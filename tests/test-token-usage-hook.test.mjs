import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../.claude/hooks/scripts/test-token-usage.mjs', import.meta.url));
const sharedScript = fileURLToPath(new URL('../.agents/hooks/scripts/test-token-usage.mjs', import.meta.url));
function fixture(context) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'token-hook-test-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const transcript = path.join(directory, 'transcript.jsonl');
  writeFileSync(transcript, JSON.stringify({ type: 'assistant', sessionId: 'session-a', message: { id: 'a', usage: { input_tokens: 10, output_tokens: 5, cache_creation_input_tokens: 2 }, content: 'PRIVATE_TRANSCRIPT' } }));
  return { directory, transcript };
}
function run(command, location, extra = {}, entry = script) {
  return spawnSync(process.execPath, [entry], {
    encoding: 'utf8',
    input: JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command }, cwd: location.directory, transcript_path: location.transcript, ...extra }),
  });
}
function contextText(result) {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  const output = JSON.parse(result.stdout).hookSpecificOutput;
  assert.equal(output.hookEventName, 'PostToolUse');
  return output.additionalContext;
}

test('common test commands trigger observed session context', context => {
  const location = fixture(context);
  for (const command of ['npm test', 'npm run test:unit', 'pnpm test', 'pnpm run test:e2e', 'yarn test', 'bun run test', 'node --test tests/example.mjs', 'pytest', 'python -m pytest', 'python3 -m pytest', 'go test ./...', 'cargo test', 'php artisan test', 'cd project && npm test']) {
    const text = contextText(run(command, location));
    assert.match(text, /input 12 \| output 5 \| tổng 17/);
    assert.match(text, /không phải token riêng lệnh test/);
    assert.doesNotMatch(text, /PRIVATE_TRANSCRIPT/);
  }
});

test('non-tests, quoted test text and other tool/events are ignored', context => {
  const location = fixture(context);
  for (const command of ['npm install', 'npm run build', 'npm run testing', 'echo npm test', 'echo "npm test; pytest"', 'cat test.json', 'node script.mjs --test', 'echo $(npm test)']) {
    const result = run(command, location);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
  }
  for (const extra of [{ tool_name: 'Read' }, { hook_event_name: 'PreToolUse' }]) assert.equal(run('npm test', location, extra).stdout, '');
});

test('missing/corrupt transcript or payload fail safely without exposing content', context => {
  const location = fixture(context);
  assert.match(contextText(run('npm test', location, { transcript_path: undefined })), /Token: N\/A/);
  assert.match(contextText(run('npm test', location, { transcript_path: path.join(location.directory, 'missing') })), /Token: N\/A/);
  writeFileSync(location.transcript, 'PRIVATE_INVALID_TRANSCRIPT');
  const text = contextText(run('npm test', location));
  assert.match(text, /Token: N\/A/);
  assert.doesNotMatch(text, /PRIVATE_INVALID/);
  const invalid = spawnSync(process.execPath, [script], { input: 'PRIVATE_INVALID_PAYLOAD', encoding: 'utf8' });
  assert.match(contextText(invalid), /Token: N\/A/);
});

test('shared symlink entry works and test command text is never executed', context => {
  const location = fixture(context);
  const marker = path.join(location.directory, 'should-not-exist');
  const text = contextText(run(`npm test; touch ${marker}`, location, {}, sharedScript));
  assert.match(text, /input 12/);
  assert.equal(existsSync(marker), false);
});
