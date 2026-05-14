# FairWork Project Structure

This file reflects the current repository layout more accurately than the original hackathon-era structure notes.

## Top Level

```text
Saasi_Boom/
├── README.md
├── PROJECT_STRUCTURE.md
├── docs/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── foundry.toml
├── contracts/
├── prompts/
├── public/
├── src/
├── supabase/
└── my-clone/              # experimental side directory, not part of main runtime
```

## Application Layout

### `src/app`

Main App Router entrypoints:

- `layout.tsx`: global fonts, providers, app shell wiring
- `page.tsx`: cinematic marketing landing page
- `dashboard/page.tsx`: product-style overview page
- `jobs/page.tsx`: browse jobs
- `jobs/create/page.tsx`: create job flow
- `jobs/[id]/page.tsx`: single job flow, acceptance, delivery, dispute entry
- `disputes/page.tsx`: dispute center
- `disputes/[id]/page.tsx`: dispute details, AI analysis, legal report, voting
- `profile/*`, `register/page.tsx`, `test-ai/page.tsx`

### `src/app/api`

The API surface is broad and grouped by capability:

- `ai/`
  - `analyze/route.ts`: prompt-template dispute analysis
  - `analyze-dispute/route.ts`: dispute-id driven analysis using Supabase records
  - `legal-report/route.ts`: transcript-to-HTML legal report
  - `transcript/route.ts`: message transcript summarization
- `dispute/`
  - `legal-report/route.ts`: evidence-heavy formal arbitration report persisted to Supabase/IPFS
  - `generate-pdf/route.ts`: dispute PDF generation
  - `respond/route.ts`: party response capture
- `ipfs/upload/route.ts`: file upload to Pinata
- `upload/route.ts`: JSON upload to Pinata
- `submissions/route.ts`: project submissions CRUD
- `meet/*`: JaaS token and recording support
- `transcribe/route.ts`: transcription helpers

Important note:
- There are overlapping AI/legal-report routes serving different UX flows. This is one of the main maintenance hotspots in the repo.

## Components

### `src/components/landing`

Marketing/brand-heavy landing page system:

- shared primitives like `Container`, `FluidGlass`, `GlowOrb`, `Background3D`
- section components under `sections/`
- navbar/footer variants dedicated to the landing experience

### `src/components/layout`

Authenticated/product navigation and chrome:

- `Navbar.tsx`
- `WalletButton.tsx`
- `NotificationBell.tsx`
- `ProfileMenu.tsx`

### `src/components/jobs`

Product workflow components:

- `JobCard.tsx`
- `ProjectSubmissionForm.tsx`
- `ReviewModal.tsx`

### `src/components/disputes`

Dispute lifecycle UI:

- `DisputeTimeline.tsx`
- `AIAnalysisReport.tsx`
- `JuryVotingPanel.tsx`
- `LegalReportViewer.tsx`

### `src/components/chat`

XMTP-based communication:

- `JobXmtpChat.tsx`
- `ChatSidebar.tsx`

### `src/components/meet`

- `JitsiMeetModal.tsx`

### `src/components/ui`

Low-level UI primitives and shared widgets.

## Shared Logic

### `src/lib`

- `wagmi.ts`: wallet + chain configuration, currently Polygon Amoy
- `contracts.ts`: hand-maintained contract ABI fragments
- `supabase.ts`: lazy client initialization with a mock fallback when env is missing
- `pinata.ts`: IPFS helper functions
- `rate-limit.ts`: API throttling
- `utils.ts`: formatting and helper utilities

### `src/hooks`

- `useGSAP.ts`
- `useVoiceRecorder.ts`
- `useXmtpChat.ts`

## Smart Contracts

### `contracts`

Foundry project with:

- `src/FairWorkEscrow.sol`
- `test/FairWorkEscrow.t.sol`
- `script/Deploy.s.sol`

Current contract responsibilities:

- job funding
- freelancer acceptance
- deliverable submission
- approval and payout
- dispute voting
- juror pool management

## Data Layer

### `supabase/migrations`

Current migrations cover:

- core jobs/disputes/evidence schema
- profiles, reviews, notifications
- legal reports and meeting recordings
- project submissions
- dispute PDF metadata and party responses

## Reorganization Guidance

If you continue cleaning this repo up, the highest-value structural moves are:

1. Split marketing and product docs clearly.
2. Consolidate duplicate AI/legal-report routes into one documented pipeline per use case.
3. Move experimental work like `my-clone/` outside the main app repo or keep it fully ignored.
4. Add a dedicated `docs/` folder for architecture, env setup, and flow diagrams.
5. Normalize status names across contract state, Supabase state, and UI labels.
