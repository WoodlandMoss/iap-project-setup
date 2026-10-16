# Bug-Injection Demonstration

## The fault

In `POST /assignments`, swap the `course` and `dueDate` arguments passed to
the parameterized insert — a one-line argument-order mistake, the kind a
real contributor could plausibly make:

```diff
- const { lastInsertRowid } = stmt.run(title, course || null, dueDate, 'open');
+ const { lastInsertRowid } = stmt.run(title, dueDate, course || null, 'open');
```

Full diff: [`1-fault-diff.patch`](1-fault-diff.patch).

**Why this one:** it's wrong in a way a user would immediately notice (their
course name and due date show up swapped), it's a realistic bug class
(mixed-up positional arguments), and — this is the part worth being honest
about — **it does not cause a visible failure in `POST`'s own response**,
because that response is built from the original request variables, not
read back from the database. Manually verified:

```
POST /assignments {"title":"Read chapter 3","course":"CS101","dueDate":"2026-10-10"}
  -> 201 { id: 1, title: 'Read chapter 3', course: 'CS101', dueDate: '2026-10-10', status: 'open' }   (looks correct)

GET /assignments
  -> [{ id: 1, title: 'Read chapter 3', course: '2026-10-10', dueDate: 'CS101', status: 'open' }]     (actually corrupted)
```

## What the suite did first (the genuine finding)

With the fault in place, the existing suite stayed **16/16 green**. Our
acceptance test created an assignment and read it back, but only asserted
`id` and `title` on the list response — never `course`, `dueDate`, or
`status`. The bug was real and the test suite didn't notice, because it
wasn't looking closely enough at data it already had in hand.

## Closing the gap

Added three missing assertions to
[`test/acceptance.assignments.test.js`](../../../test/acceptance.assignments.test.js)
checking `course`, `dueDate`, and `status` on the `GET /assignments`
response, not just on the `POST` response.

(Along the way: discovered the acceptance tests didn't call `server.close()`
when an assertion threw, which hung the whole `node --test` process instead
of reporting a clean failure. Fixed with `try/finally` in both
`test/acceptance.assignments.test.js` and `test/sanity.test.js` so a
failing test actually fails cleanly instead of hanging.)

## The suite failing

With the fault still in place and the new assertions added:

```
not ok 1 - walking skeleton: create an assignment, then see it in the list
  error: |-
    Expected values to be strictly equal:
    + actual - expected
    + '2026-10-10'
    - 'CS101'
  expected: 'CS101'
  actual: '2026-10-10'

# tests 16
# pass 15
# fail 1
```

Full output: [`2-suite-failing.txt`](2-suite-failing.txt).

## The fix

Reverted the one-line argument swap in `src/index.js`. Suite back to
**16/16 passing**.

Full output: [`3-suite-fixed.txt`](3-suite-fixed.txt).
