# Lumina Agent

Shared agent rules, skills and workflows for Claude Code, Codex and Antigravity. Install them into a project with `npx`.

## Setup

Requirements: Node.js 20+, npm/npx, Git, and SSH access to this private GitHub repository (`0132E282/lumina-agent`). The installer does not install the AI applications themselves.

Run from the project directory:

```bash
npx --yes --package='git+ssh://git@github.com/0132E282/lumina-agent.git' lumina-agent setup
```

Preview the changes or choose a project directory:

```bash
npx --yes --package='git+ssh://git@github.com/0132E282/lumina-agent.git' lumina-agent setup --dry-run
npx --yes --package='git+ssh://git@github.com/0132E282/lumina-agent.git' lumina-agent setup --target /path/to/project
```

Install user-level instructions for Claude Code and Codex under `~/`:

```bash
npx --yes --package='git+ssh://git@github.com/0132E282/lumina-agent.git' lumina-agent setup --global
```

Project setup installs the shared `.agents/` rules and skills, Claude configuration, Codex adapters, and root instructions used by Antigravity. Global setup targets Claude Code and Codex; for Antigravity, run setup in the project it should use. `setup` can also be called as `init`. Re-running setup is safe; conflicting existing files stop the installer instead of being overwritten. The CLI fetches the private repository over SSH on each run, including dry runs.

Once setup finishes, start a new agent session. Claude hooks only run in Claude Code; Codex and Antigravity use the shared rules and skills through their own discovery mechanisms.

## Workflows

- Plan in the runtime's native Plan mode; project guidance adds task, acceptance-criteria and test handoffs.
- `/test` in Claude Code or `$workflow-test` in Codex tests the active plan by default. Use `repo` or `pr` to select a broader scope. Test cases and algorithm complexity go to the repository-root `testcase.json` by default.
- `/review` reviews current changes; `repo` and `pr` select a repository snapshot or pull request.
- `/git` commits all eligible changes by default. It also supports scoped commits, merges and pull requests. Commit does not push.
- `/cleanup` refreshes agent context; it does not delete project files.
- Implementation follows the shared implementation rule. A change report is required when a task is complete.

Codex workflow skills use `$workflow-test`, `$workflow-review`, `$workflow-git` and `$workflow-cleanup`. Antigravity reads project `AGENTS.md` and shared `.agents/` resources.

## Development

```bash
npm run check
npm test
python3 scripts/check-agent-config.py
```

`npm run design:lint -- path/to/DESIGN.md` checks a design file; `npm run design:spec` prints its format specification. Claude Code can set up and run these with `/design path/to/DESIGN.md`.

Edit shared rules and skills in `.agents/`. Run the checks above after configuration changes. The installer package is private and is fetched from GitHub over SSH; it is not published to the public npm registry.

**License:** [MIT](./LICENSE)
