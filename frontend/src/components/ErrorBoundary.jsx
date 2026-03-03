import React from "react";
import { Link } from "react-router-dom";

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6 text-white">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <span className="text-red-500 text-3xl">⚠️</span>
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.4em] text-red-500 uppercase mb-4">System Fault</div>
                    <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Critical Node Failure</h1>
                    <p className="text-slate-400 max-w-md mb-8 text-sm">
                        The interface encountered an unexpected runtime anomaly. Diagnostics have been logged.
                    </p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="px-8 py-4 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
                        style={{ borderRadius: "2px" }}
                    >
                        Reboot Terminal
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-left w-full max-w-2xl overflow-auto" style={{ borderRadius: "2px" }}>
                            {this.state.error.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
