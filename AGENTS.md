# AGENTS.md — Frontend Agent Instructions

## Project

This is a React + Tailwind CSS frontend for a Collaborative Threat Intelligence Platform with:

- public visitor dashboard
- contributor portal
- admin dashboard
- IOC, malware sample, and threat actor intelligence pages
- AI chatbot assistance
- blockchain integrity verification

## Required context files

Before coding, always read:

- docs/ai/PROJECT_CONTEXT.md
- docs/ai/BACKEND_API_CONTRACT.md
- docs/ai/DATABASE_SCHEMA.md
- docs/ai/FRONTEND_ROADMAP.md
- docs/ai/UI_RULES.md

These files are the source of truth for the frontend behavior, API contract, database logic, roles, routes, and UI rules.

## Critical business logic

- Public visitors do not log in.
- Public visitors can only access public TLP:GREEN and TLP:WHITE data.
- Organizations apply through the contributor registration form.
- Admin reviews contributor applications.
- When admin approves an organization, the backend sends:
  - contributor email/username
  - temporary password
  - API key for automation
- There is one shared login page for admin and contributor.
- If admin credentials are valid, redirect to `/admin`.
- If contributor credentials are valid, redirect to `/contributor`.
- Never hardcode admin credentials in React.
- The backend must decide whether the logged-in user is admin or contributor.
- Contributor users can change their password.
- If `must_change_password = true`, force contributor to change password before accessing the dashboard.
- Contributor dashboard is official, not optional.
- API key is for automation/scripts only, not normal web dashboard login.

## Contributor permissions

Contributors can:

- view their own submitted IOCs
- view their own submitted malware samples
- view their own submitted threat actors
- submit new IOCs
- submit new malware samples
- submit new threat actors
- mark owned IOCs as false positive
- mark owned malware samples as false positive
- mark owned threat actors as false positive
- change their password

Contributors cannot:

- edit existing submissions
- delete submissions
- see private data from other contributors
- access admin pages

Marking as false positive is the only allowed correction action after submission.

## Admin permissions

Admins can:

- view all organizations
- approve/reject contributor applications
- generate/revoke API keys
- view all submissions
- view global statistics
- access admin-only dashboard pages

## Frontend coding rules

- Keep the existing React + Tailwind CSS stack.
- Do not rewrite the whole project from scratch.
- Do not modify backend files.
- Do not invent backend fields or endpoints.
- Follow the API contract files.
- Use mock data only if the backend is unavailable, and isolate mocks clearly.
- Implement loading states, error states, empty states, and basic form validation.
- Keep the UI modern, clean, responsive, and cybersecurity-themed.
- Use reusable components when possible.
- Keep changes small and focused.
- After every coding task, summarize files created, files modified, routes changed, and how to test locally.

## UI theme requirement

The dashboards must not be dark-only.

Use a clean, simple dashboard style with support for both light mode and dark mode.

Default theme:

- Light mode by default.

Theme behavior:

- The UI should support dark mode as an optional mode.
- Do not design the whole dashboard as a dark cybersecurity interface.
- Prefer readable light backgrounds, clean cards, subtle borders, soft shadows, and clear typography.
- Dark mode should be secondary and still readable.
- Avoid overly neon, hacker-style, or aggressive dark themes.

Implementation:

- Use Tailwind dark mode support if already configured.
- If dark mode is not configured yet, propose the smallest clean implementation before changing many files.
- Keep theme tokens centralized when possible.
- Do not hardcode random colors everywhere.
