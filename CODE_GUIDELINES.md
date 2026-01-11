# Code Guidelines

Canonical standards:

- docs/standards/REVIEW_CHECKLIST.md
- docs/standards/PR_NAMING.md
- docs/standards/CODING_STANDARDS.md

Hard rules:

- Trade events are append-only.
- All write inputs are schema-validated server-side.
- Audio and images go to object storage only.
- Worker jobs are idempotent.
