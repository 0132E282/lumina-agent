#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const REQUEST_TIMEOUT_MS = 30_000;

function printHelp() {
  console.log(`Usage:
  node inspect-source.mjs <page-url> [--output <report.json>]

Creates a read-only source inventory for a clone task.
`);
}

function parseArgs(argv) {
  let pageUrl = null;
  let output = null;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      printHelp();
      process.exit(0);
    }
    if (argument === '--output') {
      output = argv[index + 1];
      if (!output || output.startsWith('--')) throw new Error('--output requires a file path');
      index += 1;
      continue;
    }
    if (argument.startsWith('--')) throw new Error(`Unknown option: ${argument}`);
    if (pageUrl) throw new Error('Only one page URL is supported');
    pageUrl = argument;
  }
  if (!pageUrl) throw new Error('A page URL is required');
  return { pageUrl, output };
}

async function fetchPage(pageUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(pageUrl, { redirect: 'follow', signal: controller.signal });
    return {
      response,
      html: await response.text(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function collectAll(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]).filter(Boolean);
}

function resolveUrls(values, pageUrl) {
  return [...new Set(values.map((value) => {
    try {
      const resolved = new URL(value, pageUrl);
      return ['http:', 'https:'].includes(resolved.protocol) ? resolved.href : null;
    } catch {
      return null;
    }
  }).filter(Boolean))];
}

function inspectHtml(html, pageUrl) {
  const stylesheets = collectAll(html, /<link\b[^>]*\brel=["'][^"']*stylesheet[^"']*["'][^>]*\bhref=["']([^"']+)["']/giu);
  const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/giu)].map((match) => match[1]);
  const scripts = collectAll(html, /<script\b[^>]*\bsrc=["']([^"']+)["']/giu);
  const images = collectAll(html, /<(?:img|source|video|audio)\b[^>]*\b(?:src|poster)=["']([^"']+)["']/giu);
  const fonts = collectAll(html, /@font-face[\s\S]*?src:\s*url\(\s*["']?([^\)"']+)/giu);
  const links = collectAll(html, /<a\b[^>]*\bhref=["']([^"']+)["']/giu);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/iu)?.[1]?.replace(/\s+/gu, ' ').trim() ?? null;
  const viewport = html.match(/<meta\b[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/iu)?.[1] ?? null;
  const inlineStyleUrls = collectAll(html, /url\(\s*["']?([^\)"']+)["']?\s*\)/giu);

  return {
    pageUrl,
    title,
    viewport,
    html: {
      bytes: Buffer.byteLength(html),
      doctype: /^\s*<!doctype\s+html/iu.test(html),
      semanticTags: Object.fromEntries(['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'form'].map((tag) => [tag, (html.match(new RegExp(`<${tag}\\b`, 'giu')) ?? []).length])),
    },
    stylesheets: resolveUrls(stylesheets, pageUrl),
    inlineStyleBlocks: styleBlocks.length,
    scripts: resolveUrls(scripts, pageUrl),
    images: resolveUrls(images, pageUrl),
    fonts: resolveUrls(fonts, pageUrl),
    inlineStyleUrls: resolveUrls(inlineStyleUrls, pageUrl),
    links: resolveUrls(links, pageUrl),
  };
}

async function main() {
  const { pageUrl: inputUrl, output } = parseArgs(process.argv.slice(2));
  const pageUrl = new URL(inputUrl);
  if (!['http:', 'https:'].includes(pageUrl.protocol)) throw new Error('Page URL must use http or https');

  const { response, html } = await fetchPage(pageUrl.href);
  const report = {
    checkedAt: new Date().toISOString(),
    request: {
      inputUrl: pageUrl.href,
      finalUrl: response.url,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      redirected: response.redirected,
      accessible: response.ok,
    },
    inventory: inspectHtml(html, response.url || pageUrl.href),
  };

  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (output) {
    const outputPath = resolve(output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, serialized, 'utf8');
  }
  console.log(serialized);
  if (!response.ok) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

