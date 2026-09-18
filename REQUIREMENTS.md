# Requirements — Assignment Task Manager

## Need and Justification

**Source:** primary user and sole stakeholder (developer of this app). Elicited via self-directed semi-structured interview, Sep 18, 2026.

Current behavior, in the stakeholder's own account: assignments are currently tracked by adding them to an existing calendar app — or, when that step is skipped, not tracked at all. There is no intermediate state; an assignment either gets calendared or it gets forgotten.

The failure point is not retrieval or organization of assignments already entered — it is the entry step itself. When adding an assignment costs enough friction to compete with simply remembering it, the stakeholder skips entry, and skipped entry is indistinguishable from a forgotten assignment.

**Consequence:** missed assignments trace back to entries that were never made, not to entries that were made and then mismanaged. This directly motivates NFR-1 below: the creation flow has to be fast and low-friction enough that skipping it is never the easier option.

**Note on evidence quality:** this is a self-reported account from a single interview, not an observed or timed measurement (contrast with the "41 minutes, 28 August" example from lecture). It is a real stated pain point, but the specific numeric target in NFR-1 is a design decision made in response to it, not a measured baseline — flagged here explicitly per the "decided vs. assumed" distinction, rather than presented as harder evidence than it is.

## User Stories

Format: `As a [user], I want to [action], so that [benefit].`
Acceptance criteria in Given/When/Then form.

---

**US-1: Create an assignment**
As a student, I want to create an assignment with a title and due date, and optionally a course, so that I can track it alongside my other coursework without entry friction stopping me from bothering.

- Given I submit a title and due date, when I create the assignment, then it is saved and returned with a unique ID, status `open`, and no course (or the course, if I supplied one).
- Given I omit the title or due date, when I try to create the assignment, then the server returns HTTP 400 and no record is saved (see NFR-3).
- Given I submit a due date that is not a valid ISO-8601 date (`YYYY-MM-DD`), when I try to create the assignment, then the server returns HTTP 400 and no record is saved.

**US-2: View all assignments**
As a student, I want to see a list of all my assignments, so that I can get an overview of my workload.

- Given assignments exist, when I request the list, then all assignments are returned with course, title, due date, and status.
- Given no assignments exist, when I request the list, then an empty list is returned (not an error).
- Given multiple assignments exist, when I request the list, then they are returned sorted by due date, soonest first.

**US-3: Mark an assignment complete**
As a student, I want to mark an assignment as completed, so that my task list reflects what I still owe.

- Given an assignment with status `open`, when I mark it complete, then its status changes to `completed`.
- Given an assignment that is already `completed`, when I mark it complete again, then the status stays `completed` and no error is thrown.
- Given an assignment ID that does not exist, when I try to mark it complete, then I receive a not-found response.

**US-4: Filter assignments by course**
As a student, I want to filter my assignment list by course, so that I can focus on one class at a time.

- Given assignments across multiple courses, when I filter by a course name, then only assignments matching that course are returned.
- Given a course name with no matching assignments, when I filter by it, then an empty list is returned.
- Given assignments that have no course set, when I filter by any specific course name, then those uncategorized assignments are excluded from the results.

**US-5: Filter assignments by status**
As a student, I want to filter assignments by open/completed status, so that I can see what's still outstanding.

- Given assignments in both states, when I filter by `open`, then only open assignments are returned.
- Given assignments in both states, when I filter by `completed`, then only completed assignments are returned.

**US-6: Edit an assignment**
As a student, I want to edit an assignment's course, title, or due date, so that I can correct mistakes or reflect changes made by an instructor.

- Given an existing assignment, when I update one or more fields, then the assignment reflects the new values and keeps its original ID and status.
- Given I submit a due date on edit that is not a valid ISO-8601 date (`YYYY-MM-DD`), when I try to save, then the server returns HTTP 400 and the original record is unchanged.

**US-7: Delete an assignment**
As a student, I want to delete an assignment, so that I can remove entries I created by mistake or that no longer apply.

- Given an existing assignment, when I delete it, then it no longer appears in the list.
- Given an assignment ID that does not exist, when I try to delete it, then I receive a not-found response.

**US-8: See overdue assignments**
As a student, I want overdue open assignments to be identifiable, so that I know what needs immediate attention.

- Given an open assignment with a due date before the current date, when I view the list, then its returned record includes `overdue: true`.
- Given a completed assignment with a due date before the current date, when I view the list, then its returned record includes `overdue: false`.
- Given an open assignment with a due date on or after the current date, when I view the list, then its returned record includes `overdue: false`.

---

## Non-Functional Requirements

Each is written to be falsifiable — testable against a specific number, threshold, or named condition.

**NFR-1 — Usability of assignment entry.**
A first-time user can create a new assignment (entering a title and due date, and submitting it) in 15 seconds or less, without consulting instructions. Target: verified on at least 4 of 5 timed first-attempt trials. This target is a design decision made in response to the stated pain point above (entry friction causes skipped/forgotten assignments), not a measured baseline — see the evidence-quality note above.

**NFR-2 — Data durability.**
All assignment data persists across a server restart. Specifically: if the server process is stopped and restarted without deleting the SQLite database file, a `GET /assignments` request made after restart returns exactly the same records that existed before the restart.

**NFR-3 — Input validation.**
Any `POST` or `PUT` request to create or edit an assignment with a missing title, missing due date, or a due date that does not match the ISO-8601 calendar-date format `YYYY-MM-DD` returns an HTTP 400 status code and does not modify the database.
