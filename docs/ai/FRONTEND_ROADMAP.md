# FRONTEND_ROADMAP.md

This roadmap defines what the React + Tailwind frontend should contain.

The project must be implemented progressively. Do not build everything in one giant change.

---

# 1. Routing map

Recommended routes:

## Public routes

```text
/                         Landing page
/dashboard                 Public threat intelligence dashboard
/iocs                      Public IOC list/search
/iocs/:id                  Public IOC detail
/malware                   Public malware list
/malware/:id               Public malware detail
/threat-actors             Public threat actor list
/threat-actors/:id         Public threat actor detail
/assistant                 Public AI assistant, optional if not embedded
/register                  Become contributor form
/login                     Shared login page for admin + contributor
/blockchain/verify/:iocId  Blockchain proof verification, optional
```

## Contributor protected routes

```text
/contributor                         Contributor dashboard overview
/contributor/change-password         Mandatory password change page
/contributor/iocs                    Contributor's submitted IOCs
/contributor/iocs/new                Submit new IOC
/contributor/malware                 Contributor's submitted malware samples
/contributor/malware/new             Submit new malware sample
/contributor/threat-actors           Contributor's submitted threat actors
/contributor/threat-actors/new       Submit new threat actor
/contributor/settings                Contributor account/settings, optional
```

## Admin protected routes

```text
/admin                               Admin dashboard overview
/admin/organisations                 Organisation requests and contributors
/admin/organisations/:id             Organisation detail, optional
/admin/iocs                          Global IOC supervision, optional
/admin/malware                       Global malware supervision, optional
/admin/threat-actors                 Global threat actor supervision, optional
/admin/api-keys                      API key management, optional if backend supports
/admin/stats                         Advanced statistics, optional
```

---

# 2. Route guard rules

## Public visitor
Can access public routes only.

## Contributor
Can access:

- public routes
- `/contributor/*`

Cannot access:

- `/admin/*`

If a contributor has `mustChangePassword = true`, they can only access:

- `/contributor/change-password`
- logout action

They should be redirected away from other contributor pages until password is changed.

## Admin
Can access:

- public routes
- `/admin/*`

Cannot access:

- `/contributor/*`, unless explicitly needed for debugging/admin impersonation, which should not be implemented by default.

---

# 3. Implementation phases

## Phase 0 — Audit first
Before coding:

1. Inspect the existing project structure.
2. List existing routes/pages/components.
3. Identify whether React Router exists.
4. Identify the API service pattern, if any.
5. Identify existing Tailwind theme/design.
6. Compare current frontend with this roadmap.
7. Propose small implementation steps.

Do not code during audit unless user approves.

---

## Phase 1 — Auth foundation
Goal: implement role-aware authentication without building all dashboards yet.

Tasks:

- Create/clean API client.
- Create `authApi.login()` that supports the shared `/login` page.
- If backend has separate admin/contributor login endpoints, hide that inside `authApi.login()`.
- Create auth state/context/store.
- Save JWT and role.
- Add logout.
- Add protected route components:
  - `RequireAdmin`
  - `RequireContributor`
  - `RequireContributorPasswordResolved`
- Create shared `/login` page.
- Add redirects:
  - admin -> `/admin`
  - contributor with must-change-password -> `/contributor/change-password`
  - contributor normal -> `/contributor`

Acceptance criteria:

- Public pages still work without login.
- Login page has one form only.
- No admin credentials are hardcoded in frontend.
- Role is stored and used for route protection.

---

## Phase 2 — Contributor password change
Goal: support first-login password update.

Tasks:

- Create `/contributor/change-password`.
- Form fields:
  - current password
  - new password
  - confirm new password
- Validate password length and match.
- Call contributor change-password endpoint.
- On success, update auth state and redirect to `/contributor`.

Acceptance criteria:

- Contributor with `must_change_password = true` is forced to this page.
- After success, contributor can access dashboard.

---

## Phase 3 — Public dashboard and public intelligence pages
Goal: complete visitor experience.

Tasks:

- Public dashboard with metrics/cards/charts.
- Public IOC list with search/filter.
- Public IOC detail page with enrichment and blockchain proof.
- Public malware list/detail.
- Public threat actor list/detail.
- Public AI assistant widget or page.
- Public TLP filtering awareness.

Acceptance criteria:

- No login required.
- UI clearly shows only public data.
- Loading/empty/error states exist.

---

## Phase 4 — Become contributor flow
Goal: make `/register` clean and logically correct.

Tasks:

- Improve/rebuild contributor registration page.
- Submit organization request.
- Show success message explaining admin review.
- Explain that if approved, the organization receives by email:
  - portal login credentials
  - temporary password
  - API key for automation
- Do not imply instant access.

Acceptance criteria:

- User understands the request is pending admin approval.
- No login is created directly from registration form.

---

## Phase 5 — Contributor dashboard overview
Goal: create the private contributor home.

Dashboard should show:

- Organization/account summary.
- Total submitted IOCs.
- Total submitted malware samples.
- Total submitted threat actors.
- Status counts.
- Recent submissions.
- Quick actions:
  - Submit IOC
  - Submit Malware
  - Submit Threat Actor
  - Change password

Rules:

- Contributor sees only own organization data.
- Contributor cannot edit/delete existing submissions.

