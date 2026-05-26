# BACKEND_API_CONTRACT.md

This file describes the backend API contract expected by the React frontend.

Important: some backend endpoints may not exist yet. Codex must inspect the existing frontend/backend integration and adapt carefully. Do not invent calls silently. If an endpoint is missing, create the frontend code in a way that can be connected later or mark it clearly as a TODO.

---

# 1. Base API rules

Suggested API base URL:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

All API calls should be centralized in service files such as:

```text
src/services/apiClient.ts
src/services/authApi.ts
src/services/publicApi.ts
src/services/contributorApi.ts
src/services/adminApi.ts
```

Do not spread raw `fetch`/`axios` calls everywhere.

---

# 2. Authentication overview

There is one frontend login page:

```text
/login
```

This page is shared between:

- Admin users.
- Contributor users.

The frontend must not hardcode admin credentials.
The backend must verify whether credentials belong to an admin or contributor.

Because the backend documentation may expose separate endpoints, implement a frontend auth service that supports the current backend shape.

## Preferred frontend behavior

1. User enters email/username and password on `/login`.
2. Frontend sends credentials to backend.
3. Backend returns a JWT and role.
4. Frontend routes:
   - role `admin` -> `/admin`
   - role `contributor` with `must_change_password = true` -> `/contributor/change-password`
   - role `contributor` with `must_change_password = false` -> `/contributor`
5. Invalid credentials -> generic error.

## If backend has separate login endpoints

If no single unified backend endpoint exists, the frontend auth service can internally try:

1. Admin login endpoint.
2. If admin login fails with 401, contributor login endpoint.
3. If both fail, show invalid credentials.

Do not expose this complexity in the UI.

---

# 3. Auth endpoints

## 3.1 Admin login
Possible backend route:

```http
POST /auth/login
```

Possible request:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Possible response:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "expires_in": "8 h"
}
```

Frontend should normalize this to:

```ts
{
  token: response.access_token,
  role: 'admin',
  mustChangePassword: false
}
```

## 3.2 Contributor login
Backend route:

```http
POST /contributor/login
```

Request:

```json
{
  "email": "contact@company.com",
  "password": "temporary-or-new-password"
}
```

Response:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "must_change_password": true,
  "expires_in": "8 h"
}
```

Frontend should normalize this to:

```ts
{
  token: response.access_token,
  role: 'contributor',
  mustChangePassword: response.must_change_password
}
```

## 3.3 Contributor change password
Backend route:

```http
POST /contributor/change-password
Authorization: Bearer <contributor_jwt>
```

Request:

```json
{
  "current_password": "oldPassword123",
  "new_password": "newPassword123"
}
```

Expected behavior:

- If success, update local auth state so `mustChangePassword = false`.
- Redirect to `/contributor`.
- If current password is wrong, show backend error.

---

# 4. Public endpoints

Public endpoints require no login.

## 4.1 Public dashboard/statistics
Possible route:

```http
GET /dashboard/stats
```

Expected data examples:

```ts
type DashboardStats = {
  total_iocs?: number;
  total_threat_actors?: number;
  total_malware_samples?: number;
  by_type?: Record<string, number>;
  by_tlp?: Record<string, number>;
  recent_iocs?: IOC[];
};
```

## 4.2 Public IOC list
Possible route:

```http
GET /iocs
```

Query parameters may include:

```text
?search=&type=&tlp=&status=&page=&limit=
```

Frontend rules:

- Treat returned data as already filtered by backend.
- Still do not intentionally request/show TLP:RED or TLP:AMBER in public UI.
- Public list should focus on validated and public IOCs.

## 4.3 Public IOC detail
Possible route:

```http
GET /iocs/{id}
```

Show:

- type
- value
- description
- tags
- TLP
- confidence
- dates
- source context
- enrichment data
- blockchain proof when present

## 4.4 Public threat actor list/detail
Possible routes:

```http
GET /threat-actors
GET /threat-actors/{id}
```

## 4.5 Public malware list/detail
Possible routes:

```http
GET /malware
GET /malware/{id}
```

## 4.6 Become contributor
Possible route:

```http
POST /register
```

