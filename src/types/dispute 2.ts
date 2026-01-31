export enum DisputeStatus {
    RAISED = "RAISED",
    AI_ANALYZED = "AI_ANALYZED",
    VOTING = "VOTING",
    RESOLVED = "RESOLVED",
}

export enum DisputeOutcome {
    PENDING = "PENDING",
    CLIENT_WINS = "CLIENT_WINS",
    FREELANCER_WINS = "FREELANCER_WINS",
}

export interface Evidence {
    ipfsHash: string;
    description: string;
    uploadedBy: string;
    uploadedAt: number;
}

export interface Dispute {
    id: string;
    contractDisputeId: bigint;
    jobId: string;
    contractJobId: bigint;
    raisedBy: string; // Wallet address
    reason: string;
    clientEvidence: Evidence[];
    freelancerEvidence: Evidence[];
    aiAnalysis?: AIAnalysis;
    jurors: string[]; // 3 wallet addresses
    votes: Vote[];
    status: DisputeStatus;
    outcome: DisputeOutcome;
    createdAt: number;
    resolvedAt?: number;
}

export interface AIAnalysis {
    recommendation: "CLIENT" | "FREELANCER" | "NEUTRAL";
    confidence: number; // 0-100
    summary: string;
    reasoning: string[];
    analyzedAt: number;
}

export interface Vote {
    juror: string;
    decision: "CLIENT" | "FREELANCER";
    votedAt: number;
}

export interface RaiseDisputeParams {
    jobId: string;
    reason: string;
    evidenceFiles: File[];
    evidenceDescriptions: string[];
}
