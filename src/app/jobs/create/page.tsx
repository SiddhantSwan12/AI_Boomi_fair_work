"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ESCROW_ABI, USDC_ABI } from "@/lib/contracts";
import { ESCROW_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/lib/wagmi";
import { uploadJSONToPinata } from "@/lib/pinata";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function CreateJobPage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        deadline: "",
    });

    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState<"form" | "approving" | "creating">("form");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected || !address) {
            alert("Please connect your wallet");
            return;
        }

        try {
            setIsUploading(true);

            // 1. Upload job description to IPFS
            const jobData = {
                title: formData.title,
                description: formData.description,
                createdBy: address,
                createdAt: Date.now(),
            };

            const ipfsHash = await uploadJSONToPinata(jobData, `job-${Date.now()}`);
            console.log("Job description uploaded to IPFS:", ipfsHash);

            setIsUploading(false);

            // 2. Approve USDC spending
            setStep("approving");
            const amountInWei = parseUnits(formData.amount, 6); // USDC has 6 decimals

            // First approve USDC
            writeContract({
                address: USDC_CONTRACT_ADDRESS,
                abi: USDC_ABI,
                functionName: "approve",
                args: [ESCROW_CONTRACT_ADDRESS, amountInWei],
            }, {
                onSuccess: () => {
                    // Wait a bit for approval to confirm, then create job
                    setTimeout(() => {
                        setStep("creating");
                        createJob(amountInWei, ipfsHash);
                    }, 3000);
                },
            });

        } catch (error) {
            console.error("Error creating job:", error);
            alert("Failed to create job. See console for details.");
            setIsUploading(false);
            setStep("form");
        }
    };

    const createJob = (amountInWei: bigint, ipfsHash: string) => {
        const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

        writeContract({
            address: ESCROW_CONTRACT_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "createJob",
            args: [amountInWei, BigInt(deadlineTimestamp), ipfsHash],
        }, {
            onSuccess: async (data) => {
                console.log("Job created on-chain:", data);

                // Store metadata in Supabase
                // Note: In production, you'd listen to the JobCreated event to get the actual jobId
                // For MVP, we'll use a placeholder approach
                await supabase.from("jobs").insert({
                    contract_job_id: 0, // Will be updated by event listener
                    title: formData.title,
                    description: formData.description,
                    description_ipfs: ipfsHash,
                    amount: Number(amountInWei),
                    deadline: Math.floor(new Date(formData.deadline).getTime() / 1000),
                    client: address,
                    status: "OPEN",
                });

                // Redirect to jobs page
                setTimeout(() => {
                    router.push("/jobs");
                }, 2000);
            },
        });
    };

    const isLoading = isUploading || isWriting || isConfirming;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Post a New Job
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Create an escrow contract and fund it with USDC. Funds are locked until work is approved or dispute is resolved.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                            <CardDescription>
                                Provide clear requirements to attract the right freelancer
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <Label htmlFor="title">Job Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Build a responsive landing page"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        disabled={isLoading}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Detailed requirements, deliverables, and expectations..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        disabled={isLoading}
                                        rows={6}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <Label htmlFor="amount">Amount (USDC) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        placeholder="500"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                        disabled={isLoading}
                                        className="mt-2"
                                    />
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Platform fee: 2.5% (${(parseFloat(formData.amount || "0") * 0.025).toFixed(2)})
                                    </p>
                                </div>

                                {/* Deadline */}
                                <div>
                                    <Label htmlFor="deadline">Deadline *</Label>
                                    <Input
                                        id="deadline"
                                        type="datetime-local"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        required
                                        disabled={isLoading}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isLoading || !isConnected}
                                        className="w-full"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {step === "form" && "Uploading to IPFS..."}
                                                {step === "approving" && "Approving USDC..."}
                                                {step === "creating" && "Creating Job..."}
                                            </>
                                        ) : (
                                            "Create Job & Fund Escrow"
                                        )}
                                    </Button>

                                    {!isConnected && (
                                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 text-center">
                                            Please connect your wallet to create a job
                                        </p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                                How Escrow Works
                            </h3>
                            <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
                                <li>✓ Your USDC is locked in a smart contract</li>
                                <li>✓ Freelancer can only access funds after you approve</li>
                                <li>✓ If disputed, AI + DAO jury decides the outcome</li>
                                <li>✓ No platform can access your funds</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
