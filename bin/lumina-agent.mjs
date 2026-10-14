#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import readline from 'node:readline';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const executeFile = promisify(execFile);
const repository = 'git@github.com:0132E282/lumina-agent.git';
const payloadRoots = [
  '.agents/rules', '.agents/skills', '.agents/agents', '.agents/commands', '.agents/hooks',
  '.claude/agents', '.claude/commands', '.claude/hooks', '.claude/rules', '.claude/skills',
  '.claude/settings.json', '.codex/agents', '.codex/rules', '.codex/skills', 'CONTRACT.md',
];
const runtimes = ['codex', 'claude', 'antigravity'];
const runtimeLabels = { codex: 'Codex', claude: 'Claude Code', antigravity: 'Antigravity' };
const sharedPayloadRoots = ['.agents/rules', '.agents/skills', 'CONTRACT.md'];
const startMarker = '<!-- lumina-agent:start -->';
const endMarker = '<!-- lumina-agent:end -->';
const instructionBlock = `${startMarker}
## Lumina agent framework

- Giữ hướng dẫn riêng của project; nội dung Lumina bổ sung workflow và không tự đổi stack/UI/contract.
- Đọc [CONTRACT.md](./CONTRACT.md) trước khi làm việc; trước khi code đọc toàn bộ rule trong [.agents/rules/](./.agents/rules/), chỉ áp dụng phần liên quan.
- Skills dùng nguồn chung [.agents/skills/](./.agents/skills/). Claude dùng command trực tiếp /review, /git, /cleanup; khi lập kế hoạch dùng Plan mode có sẵn kết hợp skill workflow-plan. Codex dùng $workflow-..., Antigravity dùng /workflow-... theo runtime thực tế.
- Khi triển khai, tuân thủ rule chung và giao vai trò coding-agent; đọc toàn bộ tài liệu vai trò tương ứng trong [.claude/agents/](./.claude/agents/) trước khi thực hiện. Codex adapters nằm trong [.codex/agents/](./.codex/agents/).
- Hoàn thành task có kết quả cụ thể: dùng skill report; code có xử lý phụ thuộc dữ liệu dùng complexity-performance trước báo cáo. Database thật mặc định read-only.
- Commit/push/deploy chỉ khi được yêu cầu rõ. Dùng formatter/linter/test có sẵn; không tự tải package để kiểm tra.
- Claude hooks được cấu hình trong .claude/settings.json; Codex và Antigravity không tự chạy hooks Claude. Không báo đã chạy hook/tool khi chưa thực thi.
- Giữ các đường dẫn .agents/, .claude/, .codex/ cùng nhau để relative symlinks và tham chiếu còn hợp lệ.
${endMarker}`;

async function lstatOptional(filename) {
  try {
    return await fs.lstat(filename);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function within(root, filename) {
  const relative = path.relative(root, filename);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function excluded(name) {
  return /^(?:\.git|\.DS_Store|storage|logs?|node_modules|__pycache__|\.cache|\.env(?:\..*)?|credentials(?:\..*)?|id_rsa|id_ed25519)$/i.test(name)
    || /\.(?:log|pem|key|pyc)$/i.test(name);
}

async function assertDirectories(filename) {
  const ancestors = [];
  for (let current = filename; ; current = path.dirname(current)) {
    ancestors.push(current);
    if (current === path.dirname(current)) break;
  }
  for (const ancestor of ancestors.reverse()) {
    const status = await lstatOptional(ancestor);
    if (status && !status.isDirectory()) {
      throw new Error(`Đường dẫn phải là directory thật, không phải symlink: ${ancestor}`);
    }
  }
}

async function collectPayload(source) {
  const entries = new Map();
  async function visit(relative) {
    const filename = path.join(source, relative);
    const status = await fs.lstat(filename);
    if (!within(source, await fs.realpath(filename))) throw new Error(`Source thoát khỏi repo: ${relative}`);
    if (status.isSymbolicLink()) {
      const link = await fs.readlink(filename);
      if (path.isAbsolute(link)) throw new Error(`Source link phải tương đối: ${relative}`);
      entries.set(relative, { relative, kind: 'link', link });
    } else if (status.isDirectory()) {
      entries.set(relative, { relative, kind: 'directory' });
      for (const name of await fs.readdir(filename)) {
        if (!excluded(name)) await visit(path.join(relative, name));
      }
    } else if (status.isFile()) {
      entries.set(relative, { relative, kind: 'file', content: await fs.readFile(filename), mode: status.mode & 0o777 });
    } else {
      throw new Error(`Source không phải file/directory/link: ${relative}`);
    }
  }
  for (const relative of payloadRoots) {
    await assertDirectories(path.dirname(path.join(source, relative)));
    await visit(relative);
  }
  for (const entry of entries.values()) {
    if (entry.kind !== 'link') continue;
    const destination = path.resolve(source, path.dirname(entry.relative), entry.link);
    const resolved = await fs.realpath(path.join(source, entry.relative));
    if (!entries.has(path.relative(source, destination)) || !entries.has(path.relative(source, resolved))) {
      throw new Error(`Source link trỏ ngoài payload: ${entry.relative}`);
    }
  }
  return entries;
}

function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} phải là JSON object`);
  return value;
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function hookGroups(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} phải là array`);
  for (const group of value) {
    object(group, label);
    if (!Array.isArray(group.hooks)) throw new Error(`${label}.hooks phải là array`);
    for (const hook of group.hooks) object(hook, label);
  }
  return value;
}

