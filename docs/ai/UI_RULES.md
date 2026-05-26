# UI_RULES.md

This file defines UI/UX rules for the React + Tailwind frontend.

The design should feel modern, trustworthy, cybersecurity-oriented, and clean.

---

# 1. General style direction

Preferred style:

- ThreatChain uses a dark cybersecurity landing/register aesthetic and a clean light-first public dashboard with dark-mode support.
- Clean cards with subtle borders.
- Good spacing and readable typography.
- Modern Tailwind layout.
- Professional, not childish or overly flashy.
- Avoid clutter.
- Make important states very clear.

Current theme palette:

```css
--color-brand-deep-bg-purple: #120226;
--color-brand-primary-interface-blue: #100a36;
--color-brand-action-glow-blue: #4a3cc9;
--color-brand-aura-purple: #2a1673;
--color-brand-highlight-purple: #a789d6;
--color-brand-core-white: #ffffff;
--color-brand-body-gray: #b6b6cc;
```

Theme usage rules:

- Landing and contributor registration pages use the dark brand base `#120226`, dark panels `#100A36`, aura borders `#2A1673`, primary actions `#4A3CC9`, highlight text/icons `#A789D6`, white headings, and muted body text `#B6B6CC`.
- Public intelligence dashboard pages use light surfaces by default: page background `#F7F8FC`, cards `#FFFFFF`, borders `#E5E8F2` / `#EEF1FA`, primary text `#100A36`, secondary text around `#5E667C` / `#616B82` / `#6A728A`, and primary links/actions `#4A3CC9`.
- Dark mode for public dashboard pages uses page/card background `#0F0F1E`, panel hover/surface `#1A1A2E`, borders `#2A2A3E` / `#3A3A4E`, white headings, muted text `#A1A5AF` / `#B0B5C3`, and blue-purple highlights `#6B5FD9` / `#88ADFF`.
- Primary buttons should use `#4A3CC9` on light/dark brand screens, hover toward `#5A49DA` or `#3c2fb2`, and keep white text.
- Keep purple/blue accents controlled and intentional: use them for navigation active states, CTAs, focus rings, card top accents, links, and icon containers.
- Functional status colors should remain distinct from brand accents: success `#10B981` / green badge tones, danger `#EF4444`, warning amber/yellow, and neutral slate/gray.
- Avoid introducing unrelated color families unless a status needs them. New UI should reuse the palette above or the existing badge/status tones.

Suggested visual keywords:

- threat intelligence
- SOC dashboard
- blockchain integrity
- collaborative security
- enterprise portal

---

# 2. Layout rules

## Public layout

Public pages should include:

- Navbar
- Main content
- Footer optional
- Clear call-to-action: Become Contributor
- Secondary call-to-action: Explore dashboard / Search IOCs

## Auth layout

Shared login page `/login` should:

- Have one login form only.
- Mention that it is for approved contributors and admins.
- Not have separate tabs unless useful.
- Not reveal whether an entered email is admin or contributor after failure.
- On success, redirect based on returned role.

Suggested login page copy:

```text
Sign in to your secure workspace
For approved contributors and platform administrators.
```

## Contributor layout

Contributor pages should include:

- Sidebar or top navigation.
- Organization/account context if available.
- Clear quick actions.
- No admin links.

Contributor nav items:

- Overview
- My IOCs
- Submit IOC
- My Malware
- Submit Malware
- My Threat Actors
- Submit Threat Actor
- Change Password
- Logout

## Admin layout

Admin pages should include:

- Sidebar or top navigation.
- Admin-only navigation.
- Clear separation from contributor portal.

Admin nav items:

- Overview
- Organisations
- IOCs
- Malware
- Threat Actors
- API Keys if supported
- Stats
- Logout

---

# 3. Role visibility rules

## Public visitor UI
Show:

- Public navigation.
- Public dashboard.
- Become Contributor.
- Login.

Do not show:

- Submit IOC actions.
- Contributor dashboard links.
- Admin dashboard links.

## Contributor UI
Show:

- Contributor dashboard.
- Create actions.
- Mark false positive action for owned IOCs, malware samples, and threat actors.
- Change password.

Do not show:

- Admin links.
- Edit/delete buttons for submissions.
- API key hash.
- Other organizations' private data.

## Admin UI
Show:

- Organization approvals.
- Platform statistics.
- Contributor/account management actions supported by backend.

Do not show:

- Hardcoded credential hints.
- Fake API keys/passwords.

---

# 4. Badge rules

## TLP badges

Represent TLP clearly:

- RED: restricted/private; never shown on public pages unless backend incorrectly returns it, in which case hide or display access error.
- AMBER: limited sharing; never shown on public pages.
- GREEN: community sharing; allowed publicly.
- WHITE: public sharing; allowed publicly.

Suggested Tailwind classes can be adjusted:

