# RB-001: Saving an assignment fails, but the list still loads

**Applies to:** the assignment task manager (`src/index.js`), any deployment.
**Owner / escalation contact:** Caleb Turris (GitHub: `WoodlandMoss`).
**Time to resolve, typically:** under 10 minutes.

You do not need to know the code to follow this entry. You need a shell
on the machine running the app, and its log output.

---

## 1. Symptom: what you will see first

At least one of these:

- A user reports: *"I can see my assignments, but adding a new one gives
  an error."*
- `POST /assignments` returns **HTTP 500** with a body like:

  ```json
  {"error":"internal error","requestId":"9ded789d-1f82-45e9-a66c-55457228e3cd"}
  ```

- The logs contain `"level":"error"` lines with
  `"event":"request.failed"` on `"path":"/assignments"`, `"method":"POST"`.

At the same time, `GET /health` and `GET /assignments` still return
**200**. This "reads work, writes fail" pattern is what this entry covers.

## 2. Before you start: where things are

| What | Where |
|---|---|
| Logs | The app writes one JSON object per line to **stdout**. Wherever the app's stdout goes is the log, e.g. `app.log` if it was started with `npm start > app.log`. |
| Database file | The `DB_PATH` environment variable. If that isn't set, it's `data.sqlite` in the directory the app was started from. |
| App process | `pgrep -af "src/index.js"` |

Every log line has `ts`, `level`, `event` and `requestId`. A user's
error response carries the same `requestId`, as does the `X-Request-Id`
response header.

## 3. Confirm the diagnosis

Run these in order. Stop as soon as one rules this entry out.

**3a. The app is up and reads work.**

```bash
curl -s localhost:3000/health          # expect {"status":"ok"}
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/assignments   # expect 200
```

If either fails, this is **not** RB-001. The app is down or reads are
broken, so escalate (section 6).

**3b. The failed writes are lock errors.**

```bash
jq -c 'select(.event=="request.failed")' app.log | tail -5
```

If you have a `requestId` from the user, trace that exact request:

```bash
jq -c 'select(.requestId=="<paste requestId>")' app.log
```

This **is** RB-001 if the failure lines show:

```json
"errorCode":"ERR_SQLITE_ERROR","sqliteErrcode":5,"errorMessage":"database is locked"
```

If `errorMessage` says anything else, this is **not** RB-001, so
escalate (section 6). Examples are `disk I/O error`,
`attempt to write a readonly database` and `database or disk is full`.

**3c. Find the process holding the lock.**

```bash
lsof data.sqlite        # use the real DB path from section 2
pgrep -f "src/index.js" # the app's own PID
```

You should see **two or more** PIDs on the file. The app's PID is
expected. **Any other PID is the lock holder.** Note it, then look at
what it is:

```bash
ps -o pid,user,etime,cmd -p <other PID>
```

If no other process has the file open, but the errors are still
appearing, escalate (section 6).

## 4. Fix it

The lock holder is almost always one of these:

| `cmd` looks like | What it is | What to do |
|---|---|---|
| `sqlite3 data.sqlite` | Someone's interactive SQLite shell, left open in the middle of a transaction | If you can reach that person, ask them to type `ROLLBACK;` and then `.quit`. If you can't reach them, run `kill <PID>`. |
| A backup, copy or cron script | A job that opened the DB for writing and hung | `kill <PID>`. Then tell the owner of that job (section 6) so it doesn't recur. |
| `node src/index.js` (a **second** one) | A second app instance pointed at the same DB file | Stop the instance that should not be running: `kill <PID>`. If you can't tell which one is extra, keep the one whose PID owns the listening port (`lsof -i :3000`). |

`kill` sends SIGTERM. SQLite rolls back that process's **uncommitted**
changes. Data that was already saved is not affected.

**Do NOT:**

- **Delete** `data.sqlite`, or any `data.sqlite-journal` /
  `data.sqlite-wal` file next to it. SQLite needs those files to recover
  safely, and deleting them can corrupt or lose data.
- **Restart the app as the fix.** The lock belongs to the *other*
  process, so a restart doesn't release it. Saves will keep failing after
  the restart.
- Use `kill -9` unless plain `kill` has not worked after 30 seconds.

## 5. Verify the fix

**5a.** Run `lsof data.sqlite`. Only the app's PID should remain.

**5b.** Check that a write lock can be taken. This test writes no data:

```bash
node -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('data.sqlite');d.exec('BEGIN IMMEDIATE');d.exec('ROLLBACK');console.log('write lock OK')"
```

It should print `write lock OK`. If it prints `database is locked`
instead, go back to 3c.

**5c.** Watch for new errors while users retry:

```bash
tail -f app.log | jq -c 'select(.level=="error")'
```

No new `request.failed` lines should appear, and new saves should log
`assignment.created`.

**5d.** Tell affected users to **re-submit**. A save that got a 500 was
**not** stored, so there is nothing half-written to clean up.

## 6. Escalate if

- Section 3 ruled out RB-001 (a different `errorMessage`, reads also
  failing, or no other process on the DB file).
- The lock holder is a process you don't recognize, or it comes back
  after you kill it.
- Section 5 still fails after you have followed section 4.

**Contact:** Caleb Turris (GitHub `WoodlandMoss`). Include:

- The `request.failed` lines from 3b.
- The `lsof` and `ps` output from 3c.
- What you killed, and when.

---

*Reproduction of this failure, with real logs and `lsof` output:
[`assignments/IAP M8 - Structured Logging and Runbook Entry/`](<../../assignments/IAP M8 - Structured Logging and Runbook Entry/>).
The automated test is `test/logging.test.js`, "a locked database surfaces
as a logged request.failed…".*