function parseSettings(content, label) {
  try {
    return JSON.parse(content.toString('utf8'));
  } catch {
    throw new Error(`${label}: JSON không hợp lệ`);
  }
}

function mergeSettings(existing, incoming) {
  const merged = Object.assign(Object.create(null), object(existing, 'Settings hiện có'));
  for (const [key, value] of Object.entries(object(incoming, 'Settings nguồn'))) {
    if (key === 'hooks') continue;
    if (Object.hasOwn(merged, key) && canonical(merged[key]) !== canonical(value)) {
      throw new Error(`Settings conflict: ${key}`);
    }
    merged[key] = value;
  }
  const hooks = Object.assign(Object.create(null), object(existing.hooks ?? {}, 'hooks hiện có'));
  for (const [event, additions] of Object.entries(object(incoming.hooks ?? {}, 'hooks nguồn'))) {
    const groups = structuredClone(hookGroups(hooks[event] ?? [], event));
    const groupIndex = new Map();
    for (const group of groups) {
      const { hooks: commands, ...metadata } = group;
      const key = canonical(metadata);
      if (!groupIndex.has(key)) groupIndex.set(key, { group, commands: new Set(commands.map(canonical)) });
    }
    for (const addition of hookGroups(additions, event)) {
      const { hooks: commands, ...metadata } = addition;
      const key = canonical(metadata);
      if (!groupIndex.has(key)) {
        const group = { ...metadata, hooks: [] };
        groups.push(group);
        groupIndex.set(key, { group, commands: new Set() });
      }
      const indexed = groupIndex.get(key);
      for (const command of commands) {
        const serialized = canonical(command);
        if (indexed.commands.has(serialized)) continue;
        indexed.group.hooks.push(command);
        indexed.commands.add(serialized);
      }
    }
    hooks[event] = groups;
  }
  merged.hooks = hooks;
  return Buffer.from(`${JSON.stringify(merged, null, 2)}\n`);
}

function appendInstructions(existing, relative, block = instructionBlock) {
  const text = existing.toString('utf8');
  if (text.includes(startMarker) || text.includes(endMarker)) {
    if (text.split(startMarker).length !== 2 || text.split(endMarker).length !== 2 || !text.includes(block)) {
      throw new Error(`Integration block đã khác nội dung: ${relative}`);
    }
    return existing;
  }
  return Buffer.from(`${text}${text.length ? (text.endsWith('\n') ? '\n' : '\n\n') : ''}${block}\n`);
}

