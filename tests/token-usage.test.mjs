import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../.agents/skills/report/scripts/token-usage.mjs', import.meta.url));
const completed = usage => JSON.stringify({ type: 'turn.completed', usage });
function run(input, argumentsList = []) {
  return spawnSync(process.execPath, [script, '--task', 'TASK-001', ...argumentsList], { input, encoding: 'utf8' });
}
function report(input, argumentsList = []) {
  const result = run(input, ['--format', 'json', ...argumentsList]);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('sums completed turns without cached/reasoning double counting', () => {
  const result = report([
    completed({ input_tokens: 100, output_tokens: 20, cached_input_tokens: 90, reasoning_output_tokens: 10 }),
    JSON.stringify({ type: 'item.completed', usage: { input_tokens: 9999 } }),
    completed({ input_tokens: 2, output_tokens: 3 }),
  ].join('\r\n'));
  assert.equal(result.status, 'complete');
  assert.equal(result.completed_turns, 2);
  assert.equal(result.measured_turns, 2);
  assert.deepEqual(result.usage, { input_tokens: 102, output_tokens: 23, total_tokens: 125 });
});

test('partial reports unknown total and explicit measured subtotal', () => {
  const input = [completed({ input_tokens: 10, output_tokens: 3 }), completed(), completed({ input_tokens: 5 })].join('\n');
  const result = report(input);
  assert.equal(result.status, 'partial');
  assert.equal(result.completed_turns, 3);
  assert.equal(result.measured_turns, 1);
  assert.equal(result.usage.total_tokens, null);
  assert.equal(result.measured_usage.total_tokens, 13);
  const text = run(input);
  assert.match(text.stdout, /tổng N\/A/);
  assert.match(text.stdout, /partial/);
  assert.match(text.stdout, /thiếu 2 lượt/);
});

test('empty and missing usage are unavailable, zero usage is measured', () => {
  for (const input of ['', '\nnull\n', completed(null), completed({})]) {
    const result = report(input);
    assert.equal(result.status, 'unavailable');
    assert.equal(result.usage.total_tokens, null);
    assert.equal(result.measured_usage.total_tokens, null);
  }
  assert.equal(report(completed({ input_tokens: 0, output_tokens: 0 })).usage.total_tokens, 0);
});

test('failed turns prevent declaring a complete total', () => {
  const failed = JSON.stringify({ type: 'turn.failed', error: { message: 'PRIVATE_ERROR' } });
  const input = `${completed({ input_tokens: 8, output_tokens: 2 })}\n${failed}`;
  const result = report(input);
  assert.equal(result.status, 'partial');
  assert.equal(result.failed_turns, 1);
  assert.equal(result.usage.total_tokens, null);
  assert.equal(result.measured_usage.total_tokens, 10);
  assert.match(run(input).stdout, /Lượt thất bại chưa đo: 1/);
  assert.doesNotMatch(run(input).stdout, /PRIVATE_ERROR/);
  assert.equal(report(failed).status, 'unavailable');
});

test('invalid JSON/counts/overflow fail without exposing raw input', () => {
  const invalid = [
    '{SECRET_INVALID',
    ...[-1, 1.5, '4', null, Number.MAX_SAFE_INTEGER + 1].map(input_tokens => completed({ input_tokens, output_tokens: 2 })),
    completed('SECRET_INVALID'),
    completed({ input_tokens: Number.MAX_SAFE_INTEGER, output_tokens: 1 }),
    [completed({ input_tokens: Number.MAX_SAFE_INTEGER, output_tokens: 0 }), completed({ input_tokens: 1, output_tokens: 0 })].join('\n'),
  ];
  for (const input of invalid) {
    const result = run(`\n${input}`);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Line [23]:/);
    assert.doesNotMatch(result.stderr, /SECRET_INVALID/);
    assert.equal(result.stdout, '');
  }
});

test('explicit file input and caller attribution', context => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'codex-usage-test-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const inputFile = path.join(directory, 'events.jsonl');
  writeFileSync(inputFile, completed({ input_tokens: 7, output_tokens: 4 }));
  const result = report('INVALID_STDIN', ['--input', inputFile, '--repo', directory, '--skill', 'report', '--command', '/report']);
  assert.deepEqual(result.attribution, { repo: directory, task: 'TASK-001', skill: 'report', command: '/report' });
  assert.match(result.attribution_basis, /not verified/);
  assert.equal(result.usage.total_tokens, 11);
});

