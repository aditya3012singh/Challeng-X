import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getBattleById } from "../../store/api/teamBattle.thunk";
import { TeamChat } from "../components/TeamChat";

export const BattleRoom = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [battleData, setBattleData] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch battle data
  useEffect(() => {
    const fetchBattleData = async () => {
      try {
        setLoading(true);
        const result = await dispatch(getBattleById(battleId)).unwrap();
        setBattleData(result);
      } catch (error) {
        console.error("Failed to fetch battle:", error);
        alert("Failed to load battle room. Redirecting...");
        navigate("/team-battle");
      } finally {
        setLoading(false);
      }
    };

    if (battleId) {
      fetchBattleData();
    }
  }, [battleId, dispatch, navigate]);

  // Listen for Team2 joining (polling for now)
  useEffect(() => {
    if (!battleData || battleData.team2) return;

    const interval = setInterval(async () => {
      try {
        const result = await dispatch(getBattleById(battleId)).unwrap();
        if (result.team2 && !battleData.team2) {
          setBattleData(result);
        }
      } catch (error) {
        console.error("Error polling battle:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [battleData, battleId, dispatch]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
      if (countdown === 1) {
        startBattle();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    setIsStarting(true);
    setCountdown(5);
  };

  const startBattle = () => {
    navigate(`/battle/${battleData.battleCode}/ide`);
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(battleData?.joinCode || "");
    // Could add a toast here
  };

  if (!battleData || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-primary)] font-mono animate-pulse">ESTABLISHING LINK...</p>
        </div>
      </div>
    );
  }

  const isTeam1 = battleData.team1.members.some(m => m.id === user?.id);
  const isTeam2 = battleData.team2?.members.some(m => m.id === user?.id);
  const userTeam = isTeam1 ? battleData.team1 : (isTeam2 ? battleData.team2 : null);
  const bothTeamsReady = battleData.team1 && battleData.team2;

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] overflow-hidden relative font-[family:var(--font-body)]">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[var(--color-primary)] opacity-[0.012] blur-[200px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="relative z-20 bg-white/[0.01] border-b border-white/[0.03] p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-2">Sync Status // Hybrid</div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">
              Combat Interface Node
            </h1>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em] mt-3">
              Protocol ID: <span className="text-white font-mono">{battleData.battleCode}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/team-battle')}
              className="px-6 py-2.5 text-[10px] font-bold border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-all uppercase tracking-widest"
              style={{ borderRadius: "2px" }}
            >
              Abort Session
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">

        {/* LEFT COLUMN - TEAM 1 */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="premium-card p-6 flex flex-col border-t-2" style={{ borderRadius: "2px", borderTopColor: isTeam1 ? "var(--color-primary)" : "rgba(255,255,255,0.05)" }}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Team A // Primary</h2>
              {isTeam1 && <span className="text-[9px] bg-white text-black px-2 py-0.5 font-bold tracking-widest">OPERATOR</span>}
            </div>
            <h3 className="text-2xl font-black text-white mb-8 tracking-tight">{battleData.team1.name}</h3>

            <div className="space-y-4">
              {battleData.team1.members.map((member, i) => (
                <div key={member.id} className="flex items-center gap-4 p-4 bg-white/[0.01] border border-white/[0.03]" style={{ borderRadius: "1px" }}>
                  <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate tracking-tight">{member.username}</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Status: Ready</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN - ACTION / CHAT */}
        <div className="lg:col-span-6 flex flex-col gap-6">

          {/* Status / Countdown Board */}
          <div className="premium-card p-12 text-center relative overflow-hidden flex flex-col justify-center min-h-[300px]" style={{ borderRadius: "2px" }}>
            {!bothTeamsReady ? (
              <div className="py-8 animate-in fade-in duration-500">
                {isTeam1 ? (
                  <>
                    <div className="text-[10px] font-bold tracking-[0.8em] text-[var(--color-primary)] uppercase mb-8 pl-2">Waiting for Challenger</div>
                    <div className="inline-block px-12 py-6 border border-white/5 bg-white/[0.01] mb-8" style={{ borderRadius: "2px" }}>
                      <span className="text-4xl font-black tracking-[0.4em] text-white font-mono">{battleData.joinCode}</span>
                    </div>
                    <button onClick={copyJoinCode} className="block mx-auto text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors mb-2">
                      [ Copy Access Credentials ]
                    </button>
                  </>
                ) : (
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.8em] animate-pulse">Establishing Node Link...</h3>
                )}
              </div>
            ) : (
              <div className="py-4 animate-in zoom-in duration-500">
                {countdown !== null ? (
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.8em] text-[var(--color-primary)] uppercase mb-8 pl-2">Imminent Deployment</div>
                    <div className="text-9xl font-black text-white font-mono tracking-tighter opacity-80">{countdown}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.8em] text-[var(--color-success)] uppercase mb-8 pl-2">Systems Operational</div>
                    <p className="text-slate-500 text-sm font-light mb-12 max-w-sm mx-auto">All computational operatives are synchronized. Authorization required to initiate combat sequence.</p>
                    {!isStarting && (
                      <button
                        onClick={startCountdown}
                        className="px-16 py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-[0.4em] text-xs hover:bg-white transition-all transform active:scale-95 shadow-2xl"
                        style={{ borderRadius: "2px" }}
                      >
                        Initialize Combat
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TEAM CHAT */}
          <div className="flex-1 min-h-[300px]">
            {userTeam ? (
              <TeamChat teamName={userTeam.name} isOwnTeam={true} />
            ) : (
              <div className="h-full flex items-center justify-center premium-card text-[10px] font-bold text-slate-600 uppercase tracking-widest" style={{ borderRadius: "2px" }}>
                Monitoring Only // Read Access
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN - TEAM 2 */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="premium-card p-6 flex flex-col border-t-2" style={{ borderRadius: "2px", borderTopColor: isTeam2 ? "var(--color-primary)" : "rgba(255,255,255,0.05)" }}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Team B // Secondary</h2>
              {isTeam2 && <span className="text-[9px] bg-white text-black px-2 py-0.5 font-bold tracking-widest">OPERATOR</span>}
            </div>
            <h3 className="text-2xl font-black text-white mb-8 tracking-tight">{battleData.team2 ? battleData.team2.name : "Unassigned"}</h3>

            {battleData.team2 ? (
              <div className="space-y-4">
                {battleData.team2.members.map((member, i) => (
                  <div key={member.id} className="flex flex-row-reverse items-center gap-4 p-4 bg-white/[0.01] border border-white/[0.03]" style={{ borderRadius: "1px" }}>
                    <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                      {member.username[0].toUpperCase()}
                    </div>
                    <div className="text-right overflow-hidden">
                      <p className="text-sm font-bold text-white truncate tracking-tight">{member.username}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Status: Ready</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-20">
                <div className="text-center">
                  <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Perimeter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
