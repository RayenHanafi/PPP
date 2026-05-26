# PROJECT_CONTEXT.md

## Project name
Collaborative Threat Intelligence Platform with Blockchain and AI.

## Frontend stack
- React
- Tailwind CSS
- Recharts when charts/statistics are needed
- The existing frontend must not be rewritten from scratch unless a specific page/component is clearly broken.

## Backend stack expected by the frontend
- FastAPI / Python
- PostgreSQL
- SQLAlchemy models
- JWT authentication for admin and contributor portal sessions
- API key authentication for contributor automation/scripts
- Blockchain integrity proof for validated IOCs
- AI chatbot for natural language exploration of threat intelligence data

## Core product idea
The platform allows organizations to share cyber threat intelligence data:

- IOCs: IPs, URLs, hashes, emails
- Malware samples
- Threat actors
- Blockchain records/proofs for validated IOCs

The public side exposes only safe public intelligence according to TLP rules. The private contributor side allows approved organizations to submit and track their own intelligence. The admin side allows platform administrators to approve organizations, manage contributor accounts/API keys, and supervise the platform.

---

# Final business logic to follow

This document overrides older contradictory notes from the cahier de charge where contributors were described as API-key-only.

## 1. Public visitor logic
A public visitor is not logged in.

A public visitor can:

- Open the landing page.
- Access the public dashboard.
- Search/filter public IOCs.
- View public IOC details.
- View public threat actor details.
- View public malware details.
- Verify an IOC blockchain proof if available.
- Use the public AI assistant/chatbot when available.
- Open the Become Contributor registration form.

A public visitor cannot:

- Login unless they are an approved contributor or admin.
- Submit IOCs/malware/threat actors.
- Mark owned IOCs, malware samples, and threat actors as false positive.
- View private TLP:AMBER or TLP:RED data.
- Access contributor or admin dashboards.

## 2. Organization onboarding logic
An organization becomes a contributor through this flow:

1. The organization submits the Become Contributor form.
2. The organization request is stored with status `pending`.
3. The admin reviews the organization from the admin dashboard.
4. If approved, the backend performs three actions:
   - Sets the organization status to `approved`.
   - Generates an API key for automation/script integrations.
   - Creates a `contributor_users` account with a temporary password.
5. The backend sends an email to the organization containing:
   - Contributor portal login email/username.
   - Temporary password.
   - API key for automation.
   - Link to the login page.
6. On first contributor login, if `must_change_password = true`, redirect the contributor to the change password screen before allowing dashboard access.

## 3. Contributor portal logic
A contributor is an approved organization user.

A contributor has two separate access mechanisms:

### A. Web portal login
Used by a human contributor in the React frontend.

- Login with email/username and password.
- Backend returns a contributor JWT.
- JWT contains role `contributor` and the organization identifier.
- Contributor is redirected to the contributor dashboard.
- If `must_change_password = true`, contributor must change password first.

### B. API key
Used only for automation/scripts/integrations.

- API key is sent with `X-API-Key` header.
- API key is not a normal web login password.
- API key should be shown only once in the approval email if the backend works that way.
- API key must not be exposed in the frontend after login unless the backend explicitly returns a regenerated key.
- API key is stored hashed in database and cannot normally be recovered in plain text.

## 4. Contributor dashboard rules
After login, a contributor is redirected to a contributor dashboard.

Contributor dashboard should show only the data submitted by that contributor's organization:

- Their submitted IOCs.
- Their submitted malware samples.
- Their submitted threat actors.
- Status of each submission: `validated`, `pending`, `rejected`, `revoked`, `false_positive`, `deprecated` where applicable.
- Blockchain proof for validated IOCs when available.

Contributor permissions:

- Can add new IOCs.
- Can add new malware samples.
- Can add new threat actors.
- Can mark an existing owned IOC, malware sample, or threat actor as false positive.
- Can change their password.
- Can view their own submitted data and statuses.

Contributor restrictions:

- Cannot edit existing IOCs, malware samples, or threat actors.
- Cannot delete existing IOCs, malware samples, or threat actors.
- Cannot mark another organization’s IOC, malware sample, or threat actor as false positive.
- Cannot access admin pages.
- Cannot approve/revoke organizations.
- Cannot view private data from other organizations.

