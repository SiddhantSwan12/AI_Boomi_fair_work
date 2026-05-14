"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error) {
        console.error("ErrorBoundary caught:", error);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-700">Failed to load this section</p>
                        <p className="text-xs text-red-500 mt-1">{this.state.error?.message ?? "An unexpected error occurred."}</p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
