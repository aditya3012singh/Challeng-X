import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getProblemById } from "../../store/api/problem.thunk";
import { createBattleSelected } from "../../store/api/battle.thunk";

export const ProblemDetail = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const id  = useParams();
    const [creatingBattle, setCreatingBattle] = useState(false);

    const {
        currentProblem = null,
        loading = false,
        error = null,
    } = useSelector((state) => state.problem);

    useEffect(() => {
        if (id) {
            dispatch(getProblemById(id));
        }
    }, [id, dispatch]);

    const handleCreateBattle = async () => {
        if (!currentProblem?.id) return;
        
        setCreatingBattle(true);
        try {
            const result = await dispatch(createBattleSelected({ problemId: currentProblem.id })).unwrap();
            // Navigate to battle page or show success message
            // Assuming the battle response has a battle ID
            if (result?.id) {
                navigate(`/battle/${result.id}/ide`);
            }
            else {
                alert("Battle created successfully!");
            }
        } catch (error) {
            alert(error?.message || "Failed to create battle");
        } finally {
            setCreatingBattle(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toUpperCase()) {
            case "EASY":
                return "bg-green-100 text-green-800";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800";
            case "HARD":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    if (!currentProblem) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Problem not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3">{currentProblem.title}</h1>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(currentProblem.difficulty)}`}>
                        {currentProblem.difficulty}
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                    {currentProblem.description || "No description available"}
                </p>
            </div>

            {/* Test Cases */}
            {currentProblem.testcases && currentProblem.testcases.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-3">Test Cases</h2>
                    <div className="space-y-4">
                        {currentProblem.testcases.map((testcase, index) => (
                            <div key={index} className="border border-gray-200 rounded p-4">
                                <div className="font-medium mb-2">Test Case {index + 1}</div>
                                <div className="space-y-1 text-sm">
                                    <div>
                                        <span className="font-semibold">Input:</span>{" "}
                                        <code className="bg-gray-100 px-2 py-1 rounded">
                                            {testcase.input}
                                        </code>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Expected Output:</span>{" "}
                                        <code className="bg-gray-100 px-2 py-1 rounded">
                                            {testcase.expected || testcase.output}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Battle Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleCreateBattle}
                    disabled={creatingBattle}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                    {creatingBattle ? "Creating Battle..." : "Create Battle"}
                </button>
            </div>
        </div>
    );
};