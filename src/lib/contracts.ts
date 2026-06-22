// Contract ABIs - Generated from Solidity contracts
// After deploying, you can get the full ABI from contracts/out/FairWorkEscrow.sol/FairWorkEscrow.json

export const ESCROW_ABI = [
    // Read functions
    {
        inputs: [{ name: "_jobId", type: "uint256" }],
        name: "getJob",
        outputs: [
            {
                components: [
                    { name: "id", type: "uint256" },
                    { name: "client", type: "address" },
                    { name: "freelancer", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                    { name: "descriptionHash", type: "string" },
                    { name: "deliverableHash", type: "string" },
                    { name: "status", type: "uint8" },
                    { name: "createdAt", type: "uint256" },
                ],
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_disputeId", type: "uint256" }],
        name: "getDisputeJurors",
        outputs: [{ name: "", type: "address[]" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_disputeId", type: "uint256" }],
        name: "getDisputeVotes",
        outputs: [
            { name: "", type: "uint256" },
            { name: "", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "jobCounter",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "usdc",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },

    // Write functions
    {
        inputs: [
            { name: "_amount", type: "uint256" },
            { name: "_deadline", type: "uint256" },
            { name: "_descriptionHash", type: "string" },
        ],
        name: "createJob",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "_jobId", type: "uint256" }],
        name: "acceptJob",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "_jobId", type: "uint256" },
            { name: "_deliverableHash", type: "string" },
        ],
        name: "submitDeliverable",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "_jobId", type: "uint256" }],
        name: "approveJob",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "_juror", type: "address" }],
        name: "addJuror",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "", type: "address" }],
        name: "isJuror",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_jobId", type: "uint256" }],
        name: "cancelJob",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "_jobId", type: "uint256" },
            { name: "_evidenceHash", type: "string" },
        ],
        name: "raiseDispute",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "_disputeId", type: "uint256" },
            { name: "_voteForClient", type: "bool" },
        ],
        name: "castVote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },

    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "jobId", type: "uint256" },
            { indexed: true, name: "client", type: "address" },
            { indexed: false, name: "amount", type: "uint256" },
            { indexed: false, name: "deadline", type: "uint256" },
        ],
        name: "JobCreated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "jobId", type: "uint256" },
            { indexed: true, name: "freelancer", type: "address" },
        ],
        name: "JobAccepted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "jobId", type: "uint256" },
            { indexed: false, name: "deliverableHash", type: "string" },
        ],
        name: "DeliverableSubmitted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, name: "jobId", type: "uint256" }],
        name: "JobApproved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "jobId", type: "uint256" },
            { indexed: true, name: "client", type: "address" },
            { indexed: false, name: "refundAmount", type: "uint256" },
        ],
        name: "JobCancelled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "disputeId", type: "uint256" },
            { indexed: true, name: "jobId", type: "uint256" },
            { indexed: true, name: "raisedBy", type: "address" },
        ],
        name: "DisputeRaised",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "disputeId", type: "uint256" },
            { indexed: true, name: "requestId", type: "uint256" },
        ],
        name: "JurorSelectionRequested",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "disputeId", type: "uint256" },
            { indexed: false, name: "jurors", type: "address[]" },
        ],
        name: "JurorsSelected",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "disputeId", type: "uint256" },
            { indexed: true, name: "juror", type: "address" },
            { indexed: false, name: "votedForClient", type: "bool" },
        ],
        name: "VoteCast",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "disputeId", type: "uint256" },
            { indexed: true, name: "winner", type: "address" },
        ],
        name: "DisputeResolved",
        type: "event",
    },
] as const;

// Verify.sol — deployed on Polygon Amoy at NEXT_PUBLIC_VERIFY_ADDRESS
// Used for juror credential anchoring and Merkle proof verification
export const VERIFY_ABI = [
    {
        inputs: [
            { name: "root",     type: "bytes32" },
            { name: "docOwner", type: "address" },
            { name: "deadline", type: "uint256" },
            { name: "v",        type: "uint8"   },
            { name: "r",        type: "bytes32" },
            { name: "s",        type: "bytes32" },
        ],
        name: "anchorWithSig",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "rootHash", type: "bytes32"   },
            { name: "leaf",     type: "bytes32"   },
            { name: "proof",    type: "bytes32[]" },
            { name: "isLeft",   type: "bool[]"    },
        ],
        name: "verify",
        outputs: [{ name: "ok", type: "bool" }],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [{ name: "", type: "bytes32" }],
        name: "docs",
        outputs: [
            { name: "owner",     type: "address" },
            { name: "timestamp", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "", type: "address" }],
        name: "nonces",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: "document", type: "bytes"   },
            { indexed: false, name: "owner",    type: "address" },
        ],
        name: "DocumentAccepted",
        type: "event",
    },
] as const;

export const VERIFY_ADDRESS  = (process.env.NEXT_PUBLIC_VERIFY_ADDRESS        ?? "") as `0x${string}`;
export const ESCROW_ADDRESS  = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ?? "") as `0x${string}`;

// ERC20 USDC ABI (minimal - just what we need)
export const USDC_ABI = [
    {
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
] as const;
