"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatUSDC, formatRelativeTime } from "@/lib/utils";
import { JobStatus } from "@/types/job";
import { DollarSign, Clock, User } from "lucide-react";
import Link from "next/link";

interface JobCardProps {
    job: {
        id: string;
        contract_job_id: number;
        title: string;
        description: string;
        amount: number;
        deadline: number;
        client: string;
        freelancer?: string;
        status: string;
        created_at: string;
    };
}

const statusVariants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    OPEN: "success",
    ACCEPTED: "info",
    SUBMITTED: "warning",
    APPROVED: "success",
    DISPUTED: "danger",
    RESOLVED: "default",
};

export default function JobCard({ job }: JobCardProps) {
    return (
        <Link href={`/jobs/${job.id}`}>
            <Card className="group p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {job.title}
                    </h3>
                    <Badge variant={statusVariants[job.status] || "default"}>
                        {job.status}
                    </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {job.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                            ${formatUSDC(BigInt(job.amount))} USDC
                        </span>
                    </span>

                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatRelativeTime(job.deadline)}
                    </span>

                    {job.freelancer && (
                        <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            Assigned
                        </span>
                    )}
                </div>
            </Card>
        </Link>
    );
}