Request example:

```json
{
  "name": "Example Company",
  "siret": "123456789",
  "email": "security@example.com",
  "website": "https://example.com",
  "description": "Security team interested in sharing threat intelligence",
  "country": "TN"
}
```

Response should create a pending organization request.

---

# 5. Contributor web portal endpoints

Contributor web portal uses JWT, not API key.

The backend documentation includes API-key submission routes. For a web dashboard, prefer JWT-based contributor endpoints. If not yet available, mark as backend TODO and avoid pretending it works.

## 5.1 Contributor profile/session
Recommended route if available:

```http
GET /contributor/me
Authorization: Bearer <contributor_jwt>
```

Expected response:

```ts
type ContributorMe = {
  id: string;
  email: string;
  org_id: string;
  organisation?: Organisation;
  must_change_password: boolean;
};
```

## 5.2 Contributor owned IOCs
Preferred JWT route:

```http
GET /contributor/iocs
Authorization: Bearer <contributor_jwt>
```

Alternative current API-key route:

```http
GET /iocs/mine
X-API-Key: <api_key>
```

Frontend decision:

- For the human dashboard, use JWT route if backend has it.
- If only API-key route exists, add TODO comment that backend needs JWT wrapper endpoints for portal use.

## 5.3 Contributor create IOC
Preferred JWT route:

```http
POST /contributor/iocs
Authorization: Bearer <contributor_jwt>
```

Alternative API-key route:

```http
POST /iocs/submit
X-API-Key: <api_key>
```

Request:

```json
{
  "type": "ip",
  "value": "185.220.101.45",
  "description": "Detected scanning SSH",
  "tlp": "green",
  "confidence": 80,
  "first_seen": "2026-03-10T08:22:00Z",
  "last_seen": "2026-03-18T14:05:00Z",
  "tags": ["ssh-bruteforce", "scanner"],
  "source_context": "firewall-logs"
}
```

## 5.4 Contributor mark owned submission as false positive
False positive is an official correction workflow for contributor-owned submissions.
It applies to:

- IOCs
- Malware samples
- Threat actors

Preferred JWT routes for the web contributor dashboard:

```http
POST /contributor/iocs/{ioc_id}/false-positive
Authorization: Bearer <contributor_jwt>

POST /contributor/malware/{malware_id}/false-positive
Authorization: Bearer <contributor_jwt>

POST /contributor/threat-actors/{threat_actor_id}/false-positive
Authorization: Bearer <contributor_jwt>
```

Alternative generic JWT route if backend prefers one endpoint:

```http
POST /contributor/submissions/{type}/{id}/false-positive
Authorization: Bearer <contributor_jwt>
```

Where `type` is one of:

```text
ioc | malware | threat_actor
```

Alternative API-key route for automation, if implemented:

```http
POST /iocs/false-positive
X-API-Key: <api_key>

POST /malware/false-positive
X-API-Key: <api_key>

POST /threat-actors/false-positive
X-API-Key: <api_key>

POST /malware/false-positive
X-API-Key: <api_key>

POST /threat-actors/false-positive
X-API-Key: <api_key>
```

Rules:

- Only owned submissions can be marked false positive.
- Backend must verify ownership before accepting the action.
- Do not allow edit/delete UI actions.
- Show confirmation modal before marking false positive.
- Hide or disable the action if status is already `false_positive`, `rejected`, or `revoked`.
- For IOCs, backend may also record a blockchain revocation event.

## 5.5 Contributor owned malware samples
Preferred JWT routes:

```http
GET /contributor/malware
POST /contributor/malware
Authorization: Bearer <contributor_jwt>
```

Alternative API-key submission route:

```http
POST /malware/submit
X-API-Key: <api_key>
```

Rules:

- Contributor can create malware samples.
- Contributor can view own malware samples.
- Contributor cannot edit/delete malware samples.
- Contributor can mark owned malware samples as false positive.

## 5.6 Contributor owned threat actors
Preferred JWT routes:

```http
GET /contributor/threat-actors
POST /contributor/threat-actors
Authorization: Bearer <contributor_jwt>
```

Alternative API-key submission route:

