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
        joinBattle({ battleCode: battleId.trim() })
    ).unwrap();

    navigate(`/battle/${res.id}/ide`);
};


    return (
        <div className="min-h-screen bg-[#0f0f12] text-white py-12 px-4">
  <div className="max-w-4xl mx-auto">
    <h1 className="text-4xl font-bold text-center mb-12">⚔️ Battle Arena</h1>

    {/* Tabs */}
    <div className="flex justify-center mb-10 space-x-3">
      <button
        onClick={() => setActiveTab("random")}
        className={`px-8 py-3 rounded-xl font-semibold transition-all ${
          activeTab === "random"
            ? "bg-blue-600 text-white shadow-lg scale-105"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        Random Battle
      </button>

      <button
        onClick={() => setActiveTab("join")}
        className={`px-8 py-3 rounded-xl font-semibold transition-all ${
          activeTab === "join"
            ? "bg-blue-600 text-white shadow-lg scale-105"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        Join Battle
      </button>
    </div>

    {/* Error */}
    {error && (
      <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
        <p className="font-semibold mb-1">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    )}

    {/* Tab Content Card */}
    <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-10">
      {/* Random Battle */}
      {activeTab === "random" && (
        <div className="text-center">
          <div className="mb-8">
            <div className="text-6xl mb-6">⚡</div>
            <h2 className="text-3xl font-bold mb-3">Quick Random Battle</h2>
            <p className="text-gray-400">
              Get matched with a random coding problem and challenge yourself!
            </p>
          </div>

          <button
            onClick={handleCreateRandom}
            disabled={loading}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Creating Battle..." : "Start Random Battle"}
          </button>
        </div>
      )}

      {/* Selected Problem */}
      {activeTab === "selected" && (
        <div>
          <h2 className="text-3xl font-bold mb-4">Choose Your Challenge</h2>
          <p className="text-gray-400 mb-8">
            Select a specific problem to battle with
          </p>

          <form onSubmit={handleCreateSelected}>
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-400 mb-3">
                Select Problem
              </label>

              {problemsLoading ? (
                <div className="text-center py-6 text-gray-500">
                  Loading problems...
                </div>
              ) : (
                <select
                  value={selectedProblemId}
                  onChange={(e) => setSelectedProblemId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Creating Battle..." : "Create Battle"}
            </button>
          </form>
        </div>
      )}

      {/* Join Battle */}
      {activeTab === "join" && (
        <div>
          <div className="text-center mb-8">
            <div className="text-6xl mb-6">🤝</div>
            <h2 className="text-3xl font-bold mb-2">Join an Existing Battle</h2>
            <p className="text-gray-400">
              Enter the battle ID shared by your opponent
            </p>
          </div>

          <form onSubmit={handleJoinBattle}>
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-400 mb-3">
                Battle ID
              </label>
              <input
                type="text"
                value={battleId}
                onChange={(e) => setBattleId(e.target.value)}
                placeholder="Enter battle ID (e.g., abc123xyz)"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />
              <p className="mt-3 text-sm text-gray-500">
                The battle ID is provided by the person who created the battle
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !battleId.trim()}
              className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Joining Battle..." : "Join Battle"}
            </button>
          </form>
        </div>
      )}
    </div>

    {/* Info Section */}
    <div className="mt-12 bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        ℹ️ <span className="ml-2">How it Works</span>
      </h3>
      <div className="space-y-4 text-gray-400 text-sm">
        <p><strong>1.</strong> Random Battle: Instantly matched with a random coding problem</p>
        <p><strong>2.</strong> Select Problem: Choose a specific problem to battle with</p>
        <p><strong>3.</strong> Join Battle: Enter a battle ID to join an existing battle</p>
        <p><strong>4.</strong> You’ll be taken to the battle room to compete!</p>
      </div>
    </div>
  </div>
</div>

    );
};

export default Battle;
