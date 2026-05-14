"use client";

import { ChevronDown, Hash, Plus } from "lucide-react";

interface ChatSidebarProps {
    jobTitle?: string;
    jobAmount?: string;
    clientAddress: string;
    freelancerAddress: string;
}

function shortAddress(value: string) {
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function ChatSidebar({ jobTitle, jobAmount, clientAddress, freelancerAddress }: ChatSidebarProps) {
    return (
        <aside className="border-r border-[#e5e5ea] bg-[#f9f9fb] flex flex-col h-full text-[#555] w-[260px] shrink-0">
            <div className="px-4 py-3.5 border-b border-[#e5e5ea] flex items-center justify-between hover:bg-[#f0f0f4] cursor-pointer transition-colors shadow-sm shrink-0">
                <h3 className="font-bold text-[#1a1a2e] truncate">FairWork Workspace</h3>
                <ChevronDown className="w-4 h-4 text-[#999]" />
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-6">
                {/* Job Details */}
                <div className="px-3">
                    <h4 className="px-1 text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">Job Details</h4>
                    <div className="px-2 py-1.5 rounded-md bg-white text-[#1a1a2e] border border-[#e5e5ea]">
                        <p className="text-[13px] font-medium truncate">{jobTitle || "Untitled Job"}</p>
                        {jobAmount && <p className="text-[11px] text-[#22c55e] mt-0.5">{jobAmount} USDC</p>}
                    </div>
                </div>

                {/* Channels */}
                <div className="px-3">
                    <div className="flex items-center justify-between px-1 mb-1 group cursor-pointer">
                        <h4 className="text-[11px] font-semibold text-[#999] group-hover:text-[#333] uppercase tracking-wider transition-colors">Channels</h4>
                        <Plus className="w-3.5 h-3.5 text-[#999] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#e8e8f0] text-[#1a1a2e] cursor-pointer">
                            <Hash className="w-4 h-4 opacity-60" />
                            <span className="text-[14px] font-medium truncate">general</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#f0f0f4] cursor-pointer transition-colors text-[#555]">
                            <Hash className="w-4 h-4 opacity-60" />
                            <span className="text-[14px] font-medium truncate">job-discussion</span>
                        </div>
                    </div>
                </div>

                {/* Direct Messages */}
                <div className="px-3">
                    <div className="flex items-center justify-between px-1 mb-1 group cursor-pointer">
                        <h4 className="text-[11px] font-semibold text-[#999] group-hover:text-[#333] uppercase tracking-wider transition-colors">Direct messages</h4>
                        <Plus className="w-3.5 h-3.5 text-[#999] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#f0f0f4] cursor-pointer transition-colors text-[#1a1a2e]">
                            <div className="relative flex items-center justify-center w-5 h-5 rounded bg-[#22c55e] text-[10px] font-bold text-white overflow-hidden shrink-0">
                                {clientAddress.slice(2, 4).toUpperCase()}
                                <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-[#f9f9fb] bg-[#22c55e]" />
                            </div>
                            <span className="text-[14px] truncate">Client ({shortAddress(clientAddress)})</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#f0f0f4] cursor-pointer transition-colors text-[#555]">
                            <div className="relative flex items-center justify-center w-5 h-5 rounded bg-[#6366f1] text-[10px] font-bold text-white overflow-hidden shrink-0">
                                {freelancerAddress.slice(2, 4).toUpperCase()}
                                <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-[#f9f9fb] bg-[#22c55e]" />
                            </div>
                            <span className="text-[14px] truncate">Freelancer ({shortAddress(freelancerAddress)})</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
