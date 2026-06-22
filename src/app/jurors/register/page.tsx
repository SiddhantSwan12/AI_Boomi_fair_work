"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useSignTypedData } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { hexToSignature, type Hex } from "viem";
import { hashDocument } from "@/lib/merkle";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import {
    Check, ChevronRight, ChevronLeft, Upload, X,
    FileText, ShieldCheck, Loader2, ExternalLink,
} from "lucide-react";

const EXPERTISE_TAGS = [
    "Solidity", "EVM", "Smart Contracts", "DeFi", "NFT", "Auditing", "Security",
    "React", "Next.js", "TypeScript", "Node.js", "Python", "Rust", "Frontend",
    "Backend", "Full-Stack", "UI/UX", "Technical Writing", "AI/ML",
    "IPFS", "Tokenomics", "DAO Governance", "Web3.js", "Ethers.js",
];

const EXPERIENCE_LEVELS = [
    { value: "entry",        label: "Entry Level",   desc: "Building expertise, keen eye for detail" },
    { value: "intermediate", label: "Intermediate",  desc: "1–3 years resolving technical disputes"  },
    { value: "expert",       label: "Expert",        desc: "3+ years, seasoned arbitrator"           },
];

const TOTAL_STEPS = 4;

const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white border border-[#E4E5E7] text-[#404145] text-sm " +
    "placeholder:text-[#95979D] outline-none transition-colors focus:border-[#1DBF73]";

const StepDot = ({ index, current }: { index: number; current: number }) => (
    <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
            index <= current
                ? "bg-[#1DBF73] border-[#1DBF73] text-white"
                : "bg-[#F7F7F7] border-[#E4E5E7] text-[#95979D]"
        }`}>
            {index < current ? <Check className="w-3.5 h-3.5" /> : index + 1}
        </div>
        {index < TOTAL_STEPS - 1 && (
            <div className={`h-0.5 w-10 rounded-full transition-all ${index < current ? "bg-[#1DBF73]" : "bg-[#E4E5E7]"}`} />
        )}
    </div>
);

interface PreparedAnchor {
    root_hex: Hex;
    deadline: string;
    typed_data: {
        domain: { name: string; version: string; chainId: number; verifyingContract: `0x${string}` };
        types: { Anchor: { name: string; type: string }[] };
        primaryType: "Anchor";
        message: { root: string; owner: string; nonce: string; deadline: string };
    };
}

export default function JurorRegisterPage() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const { signTypedDataAsync } = useSignTypedData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep]       = useState(0);
    const [checking, setChecking] = useState(true);
    const [dragging, setDragging] = useState(false);
    const [error, setError]     = useState("");

    // Step 1 — profile details
    const [form, setForm] = useState({
        display_name:     "",
        expertise:        [] as string[],
        bio:              "",
        experience_level: "",
    });

    // Step 2 — credential files
    const [files, setFiles]           = useState<File[]>([]);
    const [fileHashes, setFileHashes] = useState<Hex[]>([]);
    const [processing, setProcessing] = useState(false);
    const [prepared, setPrepared]     = useState<PreparedAnchor | null>(null);

    // Step 3 — sign & anchor
    const [anchoring, setAnchoring] = useState(false);
    const [anchorTx, setAnchorTx]   = useState<string | null>(null);

    // Redirect if already registered
    useEffect(() => {
        if (!isConnected || !address) { setChecking(false); return; }
        supabase
            .from("juror_profiles")
            .select("wallet")
            .eq("wallet", address.toLowerCase())
            .single()
            .then(({ data }) => {
                if (data) router.replace(`/profile/${address}`);
                else { setStep(1); setChecking(false); }
            });
    }, [isConnected, address, router]);

    useEffect(() => {
        if (isConnected && step === 0) setStep(1);
    }, [isConnected, step]);

    const toggleExpertise = (tag: string) => {
        setForm((f) => ({
            ...f,
            expertise: f.expertise.includes(tag)
                ? f.expertise.filter((t) => t !== tag)
                : f.expertise.length < 8 ? [...f.expertise, tag] : f.expertise,
        }));
    };

    // File handling
    const addFiles = useCallback((incoming: FileList | null) => {
        if (!incoming) return;
        const newFiles = Array.from(incoming).filter(
            (f) => !files.some((ex) => ex.name === f.name && ex.size === f.size)
        );
        setFiles((prev) => [...prev, ...newFiles]);
        setFileHashes([]);
        setPrepared(null);
    }, [files]);

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setFileHashes([]);
        setPrepared(null);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    // Step 2 → Step 3: hash files client-side, call prepare-anchor
    const processFiles = async () => {
        if (!address || files.length === 0) return;
        setProcessing(true);
        setError("");
        try {
            const hashes = await Promise.all(
                files.map(async (f) => {
                    const buf = await f.arrayBuffer();
                    return hashDocument(new Uint8Array(buf));
                })
            );
            setFileHashes(hashes);

            const res = await fetch("/api/juror/prepare-anchor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet: address, fileHashes: hashes, profileData: form }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "prepare-anchor failed");

            setPrepared(data as PreparedAnchor);
            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setProcessing(false);
        }
    };

    // Step 3: sign EIP-712 typed data, call anchor API
    const handleAnchor = async () => {
        if (!prepared || !address) return;
        setAnchoring(true);
        setError("");
        try {
            const sig = await signTypedDataAsync({
                domain: prepared.typed_data.domain,
                types:  prepared.typed_data.types,
                primaryType: "Anchor",
                message: {
                    root:     prepared.root_hex,
                    owner:    address,
                    nonce:    BigInt(prepared.typed_data.message.nonce),
                    deadline: BigInt(prepared.deadline),
                },
            });

            const { v, r, s } = hexToSignature(sig);

            const res = await fetch("/api/juror/anchor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wallet:      address,
                    root_hex:    prepared.root_hex,
                    deadline:    prepared.deadline,
                    leaf_hashes: fileHashes,
                    signature:   { v: Number(v), r, s },
                    profileData: form,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Anchor transaction failed");

            setAnchorTx(data.anchor_tx);
            setTimeout(() => router.push(`/profile/${address}`), 4000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Signing cancelled or failed");
        } finally {
            setAnchoring(false);
        }
    };

    const canAdvanceStep1 = form.display_name.trim().length >= 2 && form.expertise.length > 0;

    if (checking) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            <Navbar />

            {/* Glow background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-accent-indigo/8 blur-3xl" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent-violet/6 blur-3xl" />
            </div>

            <main className="relative z-10 flex flex-col items-center pt-20 pb-20 px-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#1DBF73]/30 bg-[#E9F9F0] px-4 py-1.5 text-xs text-[#1DBF73] font-semibold tracking-widest uppercase mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
                        Become a Juror
                    </div>
                    <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold text-text-primary tracking-tight">
                        {step === 0 ? "Connect your wallet" : step === 3 && anchorTx ? "You're verified!" : "Juror Registration"}
                    </h1>
                    <p className="text-text-muted mt-3 text-base max-w-md mx-auto">
                        {step === 0
                            ? "Your wallet is your identity. Connect to begin."
                            : step === 1
                            ? "Tell us about your expertise so you're matched to the right disputes."
                            : step === 2
                            ? "Upload credential documents. They are hashed in your browser — nothing leaves your device."
                            : anchorTx
                            ? "Your credentials are anchored on Polygon Amoy. Redirecting to your profile…"
                            : "Sign your Merkle root to anchor your credentials permanently on-chain."}
                    </p>
                </motion.div>

                {/* Step dots (shown for steps 1–3) */}
                {step > 0 && !anchorTx && (
                    <div className="flex items-center mb-10">
                        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                            <StepDot key={i} index={i} current={step - 1} />
                        ))}
                    </div>
                )}

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
                    className="w-full max-w-[640px] bg-white border border-[#E4E5E7] rounded-2xl px-11 py-10 shadow-card"
                >
                    <AnimatePresence mode="wait">

                        {/* ── STEP 0: Connect Wallet ── */}
                        {step === 0 && (
                            <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                                <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 border border-accent-indigo/30 flex items-center justify-center mx-auto mb-7">
                                    <ShieldCheck className="w-8 h-8 text-accent-indigo" />
                                </div>
                                <p className="text-text-muted mb-8 leading-relaxed">
                                    Juror status is tied to your wallet. Once verified, your credentials are anchored on-chain — permanent and auditable by anyone.
                                </p>
                                <div className="flex justify-center">
                                    <ConnectButton label="Connect Wallet to Continue" showBalance={false} accountStatus="address" chainStatus="none" />
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 1: Profile Details ── */}
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                                <h2 className="font-heading text-[1.4rem] font-bold text-text-primary mb-1">Your details</h2>
                                <p className="text-text-muted text-sm mb-7">This is your public juror profile on FairWork.</p>

                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Display Name *</label>
                                        <input
                                            className={inputClass}
                                            placeholder="e.g. Alex Chen"
                                            value={form.display_name}
                                            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                                            Expertise * <span className="text-text-subtle font-normal normal-case">({form.expertise.length}/8 selected)</span>
                                        </label>
                                        {form.expertise.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {form.expertise.map((t) => (
                                                    <span key={t} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20">
                                                        {t}
                                                        <button onClick={() => toggleExpertise(t)}><X className="w-3 h-3" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {EXPERTISE_TAGS.filter((t) => !form.expertise.includes(t)).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => toggleExpertise(t)}
                                                    className="px-3 py-1 rounded-full text-xs font-medium bg-[#F7F7F7] text-[#62646A] border border-[#E4E5E7] hover:border-accent-indigo/40 hover:text-accent-indigo transition-colors"
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Bio</label>
                                        <textarea
                                            rows={3}
                                            className={inputClass + " resize-none"}
                                            placeholder="Brief summary of your background and dispute resolution experience…"
                                            value={form.bio}
                                            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Experience Level</label>
                                        <div className="flex flex-col gap-2">
                                            {EXPERIENCE_LEVELS.map((lvl) => (
                                                <button
                                                    key={lvl.value}
                                                    onClick={() => setForm((f) => ({ ...f, experience_level: lvl.value }))}
                                                    className={`flex items-center gap-3 p-4 rounded-xl text-left border-[1.5px] transition-all ${
                                                        form.experience_level === lvl.value
                                                            ? "border-accent-indigo bg-accent-indigo/5"
                                                            : "border-[#E4E5E7] hover:border-accent-indigo/40"
                                                    }`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                        form.experience_level === lvl.value ? "border-accent-indigo" : "border-[#C5C6C9]"
                                                    }`}>
                                                        {form.experience_level === lvl.value && <div className="w-2 h-2 rounded-full bg-accent-indigo" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-text-primary">{lvl.label}</div>
                                                        <div className="text-xs text-text-muted">{lvl.desc}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!canAdvanceStep1}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1DBF73] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#19a463] transition-colors"
                                    >
                                        Continue <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Upload Credentials ── */}
                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                                <h2 className="font-heading text-[1.4rem] font-bold text-text-primary mb-1">Upload credentials</h2>
                                <p className="text-text-muted text-sm mb-6">
                                    Certifications, portfolio, or any proof of expertise. Files are hashed <strong>in your browser</strong> — the documents themselves are never sent to any server.
                                </p>

                                {/* Drop zone */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={onDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                                        dragging ? "border-accent-indigo bg-accent-indigo/5" : "border-[#E4E5E7] hover:border-accent-indigo/50 hover:bg-[#FAFAFA]"
                                    }`}
                                >
                                    <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
                                    <p className="text-sm font-medium text-text-primary">Drag & drop files here</p>
                                    <p className="text-xs text-text-muted mt-1">or click to browse — PDF, images, text files</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => addFiles(e.target.files)}
                                    />
                                </div>

                                {/* File list */}
                                {files.length > 0 && (
                                    <div className="mt-4 flex flex-col gap-2">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F7F7F7] border border-[#E4E5E7]">
                                                <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-text-primary truncate">{f.name}</p>
                                                    {fileHashes[i] && (
                                                        <p className="text-[10px] text-text-muted font-mono truncate mt-0.5">
                                                            {fileHashes[i].slice(0, 18)}…
                                                        </p>
                                                    )}
                                                </div>
                                                {fileHashes[i]
                                                    ? <Check className="w-4 h-4 text-[#1DBF73] flex-shrink-0" />
                                                    : <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}><X className="w-4 h-4 text-text-muted hover:text-red-500" /></button>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                                <div className="flex justify-between mt-8">
                                    <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E5E7] text-sm text-text-muted hover:border-[#C5C6C9] transition-colors">
                                        <ChevronLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button
                                        onClick={processFiles}
                                        disabled={files.length === 0 || processing}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1DBF73] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#19a463] transition-colors"
                                    >
                                        {processing ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                                        ) : (
                                            <>Process Documents <ChevronRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3: Sign & Anchor ── */}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>

                                {/* Success state */}
                                {anchorTx ? (
                                    <div className="text-center">
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                            className="w-[72px] h-[72px] rounded-full bg-[#E9F9F0] border border-[#1DBF73]/30 flex items-center justify-center mx-auto mb-6"
                                        >
                                            <ShieldCheck className="w-9 h-9 text-[#1DBF73]" />
                                        </motion.div>
                                        <h3 className="font-heading text-xl font-bold text-text-primary mb-2">Credentials Anchored</h3>
                                        <p className="text-text-muted text-sm mb-6">Your Merkle root is permanently recorded on Polygon Amoy.</p>
                                        <a
                                            href={`https://amoy.polygonscan.com/tx/${anchorTx}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-accent-indigo hover:underline mb-6"
                                        >
                                            View transaction <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <div className="flex justify-center mt-2">
                                            <div className="w-5 h-5 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
                                        </div>
                                        <p className="text-xs text-text-muted mt-3">Redirecting to your profile…</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="font-heading text-[1.4rem] font-bold text-text-primary mb-1">Sign & publish</h2>
                                        <p className="text-text-muted text-sm mb-7">
                                            Sign your Merkle root with your wallet. This anchors your credentials to your address — permanently and publicly on Polygon Amoy.
                                        </p>

                                        {/* Root hash display */}
                                        <div className="rounded-xl bg-[#F7F7F7] border border-[#E4E5E7] px-5 py-4 mb-4">
                                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Merkle Root</p>
                                            <p className="font-mono text-xs text-text-primary break-all">{prepared?.root_hex}</p>
                                        </div>

                                        {/* File summary */}
                                        <div className="rounded-xl bg-[#F7F7F7] border border-[#E4E5E7] px-5 py-4 mb-6">
                                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Documents ({files.length})</p>
                                            {files.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 py-1">
                                                    <Check className="w-3 h-3 text-[#1DBF73] flex-shrink-0" />
                                                    <span className="text-xs text-text-primary truncate">{f.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

                                        <div className="flex justify-between">
                                            <button onClick={() => setStep(2)} disabled={anchoring} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E5E7] text-sm text-text-muted hover:border-[#C5C6C9] transition-colors disabled:opacity-40">
                                                <ChevronLeft className="w-4 h-4" /> Back
                                            </button>
                                            <button
                                                onClick={handleAnchor}
                                                disabled={anchoring}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-indigo text-white text-sm font-semibold disabled:opacity-60 hover:bg-accent-indigo/90 transition-colors"
                                            >
                                                {anchoring ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Anchoring on-chain…</>
                                                ) : (
                                                    <><ShieldCheck className="w-4 h-4" /> Sign & Publish to Polygon Amoy</>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>

                {/* Privacy note */}
                {step === 2 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-xs text-text-muted text-center max-w-sm">
                        Your documents are hashed locally using keccak256. Only the hash is sent to our API — the actual files never leave your device.
                    </motion.p>
                )}
            </main>
        </div>
    );
}