```http
POST /threat-actors/submit
X-API-Key: <api_key>
```

Rules:

- Contributor can create threat actors.
- Contributor can view own threat actors.
- Contributor cannot edit/delete threat actors.
- Contributor can mark owned threat actors as false positive.

---

# 6. Automation API-key endpoints

These are for external scripts/integrations, not normal web dashboard login.

```http
POST /iocs/submit
X-API-Key: <api_key>

POST /threat-actors/submit
X-API-Key: <api_key>

POST /malware/submit
X-API-Key: <api_key>

GET /iocs/mine
X-API-Key: <api_key>

POST /iocs/false-positive
X-API-Key: <api_key>

POST /malware/false-positive
X-API-Key: <api_key>

POST /threat-actors/false-positive
X-API-Key: <api_key>
```

Frontend should not require the contributor to paste the API key for normal web usage unless the backend has no JWT portal endpoints yet. If this is necessary temporarily, show it as a temporary/dev fallback only.

---

# 7. Admin endpoints

Admin endpoints require admin JWT:

```http
Authorization: Bearer <admin_jwt>
```

## 7.1 List organizations
Possible route:

```http
GET /admin/organisations
```

Expected response:

```ts
type OrganisationListResponse = {
  total: number;
  items: Organisation[];
};
```

## 7.2 Approve organization
Possible route:

```http
POST /admin/approve/{org_id}
```

Expected backend behavior:

- Set organization as approved.
- Generate API key for automation.
- Create contributor user with temporary password.
- Send welcome email with login credentials and API key.

Frontend should show success message like:

```text
Organisation approved. Contributor credentials and API key were sent by email.
```

Do not display fake credentials in UI unless backend returns them.

## 7.3 Revoke organization
Possible route:

```http
POST /admin/revoke/{org_id}
```

Expected behavior:

- Organization status becomes revoked.
- API key becomes unusable.
- Contributor account becomes inactive if backend supports it.

## 7.4 Admin dashboard statistics
Possible route:

```http
GET /admin/stats
```

Potential data:

- total organizations
- pending organizations
- approved organizations
- revoked organizations
- total IOCs
- total malware samples
- total threat actors
- pending submissions
- blockchain records

---

# 8. Blockchain verification endpoints

Possible routes:

```http
GET /blockchain/verify/{ioc_id}
GET /blockchain/records/{ioc_id}
```

Expected response example:

```json
{
  "ioc_id": "uuid",
  "is_valid": true,
  "tx_hash": "0x...",
  "block_number": 123,
  "event_type": "IOCRegistered",
  "recorded_at": "2026-04-01T10:00:00Z"
}
```

Frontend rules:

- Show verification result clearly.
- Show copy button for transaction hash.
- If local Ganache has no external explorer, do not create fake explorer links.

---

# 9. Chatbot endpoint

Possible route:

```http
POST /chat
```

Request:

```json
{
  "message": "What do we know about APT28?",
  "context_type": "public",
  "ioc_id": "optional-uuid"
}
```

Response:

```json
{
  "answer": "...",
  "sources": [],
  "confidence": "medium"
}
```

Rules:

- Public chatbot must not expose private TLP data.
- Contributor/admin chatbot access depends on backend authorization.
- UI must show loading and error states.

---

# 10. Error handling

Standard error response may look like:

```json
{
  "detail": "Message d'erreur"
}
```

Frontend should normalize errors:

```ts
type ApiError = {
  status: number;
  message: string;
};
```

Common statuses:

- 400: validation/business rule error
- 401: unauthenticated or invalid credentials
- 403: unauthorized role, inactive account, must change password, not owner
- 404: resource not found
- 409: duplicate conflict
- 500: server error

---

# 11. Implementation notes for Codex

- Create an API client with automatic Authorization header injection from auth state.
- Keep admin and contributor service functions separate.
- Keep public service functions separate from protected service functions.
- Do not implement edit/delete buttons for contributor-owned submissions.
- Do implement create forms and false-positive actions for IOCs, malware samples, and threat actors.
- Do implement unified login UI.
- If backend currently has separate auth endpoints, hide that inside `authApi.login()`.
