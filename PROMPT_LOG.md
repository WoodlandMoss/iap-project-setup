# Prompt-and-Diff Log

This log tracks every AI-assisted change made to this project, organized by
milestone. Each entry records the prompt given to the AI tool and the
resulting diff/commit, so it's clear what was AI-generated versus
hand-written. A milestone with no AI involvement says so directly instead of
listing prompts.

**Tool used:** Claude Code (Sonnet 5)

---

## Milestone 1: Repository and toolchain

**Prompt:**
> help me do this assignment: [pasted IAP 1 - Repository and Toolchain
> assignment text]

**Response:** Explained what was needed and, after the working directory was
wiped, walked through rebuilding the project step by step: `git init`,
`npm init`, an Express app with a `/health` route, a `node --test` sanity
suite, `.gitignore`, `README.md`, and pushing to the existing GitHub remote.

**Diff:** Created `package.json`, `src/index.js`, `test/sanity.test.js`,
`.gitignore`, `README.md`. All AI-suggested code was reviewed before
accepting.

**Commit:** `d11a836` — Initial project skeleton: Express + node:sqlite,
passing test

**Notes:** Concept brief and stack choice (Node/Express/SQLite) were
confirmed with the student before being written into the README.

---

<!-- Add new milestones below as the project progresses. -->