async function preflight(target, entries) {
  const changes = [];
  for (const entry of entries.values()) {
    const filename = path.join(target, entry.relative);
    await assertDirectories(path.dirname(filename));
    const status = await lstatOptional(filename);
    if (entry.kind === 'directory') {
      if (status && !status.isDirectory()) throw new Error(`Directory conflict: ${entry.relative}`);
      if (!status) changes.push(entry);
      continue;
    }
    if (entry.kind === 'link') {
      if (status && (!status.isSymbolicLink() || await fs.readlink(filename) !== entry.link)) {
        throw new Error(`Link conflict: ${entry.relative}`);
      }
      if (!status) changes.push(entry);
      continue;
    }
    if (status && !status.isFile()) throw new Error(`File conflict: ${entry.relative}`);
    const existing = status ? await fs.readFile(filename) : Buffer.alloc(0);
    let content = entry.content;
    if (entry.instructions) content = appendInstructions(existing, entry.relative, entry.block);
    else if (entry.relative === '.claude/settings.json') {
      content = mergeSettings(status ? parseSettings(existing, 'Settings hiện có') : {}, parseSettings(content, 'Settings nguồn'));
    } else if (status && !existing.equals(content)) {
      throw new Error(`File đã tồn tại với nội dung khác: ${entry.relative}`);
    }
    if (!status || !existing.equals(content)) changes.push({ ...entry, content, existing: status ? existing : null });
  }
  return changes;
}

export async function installFromSource({ source, target, dryRun = false, global = false, agents = global ? ['codex', 'claude'] : runtimes }) {
  source = await fs.realpath(source);
  target = path.resolve(target);
  await assertDirectories(target);
  const allEntries = await collectPayload(source);
  const selected = new Set(agents);
  const roots = [...sharedPayloadRoots];
  if (selected.has('claude')) roots.push(
    '.agents/agents', '.agents/commands', '.agents/hooks',
    '.claude/agents', '.claude/commands', '.claude/hooks', '.claude/rules', '.claude/skills', '.claude/settings.json',
  );
  if (selected.has('codex')) roots.push(
    '.agents/agents', '.codex/agents', '.codex/rules', '.codex/skills', '.claude/agents',
  );
  for (const relative of allEntries.keys()) {
    if (!roots.some(root => relative === root || relative.startsWith(`${root}/`))) allEntries.delete(relative);
  }
  const entries = allEntries;
  let block = instructionBlock;
  if (global) {
    block = instructionBlock.replace(/\]\(\.\/([^)]*)\)/g, (_, relative) => `](<${path.join(target, relative)}>)`)
      .replace('trong .claude/settings.json', `trong ${path.join(target, '.claude/settings.json')}`);
    const settingsEntry = entries.get('.claude/settings.json');
    if (settingsEntry) {
      const settings = object(parseSettings(settingsEntry.content, 'Settings nguồn'), 'Settings nguồn');
      for (const [event, groups] of Object.entries(object(settings.hooks ?? {}, 'hooks nguồn'))) {
        for (const group of hookGroups(groups, event)) {
          for (const hook of group.hooks) {
            if (hook.type === 'command' && typeof hook.command === 'string' && hook.command.startsWith('bash .claude/hooks/')) {
              const filename = path.join(target, hook.command.slice(5));
              hook.command = `bash '${filename.replaceAll("'", "'\\''")}'`;
            }
          }
        }
      }
      settingsEntry.content = Buffer.from(`${JSON.stringify(settings, null, 2)}\n`);
    }
  }
  const instructionPaths = global
    ? [selected.has('codex') && '.codex/AGENTS.md', selected.has('claude') && '.claude/CLAUDE.md', selected.has('antigravity') && 'AGENTS.md']
    : [selected.has('codex') && 'AGENTS.md', selected.has('antigravity') && 'AGENTS.md', selected.has('claude') && 'CLAUDE.md'];
  for (const relative of new Set(instructionPaths.filter(Boolean))) {
    entries.set(relative, { relative, kind: 'file', instructions: true, block, mode: 0o644 });
  }
  const changes = await preflight(target, entries);
  if (dryRun) return { target, changes: changes.length, dryRun };
  await fs.mkdir(target, { recursive: true });
  for (const entry of changes) {
    const filename = path.join(target, entry.relative);
    await assertDirectories(path.dirname(filename));
    if (entry.kind === 'directory') {
      await fs.mkdir(filename, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(filename), { recursive: true });
      if (entry.kind === 'link') {
        await fs.symlink(entry.link, filename);
      } else if (entry.existing === null) {
        await fs.writeFile(filename, entry.content, { flag: 'wx', mode: entry.mode });
      } else {
        const handle = await fs.open(filename, constants.O_RDWR | constants.O_NOFOLLOW);
        try {
          const status = await handle.stat();
          if (!status.isFile() || !(await handle.readFile()).equals(entry.existing)) {
            throw new Error(`Target thay đổi sau preflight: ${entry.relative}`);
          }
          await handle.truncate(0);
          let offset = 0;
          while (offset < entry.content.length) {
            const { bytesWritten } = await handle.write(entry.content, offset, entry.content.length - offset, offset);
            if (bytesWritten === 0) throw new Error(`Không ghi được file: ${entry.relative}`);
            offset += bytesWritten;
          }
        } finally {
          await handle.close();
        }
      }
    }
  }
  return { target, changes: changes.length, dryRun };
}

