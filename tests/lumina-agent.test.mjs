import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { initialize, installFromSource } from '../bin/lumina-agent.mjs';

const executeFile = promisify(execFile);
const repository = fileURLToPath(new URL('../', import.meta.url));

async function fixture(context, copySource = false) {
  const temporary = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'lumina-test-')));
  context.after(() => fs.rm(temporary, { recursive: true, force: true }));
  const target = path.join(temporary, 'project');
  const source = copySource ? path.join(temporary, 'source') : repository;
  if (copySource) {
    await fs.mkdir(source);
    for (const name of ['.agents', '.claude', '.codex', 'CONTRACT.md']) {
      await fs.cp(path.join(repository, name), path.join(source, name), { recursive: true, verbatimSymlinks: true });
    }
  }
  return { temporary, target, source };
}

test('empty install preserves relative links and executables; repeat is idempotent', async context => {
  const options = await fixture(context);
  const first = await installFromSource(options);
  assert.ok(first.changes > 0);
  assert.equal(await fs.readlink(path.join(options.target, '.codex/skills')), '../.agents/skills');
  assert.equal(await fs.readlink(path.join(options.target, '.agents/agents')), '../.claude/agents');
  const script = '.agents/skills/git-workflow/scripts/validate-commit-message.sh';
  assert.equal((await fs.stat(path.join(options.target, script))).mode & 0o777, (await fs.stat(path.join(repository, script))).mode & 0o777);
  assert.match(await fs.readFile(path.join(options.target, 'AGENTS.md'), 'utf8'), /lumina-agent:start/);
  assert.doesNotMatch(await fs.readFile(path.join(options.target, 'AGENTS.md'), 'utf8'), /Repo cấu hình agent/);
  assert.equal((await installFromSource(options)).changes, 0);
  for (const name of ['.git', '.claude/storage', 'docs', 'package.json', '.agents/.DS_Store']) {
    await assert.rejects(fs.lstat(path.join(options.target, name)), { code: 'ENOENT' });
  }
});

test('project instructions and settings survive; matching hook commands are deduplicated', async context => {
  const options = await fixture(context);
  await fs.mkdir(path.join(options.target, '.claude'), { recursive: true });
  const projectInstructions = '# Project\nUse our existing React components.\n';
  await fs.writeFile(path.join(options.target, 'AGENTS.md'), projectInstructions);
  await fs.writeFile(path.join(options.target, 'CLAUDE.md'), '# Claude project\n');
  const settings = {
    permissions: { deny: ['Read(.env)'] },
    model: 'existing-model',
    hooks: { PreToolUse: [{ matcher: '.*', hooks: [
      { type: 'command', command: 'bash custom.sh' },
      { command: 'bash .claude/hooks/scripts/audit-log.sh', type: 'command' },
    ] }] },
  };
  await fs.writeFile(path.join(options.target, '.claude/settings.json'), JSON.stringify(settings));
  await installFromSource(options);
  const instructions = await fs.readFile(path.join(options.target, 'AGENTS.md'), 'utf8');
  assert.ok(instructions.startsWith(projectInstructions));
  const merged = JSON.parse(await fs.readFile(path.join(options.target, '.claude/settings.json'), 'utf8'));
  assert.deepEqual(merged.permissions, settings.permissions);
  assert.equal(merged.model, 'existing-model');
  assert.equal(merged.hooks.PreToolUse[0].hooks.length, 2);
  assert.equal((await installFromSource(options)).changes, 0);
});

test('content conflict completes preflight without partial writes', async context => {
  const options = await fixture(context);
  await fs.mkdir(options.target);
  await fs.writeFile(path.join(options.target, 'CONTRACT.md'), 'Project contract');
  await assert.rejects(installFromSource(options), /CONTRACT.md/);
  assert.deepEqual(await fs.readdir(options.target), ['CONTRACT.md']);
  assert.equal(await fs.readFile(path.join(options.target, 'CONTRACT.md'), 'utf8'), 'Project contract');
});

