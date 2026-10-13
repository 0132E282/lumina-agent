# Shared Agent Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A reusable **`.claude/` configuration** that turns Claude Code into a structured, multi-agent software development pipeline — from raw requirement to reviewed, committed code — enforcing a consistent set of engineering rules at every step.

---

## Table of Contents

- [Structure](#-structure)
- [End-to-end workflow](#-end-to-end-workflow)
- [Core rules](#-core-rules-clauderules)
- [Using this in another project](#-using-this-in-another-project)
- [GitHub Actions](#-github-actions)
- [Contributing](#-contributing)
- [Antigravity](#antigravity)
- [Configuration maintenance](#configuration-maintenance)

## 🗂 Structure

| Folder | What it holds |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | Codex instructions referencing the shared conventions and rules |
| [`.agents/rules/`](./.agents/rules) | Canonical shared Markdown rules for Claude and Codex |
| [`.agents/skills/`](./.agents/skills) | Canonical shared skills and workflow adapters, discovered by Codex |
| [`.codex/agents/`](./.codex/agents) | Codex custom agents in TOML, inheriting the session model |
| [`.codex/rules/`](./.codex/rules) | Link to `.agents/rules/`, loaded through AGENTS.md |
| [`.codex/skills/`](./.codex/skills) | Convenience link to `.agents/skills/`; Codex discovery remains in `.agents/skills/` |
| [`.claude/agents/`](./.claude/agents) | Subagents — each with its own tools, model, and single responsibility |
| [`.claude/commands/`](./.claude/commands) | Direct slash commands such as `/review`, `/git`, `/cleanup` — planning uses native Plan mode |
| [`.claude/skills/`](./.claude/skills) | Link to the shared `.agents/skills/` directory |
| [`.claude/rules/`](./.claude/rules) | Link to the shared rules in `.agents/rules/` |
| [`.claude/hooks/`](./.claude/hooks) | Automated hooks (audit log, commit-msg guard, secret scan, auto-format, auto-lint...) |

### Agents

| Agent | Role |
|---|---|
| `requirement-analysis-agent` | Turns a raw requirement (text/image/PDF/DOCX...) into a clear purpose/scope/impact analysis, classifies it as a new feature vs. a small fix, and recommends the next step |
| `system-design-agent` | Produces HLD/LLD, data model, API, and reliability/security/performance design for features that need architecture |
| `planner-agent` | Breaks a spec or design doc into traceable tasks (REQ → Task → AC → Test) — plan only, never touches product code |
| `coding-agent` | Implements code per SOLID/DRY/KISS/YAGNI, strictly within the assigned scope |
| `setup-agent` | Installs and configures requested tools, libraries, runtimes and applications; verifies compatibility and a working smoke test |
| `qa-tester-agent` | Designs and executes test cases (equivalence partitioning, boundary values, decision tables...) with full requirement traceability |
| `reviewer-agent` | Independent "fresh eyes" review for code, plans, or test cases — never fixes, only reports |
| `researcher-agent` | Reads widely, answers briefly — local docs first, then web, no fabrication |
| `workspace-auditor-agent` | Finds likely-unneeded files/folders — lists with evidence, never deletes |
| `leak-hunter` | Finds where protected data (correct answers, unreleased content, PII...) could reach the client early — lists with evidence, never fixes |

### Commands

| Command | Does |
|---|---|
| `/test [feature\|repo [branch]\|pr [URL/#number]]` | QA features from the active plan by default; save cases, results and algorithm complexity in root testcase.json |
| `/review` | Review current working-tree changes; return findings in chat by default |
| `/review repo [.|branch]` | Review the full tracked code snapshot at HEAD or a named branch |
| `/review pr [URL|#number] [--comment] [--file]` | Review a PR; optionally post a PR comment and/or save a JSON report |
| `/git` or `/git commit [all]` | Commit all valid changes by default, excluding secrets and temporary/junk files |
| `/git commit change` | Commit only the current task's changes with a validated Conventional Commit |
| `/git merge source [into target]` | Merge source into the current branch by default, resolve supported conflicts, and run relevant checks |
| `/git pr [into target] [from source]` | Create/update a PR; default to a confirmed parent branch, otherwise a development branch, then the primary branch |
| `/git main [repository-name] [into current\|main] [from source]` | Prepare the repository and create/update a PR into the selected branch (primary by default), then ask before merging |
| `/cleanup` | Compact working context while retaining objectives, decisions, evidence and next steps; does not delete files |

`/review` is the single review entrypoint; Codex uses `$workflow-review` with the same arguments. PR comments require `pr --comment`; JSON reports require `--file` and use `.agents/skills/workflow-review/assets/review-json-template.json`, with a matching `docs/reviews/index.json` entry. Without those flags, results stay in chat.

Implementation is a shared rule (`.agents/rules/implementation.md`), and reports are mandatory at task completion; neither needs a separate command. `/cleanup` and Codex's `$workflow-cleanup` consolidate context refresh. They preserve pending tasks and decisions, use native compaction only when available, and otherwise provide a handoff summary without claiming to reset history or memory. Workspace file cleanup remains a separate skill.

`/test` reads the current plan's features/tasks when available; `repo` and `pr` select broader or PR-specific scopes. Cases/results go to root `testcase.json` using `.agents/skills/workflow-test/assets/testcase-template.json`, preserving IDs/history. `algorithmComplexity` records input sizes, Before/After time and space, allocation, preprocessing, I/O and supporting evidence. Unexecuted tests are Not Run; static analysis is not a benchmark.

### Skills

| Skill | Purpose |
|---|---|
| `git-workflow` | Gatekeeper for every commit/PR — Conventional Commits, conflict-safe merging |
| `workflow-plan` | Adds project-specific task/AC/test planning and handoff rules to the runtime's existing Plan mode |
| `report` | Formats change reports and review reports from already-done work |
| `docs` | Reconciles README/CLAUDE.md/docs against the actual codebase, or writes a lean first version when none exists (leaner `/init`) — not system architecture specs |
| `cleanup-temp-files` | Removes Claude's own temp files from the current session |
| `markitdown` | Converts PDF/DOCX/PPTX/XLSX/images/... to Markdown |
| `database` | SQL/NoSQL query review, schema/index design, performance analysis |
| `design-patterns` | Reference for the 22 GoF patterns, grouped by when to actually use them |
| `review-web-security` | Web security review (authn/authz, injection, frontend, API, infra...) with evidence, severity, fix, and regression tests |
| `testing-strategy` | Technical unit testing: picking the right test double, Arrange-Act-Assert structure, risk-based coverage |
| `dependency-audit` | Read-only dependency vulnerability audit (npm/composer/pip/cargo/go) — reports and suggests, never auto-upgrades |
| `refactoring-catalog` | Fowler-style refactoring techniques mapped to specific code smells |
| `ci-pipeline` | Authoring/reviewing CI workflows (GitHub Actions/GitLab CI) — fail-fast job order, caching, secret handling |
| `testcase` | Writing a few structured test cases quickly (ID/Priority/Steps/Expected result) without spawning the full `qa-tester-agent` agent |

---

## 🔄 End-to-end workflow

```
user request  →  (planning needed?) → native Plan mode + workflow-plan  →  implementation rules  →  /test  →  /review  →  /git commit  →  /git main
                 │                                               ↑
                 └── (small fix) ────────────────────────────────┘
```

Each stage **stops and asks for confirmation** before moving to the next — nothing auto-cascades from analysis straight to a commit. Documents are handed off **by file path** (`docs/requirement-analysis.md` → `docs/system-design.md` → `docs/implementation-plan.json`), not by pasting full text into the next agent's prompt, so context stays small and traceable.

Planning has no custom slash command. Use the runtime's existing Plan mode and describe the work; `AGENTS.md` routes planning to the shared `workflow-plan` skill. Codex can also invoke `$workflow-plan` explicitly. The skill supplements the native mode with scoped research/design, tasks, acceptance criteria, tests and handoff; it does not switch modes or bypass their permissions. If native mode restricts repository writes or requires its own plan-file format, use that permitted output and report the JSON/index handoff as not yet saved. Save the structured handoff when repository-document writes become permitted, then follow the runtime's existing approval step without asking for duplicate approval.

`/git` and `/git commit` default to `commit all`; `/git help` displays usage. No `--` prefixes are used in these workflow arguments. Commit does not imply push or PR creation. Temporary/scratch/debug/ad-hoc test files, logs/cache, `.DS_Store`, `.dssc`, backups and secrets are excluded from commit/push; official tests remain deliverables. Before pushing, inspect every outgoing commit, including files added then deleted, and stop if prohibited content is present.

`main` combines repository preparation and PR creation; an existing repository is reused. The optional name identifies the repository, not a branch. Missing repository details or permissions are resolved before dependent work; a fresh repository without the commits/branches required for a PR is reported as incomplete. PR merge approval is requested only after the concrete PR is ready and its checks/conflicts have been assessed. Codex uses the single `$workflow-git` skill with the same arguments; old commit/PR adapters are removed. `git-workflow` remains the shared rules skill, not another command.

`/git merge feature/login` merges that branch into the current branch; `into main` explicitly selects a named target. Local merge resolves conflicts with sufficient evidence, runs checks, and never implies push. Ambiguous conflicts or a dirty worktree are reported before proceeding.

`/git main` targets the remote's actual primary branch, using the current branch as source. `/git main into current from feature/login` instead opens a PR from `feature/login` into the branch checked out when the command was invoked. Missing source branches are clarified before creating the PR; source and base must differ. These options select the PR's target, not an immediate local merge.

`/git pr` is the short PR command. Explicit targets and an existing PR's base take precedence; otherwise a confirmed branch of origin is used (for example, a feature created from `developer` targets `developer`). When origin is unknown, use the project's `developer`/`develop` integration branch if present, otherwise the actual primary branch. Ambiguous origins or multiple development branches require clarification; Git ancestry and upstream tracking alone do not identify the original branch. Use `/git pr into release/1.0` to select another target explicitly.

Before resolving remote conflicts, fetch the relevant refs and record their SHAs and merge-base. Resolve each hunk against that base: accept incoming changes where the user made no change, preserve the user's edits where both sides conflict, and retain non-conflicting incoming changes. Determine the user's side from scope and diffs rather than branch names or ours/theirs labels. Fetch does not silently authorize an extra pull/merge/rebase; unresolved ownership or a dirty worktree requires clarification.

---

## 📐 Core rules (`.claude/rules/`)

Every agent is bound by some or all of the rule files in `.claude/rules/` (one file per group, e.g. `simplicity.md`, `data-safety.md`):

KISS+YAGNI · Clean Code · SRP/Separation of Concerns · DRY · SOLID · Fail-Fast Validation · Data Safety (authz/transactions) · Quality Assurance (test/lint/review) · Complexity/Performance · Setup Rule/Template Changes · Commit Discipline · PR Conflict Safety · Comment Discipline · Database Read-Only by Default · Local-First Search + No Fabrication · Documentation as Code Sync · Documentation Reading + TOC · Type Safety · Backend Contract/Content/Security · Frontend Design Fidelity/Accessibility · Black-Box Feature Testing · Plan Output Format (JSON, `planner-agent` only) · Open Questions Table · Mandatory Report · Response Style.

`coding-agent` reads every rule file in the shared directory before coding; other agents apply the rule files relevant to their task.

---

## 🚀 Using this in another project

This is a **private GitHub repository**. Only accounts granted read access can install it. Requirements: Node.js 20+, npm/npx, Git, and a [GitHub SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) authorized for `0132E282/lumina-agent`. Configure your SSH key, known host and organization SSO authorization, if applicable, before running the command. No token belongs in the command, project settings or logs. The package is marked `private: true`; it is not published to public npm.

**Availability:** these commands become usable from GitHub after the CLI changes have been pushed to the private repository. Local tests do not establish that the remote version already contains the CLI.

From your target project directory, install **skills, rules, agents, commands and Claude hook configuration together**:

```bash
npx --yes --package='git+ssh://git@github.com/0132E282/lumina-agent.git' lumina-agent setup
```

Preview changes, or choose another project directory:

```bash
npx --yes --package='git+ssh://git@github.com/0132E282/lumina-agent.git' lumina-agent setup --dry-run
npx --yes --package='git+ssh://git@github.com/0132E282/lumina-agent.git' lumina-agent setup --target /absolute/path/to/project
```

Or install user configuration under your home directory (`~/`) for Claude and Codex:

```bash
npx --yes --package='git+ssh://git@github.com/0132E282/lumina-agent.git' lumina-agent setup --global
npx --yes --package='git+ssh://git@github.com/0132E282/lumina-agent.git' lumina-agent setup --global --dry-run
```

`setup` defaults to the current project directory. `--global` uses the operating system's home directory and cannot be combined with `--target`. Global instructions are appended to `~/.codex/AGENTS.md` and `~/.claude/CLAUDE.md`; shared payload stays in `~/.agents/`, `~/.claude/`, `~/.codex/` and `~/CONTRACT.md`. Global instruction links and Claude hook script commands use absolute home paths, so opening another project does not change where these files resolve. Hooks still operate on the active project's working directory. Existing user settings and instructions are preserved; conflicting payload files stop the install. A custom `CODEX_HOME` is not targeted by `--global`. `init` remains a compatible alias for `setup`.

The CLI clones the private repository's current default branch through SSH on **every setup/init**, including dry runs and runs using npm's cached CLI. Authentication or network failure stops installation. Clone timeout is 120 seconds; the temporary clone is cleaned up after success or failure. npm distributes only the executable, not the configuration payload (npm packaging does not preserve symlinks). See [npm exec](https://docs.npmjs.com/cli/v11/commands/npm-exec/) and [package bin/private fields](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/).

The installer preserves relative symlinks and executable file modes on macOS/Linux. It includes shared `.agents/rules/` and `.agents/skills/`, Claude agents/commands/hooks/settings, Codex adapters and their shared links, plus `CONTRACT.md`. Project setup appends a small integration block to `AGENTS.md` and `CLAUDE.md`, preserving existing project instructions rather than copying this repository's maintenance guide. Existing Claude settings are preserved and hook commands are merged without adding duplicate matching commands. It excludes repository history, storage/logs, project docs, `.DS_Store`, credential/key files and environment files. It does not install or update the Claude/Codex applications, install hook dependencies, run hooks or alter your project's package manifest/Git hooks.

All content/link/settings conflicts are checked before writing. Different existing files, a different `CONTRACT.md`, an edited integration block or malformed settings stop the install; there is no overwrite/force option. Repeating the same install is idempotent. Dry runs do not write to the target. Use actual directory paths: target roots/ancestors and payload parent directories cannot be symlinks. Keep the target directory unchanged while installation runs; unexpected filesystem failures or process interruption during writes can leave a partial install.

Removing repository access prevents future authenticated installs, but cannot revoke configuration someone already downloaded or copied. The CLI is an installer, not DRM; it cannot prevent an authorized collaborator from sharing received files. Keep the repository private and manage collaborators in GitHub.

Start a new agent session after installation. Describe the task directly; use native Plan mode when planning is needed. Implementation follows the shared implementation rule and coding-agent; explicit workflow skills remain available across runtimes. Claude hook settings do not activate Claude hooks in Codex or Antigravity. Some Claude hooks need tools such as `jq` or `rtk`; consult [the hook guide](./.claude/hooks/README.md) and install only the dependencies you need.

## ✅ GitHub Actions

Workflow [`agent-config.yml`](./.github/workflows/agent-config.yml) runs on `push` and `pull_request` events targeting `main`.

It checks:

- Shared rules and skills structure and links.
- Codex agent adapters and their role sources.
- CLI syntax, installer tests and offline npm packaging/bin resolution.
- Whitespace errors in the commit changes.

Run the equivalent checks locally:

```bash
python3 scripts/check-agent-config.py
npm run check
npm test
git diff --check HEAD^ HEAD
```

### DESIGN.md tooling

This repository includes Google's [`@google/design.md`](https://github.com/google-labs-code/design.md) CLI as a development dependency. Use it to validate a UI project's `DESIGN.md` or inspect the current format specification:

```bash
npm run design:lint -- path/to/DESIGN.md
npm run design:spec
```

The format and CLI are currently alpha and may change. This agent-configuration repository does not define product UI design tokens; lint the actual `DESIGN.md` from a UI project.

In Claude Code, run `/design path/to/DESIGN.md` to set up the tooling in the active project, add missing `design:lint` / `design:spec` scripts, print the spec, and lint the selected file. With no argument, it checks `DESIGN.md`; if the file is missing, setup and spec still run and lint is reported as not run. The command preserves existing scripts, dependency versions and the project's package manager. A command installed under `~/` still sets up the active project, not a global npm package. The command file is included by the existing project/global installer; start a new Claude session after installation. Codex can follow `.claude/commands/design.md` as workflow instructions; these Claude slash commands are not registered automatically in Codex.

When enabling branch protection on GitHub, require the `Validate agent configuration` status check before merging. The installer CLI uses Node built-ins and `node --test`; the optional DESIGN.md tooling is a development dependency and is not used by installer runtime code. CI does not install dependencies, clone the private remote through SSH, lint a design file or deploy. No formatter is bundled; syntax/tests and whitespace checks are explicit.

---

## 🤝 Contributing

Open a PR if you have a rule, agent, or skill worth adding — keep each one single-purpose and link it from the relevant table above.

**License**: [MIT](./LICENSE)

## Antigravity

Open the repository root in Antigravity and start a new conversation. It loads `AGENTS.md` and uses the shared `.agents/skills/` and `.agents/rules/`. Invoke `/workflow-implement` for the `coding-agent` role — it applies `coding-frontend`/`coding-backend` internally per stack, don't invoke those skills directly. Rules have activation metadata; no separate copy is needed. Codex TOML agents and Claude hooks are not Antigravity configurations.

Setup follows the official [skills](https://www.antigravity.google/docs/skills) and [rules](https://www.antigravity.google/docs/rules) documentation.

## Configuration maintenance

Edit shared rules and skills only in `.agents/`. Claude and Codex paths are relative symlinks to this source. Keep the three directories and root instruction files together when copying the framework. Tool-specific agents and hooks remain separate. Run `python3 scripts/check-agent-config.py` after structural changes; this checks file configuration, not runtime tool discovery.
