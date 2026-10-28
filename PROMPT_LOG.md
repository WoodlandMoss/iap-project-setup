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

**Commit:** `6fdd83f` — M2: elicitation raw output + audit

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

**Commit:** `de87c0d` — M3: domain model and AI critique

---

## Milestone 4: ADR-001

**Prompt:**
> Help with one real decision already made on this app — context,
> the decision, at least two genuine alternatives with why each was
> rejected, and consequences that name what's now harder, not only what's
> easier. Base it on the node:sqlite-vs-ORM decision defended in the design
> walkthrough.

**Response:** Provided ideas for a full ADR grounding the context in M1's fixed stack
and M3's fixed schema (one entity, no relationships), stating the decision
(hand-written SQL over `node:sqlite`, no ORM or query builder), two
alternatives considered (a full ORM; a query builder as a middle ground)
each with a specific reason it was rejected, and a consequences section
listing both what the decision buys (zero dependencies, transparency,
simpler synchronous handlers) and what it costs (no enforced query
parameterization, no migration tooling, a hand-rewrite required to change
database engines or add concurrency).

**Diff:** Added `docs/adr/ADR-001-node-sqlite-without-orm.md` and
`assignments/IAP M4 - ADR-001/README.md` (pointer to the ADR, since it lives
under `docs/adr/` rather than the milestone folder).

**Commit:** `9e57dae` — M4: ADR-001 for node:sqlite over an ORM

---

## Milestone 5: Walking Skeleton

**Prompt:**
> Implement one real, end-to-end thin slice — no mocks or stubs — plus CI
> that actually runs it. Build on ADR-001: create an assignment over real
> HTTP, have it actually land in node:sqlite, and read it back. Set up
> GitHub Actions to run the test suite on every push.