test('edited integration block and invalid settings fail before writing', async context => {
  const options = await fixture(context);
  await fs.mkdir(options.target);
  await fs.writeFile(path.join(options.target, 'AGENTS.md'), '<!-- lumina-agent:start -->\nedited\n<!-- lumina-agent:end -->');
  await assert.rejects(installFromSource(options), /Integration block/);
  assert.deepEqual(await fs.readdir(options.target), ['AGENTS.md']);
  await fs.rm(path.join(options.target, 'AGENTS.md'));
  await fs.mkdir(path.join(options.target, '.claude'));
  await fs.writeFile(path.join(options.target, '.claude/settings.json'), '{"hooks":{"PreToolUse":{}}}');
  await assert.rejects(installFromSource(options), /array/);
  assert.deepEqual(await fs.readdir(options.target), ['.claude']);
  await fs.writeFile(path.join(options.target, '.claude/settings.json'), 'sensitive-credential-not-json');
  await assert.rejects(installFromSource(options), error => /JSON không hợp lệ/.test(error.message) && !error.message.includes('sensitive-credential'));
});

test('dry run does not create target or alter existing settings', async context => {
  const options = await fixture(context);
  assert.ok((await installFromSource({ ...options, dryRun: true })).changes > 0);
  await assert.rejects(fs.stat(options.target), { code: 'ENOENT' });
  await fs.mkdir(options.target);
  await fs.writeFile(path.join(options.target, 'AGENTS.md'), 'Original');
  await installFromSource({ ...options, dryRun: true });
  assert.deepEqual(await fs.readdir(options.target), ['AGENTS.md']);
  assert.equal(await fs.readFile(path.join(options.target, 'AGENTS.md'), 'utf8'), 'Original');
});

test('target symlink root, ancestor, directory and instruction file are rejected', async context => {
  const options = await fixture(context);
  const outside = path.join(options.temporary, 'outside');
  await fs.mkdir(outside);
  await fs.symlink(outside, options.target);
  await assert.rejects(installFromSource(options), /directory thật/);
  await assert.rejects(installFromSource({ ...options, target: path.join(options.target, 'nested') }), /directory thật/);
  await fs.unlink(options.target);
  await fs.mkdir(options.target);
  await fs.symlink(outside, path.join(options.target, '.agents'));
  await assert.rejects(installFromSource(options), /directory thật/);
  await fs.unlink(path.join(options.target, '.agents'));
  await fs.writeFile(path.join(outside, 'instructions'), 'Do not touch');
  await fs.symlink(path.join(outside, 'instructions'), path.join(options.target, 'AGENTS.md'));
  await assert.rejects(installFromSource(options), /File conflict/);
  assert.equal(await fs.readFile(path.join(outside, 'instructions'), 'utf8'), 'Do not touch');
  assert.deepEqual(await fs.readdir(options.target), ['AGENTS.md']);
});

test('source links escaping repo, outside allowlist and broken links are rejected', async context => {
  const options = await fixture(context, true);
  const link = path.join(options.source, '.agents/skills/unsafe');
  await fs.writeFile(path.join(options.temporary, 'private-data'), 'Private');
  await fs.symlink('../../../private-data', link);
  await assert.rejects(installFromSource(options), /thoát khỏi repo/);
  await fs.unlink(link);
  await fs.writeFile(path.join(options.source, 'secret.txt'), 'Excluded');
  await fs.symlink('../../secret.txt', link);
  await assert.rejects(installFromSource(options), /ngoài payload/);
  await fs.unlink(link);
  await fs.symlink('missing-file', link);
  await assert.rejects(installFromSource(options), { code: 'ENOENT' });
  await assert.rejects(fs.stat(options.target), { code: 'ENOENT' });
});

test('source secrets and runtime artifacts are excluded', async context => {
  const options = await fixture(context, true);
  for (const name of ['.env', 'credentials.json', 'private.key', 'output.log', '.DS_Store']) {
    await fs.writeFile(path.join(options.source, '.agents/skills', name), 'Not payload');
  }
  await installFromSource(options);
  for (const name of ['.env', 'credentials.json', 'private.key', 'output.log', '.DS_Store']) {
    await assert.rejects(fs.stat(path.join(options.target, '.agents/skills', name)), { code: 'ENOENT' });
  }
});

