"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase";
import { formatAddress } from "@/lib/utils";
import { Loader2, Scale, AlertCircle, ArrowUpRight, Brain, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    OPEN: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending Analysis", icon: Clock },
    AI_ANALYZED: { bg: "bg-blue-100", text: "text-blue-700", label: "AI Analyzed", icon: Brain },
    VOTING: { bg: "bg-purple-100", text: "text-purple-700", label: "DAO Voting", icon: Users },
    RESOLVED: { bg: "bg-green-100", text: "text-green-700", label: "Resolved", icon: CheckCircle },
};

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        setIsLoading(true);

        const { data, error } = await supabase
            .from("disputes")
            .select(`
                *,
                jobs (
                    title,
                    client,
                    freelancer,
                    amount
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching disputes:", error);
        } else {
            setDisputes(data || []);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom py-12">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1DBF73] to-[#00b894] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                            <Scale className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            Dispute Center
                        </h1>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-gray-600 text-lg">
                            Fair resolution powered by AI analysis and community governance
                        </p>
                        <Link href="/test-ai">
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap">
                                <Brain className="w-5 h-5" />
                                Try AI Demo
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* How Disputes Work */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">How Dispute Resolution Works</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Brain className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm mb-1">1. AI Analysis</div>
                                <p className="text-gray-600 text-sm">OpenAI analyzes the job and provides an unbiased recommendation</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm mb-1">2. DAO Voting</div>
                                <p className="text-gray-600 text-sm">3 community jurors vote on the final decision</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm mb-1">3. Resolution</div>
                                <p className="text-gray-600 text-sm">Funds are released based on the jury's decision</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disputes List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1DBF73] rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading disputes...</p>
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No Active Disputes
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Great news! All jobs are proceeding smoothly without any conflicts.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((dispute, index) => {
                            const status = statusConfig[dispute.status] || statusConfig.OPEN;
                            const StatusIcon = status.icon;

                            return (
                                <Link
                                    key={dispute.id}
                                    href={`/disputes/${dispute.id}`}
                                    className="block"
                                >
                                    <div
                                        className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[#1DBF73]/30 transition-all duration-300 group animate-fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1DBF73] transition-colors">
                                                        {dispute.jobs?.title || "Untitled Job"}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1.5 ${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
                                                    <span>Client: <span className="text-gray-700 font-medium">{formatAddress(dispute.jobs?.client || "")}</span></span>
                                                    <span>Freelancer: <span className="text-gray-700 font-medium">{formatAddress(dispute.jobs?.freelancer || "")}</span></span>
                                                </div>

                                                <p className="text-gray-600 text-sm line-clamp-2">
                                                    <span className="text-gray-400">Reason:</span> {dispute.reason}
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#1DBF73] transition-colors flex-shrink-0">
                                                <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
