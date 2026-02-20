import React from "react";

/**
 * Component to display submission status with real-time updates
 * 
 * @param {Object} props
 * @param {Object} props.status - Status object from useSubmission hook
 * @param {string} props.className - Additional CSS classes
 */
export const SubmissionStatus = ({ status, className = "" }) => {
    if (!status) {
        return null;
    }

    const { 
        status: submissionStatus, 
        isComplete, 
        isProcessing,
        passedTests,
        totalTests,
        executionTimeMs 
    } = status;

    // Status configurations
    const statusConfig = {
        QUEUED: {
            label: "Queued",
            color: "bg-yellow-500",
            textColor: "text-yellow-500",
            icon: "⏳",
            message: "Your submission is in the queue..."
        },
        RUNNING: {
            label: "Running",
            color: "bg-blue-500",
            textColor: "text-blue-500",
            icon: "🔄",
            message: "Running test cases..."
        },
        PASSED: {
            label: "Passed",
            color: "bg-green-500",
            textColor: "text-green-500",
            icon: "✅",
            message: "All test cases passed!"
        },
        FAILED: {
            label: "Failed",
            color: "bg-red-500",
            textColor: "text-red-500",
            icon: "❌",
            message: "Some test cases failed"
        },
        ERROR: {
            label: "Error",
            color: "bg-red-600",
            textColor: "text-red-600",
            icon: "⚠️",
            message: "Compilation or runtime error"
        },
        TIMEOUT: {
            label: "Timeout",
            color: "bg-orange-500",
            textColor: "text-orange-500",
            icon: "⏱️",
            message: "Execution timed out"
        }
    };

    const config = statusConfig[submissionStatus] || statusConfig.QUEUED;

    return (
        <div className={`rounded-lg border border-gray-700 bg-gray-900 p-4 ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <h3 className={`font-bold text-lg ${config.textColor}`}>
                            {config.label}
                        </h3>
                        <p className="text-sm text-gray-400">{config.message}</p>
                    </div>
                </div>

                {/* Loading spinner for processing states */}
                {isProcessing && (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                )}
            </div>

            {/* Progress bar */}
            {isProcessing && (
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                        className={`h-full ${config.color} animate-pulse`}
                        style={{ width: submissionStatus === "RUNNING" ? "60%" : "30%" }}
                    ></div>
                </div>
            )}

            {/* Results for completed submissions */}
            {isComplete && totalTests !== undefined && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded p-3">
                        <p className="text-xs text-gray-400 mb-1">Test Cases</p>
                        <p className="text-lg font-bold">
                            <span className={config.textColor}>{passedTests}</span>
                            <span className="text-gray-500"> / {totalTests}</span>
                        </p>
                    </div>
                    
                    {executionTimeMs !== undefined && (
                        <div className="bg-gray-800 rounded p-3">
                            <p className="text-xs text-gray-400 mb-1">Execution Time</p>
                            <p className="text-lg font-bold text-gray-200">
                                {executionTimeMs}ms
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Progress indicator */}
            {isComplete && totalTests !== undefined && (
                <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                            className={`h-full ${config.color} transition-all duration-500`}
                            style={{ width: `${(passedTests / totalTests) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};
