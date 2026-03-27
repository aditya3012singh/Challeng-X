import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitCode, getSubmissionStatus } from "../../store/api/submission.thunk";
import { updateSubmissionStatus, clearCurrentSubmission } from "../../store/slices/submission.slice";
import { getSocket } from "../../lib/socket";

/**
 * Custom hook for handling async code submissions with polling and real-time updates
 * 
 * @returns {Object} - Submission state and handler functions
 */
export const useSubmission = () => {
    const dispatch = useDispatch();
    const { currentSubmission, submissionStatus, loading, error } = useSelector(
        (state) => state.submission
    );
    
    const pollingIntervalRef = useRef(null);
    const socketRef = useRef(null);

    /**
     * Submit code and start tracking
     */
    const handleSubmit = useCallback(async ({ code, language, problemId, battleId, contestId }) => {
        try {
            // Submit code
            const result = await dispatch(submitCode({ 
                code, 
                language, 
                problemId, 
                battleId,
                contestId
            })).unwrap();
            
            // Start polling for status
            startPolling(result.submissionId);
            
            return result;
        } catch (err) {
            console.error("Submission error:", err);
            throw err;
        }
    }, [dispatch]);

    /**
     * Start polling for submission status
     */
    const startPolling = useCallback((submissionId) => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Poll every 2 seconds
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const result = await dispatch(getSubmissionStatus({ submissionId })).unwrap();
                
                // Stop polling if submission is complete
                if (["PASSED", "FAILED", "ERROR"].includes(result.status)) {
                    stopPolling();
                }
            } catch (err) {
                console.error("Polling error:", err);
                stopPolling();
            }
        }, 2000);
    }, [dispatch]);

    /**
     * Stop polling
     */
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    /**
     * Listen to socket events for real-time updates
     */
    useEffect(() => {
        socketRef.current = getSocket();

        const handleSubmissionResult = (data) => {
            console.log("📡 Received submission result:", data);
            
            // Update Redux state
            dispatch(updateSubmissionStatus({
                submissionId: data.submissionId,
                status: data.status,
                passedTests: data.passedTests,
                totalTests: data.totalTests,
                executionTimeMs: data.executionTimeMs
            }));

            // Stop polling since we got the final result
            stopPolling();
        };

        // Listen for submission results
        socketRef.current.on("submissionResult", handleSubmissionResult);

        // Cleanup
        return () => {
            if (socketRef.current) {
                socketRef.current.off("submissionResult", handleSubmissionResult);
            }
            stopPolling();
        };
    }, [dispatch, stopPolling]);

    /**
     * Reset submission state
     */
    const resetSubmission = useCallback(() => {
        stopPolling();
        dispatch(clearCurrentSubmission());
    }, [dispatch, stopPolling]);

    /**
     * Get current submission status
     */
    const getStatus = useCallback(() => {
        if (!submissionStatus && !currentSubmission) {
            return null;
        }

        const status = submissionStatus?.status || currentSubmission?.status;
        const isComplete = ["PASSED", "FAILED", "ERROR"].includes(status);
        const isProcessing = ["QUEUED", "RUNNING"].includes(status);

        return {
            status,
            isComplete,
            isProcessing,
            passedTests: submissionStatus?.passedTests,
            totalTests: submissionStatus?.totalTests,
            executionTimeMs: submissionStatus?.executionTimeMs,
        };
    }, [submissionStatus, currentSubmission]);

    return {
        // State
        currentSubmission,
        submissionStatus,
        loading,
        error,
        status: getStatus(),
        
        // Actions
        submit: handleSubmit,
        reset: resetSubmission,
        startPolling,
        stopPolling,
    };
};
