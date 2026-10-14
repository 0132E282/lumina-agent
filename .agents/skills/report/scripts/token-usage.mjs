#!/usr/bin/env node
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import path from 'node:path';

const help = `Usage: node token-usage.mjs --task LABEL [options]
Read runtime JSONL from stdin or --input FILE.

Options:
  --task LABEL       Required caller-assigned task label
  --repo PATH        Caller-assigned repo path (default: current directory)
  --skill LABEL      Optional caller-assigned skill label
  --command LABEL    Optional caller-assigned command label
  --input FILE       Read only this explicit file instead of stdin
  --format text|json Output format (default: text)
  --runtime NAME     codex|claude|antigravity|claude-transcript (default: codex)
  --help             Show this help without reading input

Example:
  codex exec --json 'your task' | node token-usage.mjs --task TASK-001
  node token-usage.mjs --input events.jsonl --task TASK-001 --format json

Input schema: one JSON value per line. Codex events with type="turn.completed"
are measured; usage.input_tokens and usage.output_tokens must both be
nonnegative safe integers. Blank lines and unrelated events are ignored.
Cached input and reasoning output are subsets and never added again.
Claude: type="result", usage.input_tokens/output_tokens plus separate optional
cache_read_input_tokens/cache_creation_input_tokens (absent = 0) in full input.
Do not add assistant usage or modelUsage. Antigravity: event="result", result
envelope containing conversation_id/status/usage; a direct result envelope is
also accepted. Use input_tokens/output_tokens as given, without adding thinking,
cache or total_tokens again. Pretty-printed multiline JSON is not JSONL.
Claude/Antigravity require SINGLE SESSION input and retain only the LAST result
snapshot, never summing cumulative snapshots. Differing present session IDs
fail. Their usage may include resumed-session history: label it session usage,
or start a fresh session for task-specific attribution. Missing final usage is
N/A even if an older snapshot was measured. Failure usage is still measurable,
but runtime_status indicates failure and does not claim task success.
Invalid JSON/counts or unsafe sums fail with a line number, without raw logs.
claude-transcript: explicit live transcript JSONL, type="assistant", sessionId,
message.id/message.usage. Retain latest recorded usage per unique message ID;
normalize Claude cache input categories. Exclude parent_tool_use_id subagents.
Always partial when measured: observed session subtotal, not task/test-only or
final billed total; live output usage may be placeholders/incomplete. Mixed
session IDs fail. Latest missing message usage removes its older subtotal.

Output schema: attribution {repo,task,skill,command}, attribution_basis,
runtime, measurement_scope, source, status (complete|partial|unavailable),
completed_turns, measured_turns (Codex only; null for session snapshots),
failed_turns (turn.failed events without inferred usage),
result_events, measured_result_events, runtime_status (session snapshots),
usage {input_tokens,output_tokens,total_tokens}, measured_usage (same fields).
Missing usage/counts leave usage fields null (text: N/A); measured_usage holds
only the known subtotal, or null when no turn was measured. Missing turns are
reported explicitly. Labels do not prove event/task/repo scope. Each supplied
turn is counted once; concatenated duplicate logs will be counted twice.
This script reads no session logs automatically, stores no raw logs, and makes
no Codex/API calls. A failed/incomplete run without turn.completed is unmeasured.
`;