export async function initialize({ target, dryRun = false, global = false, agents = global ? ['codex', 'claude'] : runtimes }, runGit = executeFile) {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'lumina-agent-'));
  try {
    const source = path.join(temporary, 'source');
    try {
      await runGit('git', ['clone', '--depth', '1', '--', repository, source], {
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_SSH_COMMAND: 'ssh -o BatchMode=yes -o ConnectTimeout=15' },
        timeout: 120_000,
        maxBuffer: 1024 * 1024,
      });
    } catch {
      throw new Error('Không đọc được private repo. Kiểm tra quyền collaborator, Git và SSH key GitHub đã được cấp quyền; clone timeout 120 giây.');
    }
    return await installFromSource({ source, target, dryRun, global, agents });
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

export function parseArguments(argumentsList, { cwd = process.cwd(), home = os.homedir() } = {}) {
  if (argumentsList.length === 0 || argumentsList[0] === '--help' || argumentsList[0] === '-h') return null;
  if (!['setup', 'init'].includes(argumentsList[0])) throw new Error('Chỉ hỗ trợ lệnh setup hoặc init. Dùng --help để xem cú pháp.');
  const options = { target: cwd, dryRun: false, global: false, agents: [] };
  const seen = new Set();
  for (let index = 1; index < argumentsList.length; index++) {
    const argument = argumentsList[index];
    if (argument === '--agent' && argumentsList[index + 1] && !argumentsList[index + 1].startsWith('--')) {
      const agent = argumentsList[++index].toLowerCase();
      if (!runtimes.includes(agent)) throw new Error(`Agent không hợp lệ: ${agent}. Chọn codex, claude hoặc antigravity.`);
      if (options.agents.includes(agent)) throw new Error(`Agent bị chọn trùng: ${agent}`);
      options.agents.push(agent);
      continue;
    }
    if (seen.has(argument)) throw new Error(`Option trùng: ${argument}`);
    seen.add(argument);
    if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--global') options.global = true;
    else if (argument === '--target' && argumentsList[index + 1] && !argumentsList[index + 1].startsWith('--')) {
      options.target = argumentsList[++index];
    } else throw new Error(`Option không hợp lệ: ${argument}`);
  }
  if (options.global && seen.has('--target')) throw new Error('Không kết hợp --global với --target.');
  if (options.global && options.agents.includes('antigravity')) throw new Error('Antigravity chỉ hỗ trợ cài theo project; bỏ --global hoặc bỏ --agent antigravity.');
  if (options.global) options.target = home;
  if (options.agents.length === 0) options.agents = options.global ? ['codex', 'claude'] : runtimes;
  return options;
}

