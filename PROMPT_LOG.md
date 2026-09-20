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
## Milestone 2: Requirements and AI Elicitation Audit

[#milestone-2-requirements-and-ai-elicitation-audit](#milestone-2-requirements-and-ai-elicitation-audit)

**Prompt 1 (requirements drafting):**
> Act as an interviewer for the gathering of requirements for my IAP,
> per the IAP M2 spec: 6-8 user stories with acceptance criteria in a
> consistent format, plus 3 falsifiable non-functional requirements.

**Response:** Interviewed ideas for 8 user stories (create, list, mark complete, filter
by course, filter by status, edit, delete, overdue flagging) in
Given/When/Then format, and 3 NFRs with concrete, testable thresholds
(response time under load, data durability across restart, input
validation returning HTTP 400).

**Diff:** Added `REQUIREMENTS.md`. Reviewed and accepted with no scope
changes — the app description was already fixed by the M1 README.

---

**Prompt 2 (elicitation, separate/isolated):**
> I'm building an app called an assignment task manager for students to
> track coursework across multiple classes. Elicit requirements for me —
> what should this app do?

**Response:** Produced a broad, unscoped feature list (accounts/SSO,
push/email reminders, file attachments, calendar sync, recurring
assignments, collaboration, gamification, analytics dashboard, offline
sync, native mobile app) plus a non-functional section consisting of
unfalsifiable statements ("fast," "secure," "scalable").

**Diff:** Added `ai-elicitation-raw.md` (kept verbatim, unedited, as
evidence) and `ELICITATION_AUDIT.md` (human-written audit: omissions,
inventions, and correct insights, closing with a judgment that the
elicitation defaulted to startup-scale assumptions because it was never
asked what the project's actual constraints were).

**Commit:** *(fill in after committing, e.g. `abc1234` — M2: requirements
+ elicitation audit)*

---

## Milestone 3: Domain Model and AI Critique

**Prompt 1 (AI's first draft, cold, requirements attached):**
> Here are the requirements for my app [`REQUIREMENTS.md` pasted in full].
> Draft a domain model for it as a Mermaid ER diagram.

**Response:** Produced a 6-entity model — `USER`, `COURSE`, `ASSIGNMENT`,
`TAG`, `REMINDER`, `SETTINGS` — with a `USER`-owns-`COURSE`-contains-
`ASSIGNMENT` hierarchy, a many-to-many `ASSIGNMENT`/`TAG` join, and extra
`ASSIGNMENT` fields (`description`, `priority`, `estimatedMinutes`) not
present in any user story.

**Diff:** Added `domain-model-raw.mmd` and `DOMAIN_MODEL_RAW.md` (kept
verbatim, unedited, as evidence).

---

**Prompt 2 (adopted model, separate pass):**
> Reduce that draft to only what `REQUIREMENTS.md`'s user stories actually
> require, tracing every entity and attribute back to a specific story or
> NFR.

**Response:** Collapsed the model to a single `ASSIGNMENT` entity (`id`,
`title`, `course`, `dueDate`, `status`), dropping `USER`, `COURSE`,
`SETTINGS`, `REMINDER`, and `TAG` as unsupported by any requirement, and
explicitly excluding `overdue` as a stored column since US-8 defines it as a
comparison made at read time, not a persisted fact.

**Diff:** Added `domain-model.mmd`, `DOMAIN_MODEL.md`, and
`DOMAIN_MODEL_CRITIQUE.md` (critique of the M3-Prompt-1 draft against the
adopted model — over-modelling, under-modelling, invented relationships, and
what it got right).

**Commit:** *(fill in after committing)*
