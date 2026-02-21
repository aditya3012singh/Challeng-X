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

  // Redirect back to active battle IDE if one already exists in state
  useEffect(() => {
    if (currentBattle && currentBattle.status !== "FINISHED") {
      navigate(`/battle/${currentBattle.id}/ide`, { replace: true });
    }
  }, [currentBattle, navigate]);

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
    <div className="min-h-screen bg-[var(--color-bg-dark)] text-white py-20 px-4 relative overflow-hidden font-[family:var(--font-heading)]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl font-black text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-glow">
          BATTLE CONTROL
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-12 space-x-6">
          <button
            onClick={() => setActiveTab("random")}
            className={`px-8 py-3 rounded clip-path-polygon transition-all border border-[var(--color-primary)] uppercase tracking-widest text-sm font-bold ${activeTab === "random"
              ? "bg-[var(--color-primary)] text-black shadow-[0_0_20px_var(--color-primary)]"
              : "bg-transparent text-[var(--color-primary)] hover:bg-[rgba(0,240,255,0.1)]"
              }`}
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
          >
            Random
          </button>

          <button
            onClick={() => setActiveTab("selected")}
            className={`px-8 py-3 rounded clip-path-polygon transition-all border border-[var(--color-primary)] uppercase tracking-widest text-sm font-bold ${activeTab === "selected"
              ? "bg-[var(--color-primary)] text-black shadow-[0_0_20px_var(--color-primary)]"
              : "bg-transparent text-[var(--color-primary)] hover:bg-[rgba(0,240,255,0.1)]"
              }`}
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
          >
            Custom
          </button>

          <button
            onClick={() => setActiveTab("join")}
            className={`px-8 py-3 rounded clip-path-polygon transition-all border border-[var(--color-success)] uppercase tracking-widest text-sm font-bold ${activeTab === "join"
              ? "bg-[var(--color-success)] text-black shadow-[0_0_20px_var(--color-success)]"
              : "bg-transparent text-[var(--color-success)] hover:bg-[rgba(0,255,157,0.1)]"
              }`}
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
          >
            Join
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/40 border border-red-500 rounded text-red-300 text-center animate-pulse">
            ⚠ {error}
          </div>
        )}

        {/* Tab Content Card */}
        <div className="glass-panel border-glow rounded-3xl p-10 min-h-[400px] flex items-center justify-center relative">
          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--color-primary)]"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[var(--color-primary)]"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[var(--color-primary)]"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--color-primary)]"></div>

          {/* Random Battle */}
          {activeTab === "random" && (
            <div className="text-center max-w-lg">
              <div className="mb-8">
                <div className="text-8xl mb-6 filter drop-shadow-[0_0_15px_var(--color-primary)]">⚡</div>
                <h2 className="text-3xl font-bold mb-3 text-white">QUICK DEPLOYMENT</h2>
                <p className="text-[var(--color-text-muted)]">
                  Instant matchmaking with random parameters. Test your adaptability.
                </p>
              </div>

              <button
                onClick={handleCreateRandom}
                disabled={loading}
                className="px-12 py-5 neon-button text-xl font-bold rounded clip-path-polygon hover:scale-105 transition-transform"
                style={{ clipPath: "polygon(5% 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)" }}
              >
                {loading ? "INITIALIZING..." : "INITIATE SEQUENCE"}
              </button>
            </div>
          )}

          {/* Selected Problem */}
          {activeTab === "selected" && (
            <div className="w-full max-w-lg">
              <h2 className="text-3xl font-bold mb-6 text-center text-white">CUSTOM CONFIGURATION</h2>
              <p className="text-[var(--color-text-muted)] mb-8 text-center">
                Select specific combat scenario.
              </p>

              <form onSubmit={handleCreateSelected}>
                <div className="mb-8">
                  <label className="block text-xs font-bold text-[var(--color-primary)] mb-2 uppercase tracking-widest">
                    Select Target Problem
                  </label>

                  {problemsLoading ? (
                    <div className="text-center py-6 text-gray-500 animate-pulse">
                      LOADING DATABASE...
                    </div>
                  ) : (
                    <select
                      value={selectedProblemId}
                      onChange={(e) => setSelectedProblemId(e.target.value)}
                      className="w-full px-4 py-4 bg-black/50 border border-gray-700 rounded text-white focus:border-[var(--color-primary)] focus:outline-none focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      required
                    >
                      <option value="">-- SELECT DATASET --</option>
                      {problems.map((problem) => (
                        <option key={problem.id} value={problem.id}>
                          [{problem.difficulty}] {problem.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedProblemId}
                  className="w-full py-5 neon-button text-xl font-bold rounded clip-path-polygon"
                  style={{ clipPath: "polygon(5% 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)" }}
                >
                  {loading ? "INITIALIZING..." : "CREATE LOBBY"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "join" && (
            <div className="w-full max-w-lg">
              <div className="text-center mb-8">
                <div className="text-6xl mb-6">🤝</div>
                <h2 className="text-3xl font-bold mb-2 text-white">ESTABLISH LINK</h2>
                <p className="text-[var(--color-text-muted)]">
                  Enter access code to join existing session.
                </p>
              </div>

              <form onSubmit={handleJoinBattle}>
                <div className="mb-8">
                  <label className="block text-xs font-bold text-[var(--color-success)] mb-2 uppercase tracking-widest">
                    Access Code
                  </label>
                  <input
                    type="text"
                    value={battleId}
                    onChange={(e) => setBattleId(e.target.value)}
                    placeholder="ENTER CODE (e.g. A1B2C3)"
                    className="w-full px-4 py-4 bg-black/50 border border-gray-700 rounded text-white focus:border-[var(--color-success)] focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,157,0.2)] font-mono tracking-widest text-center text-lg"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !battleId.trim()}
                  className="w-full py-5 bg-[rgba(0,255,157,0.1)] border border-[var(--color-success)] text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-black transition-all text-xl font-bold rounded clip-path-polygon uppercase tracking-widest"
                  style={{ clipPath: "polygon(5% 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)" }}
                >
                  {loading ? "CONNECTING..." : "JOIN SESSION"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
