import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../.claude/hooks/scripts/ensure-final-newline.mjs', import.meta.url));
function fixture(context) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'newline-test-')));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function run(argumentsList, input = '') {
  return spawnSync(process.execPath, [script, ...argumentsList], { input, encoding: 'utf8' });
}
function hook(root, filePath, extra = {}) {
  return run([], JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Write', cwd: root, tool_input: { file_path: filePath }, ...extra }));
}

test('check never mutates; write adds final LF and preserves file mode/content', context => {
  const root = fixture(context);
  const file = path.join(root, 'config.json');
  fs.writeFileSync(file, '{"secret":"PRIVATE_CONTENT"}', { mode: 0o640 });
  const before = fs.readFileSync(file);
  const mode = fs.statSync(file).mode;
  const check = run(['--check', file]);
  assert.equal(check.status, 1);
  assert.deepEqual(fs.readFileSync(file), before);
  assert.doesNotMatch(check.stderr, /PRIVATE_CONTENT/);
  assert.equal(run(['--write', file]).status, 0);
  assert.deepEqual(fs.readFileSync(file), Buffer.concat([before, Buffer.from('\n')]));
  assert.equal(fs.statSync(file).mode, mode);
  assert.equal(run(['--check', file]).status, 0);
});

test('preserves CRLF, existing final newline/blank lines and empty files', context => {
  const root = fixture(context);
  for (const [name, before, after] of [
    ['crlf.md', 'first\r\nlast', 'first\r\nlast\r\n'],
    ['terminal-cr.md', 'first\r\nlast\r', 'first\r\nlast\r\n'],
    ['blank.md', 'done\n\n', 'done\n\n'],
    ['empty.md', '', ''],
    ['.editorconfig', 'root = true', 'root = true\n'],
  ]) {
    const file = path.join(root, name);
    fs.writeFileSync(file, before);
    assert.equal(run(['--write', file]).status, 0);
    assert.equal(fs.readFileSync(file, 'utf8'), after);
  }
});

test('skips binaries, invalid UTF8, unsupported files and symlinks', context => {
  const root = fixture(context);
  for (const [name, bytes] of [['nul.json', Buffer.from([65, 0, 66])], ['invalid.md', Buffer.from([0xff, 0xfe])], ['image.png', Buffer.from('plain content')]]) {
    const file = path.join(root, name);
    fs.writeFileSync(file, bytes);
    assert.equal(run(['--check', file]).status, 0);
    assert.equal(run(['--write', file]).status, 0);
    assert.deepEqual(fs.readFileSync(file), bytes);
  }
  const target = path.join(root, 'target.md');
  const link = path.join(root, 'link.md');
  fs.writeFileSync(target, 'no newline');
  fs.symlinkSync(target, link);
  assert.equal(run(['--write', link]).status, 0);
  assert.equal(fs.readFileSync(target, 'utf8'), 'no newline');
});

test('hook fixes touched file only, ignores unrelated tool/event and never executes path', context => {
  const root = fixture(context);
  const touched = path.join(root, 'touched.json');
  const untouched = path.join(root, 'untouched.json');
  fs.writeFileSync(touched, '{}');
  fs.writeFileSync(untouched, '{}');
  const result = hook(root, touched);
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.hookEventName, 'PostToolUse');
  assert.equal(fs.readFileSync(touched, 'utf8'), '{}\n');
  assert.equal(fs.readFileSync(untouched, 'utf8'), '{}');
  assert.equal(hook(root, touched).stdout, '');
  for (const extra of [{ tool_name: 'Bash' }, { hook_event_name: 'PreToolUse' }]) assert.equal(hook(root, untouched, extra).stdout, '');
  const marker = path.join(root, 'marker');
  assert.equal(hook(root, `$(touch ${marker}).md`).status, 0);
  assert.equal(fs.existsSync(marker), false);
});

test('hook skips outside root and parent symlink escapes', context => {
  const root = fixture(context);
  const outside = fixture(context);
  const externalFile = path.join(outside, 'external.md');
  fs.writeFileSync(externalFile, 'outside');
  assert.equal(hook(root, externalFile).stdout, '');
  fs.symlinkSync(outside, path.join(root, 'escape'));
  assert.equal(hook(root, path.join(root, 'escape', 'external.md')).stdout, '');
  assert.equal(fs.readFileSync(externalFile, 'utf8'), 'outside');
});

test('CLI errors sanitized, hook payload errors exit zero, help available', context => {
  const root = fixture(context);
  assert.equal(run(['--check', path.join(root, 'missing.md')]).status, 1);
  assert.equal(run(['--write']).status, 1);
  assert.equal(run(['--help']).status, 0);
  const invalid = run([], 'PRIVATE_INVALID_PAYLOAD');
  assert.equal(invalid.status, 0);
  assert.match(invalid.stdout, /additionalContext/);
  assert.doesNotMatch(invalid.stdout, /PRIVATE_INVALID/);
});
