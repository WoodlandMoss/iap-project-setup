# IAP M6 — Tests and Bug-Injection Demonstration

**Status:** Complete.

## What to do, mapped to evidence

1. **Acceptance test for the M5 thin slice** —
   [`test/acceptance.assignments.test.js`](../../test/acceptance.assignments.test.js)
   (real HTTP, real `node:sqlite`, no mocks): create an assignment, read it
   back, and reject an invalid one.
2. **Unit tests for the logic underneath** —
   [`test/unit.validation.test.js`](../../test/unit.validation.test.js): 12
   cases against `src/validation.js`'s `isValidDate` and
   `validateAssignmentInput`, extracted out of the HTTP handler specifically
   so it's testable as pure logic.
3. **Coverage report** — [`coverage-report.txt`](coverage-report.txt), via
   `npm run test:coverage` (Node's built-in `--experimental-test-coverage`,
   no added dependency). 97.38% lines overall; the only gap is the
   `require.main === module` server-startup block in `src/index.js`, which
   isn't reachable from a test.
4. **Bug injection** — [`bug-injection/`](bug-injection/): a one-line
   argument-order swap that corrupts stored `course`/`dueDate` values,
   caught only after closing a real gap in the acceptance test (it checked
   `id`/`title` on the list response but not the rest of the record). Full
   diff → failing run → fixed run in
   [`bug-injection/README.md`](bug-injection/README.md).

## Evidence

- **Test run output:** [`test-run-output.txt`](test-run-output.txt) — 16/16
  passing.
- **Coverage report:** [`coverage-report.txt`](coverage-report.txt).
- **Bug-injection evidence (three parts):**
  [`bug-injection/1-fault-diff.patch`](bug-injection/1-fault-diff.patch),
  [`bug-injection/2-suite-failing.txt`](bug-injection/2-suite-failing.txt),
  [`bug-injection/3-suite-fixed.txt`](bug-injection/3-suite-fixed.txt).

See the "Milestone 6" entry in [`PROMPT_LOG.md`](../../PROMPT_LOG.md) for
the prompt-and-diff record.