**Response:** Added `src/db.js` (opens the SQLite file, creates the
`assignment` table from `domain-model.mmd` if it doesn't exist) and wired
`POST /assignments` / `GET /assignments` into `src/index.js`, with NFR-3
validation (missing `title`/`dueDate`, or a non-ISO-8601 `dueDate`, returns
400). Added `test/assignments.test.js`, which drives the same path over real
HTTP against an in-memory `node:sqlite` database: create, then list, then a
rejected invalid create. Verified the slice manually too — started the real
server, created an assignment via `curl`, killed the process outright,
started a fresh one on the same port, and confirmed the assignment was still
there (proving real disk persistence, not in-process memory), captured as
`walking-skeleton-evidence.png`. Added `.github/workflows/ci.yml` running
`npm ci && npm test` on every push.

**Diff:** Added `src/db.js`, `test/assignments.test.js`,
`.github/workflows/ci.yml`, `assignments/IAP M5 - Walking Skeleton/README.md`
and `walking-skeleton-evidence.png`. Modified `src/index.js` (new routes),
`test/sanity.test.js` (updated to pass an in-memory db explicitly), and
`.gitignore` (excludes the runtime `*.sqlite` file).

**Commit:** `dcda3ed` — M5: walking skeleton -- real create+list slice with CI
**CI run:** https://github.com/WoodlandMoss/iap-project-setup/actions/runs/37020974393 (success)

---

## Milestone 6: Tests and Bug-Injection Demonstration

**Prompt 1 (test restructuring):**
> Write an acceptance test for the M5 thin slice and unit tests for the
> logic underneath it, plus a coverage report. Extract the inline
> validation out of the Express handler first so it's actually
> unit-testable.

**Response:** Added `src/validation.js` (`isValidDate`,
`validateAssignmentInput`), pulled out of the `POST /assignments` handler
so it's testable without HTTP or a database. Renamed
`test/assignments.test.js` to `test/acceptance.assignments.test.js` to make
explicit it's the acceptance layer. Added `test/unit.validation.test.js`
(12 cases: missing/empty title, missing/malformed `dueDate` in several
shapes, course optional). Added `npm run test:coverage` using Node's
built-in `--experimental-test-coverage` (no new dependency). Result: 16/16
passing, 97%+ line coverage.

**Diff:** Added `src/validation.js`, `test/unit.validation.test.js`.
Renamed `test/assignments.test.js` to `test/acceptance.assignments.test.js`.
Modified `src/index.js` (uses `validateAssignmentInput`), `package.json`
(`test:coverage` script).

**Commit:** `331a151` — M6: extract validation, split acceptance/unit tests, add coverage

---

**Prompt 2 (bug injection, chosen collaboratively):**
> Pick 2-3 candidate faults for the bug-injection demonstration and explain
> the tradeoffs; after discussion, inject the chosen one, run the suite,
> capture the failure, fix it, and capture the suite passing again.

**Response:** Proposed four candidates (sort-order flip, a weakened boolean
in validation, a dropped regex anchor, and an argument-order swap in the
insert call) with a prediction of which the existing suite would or
wouldn't catch. Selected, with the user: swapping the `course`/`dueDate`
arguments passed to `stmt.run(...)` in `POST /assignments` — realistic bug
class, immediately visible to a user, and (confirmed) invisible to the
existing suite, since the acceptance test only asserted `id`/`title` on the
`GET` response. Manually verified the corruption via direct requests before
touching tests. Added the missing `course`/`dueDate`/`status` assertions to
`test/acceptance.assignments.test.js`, confirmed the suite now fails
(15 pass, 1 fail) with the fault present, reverted the fault, confirmed
16/16 passing again. Also fixed a real bug found along the way: the
acceptance tests didn't close their HTTP server when an assertion threw,
which hung `node --test` instead of reporting a clean failure; wrapped both
acceptance tests and the sanity test in `try`/`finally`.

**Diff:** Modified `test/acceptance.assignments.test.js` (new assertions,
`try`/`finally` cleanup), `test/sanity.test.js` (`try`/`finally` cleanup).
Added `assignments/IAP M6 - Tests and Bug-Injection Demonstration/` with
`test-run-output.txt`, `coverage-report.txt`, and `bug-injection/`
(`1-fault-diff.patch`, `2-suite-failing.txt`, `3-suite-fixed.txt`,
`README.md` narrating the find-gap-close-gap story).

**Commit:** `f16beae` — M6: bug-injection demonstration -- swapped course/dueDate args

---

## Milestone 7: Documented Refactor

**Prompt:**
> Identify something in the codebase that's genuinely worse than it
> should be, name the smell, refactor it, run the same M6 test set before
> and after unchanged, and write a short note on what was wrong, what
> changed, and what's now easier.

**Response:** Considered five candidates before picking one: deduplicating
the repeated `course || null` normalization, deduplicating the repeated
validation error string, extracting a `createAssignment(db, input)`
service function (ruled out as speculative — nothing discovered motivates
it yet, the exact anti-pattern Session 9 warns against), deduplicating
test-setup boilerplate between `sanity.test.js` and
`acceptance.assignments.test.js`, and fixing `POST /assignments`'s
response to reflect the persisted row instead of echoing the request.
Picked the last one: it's the only candidate traceable to a real, already
proven failure mode — it's the structural root cause of the M6
bug-injection finding (a swapped-column corruption a correct-looking
`POST` response completely hid, because the response never actually
checked what was stored). Ran the existing 16-test suite before touching
anything (16/16 passing), refactored `POST /assignments` in `src/index.js`
to `INSERT` then re-select the created row by id and return it directly,
ran the same 16 tests again (16/16 passing, diffed byte-for-byte identical
test names/order against the before run), and manually confirmed via
direct HTTP requests that the real response now reflects the real
database row.

**Diff:** Modified `src/index.js` (`POST /assignments` now reads back the
inserted row instead of reconstructing a response from input). Added
`assignments/IAP M7 - Documented Refactor/` with
`1-test-output-before.txt`, `2-test-output-after.txt`,
`3-refactor-diff.patch`, `NOTE.md`, and `README.md`.

**Commit:** *(fill in after committing)*
