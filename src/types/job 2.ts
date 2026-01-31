export enum JobStatus {
    OPEN = "OPEN",
    ACCEPTED = "ACCEPTED",
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    DISPUTED = "DISPUTED",
    RESOLVED = "RESOLVED",
}

export interface Job {
    id: string;
    contractJobId: bigint;
    title: string;
    description: string;
    descriptionIPFS: string;
    amount: bigint; // USDC amount in wei (6 decimals)
    deadline: number; // Unix timestamp
    client: string; // Wallet address
    freelancer?: string; // Wallet address
    status: JobStatus;
    createdAt: number;
    updatedAt: number;
}

export interface CreateJobParams {
    title: string;
    description: string;
    amount: string; // USDC amount as string
    deadline: Date;
}
