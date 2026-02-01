import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    createBattleRandom,
    createBattleSelected,
    joinBattle,
} from "../../store/api/battle.thunk";
import { getAllProblems } from "../../store/api/problem.thunk";
import { clearBattleError } from "../../store/slices/battle.slice";

export const Battle = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("random"); // random, selected, join
    const [battleId, setBattleId] = useState("");
    const [selectedProblemId, setSelectedProblemId] = useState("");

    const {
        currentBattle,
        loading,
        error,
    } = useSelector((state) => state.battle);

    const {
        problems = [],
        loading: problemsLoading,
    } = useSelector((state) => state.problem);

    // Fetch problems for selected battle option
    useEffect(() => {
        if (activeTab === "selected" && problems.length === 0) {
            dispatch(getAllProblems());
        }
    }, [activeTab, dispatch, problems.length]);

    // Clear error when tab changes
    useEffect(() => {
        dispatch(clearBattleError());
    }, [activeTab, dispatch]);

    // Navigate to battle IDE when battle is created/joined
    // useEffect(() => {
    //     if (currentBattle?.id) {
    //         navigate(`/battle/${currentBattle.id}/ide`);
    //     }
    // }, [currentBattle, navigate]);

   const handleCreateRandom = async () => {
    const res = await dispatch(createBattleRandom()).unwrap();
    navigate(`/battle/${res.id}/ide`);
};


     const handleCreateSelected = async (e) => {
        e.preventDefault();
        if (!selectedProblemId) return;

        const res = await dispatch(
            createBattleSelected({ problemId: selectedProblemId })
        ).unwrap();

        navigate(`/battle/${res.id}/ide`);
    };


    const handleJoinBattle = async (e) => {
    e.preventDefault();
    if (!battleId.trim()) return;

    const res = await dispatch(
        joinBattle({ battleId: battleId.trim() })
    ).unwrap();

    navigate(`/battle/${res.id}/ide`);
};


    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-bold text-center mb-8">Battle Arena</h1>

                {/* Tabs */}
                <div className="flex justify-center mb-8 space-x-2">
                    <button
                        onClick={() => setActiveTab("random")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeTab === "random"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        Random Battle
                    </button>
                    {/* <button
                        onClick={() => setActiveTab("selected")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeTab === "selected"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        Select Problem
                    </button> */}
                    <button
                        onClick={() => setActiveTab("join")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeTab === "join"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        Join Battle
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <p className="font-semibold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Random Battle Tab */}
                    {activeTab === "random" && (
                        <div className="text-center">
                            <div className="mb-6">
                                <svg
                                    className="mx-auto h-24 w-24 text-blue-600 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                                <h2 className="text-2xl font-bold mb-2">Quick Random Battle</h2>
                                <p className="text-gray-600">
                                    Get matched with a random coding problem and challenge yourself!
                                </p>
                            </div>
                            <button
                                onClick={handleCreateRandom}
                                disabled={loading}
                                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? "Creating Battle..." : "Start Random Battle"}
                            </button>
                        </div>
                    )}

                    {/* Selected Problem Tab */}
                    {activeTab === "selected" && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Choose Your Challenge</h2>
                            <p className="text-gray-600 mb-6">
                                Select a specific problem to battle with
                            </p>

                            <form onSubmit={handleCreateSelected}>
                                <div className="mb-6">
                                    <label
                                        htmlFor="problem-select"
                                        className="block text-sm font-semibold text-gray-700 mb-2"
                                    >
                                        Select Problem
                                    </label>
                                    {problemsLoading ? (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500">Loading problems...</p>
                                        </div>
                                    ) : (
                                        <select
                                            id="problem-select"
                                            value={selectedProblemId}
                                            onChange={(e) => setSelectedProblemId(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">-- Choose a problem --</option>
                                            {problems.map((problem) => (
                                                <option key={problem.id} value={problem.id}>
                                                    {problem.title} - {problem.difficulty}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !selectedProblemId}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? "Creating Battle..." : "Create Battle"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Join Battle Tab */}
                    {activeTab === "join" && (
                        <div>
                            <div className="text-center mb-6">
                                <svg
                                    className="mx-auto h-20 w-20 text-green-600 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                <h2 className="text-2xl font-bold mb-2">Join an Existing Battle</h2>
                                <p className="text-gray-600">
                                    Enter the battle ID shared by your opponent
                                </p>
                            </div>

                            <form onSubmit={handleJoinBattle}>
                                <div className="mb-6">
                                    <label
                                        htmlFor="battle-id"
                                        className="block text-sm font-semibold text-gray-700 mb-2"
                                    >
                                        Battle ID
                                    </label>
                                    <input
                                        type="text"
                                        id="battle-id"
                                        value={battleId}
                                        onChange={(e) => setBattleId(e.target.value)}
                                        placeholder="Enter battle ID (e.g., abc123xyz)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        The battle ID is provided by the person who created the battle
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !battleId.trim()}
                                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? "Joining Battle..." : "Join Battle"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">How it Works</h3>
                    <div className="space-y-2 text-blue-800">
                        <div className="flex items-start">
                            <span className="font-bold mr-2">1.</span>
                            <p>
                                <strong>Random Battle:</strong> Get instantly matched with a random coding
                                problem
                            </p>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">2.</span>
                            <p>
                                <strong>Select Problem:</strong> Choose a specific problem you want to
                                battle with
                            </p>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">3.</span>
                            <p>
                                <strong>Join Battle:</strong> Enter a battle ID to join an existing battle
                                created by others
                            </p>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">4.</span>
                            <p>
                                Once created or joined, you'll be taken to the battle room where you can
                                solve the problem and compete!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Battle;
