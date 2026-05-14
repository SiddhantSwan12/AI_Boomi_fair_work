# Status Model

## Job Statuses

Shared source: `src/lib/status.ts`

### Contract-backed statuses

- `OPEN`
- `ACCEPTED`
- `SUBMITTED`
- `APPROVED`
- `DISPUTED`
- `RESOLVED`
- `CANCELLED`

### App-only extension

- `WAITING_CLIENT_APPROVAL`

This is a product-layer state used after a freelancer accepts the job but before the client approves collaboration in the UI.

### Display Labels

- `OPEN` -> `Open`
- `WAITING_CLIENT_APPROVAL` -> `Acceptance Pending`
- `ACCEPTED` -> `In Progress`
- `SUBMITTED` -> `Under Review`
- `APPROVED` -> `Completed`
- `DISPUTED` -> `Disputed`
- `RESOLVED` -> `Resolved`
- `CANCELLED` -> `Cancelled`

## Dispute Statuses

Canonical UI/product statuses:

- `OPEN`
- `AI_ANALYZED`
- `VOTING`
- `RESOLVED`

### Legacy normalization

The app normalizes these legacy/raw values into `OPEN`:

- `RAISED`
- `DISPUTED`

This keeps older data renderable while the app migrates toward a single dispute lifecycle vocabulary.

## Guidance

- Prefer importing helpers from `src/lib/status.ts` instead of hard-coding labels or status groups inline.
- If a new state is introduced, update:
  - `src/lib/status.ts`
  - any migration or seed data that writes the new state
  - docs in this file