function parseArguments(argumentsList) {
  const options = { repo: process.cwd(), format: 'text', runtime: 'codex' };
  const allowed = new Set(['task', 'repo', 'skill', 'command', 'input', 'format', 'runtime']);
  const supplied = new Set();
  for (let index = 0; index < argumentsList.length; index += 1) {
    const name = argumentsList[index].slice(2);
    if (!argumentsList[index].startsWith('--') || !allowed.has(name)) {
      throw new Error('Unknown option; use --help.');
    }
    const value = argumentsList[index + 1];
    if (!value || value.startsWith('--') || !value.trim()) {
      throw new Error(`Missing value for --${name}.`);
    }
    if (supplied.has(name)) {
      throw new Error(`Duplicate option --${name}.`);
    }
    supplied.add(name);
    options[name] = value;
    index += 1;
  }
  if (!options.task) throw new Error('--task is required.');
  if (!['text', 'json'].includes(options.format)) throw new Error('--format must be text or json.');
  if (!['codex', 'claude', 'antigravity', 'claude-transcript'].includes(options.runtime)) throw new Error('--runtime must be codex, claude, antigravity or claude-transcript.');
  return options;
}

function safeAdd(left, right, lineNumber) {
  const sum = left + right;
  if (!Number.isSafeInteger(sum)) throw new Error(`Line ${lineNumber}: token sum exceeds safe integer range.`);
  return sum;
}

function normalizeUsage(usage, runtime, lineNumber) {
  if (usage === undefined || usage === null) return null;
  if (typeof usage !== 'object' || Array.isArray(usage)) {
    throw new Error(`Line ${lineNumber}: invalid usage object.`);
  }
  const fields = ['input_tokens', 'output_tokens'];
  if (runtime === 'claude') fields.push('cache_read_input_tokens', 'cache_creation_input_tokens');
  for (const field of fields) {
    if (Object.hasOwn(usage, field) && (!Number.isSafeInteger(usage[field]) || usage[field] < 0)) {
      throw new Error(`Line ${lineNumber}: ${field} must be a nonnegative safe integer.`);
    }
  }
  if (!Object.hasOwn(usage, 'input_tokens') || !Object.hasOwn(usage, 'output_tokens')) return null;
  let inputTokens = usage.input_tokens;
  if (runtime === 'claude') {
    inputTokens = safeAdd(inputTokens, usage.cache_read_input_tokens ?? 0, lineNumber);
    inputTokens = safeAdd(inputTokens, usage.cache_creation_input_tokens ?? 0, lineNumber);
  }
  return { input_tokens: inputTokens, output_tokens: usage.output_tokens, total_tokens: safeAdd(inputTokens, usage.output_tokens, lineNumber) };
}

function sessionResult(event, runtime) {
  if (runtime === 'claude') return event?.type === 'result' ? event : null;
  if (event?.event === 'result') return event.result ?? {};
  return event && Object.hasOwn(event, 'conversation_id') && Object.hasOwn(event, 'status') ? event : null;
}

