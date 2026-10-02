# IAP M5 — Walking Skeleton

**Status:** Complete.

## The thin slice

`POST /assignments` → Express validates and writes a row via `node:sqlite`
(per `ADR-001`) → SQLite persists it to disk → `GET /assignments` reads it
back. No mocks, no stubs: both routes run against the same real SQLite
database file the app uses at runtime.

- **Code:** [`src/index.js`](../../src/index.js) (routes),
  [`src/db.js`](../../src/db.js) (schema + connection)
- **Automated test exercising the same path:**
  [`test/assignments.test.js`](../../test/assignments.test.js) — creates an
  assignment over real HTTP, then confirms it comes back from a second,
  separate `GET` request against an in-memory `node:sqlite` database.

## Evidence

**[`walking-skeleton-evidence.png`](walking-skeleton-evidence.png)** —
terminal capture of the slice running for real: `npm start`, a `POST` that
creates an assignment, a `GET` that reads it back, then the process is
killed outright and restarted on the same port — the assignment is still
there, proving the data round-tripped through actual disk-backed SQLite
storage (NFR-2), not an in-memory mock.

**CI:** [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs
`npm ci` and `npm test` (which includes the walking-skeleton test above) on
every push. Green run:
https://github.com/WoodlandMoss/iap-project-setup/actions/runs/37020974393

See the "Milestone 5" entry in [`PROMPT_LOG.md`](../../PROMPT_LOG.md) for
the prompt-and-diff record.
