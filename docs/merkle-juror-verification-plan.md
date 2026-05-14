# Execution Plan: Merkle-Verified Juror Registration

**Vision:** A dedicated juror registration page where document verification is the gate to profile
creation. No credential anchor on-chain = no juror profile = never selected for disputes.
Only verified jurors exist on the platform.

---

## The Core Principle

```
Upload docs → Hash (client-side) → Merkle tree → Sign (EIP-712) → Anchor on Polygon Amoy
                                                                           ↓
                                                              Tx confirmed on-chain?
                                                               YES → create profile
                                                               NO  → nothing created
```

Profile creation is the **last** step, and it is **blocked** until the anchor transaction
confirms. There is no intermediate state. A juror either has a verified profile or they don't exist.

---

## Critical Constraint: FairWorkEscrow Is NOT Redeployed

**Existing jobs and disputes on the current contract are preserved.**

`0xc7cd93d40ae3e3d913706e28a3cfc0fc67477fb4` stays live and untouched.

Credential verification is enforced at the **application layer** (API + Supabase), not inside
`FairWorkEscrow.sol`. The flow is:

```
Juror registers (with verified credentials)
    → API calls addJuror() on existing FairWorkEscrow (relayer = owner key)
    → juror is now in the jury pool
    → future _selectJurors() picks them like any other juror
```

On-chain proof checks inside `castVote()` are deferred to a future contract upgrade.
For now: if someone is in the jury pool, they got there because the API verified their credentials.

---

## What Changes vs. What Stays

| Area | Change |
|------|--------|
| New page: `src/app/jurors/register/page.tsx` | Multi-step wizard with doc upload + on-chain anchor |
| New Supabase table: `juror_profiles` | Only written after anchor tx confirms |
| New: `src/lib/merkle.ts` | SHA-256 + Merkle tree — exact TS port of merkleDoc Rust |
| New contract: `Verify.sol` deployed on Polygon Amoy | Standalone — anchors roots, verifies proofs |
| New API routes: `src/app/api/juror/*` | Process docs, relay anchor tx, call addJuror, serve proofs |
| Modified: `src/lib/supabase.ts` | Add `juror_profiles` type |
| `FairWorkEscrow.sol` | **UNTOUCHED** — no redeploy, no ABI change, existing jobs safe |
| Existing `/register` page | **UNTOUCHED** — stays for freelancers/clients |

---

## Blockchain Compatibility

| | merkleDoc | FairWork |
|---|---|---|
| Chain | Ethereum / any EVM | Polygon Amoy testnet |
| Contracts | Foundry, Solidity ^0.8 | Foundry, Solidity 0.8.20 |
| Frontend | Next.js + wagmi | Next.js 14 + wagmi v2 |

`Verify.sol` is pure EVM — deploys identically on Polygon Amoy. No chain migration needed.
The Rust backend from merkleDoc is **not used** — Merkle logic ported to TypeScript.

---

## Hashing Algorithm (must match Verify.sol exactly)

From merkleDoc Rust source:

```
leaf hash:    SHA256(raw_content_string)            → 64-char hex string
parent hash:  SHA256(left_hex_string + right_hex_string)  → operates on hex STRINGS, not raw bytes
odd leaves:   duplicate the last leaf
proof order:  leaf → root (bottom-up)
isLeft[i]:    true  = proof[i] is the LEFT sibling  → SHA256(proof[i] + current)
              false = proof[i] is the RIGHT sibling → SHA256(current + proof[i])
```

The TypeScript `src/lib/merkle.ts` implements this exactly using Web Crypto API
(`globalThis.crypto.subtle`) — works in both Node.js 18+ and the browser.

---

## Known Friction Points (pre-resolved)

| Issue | Resolution |
|-------|-----------|
| `castVote` ABI change would break existing jobs | Dropped — no contract changes at all |
| `addJuror` is `onlyOwner` | Relayer key = owner key in `.env.local`. Acceptable for testnet. |
| No `foundry.toml` at contracts root | Create it before Phase 2 deploy |
| PDF per-page splitting (pdfjs complexity) | Hash **whole file** as a single leaf. Simple, no extra deps. |
| FairWorkEscrow redeploy loses testnet state | Moot — contract is not redeployed |

---

## New Supabase Table

```sql
create table juror_profiles (
  id               uuid primary key default gen_random_uuid(),
  wallet           text not null unique,
  display_name     text not null,
  expertise        text[],
  bio              text,
  experience_level text,              -- "entry" | "intermediate" | "expert"
  credential_root  text not null,     -- 64-char hex SHA-256 Merkle root
  leaf_hashes      text[] not null,   -- individual document hashes (for proof reconstruction)
  anchor_tx        text not null,     -- confirmed tx hash on Polygon Amoy
  anchored_at      timestamptz,
  created_at       timestamptz default now()
);
```

No row is ever inserted before `anchor_tx` is confirmed. No partial/unverified rows.

---

## Phase 1 — TypeScript Merkle Library ✅ COMPLETE

**File:** `src/lib/merkle.ts`

Exports:
- `hashDocument(content: string): Promise<string>` — SHA-256 of file content
- `buildMerkleTree(data: string[]): Promise<MerkleTree>` — from raw content strings
- `buildTreeFromHashes(hashes: string[]): Promise<MerkleTree>` — from pre-hashed leaves
- `getProof(tree: MerkleTree, leafIndex: number): MerkleProof` — `{ leaf, proof[], isLeft[] }`
- `verifyProof(root, leaf, proof[], isLeft[]): Promise<boolean>` — mirrors Verify.sol
- `toBytes32(hex: string): 0x${string}` — format for contract calls
- `fromBytes32(bytes32: string): string` — strip 0x prefix

