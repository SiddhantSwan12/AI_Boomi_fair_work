# FairWork

FairWork is a Next.js 14 + Solidity project for Web3 freelance escrow. The app combines on-chain job funding with off-chain product workflows for submissions, messaging, meetings, AI-assisted dispute analysis, and legal-report generation.

This repository is currently an active product workspace, not a minimal starter. Some features are fully on-chain, while others use Supabase as the practical source of truth for the current MVP.

## Stack

- Next.js 14 App Router
- React 18
- Tailwind CSS
- wagmi + RainbowKit
- Supabase
- Pinata / IPFS
- XMTP chat
- Jitsi / JaaS meeting support
- Foundry for smart contracts

## Current App Surfaces

- `/` cinematic marketing landing page
- `/dashboard` product overview / marketplace-style entry page
- `/jobs` browse jobs
- `/jobs/create` post a job
- `/jobs/[id]` accept work, submit deliverables, raise disputes, chat
- `/disputes` dispute center
- `/disputes/[id]` AI analysis, legal report, juror flow
- `/profile/[address]`, `/profile/edit`, `/register`

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Foundry

### Install

```bash
npm install
```

If you want to run the Solidity tests or redeploy contracts:

```bash
forge install OpenZeppelin/openzeppelin-contracts
```

### Environment

Copy the template and fill in the services you actually want to use:

```bash
cp .env.example .env.local
```

Common variables used by the current app:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=
NEXT_PUBLIC_JURY_POOL_CONTRACT_ADDRESS=
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=

PINATA_JWT=

OPENAI_API_KEY=
FASTROUTER_API_KEY=
NUGEN_API_KEY=

NEXT_PUBLIC_JAAS_APP_ID=
JAAS_API_KEY_ID=
JAAS_PRIVATE_KEY=

PRIVATE_KEY=
```

### Run the App

```bash
npm run dev
```

The dev server is configured for `http://localhost:3001`.

### Type Check

```bash
npm run type-check
```

### Contract Tests

```bash
forge test
```

## Repository Map

- `src/app`: App Router pages and API routes
- `src/components`: UI grouped mostly by feature
- `src/hooks`: custom React hooks like GSAP, voice recording, XMTP chat
- `src/lib`: integrations and shared utilities
- `src/types`: TypeScript types
- `contracts`: Foundry smart contract project
- `supabase/migrations`: SQL schema evolution
- `prompts`: AI prompt templates
- `public`: static assets
- `docs`: architecture, setup, flow, and status notes

See `PROJECT_STRUCTURE.md` for a more complete walkthrough.

## Important Notes

- The app currently targets Polygon Amoy in the frontend config.
- Supabase is used heavily for metadata and some MVP flows that are not fully mirrored on-chain.
- `my-clone/` is an experimental side directory and is not part of the main application runtime.

## Known Maintenance Gaps

- Some docs and product assumptions still reference older Mumbai-era behavior.
- There are overlapping AI/legal-report routes for different product flows.
- The dispute flow mixes on-chain and off-chain handling and should be treated carefully during refactors.
