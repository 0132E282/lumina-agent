#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

function isTestCommand(command) {
  if (typeof command !== 'string' || command.includes('$(') || command.includes('`')) return false;
  const tokens = command.match(/"(?:\\.|[^"\\])*"|'[^']*'|&&|\|\||[;|\n]|[^\s;|]+/g) ?? [];
  let segment = [];
  for (const token of [...tokens, ';']) {
    if (!['&&', '||', ';', '|', '\n'].includes(token)) {
      segment.push(token);
      continue;
    }
    const [runner, action, next] = segment;
    if (['npm', 'pnpm', 'yarn', 'bun'].includes(runner) && (/^test(?::[\w-]+)*$/.test(action ?? '') || action === 'run' && /^test(?::[\w-]+)*$/.test(next ?? ''))) return true;
    if (runner === 'node' && action === '--test') return true;
    if (runner === 'pytest' || ['python', 'python3'].includes(runner) && action === '-m' && next === 'pytest') return true;
    if (['go', 'cargo'].includes(runner) && action === 'test') return true;
    if (runner === 'php' && action === 'artisan' && next === 'test') return true;
    segment = [];
  }
  return false;
}

function emitContext(context) {
  process.stdout.write(`${JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: context } })}\n`);
}

try {
  let payloadText = '';
  for await (const chunk of process.stdin) payloadText += chunk;
  const payload = JSON.parse(payloadText);
  if (payload?.hook_event_name === 'PostToolUse' && payload.tool_name === 'Bash' && isTestCommand(payload.tool_input?.command)) {
    if (typeof payload.transcript_path !== 'string' || !path.isAbsolute(payload.transcript_path) || typeof payload.cwd !== 'string' || !path.isAbsolute(payload.cwd)) {
      emitContext('Token: N/A — hook thiếu transcript_path/cwd hợp lệ. Không có số đo token riêng test/task.');
    } else {
      const ownFile = pathToFileURL(realpathSync(fileURLToPath(import.meta.url)));
      const script = fileURLToPath(new URL('../../skills/report/scripts/token-usage.mjs', ownFile));
      const result = spawnSync(process.execPath, [script, '--runtime', 'claude-transcript', '--input', payload.transcript_path, '--repo', payload.cwd, '--task', 'test session snapshot', '--command', 'test'], { encoding: 'utf8', timeout: 8000, maxBuffer: 65536 });
      emitContext(result.status === 0 && !result.error ? `${result.stdout.trim()}\nHook sau test: đây là snapshot session, không phải token riêng lệnh test; không xác nhận test pass.` : 'Token: N/A — không đọc được telemetry transcript bằng runtime hiện có. Không có số đo token riêng test/task.');
    }
  }
} catch {
  emitContext('Token: N/A — hook không xử lý được payload/telemetry. Không có số đo token riêng test/task.');
}