test('help, required task, unsupported format, missing input', () => {
  const help = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /turn.completed/);
  const missingTask = spawnSync(process.execPath, [script], { encoding: 'utf8', input: '' });
  assert.equal(missingTask.status, 1);
  assert.match(missingTask.stderr, /--task is required/);
  for (const argumentsList of [['--format', 'xml'], ['--unknown', 'x'], ['--input'], ['--task', 'duplicate']]) {
    assert.equal(run('', argumentsList).status, 1);
  }
  const missingFile = run('', ['--input', path.join(os.tmpdir(), 'codex-usage-nonexistent', 'events.jsonl')]);
  assert.equal(missingFile.status, 1);
  assert.match(missingFile.stderr, /ENOENT/);
});

const claudeResult = (usage, extra = {}) => JSON.stringify({ type: 'result', subtype: 'success', session_id: 'session-a', usage, ...extra });
const antigravityResult = (usage, extra = {}) => JSON.stringify({ event: 'result', result: { conversation_id: 'session-a', status: 'SUCCESS', usage, ...extra } });

test('Claude normalizes separate cache input categories and ignores assistant/modelUsage', () => {
  const input = [
    JSON.stringify({ type: 'assistant', message: { usage: { input_tokens: 9999, output_tokens: 9999 } } }),
    claudeResult({ input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 20, cache_creation_input_tokens: 30 }, { modelUsage: { model: { inputTokens: 9999 } } }),
  ].join('\n');
  const result = report(input, ['--runtime', 'claude']);
  assert.deepEqual(result.usage, { input_tokens: 60, output_tokens: 5, total_tokens: 65 });
  assert.equal(result.runtime_status, 'success');
  assert.equal(result.completed_turns, null);
  assert.match(result.measurement_scope, /runtime-session snapshot/);
  assert.equal(report(claudeResult({ input_tokens: 10, output_tokens: 5 }), ['--runtime', 'claude']).usage.total_tokens, 15);
});

test('both session runtimes retain last cumulative snapshot rather than sum', () => {
  for (const [runtime, resultEvent] of [['claude', claudeResult], ['antigravity', antigravityResult]]) {
    const input = [resultEvent({ input_tokens: 10, output_tokens: 5 }), resultEvent({ input_tokens: 30, output_tokens: 15 })].join('\n');
    const result = report(input, ['--runtime', runtime]);
    assert.equal(result.usage.total_tokens, 45);
    assert.equal(result.result_events, 2);
    assert.equal(result.measured_result_events, 2);
    const missing = report(`${input}\n${resultEvent(undefined)}`, ['--runtime', runtime]);
    assert.equal(missing.status, 'unavailable');
    assert.equal(missing.usage.total_tokens, null);
    assert.equal(missing.measured_usage.total_tokens, null);
  }
});

test('Antigravity accepts direct and wrapped result and does not add subsets', () => {
  const usage = { input_tokens: 10, output_tokens: 4, total_tokens: 14, cache_read_tokens: 8, thinking_tokens: 3 };
  for (const input of [antigravityResult(usage), JSON.stringify({ conversation_id: 'session-a', status: 'SUCCESS', usage })]) {
    assert.deepEqual(report(input, ['--runtime', 'antigravity']).usage, { input_tokens: 10, output_tokens: 4, total_tokens: 14 });
  }
  const finalMissing = `${antigravityResult(usage)}\n${JSON.stringify({ event: 'result' })}`;
  assert.equal(report(finalMissing, ['--runtime', 'antigravity']).status, 'unavailable');
});

test('session runtime failures preserve valid usage without implying task success', () => {
  for (const [runtime, input] of [
    ['claude', claudeResult({ input_tokens: 10, output_tokens: 2 }, { is_error: true, subtype: 'error_during_execution' })],
    ['antigravity', antigravityResult({ input_tokens: 10, output_tokens: 2 }, { status: 'ERROR' })],
  ]) {
    const result = report(input, ['--runtime', runtime]);
    assert.equal(result.runtime_status, 'failure');
    assert.equal(result.usage.total_tokens, 12);
    assert.match(run(input, ['--runtime', runtime]).stdout, /không xác nhận task thành công/);
  }
});

