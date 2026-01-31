"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ESCROW_ABI } from "@/lib/contracts";
import { ESCROW_CONTRACT_ADDRESS } from "@/lib/wagmi";
import { supabase } from "@/lib/supabase";
import { formatUSDC, formatAddress, getIPFSUrl } from "@/lib/utils";
import { Loader2, ExternalLink, Upload, CheckCircle2, AlertTriangle } from "lucide-react";

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { writeContract, isPending } = useWriteContract();

    const [job, setJob] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
    const [disputeReason, setDisputeReason] = useState("");
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [showDisputeForm, setShowDisputeForm] = useState(false);

    useEffect(() => {
        fetchJob();
    }, [params.id]);

    const fetchJob = async () => {
        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", params.id)
            .single();

        if (error) {
            console.error("Error fetching job:", error);
        } else {
            setJob(data);
        }
        setIsLoading(false);
    };

    const handleAcceptJob = () => {
        if (!job) return;

        writeContract({
            address: ESCROW_CONTRACT_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "acceptJob",
            args: [BigInt(job.contract_job_id)],
        }, {
            onSuccess: async () => {
                await supabase
                    .from("jobs")
                    .update({ freelancer: address, status: "ACCEPTED" })
                    .eq("id", job.id);
                fetchJob();
            },
        });
    };

    const handleSubmitDeliverable = async () => {
        if (!deliverableFile || !job) return;

        try {
            // Upload to IPFS
            const formData = new FormData();
            formData.append("file", deliverableFile);

            const response = await fetch("/api/ipfs/upload", {
                method: "POST",
                body: formData,
            });

            const { ipfsHash } = await response.json();

            // Submit to contract
            writeContract({
                address: ESCROW_CONTRACT_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "submitDeliverable",
                args: [BigInt(job.contract_job_id), ipfsHash],
            }, {
                onSuccess: async () => {
                    await supabase
                        .from("jobs")
                        .update({ deliverable_ipfs: ipfsHash, status: "SUBMITTED" })
                        .eq("id", job.id);
                    fetchJob();
                },
            });
        } catch (error) {
            console.error("Error submitting deliverable:", error);
            alert("Failed to submit deliverable");
        }
    };

    const handleApproveJob = () => {
        if (!job) return;

        writeContract({
            address: ESCROW_CONTRACT_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "approveJob",
            args: [BigInt(job.contract_job_id)],
        }, {
            onSuccess: async () => {
                await supabase
                    .from("jobs")
                    .update({ status: "APPROVED" })
                    .eq("id", job.id);
                fetchJob();
            },
        });
    };

    const handleRaiseDispute = async () => {
        if (!evidenceFile || !disputeReason || !job) return;

        try {
            // Upload evidence to IPFS
            const formData = new FormData();
            formData.append("file", evidenceFile);

            const response = await fetch("/api/ipfs/upload", {
                method: "POST",
                body: formData,
            });

            const { ipfsHash } = await response.json();

            // Raise dispute on contract
            writeContract({
                address: ESCROW_CONTRACT_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "raiseDispute",
                args: [BigInt(job.contract_job_id), ipfsHash],
            }, {
                onSuccess: async (data) => {
                    // Create dispute in Supabase
                    await supabase.from("disputes").insert({
                        contract_dispute_id: 0, // Will be updated by event listener
                        job_id: job.id,
                        contract_job_id: job.contract_job_id,
                        raised_by: address,
                        reason: disputeReason,
                        status: "RAISED",
                    });

                    await supabase
                        .from("jobs")
                        .update({ status: "DISPUTED" })
                        .eq("id", job.id);

                    router.push("/disputes");
                },
            });
        } catch (error) {
            console.error("Error raising dispute:", error);
            alert("Failed to raise dispute");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Navbar />
                <div className="container mx-auto px-6 py-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">Job not found</p>
                </div>
            </div>
        );
    }

    const isClient = address?.toLowerCase() === job.client.toLowerCase();
    const isFreelancer = address?.toLowerCase() === job.freelancer?.toLowerCase();
    const canAccept = job.status === "OPEN" && !isClient && isConnected;
    const canSubmit = job.status === "ACCEPTED" && isFreelancer;
    const canApprove = job.status === "SUBMITTED" && isClient;
    const canDispute = job.status === "SUBMITTED" && (isClient || isFreelancer);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Job Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <span>Client: {formatAddress(job.client)}</span>
                                        {job.freelancer && (
                                            <span>• Freelancer: {formatAddress(job.freelancer)}</span>
                                        )}
                                    </div>
                                </div>
                                <Badge variant={
                                    job.status === "OPEN" ? "success" :
                                        job.status === "APPROVED" ? "success" :
                                            job.status === "DISPUTED" ? "danger" :
                                                "warning"
                                }>
                                    {job.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
                                <p className="text-slate-700 dark:text-slate-300">{job.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Amount</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                                        ${formatUSDC(BigInt(job.amount))} USDC
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Deadline</div>
                                    <div className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {new Date(job.deadline * 1000).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {job.description_ipfs && (
                                <a
                                    href={getIPFSUrl(job.description_ipfs)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    View on IPFS <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </CardContent>
                    </Card>

                    {/* Deliverable Section */}
                    {job.deliverable_ipfs && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Deliverable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={getIPFSUrl(job.deliverable_ipfs)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    View Deliverable on IPFS <ExternalLink className="w-4 h-4" />
                                </a>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Accept Job */}
                            {canAccept && (
                                <Button onClick={handleAcceptJob} disabled={isPending} className="w-full">
                                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Accept Job
                                </Button>
                            )}

                            {/* Submit Deliverable */}
                            {canSubmit && (
                                <div className="space-y-3">
                                    <Label>Upload Deliverable</Label>
                                    <Input
                                        type="file"
                                        onChange={(e) => setDeliverableFile(e.target.files?.[0] || null)}
                                    />
                                    <Button
                                        onClick={handleSubmitDeliverable}
                                        disabled={!deliverableFile || isPending}
                                        className="w-full gap-2"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        Submit Deliverable
                                    </Button>
                                </div>
                            )}

                            {/* Approve or Dispute */}
                            {canApprove && (
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleApproveJob}
                                        disabled={isPending}
                                        className="w-full gap-2"
                                        variant="default"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Approve & Release Funds
                                    </Button>

                                    <Button
                                        onClick={() => setShowDisputeForm(!showDisputeForm)}
                                        variant="destructive"
                                        className="w-full gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Raise Dispute
                                    </Button>
                                </div>
                            )}

                            {/* Dispute Form */}
                            {showDisputeForm && canDispute && (
                                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div>
                                        <Label>Dispute Reason</Label>
                                        <Textarea
                                            value={disputeReason}
                                            onChange={(e) => setDisputeReason(e.target.value)}
                                            placeholder="Explain why you're raising a dispute..."
                                            rows={4}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label>Evidence (PDF, images, etc.)</Label>
                                        <Input
                                            type="file"
                                            onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                                            className="mt-2"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleRaiseDispute}
                                        disabled={!disputeReason || !evidenceFile || isPending}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Submit Dispute
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