```ts
const tlpClasses = {
  red: 'bg-[#FDE8E8] text-[#C11E1E] dark:bg-[#3A1F1F] dark:text-[#FF6B6B]',
  amber: 'bg-[#FFF6DF] text-[#9A6600] dark:bg-[#3A2F1A] dark:text-[#FFD166]',
  green: 'bg-[#E7F8EF] text-[#0F7A43] dark:bg-[#1B3A2A] dark:text-[#4EDC7F]',
  white: 'bg-[#EEF1FA] text-[#39415C] dark:bg-[#2A2A3E] dark:text-[#B0B5C3]',
};
```

## Status badges

Suggested styles:

```ts
const statusClasses = {
  validated: 'bg-[#E7F8EF] text-[#0F7A43] dark:bg-[#1B3A2A] dark:text-[#4EDC7F]',
  pending: 'bg-[#FFF6DF] text-[#9A6600] dark:bg-[#3A2F1A] dark:text-[#FFD166]',
  rejected: 'bg-[#FDE8E8] text-[#C11E1E] dark:bg-[#3A1F1F] dark:text-[#FF6B6B]',
  revoked: 'bg-[#EEF1FA] text-[#39415C] dark:bg-[#2A2A3E] dark:text-[#B0B5C3]',
  false_positive: 'bg-[#FFF6DF] text-[#9A6600] dark:bg-[#3A2F1A] dark:text-[#FFD166]',
  deprecated: 'bg-[#EEF1FA] text-[#39415C] dark:bg-[#2A2A3E] dark:text-[#B0B5C3]',
  approved: 'bg-[#E7F8EF] text-[#0F7A43] dark:bg-[#1B3A2A] dark:text-[#4EDC7F]',
  active: 'bg-[#E7F8EF] text-[#0F7A43] dark:bg-[#1B3A2A] dark:text-[#4EDC7F]',
  public: 'bg-[#E7EEFF] text-[#2D4DB8] dark:bg-[#1F2A4A] dark:text-[#88ADFF]',
};
```

---

# 5. Forms

All forms must include:

- Label for every input.
- Placeholder where helpful.
- Client-side validation.
- Backend error display.
- Disabled submit button while loading.
- Success state after submit.
- Clear required/optional field distinction.

## Login form
Fields:

- email/username
- password

Behavior:

- One form for admin and contributor.
- Do not ask the user to choose role unless backend requires it.
- Generic error for failed login.
- Redirect based on backend result.

## Registration form
Fields:

- organization name
- SIRET/legal registration number
- email
- website optional
- country optional
- description optional

Success message must explain admin review and email delivery of credentials/API key.

## Contributor submission forms
Common rules:

- Explain that submissions are traceable and cannot be edited/deleted later.
- Provide cancel/back button.
- Provide success message.
- Redirect to relevant list after success, or offer “submit another”.

## Change password form
Fields:

- current password
- new password
- confirm new password

Rules:

- Minimum 8 characters.
- Confirm password must match.
- On success, redirect to contributor dashboard.

---

# 6. Data tables

Tables should include:

- Search/filter where useful.
- Responsive behavior.
- Empty state.
- Loading skeleton/spinner.
- Error state with retry.
- Clear action buttons.

Contributor tables must not contain:

- Edit action.
- Delete action.

Contributor IOC, malware, and threat actor tables may contain:

- View details
- Mark false positive

---

# 7. Empty states

Examples:

## Public IOC list empty

```text
No public IOCs match your filters.
```

## Contributor submissions empty

```text
You have not submitted anything yet.
```

## Admin pending organizations empty

```text
No pending contributor requests.
```

---

# 8. Error states

Use human-friendly error messages.

Examples:

## Login error

```text
Invalid email or password.
```

Do not say “admin not found” or “contributor not found” on login failure.

## Unauthorized contributor route

```text
You need to sign in as a contributor to access this page.
```

## Unauthorized admin route

```text
You need administrator access to open this page.
```

## Must change password

```text
You must change your temporary password before accessing the contributor dashboard.
```

---

# 9. Important UX logic

## Immutable submissions explanation
Contributor submissions should be presented as traceable intelligence records.

Use copy like:

```text
For traceability, submitted records cannot be edited or deleted. If an IOC, malware sample, or threat actor is incorrect, you can mark it as a false positive.
```

## API key explanation
In contributor settings/help page, explain:

```text
Your API key is used for automated integrations and scripts. Your portal password is used only to access this web dashboard.
```

Do not display API key unless backend intentionally returns a plain key after generation/regeneration.

---

# 10. Accessibility and responsiveness

- Use semantic HTML.
- Buttons must have readable labels.
- Inputs must have labels.
- Ensure color contrast is readable.
- Pages must work on mobile and desktop.
- Tables should become cards or horizontally scroll on mobile.

---

# 11. Codex design behavior

Codex should:

- Reuse existing Tailwind theme if good.
- Improve readability if current colors are weak.
- Keep components small and reusable.
- Prefer composition over huge page files.
- Avoid random colors and inconsistent styles.
- Keep final UI coherent across public/contributor/admin zones.