async function measure(input, runtime) {
  const lines = createInterface({ input, crlfDelay: Infinity });
  let lineNumber = 0;
  let completedTurns = 0;
  let measuredTurns = 0;
  let failedTurns = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let sessionId;
  let resultEvents = 0;
  let measuredResultEvents = 0;
  let snapshot = null;
  let runtimeStatus = 'unavailable';
  const transcriptMessages = new Map();
  let excludedSubagentMessages = 0;
  try {
    for await (const line of lines) {
      lineNumber += 1;
      if (!line.trim()) continue;
      let event;
      try {
        event = JSON.parse(line);
      } catch {
        throw new Error(`Line ${lineNumber}: invalid JSON.`);
      }
      if (runtime === 'claude-transcript') {
        if (event?.type !== 'assistant') continue;
        if (event.parent_tool_use_id !== undefined && event.parent_tool_use_id !== null) {
          excludedSubagentMessages += 1;
          continue;
        }
        const identifier = event.sessionId;
        if (identifier !== undefined && identifier !== null) {
          if (typeof identifier !== 'string' || !identifier) throw new Error(`Line ${lineNumber}: invalid session identifier.`);
          if (sessionId !== undefined && sessionId !== identifier) throw new Error(`Line ${lineNumber}: mixed runtime sessions are not supported.`);
          sessionId = identifier;
        }
        const messageId = event.message?.id;
        if (typeof messageId !== 'string' || !messageId) throw new Error(`Line ${lineNumber}: assistant message.id is required.`);
        const usage = normalizeUsage(event.message.usage, 'claude', lineNumber);
        const previous = transcriptMessages.get(messageId);
        inputTokens -= previous?.input_tokens ?? 0;
        outputTokens -= previous?.output_tokens ?? 0;
        inputTokens = safeAdd(inputTokens, usage?.input_tokens ?? 0, lineNumber);
        outputTokens = safeAdd(outputTokens, usage?.output_tokens ?? 0, lineNumber);
        safeAdd(inputTokens, outputTokens, lineNumber);
        transcriptMessages.set(messageId, usage);
        continue;
      }
      if (runtime !== 'codex') {
        const result = sessionResult(event, runtime);
        if (result === null || result === undefined) continue;
        resultEvents += 1;
        if (typeof result !== 'object' || Array.isArray(result)) throw new Error(`Line ${lineNumber}: invalid result object.`);
        const identifier = runtime === 'claude' ? result.session_id : result.conversation_id;
        if (identifier !== undefined && identifier !== null) {
          if (typeof identifier !== 'string' || !identifier) throw new Error(`Line ${lineNumber}: invalid session identifier.`);
          if (sessionId !== undefined && sessionId !== identifier) throw new Error(`Line ${lineNumber}: mixed runtime sessions are not supported.`);
          sessionId = identifier;
        }
        snapshot = normalizeUsage(result.usage, runtime, lineNumber);
        if (snapshot !== null) measuredResultEvents += 1;
        runtimeStatus = runtime === 'claude'
          ? result.is_error === true || String(result.subtype ?? '').startsWith('error') ? 'failure' : result.subtype === 'success' ? 'success' : 'unknown'
          : result.status === 'SUCCESS' ? 'success' : typeof result.status === 'string' ? 'failure' : 'unknown';
        continue;
      }
      if (event?.type === 'turn.failed') failedTurns += 1;
      if (event?.type !== 'turn.completed') continue;
      completedTurns += 1;
      const usage = normalizeUsage(event.usage, runtime, lineNumber);
      if (usage === null) continue;
      inputTokens = safeAdd(inputTokens, usage.input_tokens, lineNumber);
      outputTokens = safeAdd(outputTokens, usage.output_tokens, lineNumber);
      safeAdd(inputTokens, outputTokens, lineNumber);
      measuredTurns += 1;
    }
  } finally {
    lines.close();
    if (input !== process.stdin) input.destroy();
  }
  const emptyUsage = { input_tokens: null, output_tokens: null, total_tokens: null };
  if (runtime === 'claude-transcript') {
    const measuredMessages = [...transcriptMessages.values()].filter(usage => usage !== null).length;
    return {
      status: measuredMessages > 0 ? 'partial' : 'unavailable',
      completed_turns: null, measured_turns: null, failed_turns: null,
      observed_messages: transcriptMessages.size, measured_messages: measuredMessages,
      excluded_subagent_messages: excludedSubagentMessages,
      usage: emptyUsage,
      measured_usage: measuredMessages > 0 ? { input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: inputTokens + outputTokens } : emptyUsage,
    };
  }
  if (runtime !== 'codex') {
    return {
      status: snapshot === null ? 'unavailable' : 'complete',
      completed_turns: null, measured_turns: null, failed_turns: null,
      result_events: resultEvents, measured_result_events: measuredResultEvents,
      runtime_status: runtimeStatus,
      usage: snapshot ?? emptyUsage, measured_usage: snapshot ?? emptyUsage,
    };
  }
  const measuredUsage = measuredTurns > 0
    ? { input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: inputTokens + outputTokens }
    : emptyUsage;
  const status = measuredTurns === 0 ? 'unavailable' : measuredTurns === completedTurns && failedTurns === 0 ? 'complete' : 'partial';
  return {
    status,
    completed_turns: completedTurns,
    measured_turns: measuredTurns,
    failed_turns: failedTurns,
    usage: status === 'complete' ? measuredUsage : emptyUsage,
    measured_usage: measuredUsage,
  };
}

