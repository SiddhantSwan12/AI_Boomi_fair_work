# Architecture

## Overview

FairWork is a Next.js 14 application backed by:

- Solidity contracts for escrow and juror voting
- Supabase for product metadata and workflow state
- Pinata/IPFS for file and JSON storage
- AI routes for transcript generation, dispute analysis, and legal reporting
- XMTP and Jitsi/JaaS for communication

## Runtime Layers

### Frontend

- `src/app/page.tsx`: cinematic marketing landing page
- `src/app/dashboard/page.tsx`: product overview
- `src/app/jobs/*`: job marketplace and delivery flow
- `src/app/disputes/*`: dispute review and reporting flow
- `src/app/profile/*`: profile and portfolio surface

### Shared UI and Hooks

- `src/components/landing/*`: marketing system
- `src/components/jobs/*`: marketplace/job execution UI
- `src/components/disputes/*`: dispute review UI
- `src/components/chat/*`: XMTP chat experience
- `src/hooks/*`: GSAP, voice recording, XMTP helpers

### Backend Routes

- `src/app/api/ai/*`: AI-only endpoints
- `src/app/api/dispute/*`: dispute-specific reporting and response endpoints
- `src/app/api/ipfs/upload/route.ts`: file upload
- `src/app/api/upload/route.ts`: JSON upload
- `src/app/api/submissions/route.ts`: project submissions
- `src/app/api/meet/*`: meeting token/recording support

### Contracts

- `contracts/src/FairWorkEscrow.sol`: escrow lifecycle, disputes, jury selection, payout
- `contracts/test/FairWorkEscrow.t.sol`: Foundry tests

### Data

- `supabase/migrations/*`: schema history for jobs, disputes, reports, notifications, profiles, submissions

## Maintenance Hotspots

### 1. Mixed on-chain and off-chain workflow ownership

Escrow and voting live in the contract, but several app workflows currently use Supabase-first updates for speed and UX flexibility. Refactors should be explicit about which source of truth owns each stage.

### 2. Overlapping AI/reporting endpoints

There are two report-generation families:

- transcript-driven report generation
- evidence-heavy dispute report generation persisted to Supabase/IPFS

These should stay documented separately until consolidated.

### 3. Status synchronization

Job and dispute states are referenced by:

- contract enums
- Supabase rows
- page logic
- UI labels

Shared helpers now live in `src/lib/status.ts` and should be preferred over inline string maps.
