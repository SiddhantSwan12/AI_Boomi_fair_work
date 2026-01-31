"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, TrendingUp } from "lucide-react";
import { AIAnalysis } from "@/types/dispute";

interface AIAnalysisReportProps {
    analysis: AIAnalysis;
}

export default function AIAnalysisReport({ analysis }: AIAnalysisReportProps) {
    const getRecommendationColor = () => {
        if (analysis.recommendation === "CLIENT") return "text-blue-600 dark:text-blue-400";
        if (analysis.recommendation === "FREELANCER") return "text-purple-600 dark:text-purple-400";
        return "text-slate-600 dark:text-slate-400";
    };

    const getConfidenceColor = () => {
        if (analysis.confidence >= 75) return "text-green-600";
        if (analysis.confidence >= 50) return "text-amber-600";
        return "text-red-600";
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        AI Analysis Report
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Powered by Nugen Legal AI
                    </p>
                </div>
            </div>

            {/* Recommendation */}
            <div className="mb-6">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Recommendation
                </div>
                <div className={`text-2xl font-bold ${getRecommendationColor()}`}>
                    {analysis.recommendation === "CLIENT" && "Favor Client"}
                    {analysis.recommendation === "FREELANCER" && "Favor Freelancer"}
                    {analysis.recommendation === "NEUTRAL" && "Neutral / Unclear"}
                </div>
            </div>

            {/* Confidence Score */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Confidence Score</span>
                    <span className={`font-bold ${getConfidenceColor()}`}>
                        {analysis.confidence}%
                    </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all ${analysis.confidence >= 75 ? "bg-green-600" :
                                analysis.confidence >= 50 ? "bg-amber-600" :
                                    "bg-red-600"
                            }`}
                        style={{ width: `${analysis.confidence}%` }}
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Summary
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {analysis.summary}
                </p>
            </div>

            {/* Reasoning */}
            <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Key Reasoning Points
                </h4>
                <ul className="space-y-2">
                    {analysis.reasoning.map((point, index) => (
                        <li key={index} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 pt-4 border-t border-indigo-200 dark:border-indigo-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    ⚠️ This is an AI-generated analysis to assist human jurors. The final decision rests with the DAO jury.
                </p>
            </div>
        </div>
    );
}
