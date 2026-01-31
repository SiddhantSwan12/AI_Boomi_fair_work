"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { formatAddress, formatRelativeTime } from "@/lib/utils";
import { Loader2, Scale, AlertTriangle } from "lucide-react";
import Link from "next/link";

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
          freelancer
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                            <Scale className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Active Disputes
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        AI-analyzed disputes awaiting DAO jury resolution
                    </p>
                </div>

                {/* Disputes List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : disputes.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 mb-2">
                                No active disputes
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-500">
                                All jobs are proceeding smoothly!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((dispute) => (
                            <Link key={dispute.id} href={`/disputes/${dispute.id}`}>
                                <Card className="hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg mb-2">
                                                    {dispute.jobs?.title || "Untitled Job"}
                                                </CardTitle>
                                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                    <span>Client: {formatAddress(dispute.jobs?.client || "")}</span>
                                                    <span>•</span>
                                                    <span>Freelancer: {formatAddress(dispute.jobs?.freelancer || "")}</span>
                                                </div>
                                            </div>
                                            <Badge variant={
                                                dispute.status === "RESOLVED" ? "success" :
                                                    dispute.status === "VOTING" ? "warning" :
                                                        "danger"
                                            }>
                                                {dispute.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                    Raised by: {formatAddress(dispute.raised_by)}
                                                </p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                                                    {dispute.reason}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
