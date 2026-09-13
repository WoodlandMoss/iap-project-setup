# AI Elicitation Audit Log

**Source:** `ai-elicitation-raw.md` (full output of a single cold prompt to an AI tool).
**Compared against:** `REQUIREMENTS.md`, my actual scoped requirements for the IAP.

---

## What the model missed (specific omissions)

The model never asked a single clarifying question before answering — it jumped straight to a feature list. Concretely, it never asked about:

1. **Who the user is.** It assumed multi-user with accounts/login by default. It never asked "is this single-user or multi-user?" — which is the single biggest scoping question for an app of this size, and the answer changes the entire data model.
2. **Data scale and environment.** No question about how many assignments/users this needs to handle, or whether this is a local/course project vs. a production service. This matters because it drives whether things like "sync," "scale to many users," and offline support are even relevant.
3. **What "done" means precisely.** It offered a three-state status (not started / in progress / completed) without asking whether partial progress tracking is wanted, or whether a simple binary open/completed state (what I actually want) is sufficient.
4. **Timezone / due-date semantics.** No question about how due dates and "overdue" should be computed relative to timezone — a real edge case for any due-date feature, and one I had to think through myself for NFR-1/US-8.
5. **Platform target.** It didn't ask whether this is a web API, a web frontend, a mobile app, or a class assignment with a specific tech stack — it just assumed mobile + web + calendar sync should all exist.
6. **What's out of scope.** It never asked "what do you explicitly NOT want," which would have caught most of the invented features below before they were even suggested.

## What it invented (never asked for, don't want)

The model produced a consumer-startup feature set, not a scoped course project. Specific inventions:

1. **User accounts / login / SSO** — my app has no concept of multiple users; it's a single-user local tool. This one assumption cascades into most of the rest of its answer being wrong-sized.
2. **Push notifications / email reminders** — real infrastructure (a mail service, a notification scheduler) for a feature nobody asked for.
3. **File attachments** — implies file storage and upload handling, well outside scope.
4. **Calendar sync (Google/Outlook)** — a third-party OAuth integration invented from nothing.
5. **Recurring assignments** — plausible-sounding, but not something I need; adds a whole recurrence-rule data model.
6. **Collaboration / shared courses / group assignments** — turns a personal tracker into a multi-tenant social app.
7. **Gamification (streaks, badges)** — pure invention with no connection to the stated goal of "track coursework."
8. **Analytics dashboard** — a reporting feature layered on top of a CRUD app.
9. **Offline support with sync** — meaningful engineering complexity (conflict resolution) that was never in scope.
10. **Native mobile app** — README specifies a Node/Express/SQLite backend; nothing about mobile was ever implied.
11. **Priority levels, estimated time, tags/color-coding** — extra fields I never asked for and don't plan to store.

Notably, its "non-functional" section was almost entirely vacuous restatements of the exact anti-pattern the assignment calls out: *"fast and responsive," "secure," "scalable," "clean and intuitive"* — none of these are falsifiable. Not one number, threshold, or named condition anywhere in that section.

## What it got right (useful, hadn't considered)

1. **Search across assignments by keyword** — I hadn't planned this, but it's a reasonable low-cost addition once a list view exists. Not adding it now (out of scope for M2), but worth a backlog note.
2. **List view vs. an alternate view (it suggested calendar)** — the underlying point, that a flat list may not be the only useful way to look at due dates, is fair.
3. **Explicitly separating "not started" from "in progress"** — I'm rejecting the three-state model for my scope, but it correctly surfaced that binary open/completed is a real simplification decision I should be making consciously, not by default. It forced me to write US-3's acceptance criteria more precisely (idempotent "mark complete") than I would have otherwise.

## Judgment

The model's elicitation is what you'd get from optimizing for "sound impressive to a general audience" rather than "understand this specific project." It never asked a single question, so it had no way to distinguish a weekend course project from a startup pitch, and it defaulted to the latter — multi-user accounts, notifications infrastructure, third-party integrations, gamification, and an analytics dashboard, none of which were requested and all of which would blow the scope of an assignment task manager backed by SQLite and Express.

Its value wasn't in the feature list itself — almost all of that is noise I'd have to prune — it was in the two or three places where it surfaced an implicit design decision I hadn't made explicit (status granularity, alternate views). The engineering judgment call here isn't "which of these features should I add," it's "this output is a brainstorm from someone who doesn't know my constraints, and my job is to supply the constraints it never asked for." Accepting this list wholesale would have produced an app roughly 5x the scope of what M1 actually set up. The audit process — not the AI's list — is what produced the real requirements in `REQUIREMENTS.md`.
