# IAP Project Setup

My IAP project is an assignment task manager. It lets a user create
assignments with a course, title, and due date, then track which ones are
still open versus completed, so coursework across multiple classes lives in
one place instead of scattered across syllabi.

## Stack

- **Language:** JavaScript (Node.js)
- **Framework:** Express
- **Database:** SQLite (via Node's built-in `node:sqlite` module)
- **Test runner:** Node's built-in test runner (`node --test`)

## Getting started

```bash
npm install
npm test
npm start
```

## Assignments

Deliverables are organized by assignment under [`assignments/`](assignments/),
one folder per milestone, named after its Canvas title:

- [IAP M1 - Repository and Toolchain Setup](<assignments/IAP M1 - Repository and Toolchain Setup>)
- [IAP M2 - Requirements and AI Elicitation Audit](<assignments/IAP M2 - Requirements and AI Elicitation Audit>)

The cumulative [`PROMPT_LOG.md`](PROMPT_LOG.md) records every AI-assisted
change across all milestones.