function formatText(report) {
  const usage = report.usage;
  const subtotal = report.measured_usage;
  if (report.runtime === 'claude-transcript') {
    return [
      `Token quan sát: input ${subtotal.input_tokens ?? 'N/A'} | output ${subtotal.output_tokens ?? 'N/A'} | tổng ${subtotal.total_tokens ?? 'N/A'} | trạng thái ${report.status}`,
      `Phạm vi đo: ${report.measurement_scope}.`,
      `Phạm vi do caller gán: ${JSON.stringify(report.attribution)} (không xác minh phạm vi log).`,
      `Nguồn: ${report.source} | đo ${report.measured_messages}/${report.observed_messages} message IDs; bỏ ${report.excluded_subagent_messages} subagent records.`,
      'Chỉ subtotal session được ghi nhận; không phải token riêng test/task hay tổng billed cuối. Output live có thể placeholder/chưa đầy đủ; không bao gồm subagents.',
    ].join('\n');
  }
  return [
    `Token: input ${usage.input_tokens ?? 'N/A'} | output ${usage.output_tokens ?? 'N/A'} | tổng ${usage.total_tokens ?? 'N/A'}`,
    `Phạm vi do caller gán: ${JSON.stringify(report.attribution)} (không xác minh phạm vi log).`,
    `Phạm vi đo: ${report.measurement_scope}.`,
    report.runtime === 'codex'
      ? `Nguồn: ${report.source} | trạng thái ${report.status} | đo ${report.measured_turns}/${report.completed_turns} lượt hoàn thành.`
      : `Nguồn: ${report.source} | trạng thái ${report.status} | runtime ${report.runtime_status} | snapshot cuối từ ${report.result_events} result events.`,
    ...(report.status === 'partial' ? [`Subtotal đã đo: input ${subtotal.input_tokens} | output ${subtotal.output_tokens} | tổng ${subtotal.total_tokens}; thiếu ${report.completed_turns - report.measured_turns} lượt.`] : []),
    ...(report.failed_turns > 0 ? [`Lượt thất bại chưa đo: ${report.failed_turns}; không suy diễn token đã tiêu thụ.`] : []),
    ...(report.runtime_status === 'failure' ? ['Runtime báo thất bại; usage không xác nhận task thành công.'] : []),
  ].join('\n');
}

try {
  if (process.argv.slice(2).includes('--help')) {
    process.stdout.write(help);
  } else {
    const options = parseArguments(process.argv.slice(2));
    const result = await measure(options.input ? createReadStream(options.input, { encoding: 'utf8' }) : process.stdin, options.runtime);
    const report = {
      attribution: { repo: path.resolve(options.repo), task: options.task, skill: options.skill ?? null, command: options.command ?? null },
      attribution_basis: 'caller-supplied labels; event scope is not verified',
      runtime: options.runtime,
      measurement_scope: options.runtime === 'codex' ? 'supplied completed turns; task attribution not verified' : options.runtime === 'claude-transcript' ? 'session transcript snapshot; NOT test-only/task total' : 'runtime-session snapshot; task attribution not verified',
      source: options.runtime === 'codex' ? 'Codex exec JSONL turn.completed usage' : options.runtime === 'claude-transcript' ? 'explicit Claude transcript assistant message usage (observed partial subtotal)' : `${options.runtime} result usage (last session snapshot)`,
      ...result,
    };
    process.stdout.write(`${options.format === 'json' ? JSON.stringify(report, null, 2) : formatText(report)}\n`);
  }
} catch (error) {
  const message = error?.code ? `Unable to read input (${error.code}).` : error.message;
  process.stderr.write(`token-usage: ${message}\n`);
  process.exitCode = 1;
}
