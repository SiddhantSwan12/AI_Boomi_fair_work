# FairWork - Project Structure

```
fairwork/
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── foundry.toml                    # Foundry configuration
│
├── contracts/                      # Smart contracts (Foundry)
│   ├── src/
│   │   ├── FairWorkEscrow.sol     # Main escrow contract
│   │   ├── JuryPool.sol           # Jury staking and selection
│   │   └── interfaces/
│   │       └── IERC20.sol
│   ├── script/
│   │   └── Deploy.s.sol           # Deployment script
│   ├── test/
│   │   └── FairWorkEscrow.t.sol   # Contract tests
│   └── lib/                        # OpenZeppelin via forge install
│
├── src/
│   ├── app/                        # Next.js 14 App Router
│   │   ├── layout.tsx             # Root layout with providers
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css            # Global styles + Tailwind
│   │   ├── jobs/
│   │   │   ├── page.tsx           # Browse jobs
│   │   │   ├── create/
│   │   │   │   └── page.tsx       # Create new job
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Job details
│   │   ├── disputes/
│   │   │   ├── page.tsx           # My disputes
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Dispute details + voting
│   │   └── api/
│   │       ├── ai/
│   │       │   └── analyze/
│   │       │       └── route.ts   # AI dispute analysis endpoint
│   │       ├── ipfs/
│   │       │   └── upload/
│   │       │       └── route.ts   # IPFS upload via Pinata
│   │       └── jobs/
│   │           └── route.ts       # Job metadata CRUD
│   │
│   ├── components/                 # React components
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── toast.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── jobs/
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobList.tsx
│   │   │   └── CreateJobForm.tsx
│   │   ├── disputes/
│   │   │   ├── DisputeTimeline.tsx
│   │   │   ├── AIAnalysisReport.tsx
│   │   │   ├── EvidenceUpload.tsx
│   │   │   └── JuryVotingPanel.tsx
│   │   └── web3/
│   │       └── WalletButton.tsx
│   │
│   ├── lib/                        # Utilities and configurations
│   │   ├── wagmi.ts               # Wagmi configuration
│   │   ├── supabase.ts            # Supabase client
│   │   ├── pinata.ts              # Pinata IPFS client
│   │   ├── contracts.ts           # Contract ABIs and addresses
│   │   └── utils.ts               # Helper functions
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useJobs.ts             # Job data fetching
│   │   ├── useDisputes.ts         # Dispute data fetching
│   │   └── useContract.ts         # Contract interaction helpers
│   │
│   └── types/                      # TypeScript types
│       ├── job.ts
│       ├── dispute.ts
│       └── contract.ts
│
├── prompts/                        # AI prompt templates
│   └── dispute-analysis.txt       # Nugen AI prompt for dispute analysis
│
├── public/                         # Static assets
│   └── fonts/                     # Custom fonts if needed
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql # Database schema
```

## Key Design Decisions

### Why This Structure?

1. **Contracts Separation**: Foundry projects work best in their own directory structure
2. **App Router**: Next.js 14 App Router for better performance and SEO
3. **API Routes**: Co-located with frontend for simplicity (no separate backend server)
4. **Component Organization**: Grouped by feature (jobs, disputes) not by type
5. **Lib vs Hooks**: `lib/` for pure functions, `hooks/` for React-specific logic

### What's Connected to What?

- **Frontend** → reads contract events, calls contract functions via wagmi
- **API Routes** → handle AI analysis, IPFS uploads, Supabase queries
- **Smart Contracts** → emit events that frontend listens to
- **Supabase** → stores job metadata, dispute evidence links (IPFS hashes)
- **IPFS** → stores actual files (deliverables, evidence PDFs/images)
