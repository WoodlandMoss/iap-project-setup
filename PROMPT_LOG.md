# Prompt-and-Diff Log

This log records every AI-assisted change made to this project, organized by
milestone. Each entry documents the prompt supplied to the AI tool and the
resulting diff or commit, distinguishing AI-generated work from hand-written
work. Milestones with no AI involvement are marked as such rather than
listing prompts.

**Tool used:** Claude Code (Sonnet 5)

---

## Milestone 1: Repository and Toolchain Setup

**Prompt:**
> Assist with the "IAP 1 - Repository and Toolchain" assignment, covering
> repository creation, README content, toolchain verification, and AI tool
> verification.

**Response:** Outlined the assignment requirements, then scaffolded the
project from an empty directory: initialized git, configured `package.json`
and npm scripts, implemented a minimal Express application with a health
check route, added a `node --test` sanity suite, created `.gitignore` and
`README.md`, and published the repository to GitHub.

**Diff:** Added `package.json`, `src/index.js`, `test/sanity.test.js`,
`.gitignore`, and `README.md`. All generated code was reviewed before being
accepted.

**Commit:** `d11a836` — Initial project skeleton: Express + node:sqlite,
passing test

**Notes:** The project concept and technology stack were confirmed by the
author prior to being recorded in the README.

---

<!-- Additional milestones appended below as the project progresses. -->
