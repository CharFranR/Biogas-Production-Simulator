# Skill Registry

Generated: 2026-03-28
Project: biogas-production-simulator

This registry lists available agent skills and project-level instruction files that can influence how changes are implemented/reviewed.

## Project Instruction Files (root)

- None found in repository root (`AGENTS.md`, `agents.md`, `CLAUDE.md`, `GEMINI.md`, `copilot-instructions.md`, `.cursorrules`).

## Skills Available

Source directories scanned:

- User-level: `~/.config/opencode/skills/`, `~/.copilot/skills/`
- Project-level: `.claude/skills/`, `.gemini/skills/`, `.agent/skills/`, `skills/` (none found)

Deduplication: project-level would win over user-level; between user-level sources, `~/.config/opencode/skills/` was preferred when duplicates existed.

Excluded: `sdd-*`, `_shared`, `skill-registry`.

| Skill | Location | Trigger (from description) |
|------|----------|----------------------------|
| `branch-pr` | `~/.config/opencode/skills/branch-pr/SKILL.md` | creating a pull request / opening a PR / preparing changes for review |
| `issue-creation` | `~/.config/opencode/skills/issue-creation/SKILL.md` | creating a GitHub issue / reporting a bug / requesting a feature |
| `go-testing` | `~/.config/opencode/skills/go-testing/SKILL.md` | writing Go tests / Bubbletea TUI testing / adding test coverage |
| `judgment-day` | `~/.config/opencode/skills/judgment-day/SKILL.md` | “judgment day”, “review adversarial”, “dual review”, “doble review”, “juzgar”, “que lo juzguen” |
| `skill-creator` | `~/.config/opencode/skills/skill-creator/SKILL.md` | creating a new skill / adding agent instructions / documenting patterns for AI |

## Compact Rules (for auto-resolve)

Use this section to quickly decide which skill to load.

- **PR work** → load `branch-pr` (issue must be approved, 1 `type:*` label, use PR template)
- **Creating an issue** → load `issue-creation` (must use templates; issues start as `status:needs-review`)
- **Go testing** → load `go-testing` (table-driven tests, Bubbletea/teatest patterns)
- **Adversarial review** → load `judgment-day` (requires skill registry + parallel blind judges; max 2 fix iterations)
- **Creating skills** → load `skill-creator` (follow Agent Skills spec, include triggers/frontmatter)
