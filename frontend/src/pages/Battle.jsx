import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Trophy, Target, Clock } from "lucide-react";
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
  const [selectedDifficulty, setSelectedDifficulty] = useState(""); // "" = all, "EASY", "MEDIUM", "HARD"

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
    if (activeTab === "selected") {
      const params = selectedDifficulty ? { difficulty: selectedDifficulty } : {};
      dispatch(getAllProblems(params));
    }
  }, [activeTab, selectedDifficulty, dispatch]);

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
    <div className="min-h-screen bg-zinc-950 text-neutral-50 flex items-center justify-center p-6 sm:p-8 relative overflow-x-hidden font-[family:var(--font-body)] pt-20">
      {/* AMBIENT BACKGROUND SYSTEM */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          alt="Dark code editor"
          className="object-cover opacity-[0.03] absolute inset-0 w-full h-full"
          src="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
        />
        <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,18,18,0.7),transparent_60%)] absolute inset-0" />
        <div className="bg-gradient-to-br from-[#09090b]/80 via-transparent to-[#09090b]/90 absolute inset-0" />
        <div className="bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] absolute inset-0" />
      </div>

      <div className="relative max-w-[1140px] w-full z-10">
        <div className="flex px-4 sm:px-8 py-12 justify-center items-center flex-1">
          <div className="grid max-w-[1140px] grid-cols-1 lg:grid-cols-2 gap-12 w-full text-left">
            
            {/* Left Side: Stats & Description */}
            <div className="flex flex-col justify-center gap-8">
              <div className="space-y-4">
                <div className="inline-flex font-semibold uppercase rounded-full bg-neutral-900 text-[#a1a1a1] text-[10px] tracking-[5.6px] border border-zinc-800 px-4 py-2 items-center gap-2 select-none self-start">
                  <Sparkles className="size-3 text-neutral-200" />
                  Match Center
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-[560px] font-semibold text-neutral-50 text-4xl sm:text-5xl leading-tight sm:leading-12 tracking-tight">
                    {activeTab === "random" ? "Find your next coding battle" : "Create a custom coding arena"}
                  </h1>
                  <p className="max-w-[520px] text-[#a1a1a1] text-base leading-7">
                    {activeTab === "random" 
                      ? "Choose a difficulty, then jump into a random opponent match and get routed straight into your battle screen."
                      : "Select a custom problem, configure the parameters, and challenge your friends to see who can solve it first."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] rounded-2xl bg-neutral-900 border border-zinc-800 p-5">
                  <div className="text-[#a1a1a1] flex items-center gap-2">
                    <Zap className="size-4 text-neutral-200" />
                    <span className="uppercase text-xs leading-4 tracking-[4.8px]">
                      Fast queue
                    </span>
                  </div>
                  <div className="font-semibold text-neutral-50 text-2xl leading-8 mt-4 font-mono">
                    12s
                  </div>
                  <div className="text-[#a1a1a1] text-sm leading-5 mt-1">
                    Average wait
                  </div>
                </div>
                <div className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] rounded-2xl bg-neutral-900 border border-zinc-800 p-5">
                  <div className="text-[#a1a1a1] flex items-center gap-2">
                    <Trophy className="size-4 text-neutral-200" />
                    <span className="uppercase text-xs leading-4 tracking-[4.8px]">
                      Balanced
                    </span>
                  </div>
                  <div className="font-semibold text-neutral-50 text-2xl leading-8 mt-4 font-mono">
                    1v1
                  </div>
                  <div className="text-[#a1a1a1] text-sm leading-5 mt-1">
                    Ranked pairing
                  </div>
                </div>
                <div className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] rounded-2xl bg-neutral-900 border border-zinc-800 p-5">
                  <div className="text-[#a1a1a1] flex items-center gap-2">
                    <Target className="size-4 text-neutral-200" />
                    <span className="uppercase text-xs leading-4 tracking-[4.8px]">
                      Ready
                    </span>
                  </div>
                  <div className="font-semibold text-neutral-50 text-2xl leading-8 mt-4">
                    Live
                  </div>
                  <div className="text-[#a1a1a1] text-sm leading-5 mt-1">
                    Instant start
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side: Matchmaking selection card */}
            <div className="flex justify-center items-center">
              <div className="max-w-[520px] backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] bg-neutral-900 border border-zinc-800 p-8 flex flex-col gap-6 w-full rounded-2xl">
                <div className="text-center flex flex-col gap-2">
                  <div className="size-12 rounded-2xl bg-neutral-950/70 text-neutral-200 border border-zinc-800 flex mx-auto mb-2 justify-center items-center">
                    <Target className="size-5" />
                  </div>
                  <h2 className="font-semibold text-neutral-50 text-3xl leading-9 tracking-tight">
                    {activeTab === "random" ? "Random Match" : "Custom Match"}
                  </h2>
                  <p className="text-[#a1a1a1]">
                    {activeTab === "random" ? "Join a queue to match with a random opponent." : "Select a problem to create a private match arena."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 shadow-[0_10px_30px_rgba(0,0,0,0.28)] rounded-lg bg-zinc-950 border border-zinc-800 p-1 w-full select-none">
                  <button
                    onClick={() => setActiveTab("random")}
                    className={`font-semibold uppercase rounded-md text-[10px] sm:text-[11px] tracking-[2px] sm:tracking-[3px] px-4 py-3 cursor-pointer transition-all ${
                      activeTab === "random"
                        ? "bg-neutral-200 text-neutral-900"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Random Match
                  </button>
                  <button
                    onClick={() => setActiveTab("selected")}
                    className={`font-semibold uppercase rounded-md text-[10px] sm:text-[11px] tracking-[2px] sm:tracking-[3px] px-4 py-3 cursor-pointer transition-all ${
                      activeTab === "selected"
                        ? "bg-neutral-200 text-neutral-900"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Custom Match
                  </button>
                </div>
                
                {activeTab === "random" ? (
                  <div className="flex flex-col gap-6">
                    <div className="rounded-2xl bg-neutral-950/50 border border-zinc-800 p-5">
                      <div className="flex items-start gap-4">
                        <div className="size-11 rounded-xl bg-neutral-800 text-neutral-50 flex justify-center items-center shrink-0">
                          <Clock className="size-5" />
                        </div>
                        <div className="space-y-1 flex-1 text-left">
                          <div className="flex justify-between items-center gap-4">
                            <h3 className="font-semibold text-neutral-50 text-lg leading-7">
                              Random match
                            </h3>
                            <span className="uppercase text-[#a1a1a1] text-xs leading-4 tracking-[4.8px]">
                              Auto route
                            </span>
                          </div>
                          <p className="text-[#a1a1a1] text-sm leading-6">
                            We’ll pair you with a suitable opponent and take you directly to the combat IDE arena.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="border border-red-500/20 bg-red-500/5 text-red-500 p-4 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse" style={{ borderRadius: "2px" }}>
                        ⚠ Error: {typeof error === 'object' ? (error.message || error.error || JSON.stringify(error)) : error}
                      </div>
                    )}
                    
                    <button
                      onClick={handleCreateRandom}
                      disabled={loading}
                      className="shadow-[0_18px_40px_rgba(255,255,255,0.08)] rounded-2xl bg-neutral-200 hover:bg-white text-neutral-900 w-full h-14 font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="size-4" />
                      <span>{loading ? "Starting..." : "Start Random Match"}</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateSelected} className="flex flex-col gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center select-none">
                        <span className="font-semibold uppercase text-[#a1a1a1] text-xs leading-4 tracking-[4.8px]">
                          Filter by Difficulty
                        </span>
                        <span className="font-medium rounded-full bg-neutral-950/60 text-neutral-50 text-xs leading-4 border border-zinc-800 px-3 py-1">
                          {selectedDifficulty || "ALL"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 rounded-2xl bg-neutral-950/60 border border-zinc-800 p-2 gap-2 w-full h-auto select-none">
                        {["", "EASY", "MEDIUM", "HARD"].map((diff) => (
                          <button
                            key={diff || "all"}
                            type="button"
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`font-medium rounded-xl text-[10px] sm:text-xs leading-5 p-2 cursor-pointer transition-all ${
                              selectedDifficulty === diff
                                ? "bg-neutral-200 text-neutral-900"
                                : "text-[#a1a1a1] hover:text-white"
                            }`}
                          >
                            {diff || "ALL"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 text-left">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
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
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-6 py-4 text-neutral-50 font-mono focus:outline-none focus:border-white/20 transition-all appearance-none text-sm cursor-pointer"
                          required
                        >
                          <option value="">-- Select Problem --</option>
                          {problems.map((problem) => (
                            <option key={problem.id} value={problem.id} className="bg-zinc-900">
                              [{problem.difficulty}] {problem.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    {error && (
                      <div className="border border-red-500/20 bg-red-500/5 text-red-500 p-4 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse" style={{ borderRadius: "2px" }}>
                        ⚠ Error: {typeof error === 'object' ? (error.message || error.error || JSON.stringify(error)) : error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !selectedProblemId}
                      className="shadow-[0_18px_40px_rgba(255,255,255,0.08)] rounded-2xl bg-neutral-200 hover:bg-white text-neutral-900 w-full h-14 font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="size-4" />
                      <span>{loading ? "Creating..." : "Create Private Match"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
