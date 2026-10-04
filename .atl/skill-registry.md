# Skill Registry

> Index of installed skills. Sub-agents receive exact SKILL.md paths; read the full source for rules.

## User-level skills (`~/.config/opencode/skills/`)

| Skill | Trigger / Description | Path |
|-------|----------------------|------|
| branch-pr | Create Gentle AI pull requests with issue-first checks. Trigger: creating, opening, or preparing PRs for review. | `C:\Users\Javier\.config\opencode\skills\branch-pr\SKILL.md` |
| chained-pr | Trigger: PRs over 400 lines, stacked PRs, review slices. Split oversized changes into chained PRs that protect review focus. | `C:\Users\Javier\.config\opencode\skills\chained-pr\SKILL.md` |
| cognitive-doc-design | Design docs that reduce cognitive load. Trigger: writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs. | `C:\Users\Javier\.config\opencode\skills\cognitive-doc-design\SKILL.md` |
| comment-writer | Write warm, direct collaboration comments. Trigger: PR feedback, issue replies, reviews, Slack messages, or GitHub comments. | `C:\Users\Javier\.config\opencode\skills\comment-writer\SKILL.md` |
| go-testing | Trigger: Go tests, go test coverage, Bubbletea teatest, golden files. Apply focused Go testing patterns. | `C:\Users\Javier\.config\opencode\skills\go-testing\SKILL.md` |
| issue-creation | Create Gentle AI issues with issue-first checks. Trigger: creating GitHub issues, bug reports, or feature requests. | `C:\Users\Javier\.config\opencode\skills\issue-creation\SKILL.md` |
| judgment-day | Trigger: judgment day, dual review, adversarial review, juzgar. Run blind dual review, fix confirmed issues, then re-judge. | `C:\Users\Javier\.config\opencode\skills\judgment-day\SKILL.md` |
| skill-creator | Trigger: new skills, agent instructions, documenting AI usage patterns. Create LLM-first skills with valid frontmatter. | `C:\Users\Javier\.config\opencode\skills\skill-creator\SKILL.md` |
| skill-improver | Trigger: improve skills, audit skills, refactor skills, skill quality. Audit and upgrade existing LLM-first skills. | `C:\Users\Javier\.config\opencode\skills\skill-improver\SKILL.md` |
| work-unit-commits | Plan commits as reviewable work units. Trigger: implementation, commit splitting, chained PRs, or keeping tests and docs with code. | `C:\Users\Javier\.config\opencode\skills\work-unit-commits\SKILL.md` |

## User-level skills (`~/.agents/skills/`)

| Skill | Trigger / Description | Path |
|-------|----------------------|------|
| find-skills | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. | `C:\Users\Javier\.agents\skills\find-skills\SKILL.md` |

## Project-level skills

None detected.

## Convention files

- `README.md` — project readme (Spanish). No `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or copilot instructions found in the project root.

## Notes

- Skipped `sdd-*`, `_shared`, and `skill-registry` skills from this index (handled by the SDD pipeline itself).
- No `node_modules`, package manifests, or build tooling detected — this is a static HTML/CSS/JS site.
