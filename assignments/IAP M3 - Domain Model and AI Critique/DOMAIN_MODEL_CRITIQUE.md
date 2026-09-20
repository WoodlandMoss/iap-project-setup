# Domain Model Critique — AI Draft vs. Adopted Model

**Source:** `domain-model-raw.mmd` (AI's unedited first draft, 6 entities).
**Compared against:** `domain-model.mmd` (adopted model, 1 entity).
**Compared to:** `REQUIREMENTS.md`.

---

## Where it over-modelled

1. **`USER`.** The draft invented an entity with `email`, `passwordHash`, and
   `displayName` — full authentication. `REQUIREMENTS.md`'s own "Need and
   Justification" section names the stakeholder as "primary user and sole
   stakeholder (developer of this app)"; none of US-1 through US-8 mentions
   logging in, registering, or any per-user data isolation. This is the same
   multi-user assumption the M2 elicitation audit already flagged and ruled
   out (`ELICITATION_AUDIT.md`, item 1) — the draft repeated it at the
   modeling stage even with the scoped requirements as direct input.
2. **`COURSE` as a first-class entity.** The draft gave `COURSE` its own PK,
   a `userId` FK, and fields (`colorTag`, `term`) no story requests. US-4 is
   the only story that touches course at all, and it treats course as a
   string to filter by — nothing creates, edits, or lists courses on their
   own. Modeling it as a related table implies CRUD and referential-integrity
   behavior (e.g., what happens to an empty `COURSE` row) that isn't
   specified anywhere.
3. **`SETTINGS`.** `theme` and `notificationsEnabled` correspond to no
   requirement. Nothing in the NFRs or user stories mentions preferences.
4. **`REMINDER`.** A full entity with `remindAt` and `channel` for a feature
   — reminders/notifications — that `ELICITATION_AUDIT.md` (item 2) already
   named as an invented, out-of-scope feature during M2. Reappearing here
   means the constraint didn't carry forward into the modeling prompt.
5. **`TAG` plus a many-to-many join.** No user story mentions tagging or
   categorization beyond the single `course` field.
6. **Extra `ASSIGNMENT` fields:** `description`, `priority`,
   `estimatedMinutes`. None are read or written by any of US-1–US-8; they're
   the same "priority level" and "estimated time" fields the M2 elicitation
   audit already flagged as invented (`ELICITATION_AUDIT.md`, item 11).

## Where it under-modelled

1. **No required/optional distinction.** US-1's acceptance criteria are
   explicit: omitting `title` or `dueDate` returns HTTP 400 (NFR-3), while
   `course` is optional. The draft's ER attributes don't distinguish
   nullable from required columns anywhere — every field is listed flat,
   with no constraint notation, so the one piece of validation logic the
   requirements actually specify (which fields are mandatory) doesn't show
   up in the model at all.

## Where it invented a relationship with no basis

1. **`USER ||--o{ COURSE : enrolls`.** "Enrolling" implies a multi-user
   classroom model (students enrolling in shared courses) that contradicts
   the single-user, single-stakeholder framing stated directly in
   `REQUIREMENTS.md`.
2. **`ASSIGNMENT }o--o{ TAG : tagged_with`.** A many-to-many relationship
   built on an entity (`TAG`) that itself has no requirement backing it —
   there's no basis for the entity, let alone the relationship's cardinality.

## Where it was right

1. **`ASSIGNMENT` as the central entity.** Correctly identified as the one
   entity every user story revolves around — this part needed no correction.
2. **`dueDate` as a `date`, `status` as a `string`.** Both types match how
   `REQUIREMENTS.md` describes them (ISO-8601 calendar date; a small fixed
   set of state values). The adopted model keeps both unchanged from the
   draft.
3. **Giving `ASSIGNMENT` its own PK independent of any parent.** Even though
   the draft wrongly nested `ASSIGNMENT` under `COURSE` via a foreign key,
   the instinct that assignments need a stable identity of their own (not
   just a position in a list) was correct and is preserved in the adopted
   model.

## Judgment

Five of six entities in the draft don't survive contact with
`REQUIREMENTS.md`. The pattern matches the M2 elicitation audit almost
exactly — the model reaches for a generic, multi-tenant SaaS shape (users,
settings, notifications, tags) by default, even when handed the actual
scoped requirements as input, rather than deriving structure only from what
those requirements say. The one part of the draft that survives (a single
`ASSIGNMENT` entity, correctly typed on `dueDate` and `status`) is exactly
the part that traces directly to a user story. Everything that doesn't trace
to a story — `USER`, `COURSE`, `SETTINGS`, `REMINDER`, `TAG`, and the extra
`ASSIGNMENT` fields — got cut. The adopted model is what's left after that
cut: one table, five columns, matching the five things the requirements
actually ask the system to store.
