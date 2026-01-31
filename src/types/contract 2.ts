// Contract event types matching Solidity events

export interface JobCreatedEvent {
    jobId: bigint;
    client: string;
    amount: bigint;
    deadline: bigint;
}

export interface JobAcceptedEvent {
    jobId: bigint;
    freelancer: string;
}

export interface DeliverableSubmittedEvent {
    jobId: bigint;
    deliverableHash: string;
}

export interface JobApprovedEvent {
    jobId: bigint;
}

export interface DisputeRaisedEvent {
    disputeId: bigint;
    jobId: bigint;
    raisedBy: string;
}

export interface JurorsSelectedEvent {
    disputeId: bigint;
    jurors: string[];
}

export interface VoteCastEvent {
    disputeId: bigint;
    juror: string;
    votedForClient: boolean;
}

export interface DisputeResolvedEvent {
    disputeId: bigint;
    winner: string;
}