---

## Phase 2 — Deploy Verify.sol on Polygon Amoy

### Pre-requisite: create `contracts/foundry.toml`
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.20"
```

### Steps:
1. Copy `Verify.sol` from merkleDoc into `contracts/src/Verify.sol` — fix pragma to `0.8.20`
2. Write `contracts/script/DeployVerify.s.sol` (same pattern as existing `Deploy.s.sol`)
3. Deploy:
   ```bash
   cd contracts
   forge script script/DeployVerify.s.sol --rpc-url $POLYGON_AMOY_RPC --broadcast
   ```
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_VERIFY_ADDRESS=0x...
   RELAYER_PRIVATE_KEY=0x...   # must be the FairWorkEscrow owner key
   ```
5. Add ABI + address to `src/lib/contracts.ts`

### Verify.sol function signatures (confirmed from ABI):
```
anchorWithSig(bytes32 root, address docOwner, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
verify(bytes32 rootHash, bytes32 leaf, bytes32[] proof, bool[] isLeft) → bool
docs(bytes32 root) → address owner  (read the anchored owner of a root)
nonces(address) → uint256
```

---

## Phase 3 — Juror Registration API Routes

**`POST /api/juror/prepare-anchor`**
- Receives: `{ wallet, fileHashes: string[], profileData }`
  - Hashes are computed **client-side** (browser Web Crypto) — documents never leave the device
- Builds Merkle tree from hashes
- Stores `{ wallet, root, leaf_hashes[], profileData }` in a `juror_pending` staging table (TTL: 1 hour)
- Returns: `{ root_hex, typed_data }` — EIP-712 typed data for the user to sign

**`POST /api/juror/anchor`**
- Receives: `{ wallet, root_hex, signature: { v, r, s }, deadline, profileData }`
- Validates: sig matches `wallet` and `root_hex`
- Relayer (viem `walletClient`) calls `Verify.anchorWithSig(...)` on Polygon Amoy
- Waits for tx receipt
- On confirmation:
  1. INSERT into `juror_profiles` (with `anchor_tx`)
  2. Call `FairWorkEscrow.addJuror(wallet)` from relayer (owner key)
  3. DELETE from `juror_pending`
- Returns: `{ anchor_tx, profile_id }`

**`GET /api/juror/proof/[wallet]`**
- Fetches `leaf_hashes[]` from `juror_profiles`
- Rebuilds Merkle tree, returns proof for leaf[0]
- Used by dispute UI at vote time (future use)

---

## Phase 4 — `/jurors/register` Page

**File:** `src/app/jurors/register/page.tsx`

4-step wizard. Each step locked until previous completes.

**Step 1 — Connect Wallet**
- If `juror_profiles` row exists for this wallet → redirect to `/profile/[address]`

**Step 2 — Your Details**
- Display name, expertise chips, bio, experience level

**Step 3 — Upload Credentials**
- Drag-and-drop file zone (PDF, images, text)
- Files are hashed **in the browser** using `src/lib/merkle.ts` + Web Crypto API
- Files never leave the device — only hashes are sent to the API
- Shows computed Merkle root (truncated with copy button)
- "Process" button → calls `POST /api/juror/prepare-anchor`

**Step 4 — Sign & Anchor**
- Shows root hash + "Sign with your wallet" prompt
- `useAnchorCredential` hook: `signTypedData` (wagmi) → POST to `/api/juror/anchor`
- Animated pending state while waiting for tx confirmation (polls or uses wagmi event)
- On success → redirect to `/profile/[wallet]`

**Failure states handled:** wallet disconnect mid-flow, user rejects signature, tx reverts,
already registered.

---

## Phase 5 — Wire Dispute Voting UI (future)

When a juror casts a vote, the UI can optionally:
- Fetch their proof from `GET /api/juror/proof/[wallet]`
- Display a "Credentials Verified" badge (check `juror_profiles` row exists)

Full on-chain proof verification in `castVote` is deferred to a future contract upgrade
that does not disrupt existing jobs.

---

## Implementation Order

| # | Phase | Depends on | Status |
|---|-------|-----------|--------|
| 1 | `src/lib/merkle.ts` | nothing | ✅ Done |
| 2 | `foundry.toml` + deploy `Verify.sol` | Phase 1 done | ✅ Done — `0x4913B1B6E33f9D718158B5De3fb5a0FfB59045e0` |
| 3 | API routes | Phase 2 | ✅ Done |
| 4 | `/jurors/register` page | Phase 3 | ✅ Done |
| 5 | Dispute UI credential badges | Phase 4 | ⬜ |

---

## Resolved Design Decisions

| Question | Decision |
|----------|----------|
| Relayer wallet | `RELAYER_PRIVATE_KEY` in `.env.local` = FairWorkEscrow owner key |
| Document storage | **Documents never leave the browser** — only hashes sent to API |
| Owner gate | `addJuror()` called by relayer API after anchor confirms. Owner key = relayer key. |
| Leaf granularity | One file = one leaf. No per-page splitting for MVP. |
| Profile creation trigger | Strictly after on-chain tx confirmation — no optimistic inserts |
| FairWorkEscrow | **Not redeployed** — existing jobs preserved |
