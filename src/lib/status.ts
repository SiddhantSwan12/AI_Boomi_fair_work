export const JOB_STATUS = {
    OPEN: "OPEN",
    WAITING_CLIENT_APPROVAL: "WAITING_CLIENT_APPROVAL",
    ACCEPTED: "ACCEPTED",
    SUBMITTED: "SUBMITTED",
    APPROVED: "APPROVED",
    DISPUTED: "DISPUTED",
    RESOLVED: "RESOLVED",
    CANCELLED: "CANCELLED",
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const DISPUTE_STATUS = {
    OPEN: "OPEN",
    AI_ANALYZED: "AI_ANALYZED",
    VOTING: "VOTING",
    RESOLVED: "RESOLVED",
} as const;

export type DisputeStatus = (typeof DISPUTE_STATUS)[keyof typeof DISPUTE_STATUS];

const JOB_STATUS_META: Record<JobStatus, { label: string }> = {
    OPEN: { label: "Open" },
    WAITING_CLIENT_APPROVAL: { label: "Acceptance Pending" },
    ACCEPTED: { label: "In Progress" },
    SUBMITTED: { label: "Under Review" },
    APPROVED: { label: "Completed" },
    DISPUTED: { label: "Disputed" },
    RESOLVED: { label: "Resolved" },
    CANCELLED: { label: "Cancelled" },
};

const DISPUTE_STATUS_META: Record<DisputeStatus, { label: string }> = {
    OPEN: { label: "Pending Analysis" },
    AI_ANALYZED: { label: "AI Analyzed" },
    VOTING: { label: "DAO Voting" },
    RESOLVED: { label: "Resolved" },
};

const NON_BROWSEABLE_JOB_STATUSES = new Set<JobStatus>([
    JOB_STATUS.CANCELLED,
    JOB_STATUS.DISPUTED,
    JOB_STATUS.RESOLVED,
]);

const CHAT_ENABLED_JOB_STATUSES = new Set<JobStatus>([
    JOB_STATUS.ACCEPTED,
    JOB_STATUS.SUBMITTED,
    JOB_STATUS.DISPUTED,
    JOB_STATUS.APPROVED,
    JOB_STATUS.RESOLVED,
]);

export function normalizeJobStatus(status: string | null | undefined): JobStatus {
    if (!status) return JOB_STATUS.OPEN;
    if (status in JOB_STATUS) return status as JobStatus;
    return JOB_STATUS.OPEN;
}

export function normalizeDisputeStatus(status: string | null | undefined): DisputeStatus {
    switch (status) {
        case "RAISED":
        case "DISPUTED":
            return DISPUTE_STATUS.OPEN;
        case DISPUTE_STATUS.OPEN:
        case DISPUTE_STATUS.AI_ANALYZED:
        case DISPUTE_STATUS.VOTING:
        case DISPUTE_STATUS.RESOLVED:
            return status;
        default:
            return DISPUTE_STATUS.OPEN;
    }
}

export function getJobStatusLabel(status: string | null | undefined): string {
    return JOB_STATUS_META[normalizeJobStatus(status)].label;
}

export function getDisputeStatusLabel(status: string | null | undefined): string {
    return DISPUTE_STATUS_META[normalizeDisputeStatus(status)].label;
}

export function isJobBrowseable(status: string | null | undefined): boolean {
    return !NON_BROWSEABLE_JOB_STATUSES.has(normalizeJobStatus(status));
}

export function canChatForJobStatus(status: string | null | undefined): boolean {
    return CHAT_ENABLED_JOB_STATUSES.has(normalizeJobStatus(status));
}
