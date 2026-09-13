# Requirements — Assignment Task Manager

## User Stories

Format: `As a [user], I want to [action], so that [benefit].`
Acceptance criteria in Given/When/Then form.

---

**US-1: Create an assignment**
As a student, I want to create an assignment with a course, title, and due date, so that I can track it alongside my other coursework.

- Given I submit a course, title, and due date, when I create the assignment, then it is saved and returned with a unique ID and status `open`.
- Given I omit the title or due date, when I try to create the assignment, then the request is rejected and no record is saved.
- Given I submit a due date that is not a valid calendar date, when I try to create the assignment, then the request is rejected.

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

**US-5: Filter assignments by status**
As a student, I want to filter assignments by open/completed status, so that I can see what's still outstanding.

- Given assignments in both states, when I filter by `open`, then only open assignments are returned.
- Given assignments in both states, when I filter by `completed`, then only completed assignments are returned.

**US-6: Edit an assignment**
As a student, I want to edit an assignment's course, title, or due date, so that I can correct mistakes or reflect changes made by an instructor.

- Given an existing assignment, when I update one or more fields, then the assignment reflects the new values and keeps its original ID and status.
- Given I submit an invalid due date on edit, when I try to save, then the edit is rejected and the original record is unchanged.

**US-7: Delete an assignment**
As a student, I want to delete an assignment, so that I can remove entries I created by mistake or that no longer apply.

- Given an existing assignment, when I delete it, then it no longer appears in the list.
- Given an assignment ID that does not exist, when I try to delete it, then I receive a not-found response.

**US-8: See overdue assignments**
As a student, I want overdue open assignments to be identifiable, so that I know what needs immediate attention.

- Given an open assignment with a due date in the past, when I view the list, then it is flagged/marked as overdue.
- Given a completed assignment with a due date in the past, when I view the list, then it is NOT flagged as overdue.

---

## Non-Functional Requirements

Each is written to be falsifiable — testable against a specific number, threshold, or named condition.

**NFR-1 — Response time.**
`GET /assignments` returns a response in under 200ms (measured server-side, excluding network latency) when the database contains up to 500 assignment records, on the developer's local machine.

**NFR-2 — Data durability.**
All assignment data persists across a server restart. Specifically: if the server process is stopped and restarted without deleting the SQLite database file, a `GET /assignments` request made after restart returns exactly the same records that existed before the restart.

**NFR-3 — Input validation.**
Any `POST` or `PUT` request to create or edit an assignment with a missing title, missing due date, or a due date that fails `Date.parse()` validation returns an HTTP 400 status code and does not modify the database.
