"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import JobCard from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "open" | "active">("all");

    useEffect(() => {
        fetchJobs();
    }, [filter]);

    const fetchJobs = async () => {
        setIsLoading(true);

        let query = supabase
            .from("jobs")
            .select("*")
            .order("created_at", { ascending: false });

        if (filter === "open") {
            query = query.eq("status", "OPEN");
        } else if (filter === "active") {
            query = query.in("status", ["ACCEPTED", "SUBMITTED"]);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching jobs:", error);
        } else {
            setJobs(data || []);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Browse Jobs
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Find freelance opportunities with secure escrow payments
                        </p>
                    </div>

                    <Link href="/jobs/create">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Post Job
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-8">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => setFilter("all")}
                    >
                        All Jobs
                    </Button>
                    <Button
                        variant={filter === "open" ? "default" : "outline"}
                        onClick={() => setFilter("open")}
                    >
                        Open
                    </Button>
                    <Button
                        variant={filter === "active" ? "default" : "outline"}
                        onClick={() => setFilter("active")}
                    >
                        In Progress
                    </Button>
                </div>

                {/* Jobs Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            No jobs found. Be the first to post one!
                        </p>
                        <Link href="/jobs/create">
                            <Button>Create Job</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