test('rejects mixed sessions, invalid cache count and overflow with sanitized errors', () => {
  const usage = { input_tokens: 10, output_tokens: 2 };
  for (const [runtime, input] of [
    ['claude', `${claudeResult(usage)}\n${claudeResult(usage, { session_id: 'SECRET_OTHER_SESSION' })}`],
    ['antigravity', `${antigravityResult(usage)}\n${antigravityResult(usage, { conversation_id: 'SECRET_OTHER_SESSION' })}`],
    ['claude', claudeResult({ ...usage, cache_read_input_tokens: -1 })],
    ['claude', claudeResult({ input_tokens: Number.MAX_SAFE_INTEGER, output_tokens: 0, cache_creation_input_tokens: 1 })],
    ['antigravity', antigravityResult({ input_tokens: Number.MAX_SAFE_INTEGER, output_tokens: 1 })],
  ]) {
    const result = run(input, ['--runtime', runtime]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Line [12]:/);
    assert.doesNotMatch(result.stderr, /SECRET_OTHER_SESSION/);
  }
  assert.equal(run('', ['--runtime', 'unknown']).status, 1);
});

const transcriptMessage = (id, usage, extra = {}) => JSON.stringify({ type: 'assistant', sessionId: 'session-a', message: { id, usage, content: [{ text: 'PRIVATE_CONTENT' }] }, ...extra });

test('transcript deduplicates message IDs and reports partial observed subtotal only', () => {
  const input = [
    transcriptMessage('a', { input_tokens: 10, output_tokens: 0, cache_read_input_tokens: 3 }),
    transcriptMessage('a', { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 3 }),
    transcriptMessage('b', { input_tokens: 2, output_tokens: 4 }),
    transcriptMessage('child', { input_tokens: 100, output_tokens: 100 }, { parent_tool_use_id: 'tool-a', sessionId: 'other-session' }),
    JSON.stringify({ type: 'user', message: { content: 'PRIVATE_CONTENT' } }),
  ].join('\n');
  const result = report(input, ['--runtime', 'claude-transcript']);
  assert.equal(result.status, 'partial');
  assert.equal(result.usage.total_tokens, null);
  assert.deepEqual(result.measured_usage, { input_tokens: 15, output_tokens: 9, total_tokens: 24 });
  assert.equal(result.observed_messages, 2);
  assert.equal(result.measured_messages, 2);
  assert.equal(result.excluded_subagent_messages, 1);
  assert.match(result.measurement_scope, /NOT test-only\/task total/);
  const text = run(input, ['--runtime', 'claude-transcript']).stdout;
  assert.match(text, /input 15 \| output 9 \| tổng 24/);
  assert.match(text, /placeholder/);
  assert.doesNotMatch(text, /PRIVATE_CONTENT/);
});

test('transcript final missing usage removes older message subtotal', () => {
  const input = `${transcriptMessage('a', { input_tokens: 10, output_tokens: 5 })}\n${transcriptMessage('a', undefined)}`;
  const result = report(input, ['--runtime', 'claude-transcript']);
  assert.equal(result.status, 'unavailable');
  assert.equal(result.measured_usage.total_tokens, null);
  assert.equal(result.observed_messages, 1);
  assert.equal(result.measured_messages, 0);
});

test('transcript rejects mixed sessions, malformed message IDs/counts and overflow', () => {
  for (const input of [
    `${transcriptMessage('a', { input_tokens: 1, output_tokens: 2 })}\n${transcriptMessage('b', { input_tokens: 1, output_tokens: 2 }, { sessionId: 'PRIVATE_OTHER' })}`,
    transcriptMessage('', { input_tokens: 1, output_tokens: 2 }),
    transcriptMessage('a', { input_tokens: -1, output_tokens: 2 }),
    `${transcriptMessage('a', { input_tokens: Number.MAX_SAFE_INTEGER, output_tokens: 0 })}\n${transcriptMessage('b', { input_tokens: 1, output_tokens: 0 })}`,
  ]) {
    const result = run(input, ['--runtime', 'claude-transcript']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Line [12]:/);
    assert.doesNotMatch(result.stderr, /PRIVATE_OTHER|PRIVATE_CONTENT/);
  }
});
