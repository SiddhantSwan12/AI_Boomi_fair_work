# Environment Setup

## Required Core Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=
NEXT_PUBLIC_JURY_POOL_CONTRACT_ADDRESS=
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=

PINATA_JWT=
```

## AI Variables

At least one of these is usually needed for the AI routes:

```env
OPENAI_API_KEY=
FASTROUTER_API_KEY=
NUGEN_API_KEY=
```

## Meeting / Communication Variables

```env
NEXT_PUBLIC_JAAS_APP_ID=
JAAS_API_KEY_ID=
JAAS_PRIVATE_KEY=
NEXT_PUBLIC_XMTP_ENV=dev
```

## Contract / Deployment Variables

```env
PRIVATE_KEY=
NEXT_PUBLIC_ALCHEMY_ID=
```

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the services you plan to use locally.
3. Run `npm install`.
4. Run `npm run dev`.
5. Optionally run `forge test` for the contract suite.

## Notes

- The frontend currently targets Polygon Amoy.
- The dev server runs on port `3001`.
- Missing Supabase configuration should be treated as a setup error, not a supported app mode.
