# ADR-001: Use `node:sqlite` directly, without an ORM or query builder

**Status:** Accepted

## Context

M1 fixed the stack: Node.js, Express, and SQLite, accessed through Node's
built-in `node:sqlite` module. M3's domain model fixed the schema: one
entity, `ASSIGNMENT`, with five columns (`id`, `title`, `course`, `dueDate`,
`status`) and no relationships to any other table. Implementing the CRUD
handlers (`POST`/`GET`/`PUT`/`DELETE /assignments`) requires deciding how the
Express handler layer talks to that table.

The two forces in tension: the project's scope is genuinely small — one
table, four simple queries, a single developer as the only person who will
ever touch the schema — and yet the two most common ways to talk to a
relational database from Node (a full ORM, or a SQL query builder) are built
to solve problems that come from a larger scope than this one: many
entities, multiple contributors changing the schema over time, and queries
complex enough that hand-written SQL becomes error-prone. A decision has to
be made about whether to pay for that machinery now or defer it.

## Decision

Use Node's built-in `node:sqlite` module directly. Every query is
hand-written, parameterized SQL inside the handler that runs it. No ORM, no
query builder, no schema-migration tool, and no additional runtime
dependency beyond `express` (`node:sqlite` ships with the Node runtime
itself, `>=22.5.0`, already required by `package.json`).

## Alternatives Considered

**A full ORM (e.g., Prisma or Sequelize).** Rejected. An ORM's value is
tracked, repeatable schema migrations and default query parameterization —
real benefits, but ones that pay off with many entities, complex joins, or
multiple people changing the schema concurrently. None of that is true here:
one entity, no joins, one developer. Adopting one now would mean a
generated client, a schema-definition language on top of the schema that
already exists in `domain-model.mmd`, and a build/codegen step, all to
manage four queries that are already simple to write by hand.

**A SQL query builder (e.g., Knex.js).** Rejected as a middle ground for the
same reason, one level down. A query builder removes some hand-written SQL
and adds connection pooling, but it is still an external dependency taken on
specifically to avoid writing SQL that is not the hard part of this project
— and its API is promise-based, which would force every handler to become
`async` and reintroduce the callback/promise plumbing that using
`node:sqlite` synchronously was specifically chosen to avoid (see
Consequences). It buys less than a full ORM while still costing a
dependency and an async rewrite of the handler layer.

## Consequences

**What this makes easier:**
- Zero additional dependencies — `node:sqlite` ships with the Node runtime
  already pinned in `package.json`; nothing new to install or version.
- Full transparency: the exact SQL that runs against the database is
  visible in the handler that runs it, with nothing generated or hidden
  behind a client library.
- Simpler handler code: `node:sqlite` is synchronous, so a handler calls the
  database and gets a result back directly, with no `async`/`await` or
  callback plumbing specific to the database call.

**What this makes harder:**
- **SQL-injection safety is now a per-handler discipline, not a guarantee.**
  An ORM or query builder parameterizes queries by construction; here, every
  handler that touches the database is individually responsible for using
  parameterized queries correctly. This works while there are only a few
  handlers, but it is exactly the kind of thing that degrades as more routes
  are added — a future handler, written by this developer under time
  pressure or by anyone else, can skip that discipline and introduce a real
  SQL-injection vulnerability with nothing in the toolchain to catch it.
- **Schema changes have no migration history.** Any future change to the
  `ASSIGNMENT` table — a new column, a changed constraint — is a hand-written
  `ALTER TABLE` statement with no tracked migration file, no versioning
  against what's already been applied to an existing database, and no
  built-in rollback. An ORM's migration tooling would have given this for
  free; here it has to be built by hand if it's ever needed.
- **Changing database engines later means rewriting every query.** Because
  no query builder sits between the handlers and the SQL, there is no layer
  to retarget at a different backend. If this app ever needed to move off a
  single local SQLite file — for instance, to support more than one user
  concurrently — every hand-written query would need to be rewritten rather
  than swapping a client configuration.
- **The synchronous API blocks the event loop on every query.** This is a
  non-issue at the app's current scale (one local user, one SQLite file),
  but it is a real constraint this decision accepts: reversing it later to
  handle concurrent load means touching every handler that calls the
  database, not flipping a configuration flag.

This is a scoped trade-off, made for the project's current size, not a
permanent architectural stance — if the entity count, contributor count, or
concurrency requirements grow, this decision is the first one that should be
revisited.
