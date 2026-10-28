# Documented Refactor — Note

## What was wrong

`POST /assignments` built its response by echoing back the request's own
input variables (`title`, `course || null`, `dueDate`, hardcoded
`status: 'open'`) instead of reading back the row it had just inserted.

This is the structural root cause of the bug found and fixed in M6: when
`course` and `dueDate` got swapped in the `INSERT` call, the `POST`
response still looked completely correct, because it was never actually
checking what landed in the database — it was just repeating what the
client sent. Only `GET /assignments`, which does read from the database,
exposed the corruption. A response that doesn't reflect persisted state
can silently diverge from it, and nothing in the code would ever notice.

## What I did

In `src/index.js`, after the `INSERT`, added a `SELECT * FROM assignment
WHERE id = ?` using the new row's `id`, and return that row directly as
the response instead of hand-building an object from the request.

Full diff: [`3-refactor-diff.patch`](3-refactor-diff.patch).

## What is now easier

- **The `POST` response is now an honest source of truth.** It can no
  longer disagree with what's actually in the database, because it *is*
  what's in the database. A future version of the M6 bug (any mismatch
  between what's inserted and what's returned) would now be structurally
  impossible to hide behind a correct-looking `POST` response.
- **Less code to keep in sync.** The old version hand-built the response
  shape in two places conceptually (what gets inserted, and what gets
  returned) that had to be kept consistent by hand. The new version has
  one source: the row itself. Adding a future column to `assignment`
  requires no changes to the response-building code at all — the `SELECT
  *` and `res.json(created)` pick it up automatically.
- **One less class of future bug.** Any later change to the insert logic
  (new column, changed default, different validation order) can no longer
  accidentally leave the response lying about what was actually saved,
  because the response is no longer a separate, parallel construction.

## Why the tests still pass, unchanged

The existing acceptance test
([`test/acceptance.assignments.test.js`](../../test/acceptance.assignments.test.js))
already asserts `title`, `course`, `dueDate`, and `status` on the created
record — exactly the fields this refactor touches. That test is a genuine
regression guard for this specific change, not a coincidental pass: if the
`SELECT` had used the wrong id, or any column had come back wrong, that
test would have caught it. It didn't need to change at all to prove the
refactor preserved behavior — which is the whole point of having it.
