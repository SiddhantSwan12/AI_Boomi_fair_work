"use client";

import { Check } from "lucide-react";

interface DisputeTimelineProps {
    events: {
        title: string;
        description: string;
        timestamp: string;
        status: "completed" | "active" | "pending";
    }[];
}

export default function DisputeTimeline({ events }: DisputeTimelineProps) {
    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

            {/* Timeline items */}
            <div className="space-y-8">
                {events.map((event, index) => (
                    <div key={index} className="relative flex gap-4">
                        {/* Icon */}
                        <div
                            className={`relative z-10 w-8 h-8 rounded-full border-4 flex items-center justify-center ${event.status === "completed"
                                    ? "bg-indigo-600 border-white dark:border-slate-900"
                                    : event.status === "active"
                                        ? "bg-amber-500 border-white dark:border-slate-900 animate-pulse"
                                        : "bg-slate-300 dark:bg-slate-700 border-white dark:border-slate-900"
                                }`}
                        >
                            {event.status === "completed" && (
                                <Check className="w-4 h-4 text-white" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            <p className="font-semibold text-slate-900 dark:text-white">
                                {event.title}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {event.description}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                {event.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