Acceptance criteria:

- Contributor route is protected.
- Overview works with API data or clearly isolated mock data.

---

## Phase 6 — Contributor IOC management
Goal: allow contributors to view own IOCs, create new IOCs, and mark false positive.

Pages:

```text
/contributor/iocs
/contributor/iocs/new
```

Contributor IOC list should show:

- type
- value
- TLP
- confidence
- status
- submitted date
- blockchain status if available
- action: mark as false positive, only when status allows it

No edit/delete buttons.

Submit IOC form:

- type
- value
- description
- tlp
- confidence
- first_seen
- last_seen
- tags
- source_context

False positive action:

- confirmation modal
- call backend
- update row/status on success

Acceptance criteria:

- Contributor can create IOC.
- Contributor can mark owned IOC as false positive.
- Contributor cannot edit or delete IOC.

---

## Phase 7 — Contributor malware management
Goal: allow contributors to view own malware samples, create new ones, and mark owned malware samples as false positive.

Pages:

```text
/contributor/malware
/contributor/malware/new
```

List fields:

- name
- family
- hashes
- capabilities
- TLP
- status
- submitted date
- action: mark as false positive, only when status allows it

Create form:

- name
- family
- description
- hash_md5
- hash_sha256
- capabilities
- tlp if supported

False positive action:

- confirmation modal
- call backend
- update row/status on success

No edit/delete buttons.

Acceptance criteria:

- Contributor can create malware sample.
- Contributor can mark owned malware sample as false positive.
- Contributor cannot edit or delete malware samples.

---

## Phase 8 — Contributor threat actor management
Goal: allow contributors to view own threat actors, create new ones, and mark owned threat actors as false positive.

Pages:

```text
/contributor/threat-actors
/contributor/threat-actors/new
```

List fields:

- name
- aliases
- motivation
- country
- TLP
- status
- submitted date
- action: mark as false positive, only when status allows it

Create form:

- name
- aliases
- motivation
- country
- description
- tlp if supported

False positive action:

- confirmation modal
- call backend
- update row/status on success

No edit/delete buttons.

Acceptance criteria:

- Contributor can create threat actor.
- Contributor can mark owned threat actor as false positive.
- Contributor cannot edit or delete threat actors.

---

## Phase 9 — Admin dashboard
Goal: build admin overview.

Admin dashboard should show:

- pending organization requests
- approved organizations
- revoked organizations
- total IOCs/malware/threat actors
- recent platform activity if available
- shortcuts to organization management

Acceptance criteria:

- Admin route is protected.
- Contributor cannot access admin dashboard.

---

## Phase 10 — Admin organization management
Goal: allow admin to manage contributor onboarding.

Page:

```text
/admin/organisations
```

Features:

- List organization requests.
- Filter by status: pending/approved/revoked.
- View organization details.
- Approve pending organization.
- Revoke approved organization if backend supports it.

Approval success message:

```text
Organisation approved. Contributor credentials and API key were sent by email.
```

Do not display fake API keys/passwords.
Only display actual generated API key/password if backend explicitly returns them.

---

## Phase 11 — Admin global supervision
Goal: optional admin pages for all intelligence data.

Pages:

```text
/admin/iocs
/admin/malware
/admin/threat-actors
```

Features:

- Global list.
- Filter by organization/status/TLP/type.
- View details.
- Review pending items if backend supports it.

Do not implement destructive actions unless backend supports them and user asks.

---

# 4. Component plan

Reusable components to create or reuse:

## Layout

- `PublicLayout`
- `AuthLayout`
- `ContributorLayout`
- `AdminLayout`
- `Sidebar`
- `Topbar`

## Auth

- `LoginForm`
- `ChangePasswordForm`
- `RequireAdmin`
- `RequireContributor`

## Data display

- `MetricCard`
- `StatusBadge`
- `TLPBadge`
- `ConfidenceBar`
- `DataTable`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `ConfirmDialog`

## Threat intelligence

- `IOCTypeBadge`
- `IOCCard`
- `IOCDetailPanel`
- `BlockchainProofCard`
- `MalwareCard`
- `ThreatActorCard`
- `TagList`

## Forms

- `ContributorRegisterForm`
- `IOCSubmissionForm`
- `MalwareSubmissionForm`
- `ThreatActorSubmissionForm`

---

# 5. UX copy rules

## Registration success

Use wording like:

```text
Your contributor request has been submitted successfully. An administrator will review your organization. If approved, you will receive an email containing your contributor portal credentials and your API key for automation.
```

## Contributor dashboard empty state

```text
No submissions yet. Start by submitting your first IOC, malware sample, or threat actor profile.
```

## No edit/delete explanation

```text
Submitted intelligence records are immutable for traceability. You can submit new records or mark an IOC, malware sample, or threat actor as false positive when needed.
```

## Admin approval success

```text
Organisation approved successfully. The contributor login credentials and automation API key were sent by email.
```

---

# 6. Things Codex must not do

- Do not create separate visible login pages for admin and contributor unless the user explicitly asks.
- Do not hardcode admin credentials.
- Do not show edit/delete buttons in contributor dashboard.
- Do not expose `api_key_hash`.
- Do not assume public users can log in.
- Do not expose red/amber TLP data publicly.
- Do not build all phases at once.
