"use client";

import { formatUSDC, formatRelativeTime } from "@/lib/utils";
import { Clock, User, ArrowUpRight, Wallet } from "lucide-react";
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

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    OPEN: { bg: "bg-green-100", text: "text-green-700", label: "Open" },
    ACCEPTED: { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
    SUBMITTED: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending Review" },
    APPROVED: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
    DISPUTED: { bg: "bg-red-100", text: "text-red-700", label: "Disputed" },
    RESOLVED: { bg: "bg-gray-100", text: "text-gray-700", label: "Resolved" },
};

export default function JobCard({ job }: JobCardProps) {
    const status = statusConfig[job.status] || statusConfig.OPEN;

    return (
        <Link href={`/jobs/${job.id}`}>
            <div className="service-card group h-full flex flex-col">
                {/* Header with gradient */}
                <div className="relative h-32 bg-gradient-to-br from-[#1DBF73]/20 via-[#00b894]/10 to-transparent p-5">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 ${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {status.label}
                    </span>

                    {/* Price Badge */}
                    <div className="absolute bottom-5 right-5 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#1DBF73]" />
                        <span className="text-2xl font-bold text-gray-900">
                            ${formatUSDC(BigInt(job.amount))}
                        </span>
                        <span className="text-sm text-gray-500">USDC</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1DBF73] transition-colors mb-2 line-clamp-2">
                        {job.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                        {job.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
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

                        {/* Arrow */}
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#1DBF73] transition-colors">
                            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
