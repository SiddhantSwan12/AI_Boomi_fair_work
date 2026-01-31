# FairWork - Decentralized Freelance Escrow Platform

AI-powered dispute resolution with DAO governance for Web3 freelancing.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Foundry (for smart contracts)
- Polygon Mumbai testnet MATIC (for gas)
- USDC on Mumbai testnet

### Environment Setup

1. **Copy environment template:**
```bash
cp .env.example .env.local
```

2. **Fill in your API keys in `.env.local`:**
```env
# Get from Alchemy.com
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_key

# Get from OpenAI
OPENAI_API_KEY=your_openai_key

# Get from Pinata.cloud
PINATA_JWT=your_pinata_jwt

# Get from Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For deployment
PRIVATE_KEY=your_wallet_private_key
```

### Installation

```bash
# Install frontend dependencies
npm install

# Install Foundry dependencies (OpenZeppelin)
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
cd ..
```

### Deploy Smart Contract

```bash
# Make sure you have MATIC on Mumbai testnet
# Deploy to Polygon Mumbai
forge script contracts/script/Deploy.s.sol:DeployScript \
  --rpc-url https://polygon-mumbai.g.alchemy.com/v2/$NEXT_PUBLIC_ALCHEMY_ID \
  --broadcast \
  --verify

# Copy the deployed contract address to .env.local
# NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...
```

### Run Supabase Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration

### Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🏗️ Architecture

### Smart Contracts (Polygon Mumbai)
- **FairWorkEscrow.sol**: Main escrow contract handling jobs, disputes, and voting
- **USDC Integration**: Uses Mumbai USDC testnet token
- **Gas Optimized**: ~200k gas for job creation

### Frontend (Next.js 14)
- **App Router**: Server and client components
- **wagmi v2**: Web3 wallet connection
- **RainbowKit**: Beautiful wallet UI
- **Tailwind CSS**: Professional design system

### Backend (Next.js API Routes)
- **AI Analysis**: `/api/ai/analyze` - Nugen/OpenAI dispute analysis
- **IPFS Upload**: `/api/ipfs/upload` - Pinata file uploads

### Storage
- **IPFS (Pinata)**: Job descriptions, deliverables, evidence
- **Supabase**: Off-chain metadata and indexing
- **Smart Contract**: Source of truth for funds and state

---

## 📋 User Flows

### 1. Create Job (Client)
1. Connect wallet
2. Fill job details (title, description, amount, deadline)
3. Approve USDC spending
4. Create job (funds locked in escrow)
5. Job appears in "Browse Jobs"

### 2. Accept Job (Freelancer)
1. Browse open jobs
2. Click job to view details
3. Click "Accept Job"
4. Work on deliverable

### 3. Submit Deliverable (Freelancer)
1. Upload files to IPFS
2. Submit deliverable hash to contract
3. Client notified

### 4. Approve Work (Client - Happy Path)
1. Review deliverable
2. Click "Approve"
3. Funds released to freelancer (minus 2.5% platform fee)

### 5. Raise Dispute (Client or Freelancer)
1. Click "Raise Dispute"
2. Upload evidence to IPFS
3. Dispute created on-chain
4. 3 random jurors selected

### 6. AI Analysis (Automatic)
1. System fetches job description, deliverable, and evidence
2. Calls `/api/ai/analyze` with dispute data
3. AI returns structured recommendation
4. Displayed to jurors

### 7. Jury Voting
1. Selected jurors see dispute details + AI analysis
2. Each juror votes for Client or Freelancer
3. After 3 votes, contract auto-resolves
4. Majority wins, funds distributed

---

## 🎨 Design System

### Colors
- **Primary**: Indigo (#6366f1) - Trust & professionalism
- **Secondary**: Purple (#8b5cf6) - Innovation
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Components
All components follow shadcn/ui patterns with FairWork customizations.

---

## 🔑 Key Features

### ✅ Implemented
- [x] Smart contract escrow with USDC
- [x] Job creation and browsing
- [x] Wallet connection (RainbowKit)
- [x] IPFS file uploads (Pinata)
- [x] Dispute creation
- [x] AI dispute analysis (OpenAI fallback)
- [x] Jury voting system
- [x] Automatic fund distribution
- [x] Professional UI/UX

### ⚠️ Flagged for Verification
- **Fastrouter API**: Endpoint structure needs verification from docs
  - Currently using OpenAI as fallback (fully working)
  - To integrate Fastrouter, check their API docs for exact endpoint

### 🔮 Future Enhancements (Post-Hackathon)
- Multiple milestones per job
- Commit-reveal voting for juror privacy
- Reputation system for freelancers
- Juror staking and rewards
- Chainlink VRF for random juror selection
- Email notifications
- Chat system

---

## 🧪 Testing

### Manual Testing Flow
1. **Get Mumbai USDC**: Use Mumbai USDC faucet
2. **Create Job**: Post a test job with small amount
3. **Accept Job**: Use different wallet to accept
4. **Submit Deliverable**: Upload test file
5. **Raise Dispute**: Test dispute flow
6. **Vote as Juror**: Add your address as juror, then vote

### Contract Testing
```bash
cd contracts
forge test
```

---

## 🚨 Important Notes

### For Hackathon Judges
- **Live Demo**: Make sure to have 2-3 wallets ready
- **Mumbai USDC**: Get testnet USDC from faucet
- **Jurors**: Add juror addresses via contract owner

### Security Considerations
- ✅ ReentrancyGuard on all state-changing functions
- ✅ Pausable for emergency stops
- ✅ OpenZeppelin battle-tested contracts
- ⚠️ Juror selection is pseudo-random (use Chainlink VRF in production)

### Gas Costs (Mumbai)
- Create Job: ~200k gas (~$0.01)
- Accept Job: ~50k gas
- Submit Deliverable: ~60k gas
- Raise Dispute: ~150k gas
- Cast Vote: ~80k gas

---

## 📚 Tech Stack

- **Smart Contracts**: Solidity 0.8.20, Foundry, OpenZeppelin
- **Frontend**: Next.js 14, React 18, TypeScript
- **Web3**: wagmi v2, viem, RainbowKit
- **Styling**: Tailwind CSS, shadcn/ui
- **AI**: OpenAI GPT-4o (Fastrouter integration pending)
- **Storage**: IPFS (Pinata), Supabase (PostgreSQL)
- **Network**: Polygon Mumbai Testnet

---

## 🤝 Contributing

This is a hackathon project. For production use, please:
1. Audit smart contracts
2. Implement Chainlink VRF for random selection
3. Add comprehensive tests
4. Set up proper monitoring
5. Implement rate limiting on API routes

---

## 📄 License

MIT License - Built for ETHGlobal Hackathon

---

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Polygon for fast, cheap L2
- Pinata for IPFS infrastructure
- OpenAI for dispute analysis
- shadcn/ui for beautiful components

---

**Built with ❤️ for fair freelancing**
