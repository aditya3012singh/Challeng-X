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


  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] py-20 px-4 sm:px-6 relative overflow-hidden font-[family:var(--font-body)]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[var(--color-primary)] opacity-[0.015] blur-[180px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Match Center</div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tighter uppercase font-[family:var(--font-heading)]">
            Create a Match
          </h1>
        </div>

        {/* Tabs - REFINED */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-white/[0.02] p-1 border border-white/5" style={{ borderRadius: "2px" }}>
            <button
              onClick={() => setActiveTab("random")}
              className={`px-4 sm:px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === "random"
                ? "bg-[var(--color-primary)] text-black"
                : "text-slate-500 hover:text-white"
                }`}
              style={{ borderRadius: "1px" }}
            >
              Random Match
            </button>
            <button
              onClick={() => setActiveTab("selected")}
              className={`px-4 sm:px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === "selected"
                ? "bg-[var(--color-primary)] text-black"
                : "text-slate-500 hover:text-white"
                }`}
              style={{ borderRadius: "1px" }}
            >
              Custom Match
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-12 p-6 border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse" style={{ borderRadius: "2px" }}>
            ⚠ Error: {typeof error === 'object' ? (error.message || error.error || JSON.stringify(error)) : error}
          </div>
        )}

        {/* Tab Content Card - PREMIUM */}
        <div className="premium-card p-8 sm:p-16 lg:p-20 relative overflow-hidden" style={{ borderRadius: "2px" }}>

          {/* Random Battle */}
          {activeTab === "random" && (
            <div className="text-center max-w-lg mx-auto">
              <div className="mb-12">
                <div className="text-[10px] font-bold tracking-[0.8em] text-[var(--color-primary)] uppercase mb-6 pl-2">Quick Start</div>
                <h2 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase font-[family:var(--font-heading)]">Random Match</h2>
                <p className="text-slate-500 text-sm font-light leading-relaxed">
                  Instant matchmaking with a random problem. Perfect for players who want to jump straight into the action.
                </p>
              </div>

              <button
                onClick={handleCreateRandom}
                disabled={loading}
                className="w-full py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all transform active:scale-95 shadow-xl"
                style={{ borderRadius: "2px" }}
              >
                {loading ? "Initializing..." : "Start Match →"}
              </button>
            </div>
          )}

          {/* Selected Problem */}
          {activeTab === "selected" && (
            <div className="w-full max-w-lg mx-auto">
              <div className="text-center mb-12">
                <div className="text-[10px] font-bold tracking-[0.8em] text-[var(--color-primary)] uppercase mb-6 pl-2">Custom Choice</div>
                <h2 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase font-[family:var(--font-heading)]">Custom Match</h2>
                <p className="text-slate-500 text-sm font-light leading-relaxed">
                  Choose a specific problem to solve and challenge yourself or others.
                </p>
              </div>

              <form onSubmit={handleCreateSelected}>
                <div className="mb-12">
                  <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">
                    Choose a Problem
                  </label>

                  {problemsLoading ? (
                    <div className="text-center py-6 text-slate-700 text-[10px] font-bold tracking-widest animate-pulse">
                      Loading Problems...
                    </div>
                  ) : (
                    <select
                      value={selectedProblemId}
                      onChange={(e) => setSelectedProblemId(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 px-6 py-5 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all appearance-none text-sm"
                      style={{ borderRadius: "2px" }}
                      required
                    >
                      <option value="">-- Select Problem --</option>
                      {problems.map((problem) => (
                        <option key={problem.id} value={problem.id} className="bg-[#050505]">
                          [{problem.difficulty}] {problem.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedProblemId}
                  className="w-full py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all transform active:scale-95 shadow-xl"
                  style={{ borderRadius: "2px" }}
                >
                  {loading ? "Creating..." : "Create Private Match →"}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