function promptCheckboxes(input, output, { choices, title, description = '', minimum = 0, cancelMessage }) {
  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
    return Promise.resolve(choices.filter(choice => choice.selected).map(choice => choice.value));
  }
  let activeIndex = 0;
  const render = () => {
    const items = choices.map((choice, index) => `${index === activeIndex ? '❯' : ' '} [${choice.selected ? 'x' : ' '}] ${choice.label}`);
    output.write(`\u001b[2J\u001b[H${title}\n${description ? `${description}\n` : ''}${items.join('\n')}\n`);
  };
  render();
  input.setRawMode(true);
  input.resume();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      input.removeListener('keypress', onKeypress);
      input.setRawMode(false);
      output.write('\n');
    };
    const onKeypress = (character, key = {}) => {
      if (key.ctrl && key.name === 'c' || key.name === 'escape') {
        cleanup();
        reject(new Error(cancelMessage));
        return;
      }
      if (key.name === 'up') activeIndex = (activeIndex + choices.length - 1) % choices.length;
      else if (key.name === 'down') activeIndex = (activeIndex + 1) % choices.length;
      else if (key.name === 'space' || character === ' ') {
        choices[activeIndex].selected = !choices[activeIndex].selected;
      } else if (key.name === 'return' || key.name === 'enter') {
        const selected = choices.filter(choice => choice.selected);
        if (selected.length < minimum) {
          output.write('Chọn ít nhất một agent.\n');
          render();
          return;
        }
        cleanup();
        resolve(selected.map(choice => choice.value));
        return;
      } else return;
      render();
    };
    input.on('keypress', onKeypress);
  });
}

export function promptAgents(input = process.stdin, output = process.stdout, { global = false } = {}) {
  const available = global ? runtimes.slice(0, 2) : runtimes;
  return promptCheckboxes(input, output, {
    choices: available.map(runtime => ({ value: runtime, label: runtimeLabels[runtime], selected: true })),
    title: 'Chọn agent cần cài (↑/↓ di chuyển, Space bật/tắt, Enter xác nhận)',
    description: global ? 'Antigravity chỉ hỗ trợ cài theo project.' : '',
    minimum: 1,
    cancelMessage: 'Đã hủy chọn agent.',
  });
}

export function promptInstallScope(input = process.stdin, output = process.stdout, { project = process.cwd() } = {}) {
  return promptCheckboxes(input, output, {
    choices: [{ value: 'global', label: 'Cài global (~)', selected: false }],
    title: `Chọn phạm vi cài đặt (Space bật/tắt, Enter xác nhận)\nProject hiện tại: ${project}`,
    cancelMessage: 'Đã hủy chọn phạm vi cài đặt.',
  }).then(selection => selection.includes('global'));
}

if (process.argv[1] && await fs.realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const argumentsList = process.argv.slice(2);
    const options = parseArguments(argumentsList);
    if (!options) console.log('lumina-agent setup [--agent codex|claude|antigravity ...] [--global | --target <project-directory>] [--dry-run]\nTrong terminal, chọn phạm vi trước rồi chọn agent bằng checklist. Project mặc định chọn cả ba; global chỉ có Codex và Claude Code. Dùng --agent lặp lại để chọn trực tiếp. Ngoài terminal, project mặc định cài cả ba, --global mặc định cài Codex và Claude Code. Antigravity chỉ hỗ trợ project.\nlumina-agent init: alias của setup. Mặc định cài tại project hiện tại; --global cài tại ~/.\nYêu cầu Node.js >=20, Git và quyền đọc private GitHub repo qua SSH.');
    else {
      if (process.stdin.isTTY && process.stdout.isTTY) {
        readline.emitKeypressEvents(process.stdin);
        if (!argumentsList.includes('--global') && !argumentsList.includes('--target')) {
          options.global = await promptInstallScope(process.stdin, process.stdout, { project: process.cwd() });
          if (options.global) options.target = os.homedir();
        }
        if (!argumentsList.includes('--agent')) options.agents = await promptAgents(process.stdin, process.stdout, { global: options.global });
        if (options.global && options.agents.includes('antigravity')) {
          throw new Error('Antigravity chỉ hỗ trợ cài theo project; bỏ --global hoặc bỏ --agent antigravity.');
        }
      }
      const result = await initialize(options);
      console.log(`${result.dryRun ? 'Dry run' : 'Đã cài'}: ${result.changes} mục thay đổi tại ${result.target}`);
    }
  } catch (error) {
    console.error(`Lumina: ${error.message}`);
    process.exitCode = 1;
  }
}
