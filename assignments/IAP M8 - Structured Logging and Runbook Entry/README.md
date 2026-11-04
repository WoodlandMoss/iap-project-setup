# IAP M8 — Structured Logging and Runbook Entry

**Status:** Complete.

## What to do, mapped to evidence

1. **Structured logging.** [`src/logger.js`](../../src/logger.js) is a
   small JSON-lines logger with no new dependencies. Each record is one
   JSON object on one line, so the log can be read by a machine. The
   **core fields** are always present: `ts` (ISO-8601), `level`
   (`debug`/`info`/`warn`/`error`), `event` (a dotted name, e.g.
   `assignment.created`) and `requestId`. Each event adds its own
   fields, such as `method`, `path`, `status`, `durationMs`,
   `assignmentId`, `count`, `reason`, `errorCode`, `sqliteErrcode` and
   `errorMessage`. `console.log` is no longer used anywhere in `src/`.
   `LOG_LEVEL` controls verbosity.
2. **Correlating identifier.** [`src/index.js`](../../src/index.js) gives
   every HTTP request a `requestId`. It reuses the caller's `X-Request-Id`
   header if that is a safe token, and otherwise generates a UUID. The ID:
   - is stamped on **every** log line for that request (through
     `logger.child`);
   - is returned in the `X-Request-Id` response header;
   - is included in the body of a 500 response.

   An operator can therefore go from a user's error message straight to
   the matching log lines with
   `jq 'select(.requestId=="…")'`. A request is the right unit of
   correlation here because each API operation is one request.
3. **Runbook entry.** [`docs/runbook/RB-001-saves-fail-database-locked.md`](../../docs/runbook/RB-001-saves-fail-database-locked.md)
   covers this failure: *"Saving an assignment fails, but the list still
   loads."* Another process holding a SQLite write lock causes it. The
   entry starts from what an operator sees (500 responses on `POST`,
   working `GET`s). It then confirms the cause from the logs and `lsof`,
   and gives a fix table by type of lock holder. It also includes a
   do-not list, write-free verification steps and when to escalate. It is
   written for someone who is not the author and does not know the code.

## Evidence

- **Sample structured log lines:** [`sample-logs.jsonl`](sample-logs.jsonl).
  This is the unedited stdout of the real server (`npm start` with a file
  DB). It shows a create, a list, a validation failure (`warn`), the
  locked-database failure (`error`) and the successful retry after the
  lock was released.
- **A traced operation:** [`traced-operation.txt`](traced-operation.txt).
  It filters the log above by `requestId`. `demo-create-01` reads as
  `request.received` → `assignment.created` → `request.completed`
  (201). The failing `demo-locked-02` reads as `request.received` →
  `request.failed` (`database is locked`) → `request.completed` (500).
- **Reproduction of the runbook's failure:**
  [`locked-db-reproduction.txt`](locked-db-reproduction.txt). It contains
  the 500 response (with the `requestId` in both the header and the body)
  and the `lsof` output that the runbook's step 3c relies on. There are
  two PIDs: the app, and the process holding the lock. The lock was
  simulated by a second process running `BEGIN IMMEDIATE` on `data.sqlite`.
- **Tests:** [`test/logging.test.js`](../../test/logging.test.js) adds 4
  tests: field structure on every line, end-to-end tracing by
  `requestId`, a generated ID when the header is missing or invalid, and
  the locked-DB path asserted exactly as the runbook describes it. The
  full run is in [`test-run-output.txt`](test-run-output.txt): **20/20
  passing**. The existing acceptance and sanity tests now pass
  `silentLogger`, so their output stays clean. Their assertions are
  unchanged.
- **Prompt-and-diff log:** see the "Milestone 8" entry in
  [`PROMPT_LOG.md`](../../PROMPT_LOG.md).