## 5. Admin login and dashboard logic
There is one shared login page for both admin and contributor users.

Recommended frontend route:

```text
/login
```

The same login form accepts email/username and password.

Routing after login:

- If credentials are admin credentials, redirect to `/admin`.
- If credentials are contributor credentials, redirect to `/contributor`.
- If contributor must change password, redirect to `/contributor/change-password`.
- If invalid credentials, show a generic invalid email/password error.

Important security note:

- Do not hardcode admin credentials in the React frontend.
- Even if the admin credentials are “fixed credentials known only by the admin”, they must be validated by the backend, not checked in frontend code.
- The frontend should call backend authentication endpoints and route based on the returned role/token.

Admin can:

- Login from the same `/login` page.
- Access `/admin` dashboard.
- View all organization registration requests.
- Approve organizations.
- Reject or revoke organizations if supported by backend.
- Generate/revoke API keys if supported by backend.
- View contributor status and platform statistics.
- View global IOCs/malware/threat actors.
- Supervise pending/suspicious submissions if supported.

## 6. Authentication model expected in frontend
The frontend should support role-based authentication.

Suggested frontend auth state:

```ts
type AuthRole = 'admin' | 'contributor' | null;

type AuthState = {
  token: string | null;
  role: AuthRole;
  mustChangePassword?: boolean;
  user?: {
    id?: string;
    email?: string;
    org_id?: string;
    organisation_name?: string;
  };
};
```

Protected routes:

- `/admin/*` requires role `admin`.
- `/contributor/*` requires role `contributor`.
- `/contributor/change-password` requires a valid contributor token even if `must_change_password = true`.
- Public routes require no token.

## 7. TLP visibility rules
The public dashboard and public detail pages must show only:

- `tlp = green`
- `tlp = white`

Private `tlp = amber` and `tlp = red` data must not be exposed publicly.

Contributor dashboard may show the contributor’s own submitted data including private TLP levels, depending on backend authorization.

Admin dashboard may show all TLP levels.

## 8. IOC lifecycle rules
IOC statuses:

- `validated`: accepted and registered on blockchain.
- `pending`: needs admin review or came from low-trust/suspicious source.
- `rejected`: rejected and not blockchain-registered.
- `revoked`: invalid/removed, but trace remains.
- `false_positive`: contributor marked the owned submission as false positive. For IOCs, a blockchain revocation event may be recorded if backend supports it.
- `deprecated`: obsolete but kept for historical reference.

Frontend should display statuses clearly with badges.

## 9. Blockchain rules
Validated IOCs can have blockchain integrity proof.

Frontend should display:

- `tx_hash`
- `block_number`
- `recorded_at`
- `event_type` when available

Frontend should support a blockchain verification page/section when backend provides a verification endpoint.

## 10. AI chatbot rules
The chatbot helps users explore the threat intelligence database.

Possible locations:

- Public assistant widget on public dashboard or IOC detail page.
- Dedicated `/assistant` page.
- Contextual assistant panel in detail pages.

The chatbot must not expose private TLP:RED/TLP:AMBER data to public users.
For admin/contributor, access depends on backend authorization.

---

# Existing frontend status
The current project already has:

- Landing page.
- Contributor registration page.
- Some IOC, malware, and threat actor detail pages.

These pages may be modified or rebuilt if needed:

- Landing page can be changed.
- Contributor registration page can be changed.
- IOC/malware/threat actor pages can be changed.

Do not assume existing pages are final.

---

# Codex behavior rules
Codex must:

1. Read all files in this context pack before coding.
2. Inspect the existing React project before modifying anything.
3. Avoid rewriting the whole project at once.
4. Work page by page or feature by feature.
5. Follow the role logic in this document.
6. Never invent backend fields or endpoints without marking them as assumptions.
7. Never hardcode secrets, admin credentials, API keys, or tokens in frontend code.
8. Keep frontend API calls centralized in an API service layer.
9. Keep UI components reusable.
10. Add loading, error, empty, and success states.
11. Add route guards for admin/contributor pages.
12. Keep public pages accessible without login.
