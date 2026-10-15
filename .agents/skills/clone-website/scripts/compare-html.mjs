#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

function printHelp() {
  console.log(`Usage:
  node compare-html.mjs <source.html> <clone.html>

Compares structural HTML inventory. It does not claim visual pixel parity.
`);
}

function parseArgs(argv) {
  if (argv.includes('--help')) {
    printHelp();
    process.exit(0);
  }
  if (argv.length !== 2) throw new Error('Two HTML file paths are required');
  return { sourcePath: argv[0], clonePath: argv[1] };
}

function inventory(html) {
  const tags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'form', 'img', 'video', 'script', 'link', 'h1', 'h2', 'h3', 'button'];
  return {
    bytes: Buffer.byteLength(html),
    title: html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/iu)?.[1]?.replace(/\s+/gu, ' ').trim() ?? null,
    textLength: html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/giu, '').replace(/\s+/gu, ' ').trim().length,
    tags: Object.fromEntries(tags.map((tag) => [tag, (html.match(new RegExp(`<${tag}\\b`, 'giu')) ?? []).length])),
  };
}

async function main() {
  const { sourcePath, clonePath } = parseArgs(process.argv.slice(2));
  const [sourceHtml, cloneHtml] = await Promise.all([readFile(sourcePath, 'utf8'), readFile(clonePath, 'utf8')]);
  const source = inventory(sourceHtml);
  const clone = inventory(cloneHtml);
  const differences = [];
  for (const key of ['bytes', 'title', 'textLength']) {
    if (source[key] !== clone[key]) differences.push({ field: key, source: source[key], clone: clone[key] });
  }
  for (const tag of Object.keys(source.tags)) {
    if (source.tags[tag] !== clone.tags[tag]) differences.push({ field: `tags.${tag}`, source: source.tags[tag], clone: clone.tags[tag] });
  }
  console.log(`${JSON.stringify({ source, clone, differences, structuralMatch: differences.length === 0 }, null, 2)}\n`);
  if (differences.length > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

