# IAP M7 — Documented Refactor

**Status:** Complete.

## The smell

`POST /assignments` echoed the request's input back as its response
instead of reading back the row it had just inserted — the structural
root cause of the M6 bug-injection finding (a swapped-column corruption
that a correct-looking `POST` response completely hid). Named and
explained in full in [`NOTE.md`](NOTE.md).

## Evidence

1. **Test output, before the refactor:**
   [`1-test-output-before.txt`](1-test-output-before.txt) — 16/16 passing.
2. **Test output, after the refactor:**
   [`2-test-output-after.txt`](2-test-output-after.txt) — 16/16 passing,
   same test names and order
   (diffed byte-for-byte identical against the before run).
3. **The refactor diff:** [`3-refactor-diff.patch`](3-refactor-diff.patch)
   — `src/index.js`: insert, then re-select the created row by id, then
   return that row. A real data-flow change (echo-input → read-your-own-write),
   not a rename or reformat.
4. **The note:** [`NOTE.md`](NOTE.md) — what was wrong, what changed,
   what's now easier, and why the unchanged M6 test suite is real proof
   that behavior was preserved.

See the "Milestone 7" entry in [`PROMPT_LOG.md`](../../PROMPT_LOG.md) for
the prompt-and-diff record, including the alternative smells considered
and ruled out before this one.