test('denied SSH access never writes target, suppresses raw errors and cleans clone temp', async context => {
  const options = await fixture(context);
  let cloneTemporary;
  await assert.rejects(initialize(options, async (command, argumentsList, execution) => {
    assert.equal(command, 'git');
    assert.equal(argumentsList.at(-2), 'git@github.com:0132E282/lumina-agent.git');
    cloneTemporary = path.dirname(argumentsList.at(-1));
    assert.equal(execution.env.GIT_TERMINAL_PROMPT, '0');
    assert.match(execution.env.GIT_SSH_COMMAND, /BatchMode=yes/);
    assert.equal(execution.timeout, 120_000);
    throw new Error('raw-sensitive-credential');
  }), error => /private repo/.test(error.message) && !error.message.includes('raw-sensitive-credential'));
  await assert.rejects(fs.stat(options.target), { code: 'ENOENT' });
  await assert.rejects(fs.stat(cloneTemporary), { code: 'ENOENT' });
});

test('each initialize authenticates even after a successful install', async context => {
  const options = await fixture(context);
  let calls = 0;
  const fakeGit = async (command, argumentsList) => {
    calls++;
    if (calls === 2) throw new Error('revoked');
    const clone = argumentsList.at(-1);
    await fs.mkdir(clone);
    for (const name of ['.agents', '.claude', '.codex', 'CONTRACT.md']) {
      await fs.cp(path.join(repository, name), path.join(clone, name), { recursive: true, verbatimSymlinks: true });
    }
  };
  await initialize(options, fakeGit);
  await assert.rejects(initialize(options, fakeGit), /private repo/);
  assert.equal(calls, 2);
  assert.ok(await fs.stat(path.join(options.target, 'CONTRACT.md')));
});

test('package contains CLI without configuration payload; npx resolves bin offline', async context => {
  const { temporary } = await fixture(context);
  const environment = { ...process.env, npm_config_cache: path.join(temporary, 'npm-cache') };
  const packed = await executeFile('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temporary], { cwd: repository, env: environment });
  const [metadata] = JSON.parse(packed.stdout);
  const paths = metadata.files.map(file => file.path);
  assert.ok(paths.includes('bin/lumina-agent.mjs'));
  assert.ok(paths.every(filename => ['bin/lumina-agent.mjs', 'package.json', 'README.md', 'LICENSE'].includes(filename)));
  const result = await executeFile('npx', ['--offline', '--yes', `--package=${path.join(temporary, metadata.filename)}`, 'lumina-agent', '--help'], { env: environment });
  assert.match(result.stdout, /lumina-agent init/);
  const manifest = JSON.parse(await fs.readFile(path.join(repository, 'package.json'), 'utf8'));
  assert.equal(manifest.private, true);
  const fakeCommands = path.join(temporary, 'commands');
  await fs.mkdir(fakeCommands);
  const sentinel = path.join(temporary, 'git-invoked');
  await fs.writeFile(path.join(fakeCommands, 'git'), `#!${process.execPath}\nrequire('node:fs').writeFileSync(${JSON.stringify(sentinel)}, 'called');\nconsole.error('raw-sensitive-credential');\nprocess.exit(1);\n`, { mode: 0o755 });
  const target = path.join(temporary, 'denied-project');
  await assert.rejects(executeFile('npx', ['--offline', '--yes', `--package=${path.join(temporary, metadata.filename)}`, 'lumina-agent', 'init', '--target', target], {
    env: { ...environment, PATH: `${fakeCommands}${path.delimiter}${process.env.PATH}` },
  }), error => /private repo/.test(error.stderr) && !error.stderr.includes('raw-sensitive-credential'));
  assert.equal(await fs.readFile(sentinel, 'utf8'), 'called');
  await assert.rejects(fs.stat(target), { code: 'ENOENT' });
});
