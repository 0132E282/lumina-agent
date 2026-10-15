#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, open, unlink, writeFile } from 'node:fs/promises';
import { extname, basename, dirname, join, relative, resolve } from 'node:path';

const DEFAULT_CONCURRENCY = 4;
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30_000;
const ASSET_ATTRIBUTE_PATTERN = /<(?:img|video|audio|source|track|iframe|embed|object|input)\b[^>]*?\b(?:src|poster|data)=["']([^"']+)["']/giu;
const SRCSET_PATTERN = /\bsrcset=(["'])([^"']+)\1/giu;
const STYLE_URL_PATTERN = /url\(\s*["']?([^\)"']+)["']?\s*\)/giu;

const MIME_EXTENSIONS = new Map([
  ['image/avif', '.avif'],
  ['image/gif', '.gif'],
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/svg+xml', '.svg'],
  ['image/webp', '.webp'],
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm'],
  ['video/ogg', '.ogv'],
  ['audio/mpeg', '.mp3'],
  ['audio/ogg', '.ogg'],
  ['font/woff', '.woff'],
  ['font/woff2', '.woff2'],
]);

function printHelp() {
  console.log(`Usage:
  node download-assets.mjs <page-url> --output <directory> [options]

Downloads image/video assets referenced by a page and writes a manifest.

Options:
  --output <directory>       Asset directory (required)
  --rewrite-html <file>      Write fetched HTML with downloaded URLs replaced
  --allow-external           Allow asset hosts other than the page host
  --concurrency <number>     Parallel downloads, default: ${DEFAULT_CONCURRENCY}
  --max-bytes <number>       Per-file limit, default: ${DEFAULT_MAX_BYTES}
  --help                     Show this help
`);
}

function parseArgs(argv) {
  const options = {
    allowExternal: false,
    concurrency: DEFAULT_CONCURRENCY,
    maxBytes: DEFAULT_MAX_BYTES,
    output: null,
    rewriteHtml: null,
  };
  let pageUrl = null;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      printHelp();
      process.exit(0);
    }
    if (argument === '--allow-external') {
      options.allowExternal = true;
      continue;
    }
    if (argument === '--output' || argument === '--rewrite-html' || argument === '--concurrency' || argument === '--max-bytes') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a value`);
      }
      index += 1;
      if (argument === '--output') options.output = value;
      if (argument === '--rewrite-html') options.rewriteHtml = value;
      if (argument === '--concurrency') options.concurrency = Number(value);
      if (argument === '--max-bytes') options.maxBytes = Number(value);
      continue;
    }
    if (argument.startsWith('--')) throw new Error(`Unknown option: ${argument}`);
    if (pageUrl) throw new Error('Only one page URL is supported');
    pageUrl = argument;
  }

  if (!pageUrl) throw new Error('A page URL is required');
  if (!options.output) throw new Error('--output is required');
  if (!Number.isInteger(options.concurrency) || options.concurrency < 1 || options.concurrency > 16) {
    throw new Error('--concurrency must be an integer between 1 and 16');
  }
  if (!Number.isInteger(options.maxBytes) || options.maxBytes < 1) {
    throw new Error('--max-bytes must be a positive integer');
  }

  return { pageUrl, options };
}

function resolveAssetUrl(rawValue, pageUrl) {
  const value = rawValue.trim();
  if (!value || value.startsWith('#') || /^(?:data|blob|javascript):/iu.test(value)) return null;
  try {
    const url = new URL(value, pageUrl);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function collectRawReferences(html) {
  const references = new Set();
  for (const match of html.matchAll(ASSET_ATTRIBUTE_PATTERN)) references.add(match[1]);
  for (const match of html.matchAll(SRCSET_PATTERN)) {
    for (const candidate of match[2].split(',')) references.add(candidate.trim().split(/\s+/u)[0]);
  }
  for (const match of html.matchAll(STYLE_URL_PATTERN)) references.add(match[1]);
  return [...references].filter(Boolean);
}

function safeBaseName(url) {
  const name = basename(url.pathname).replace(/[^a-z0-9._-]/giu, '_');
  return name && name !== '_' ? name : 'asset';
}

function extensionFor(url, contentType) {
  const urlExtension = extname(url.pathname).toLowerCase();
  if (urlExtension && urlExtension.length <= 8) return urlExtension;
  const normalizedType = contentType.split(';', 1)[0].trim().toLowerCase();
  return MIME_EXTENSIONS.get(normalizedType) ?? '';
}

async function fetchPage(pageUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(pageUrl, { signal: controller.signal, redirect: 'follow' });
    if (!response.ok) throw new Error(`Page request failed: ${response.status} ${response.statusText}`);
    return { html: await response.text(), finalUrl: response.url || pageUrl };
  } finally {
    clearTimeout(timeout);
  }
}

async function writeResponseToFile(response, filePath, maxBytes) {
  if (response.body === null) throw new Error('Response has no body');
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error(`asset exceeds ${maxBytes} bytes`);
  }

  const file = await open(filePath, 'w');
  let totalBytes = 0;
  try {
    const reader = response.body.getReader();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      totalBytes += chunk.value.byteLength;
      if (totalBytes > maxBytes) throw new Error(`asset exceeds ${maxBytes} bytes`);
      await file.write(chunk.value);
    }
  } finally {
    await file.close();
  }
  return totalBytes;
}

async function downloadAsset(assetUrl, outputDirectory, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const hash = createHash('sha1').update(assetUrl.href).digest('hex').slice(0, 10);
  const provisionalName = `${safeBaseName(assetUrl)}-${hash}`;
  let outputPath = null;
  try {
    const response = await fetch(assetUrl, { signal: controller.signal, redirect: 'follow' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const contentType = response.headers.get('content-type') ?? '';
    if (/mpegurl|x-mpegurl/iu.test(contentType) || /\.m3u8(?:$|\?)/iu.test(assetUrl.pathname + assetUrl.search)) {
      return { url: assetUrl.href, status: 'skipped', reason: 'stream manifest requires ffmpeg', contentType };
    }
    const extension = extensionFor(assetUrl, contentType);
    outputPath = join(outputDirectory, `${provisionalName}${extension}`);
    const bytes = await writeResponseToFile(response, outputPath, options.maxBytes);
    return {
      url: assetUrl.href,
      status: 'downloaded',
      path: relative(resolve('.'), resolve(outputPath)),
      bytes,
      contentType,
    };
  } catch (error) {
    if (outputPath) {
      try {
        const file = await open(outputPath, 'r');
        await file.close();
        await unlink(outputPath);
      } catch {
        // Partial files are best-effort cleanup; the original error is more useful.
      }
    }
    return { url: assetUrl.href, status: 'failed', reason: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function consume() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, consume));
  return results;
}

function rewriteHtml(html, replacements) {
  return html.replace(SRCSET_PATTERN, (fullMatch, quote, value) => {
    const rewritten = value.split(',').map((candidate) => {
      const parts = candidate.trim().split(/\s+/u);
      const replacement = replacements.get(parts[0]);
      if (replacement) parts[0] = replacement;
      return parts.join(' ');
    }).join(', ');
    return `srcset=${quote}${rewritten}${quote}`;
  }).replace(STYLE_URL_PATTERN, (fullMatch, rawValue) => {
    const replacement = replacements.get(rawValue.trim());
    return replacement ? fullMatch.replace(rawValue, replacement) : fullMatch;
  }).replace(/(["'])([^"']+)\1/gu, (fullMatch, quote, rawValue) => {
    const replacement = replacements.get(rawValue);
    return replacement ? `${quote}${replacement}${quote}` : fullMatch;
  });
}

async function main() {
  const { pageUrl: inputUrl, options } = parseArgs(process.argv.slice(2));
  const pageUrl = new URL(inputUrl);
  if (!['http:', 'https:'].includes(pageUrl.protocol)) throw new Error('Page URL must use http or https');

  const { html, finalUrl } = await fetchPage(pageUrl.href);
  const finalPageUrl = new URL(finalUrl);
  const rawReferences = collectRawReferences(html);
  const assetUrls = rawReferences
    .map((rawValue) => ({ rawValue, url: resolveAssetUrl(rawValue, finalPageUrl.href) }))
    .filter(({ url }) => url !== null)
    .filter(({ url }) => options.allowExternal || url.origin === finalPageUrl.origin);
  const uniqueAssets = [...new Map(assetUrls.map(({ url }) => [url.href, url])).values()];

  const outputDirectory = resolve(options.output);
  await mkdir(outputDirectory, { recursive: true });
  const results = await runWithConcurrency(uniqueAssets, options.concurrency, (assetUrl) => downloadAsset(assetUrl, outputDirectory, options));
  const resultByUrl = new Map(results.map((result) => [result.url, result]));
  const replacements = new Map();
  const rewriteDirectory = options.rewriteHtml ? dirname(resolve(options.rewriteHtml)) : null;
  for (const { rawValue, url } of assetUrls) {
    const result = resultByUrl.get(url.href);
    if (result?.status === 'downloaded') {
      const localPath = rewriteDirectory
        ? relative(rewriteDirectory, resolve(result.path)).split('\\').join('/')
        : result.path;
      replacements.set(rawValue, localPath || '.');
    }
  }

  const manifest = {
    source: finalPageUrl.href,
    generatedAt: new Date().toISOString(),
    options: { allowExternal: options.allowExternal, concurrency: options.concurrency, maxBytes: options.maxBytes },
    assets: results,
  };
  await writeFile(join(outputDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  if (options.rewriteHtml) {
    const rewrittenHtml = rewriteHtml(html, replacements);
    await writeFile(resolve(options.rewriteHtml), rewrittenHtml);
  }

  const downloaded = results.filter((result) => result.status === 'downloaded').length;
  const skipped = results.filter((result) => result.status === 'skipped').length;
  const failed = results.filter((result) => result.status === 'failed').length;
  console.log(`Downloaded ${downloaded} asset(s); skipped ${skipped}; failed ${failed}.`);
  console.log(`Manifest: ${join(outputDirectory, 'manifest.json')}`);
  if (options.rewriteHtml) console.log(`Rewritten HTML: ${resolve(options.rewriteHtml)}`);
}

main().catch((error) => {
  console.error(`download-assets: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
