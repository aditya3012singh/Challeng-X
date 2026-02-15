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
    <div className="min-h-screen bg-[var(--color-bg-dark)] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 bg-[rgba(0,0,0,0.8)] border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-[family:var(--font-heading)] text-white tracking-wider flex items-center gap-2">
              <span className="text-[var(--color-primary)]">///</span> BATTLE ROOM
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-1">
              PROTOCOL: <span className="text-[var(--color-primary)]">{battleData.battleCode}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/team-battle')}
              className="px-4 py-2 text-sm border border-red-900 text-red-500 hover:bg-red-900/20 transition-colors uppercase"
            >
              Abort
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">

        {/* LEFT COLUMN - TEAM 1 */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className={`glass-panel p-4 rounded-lg flex-1 border-t-4 ${isTeam1 ? 'border-[var(--color-primary)]' : 'border-gray-700'}`}>
            <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)] flex justify-between items-center">
              {battleData.team1.name}
              {isTeam1 && <span className="text-[10px] bg-[var(--color-primary)] text-black px-2 py-0.5 rounded">YOU</span>}
            </h2>
            <div className="space-y-3">
              {battleData.team1.members.map((member, i) => (
                <div key={member.id} className="flex items-center gap-3 p-2 bg-[rgba(255,255,255,0.03)] rounded border-l-2 border-[var(--color-primary)]">
                  <div className="w-8 h-8 bg-[var(--color-primary)] text-black font-bold flex items-center justify-center rounded-sm">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate">{member.username}</p>
                    <p className="text-[10px] text-gray-500">READY</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN - ACTION / CHAT */}
        <div className="lg:col-span-6 flex flex-col gap-4">

          {/* Status / Countdown Board */}
          <div className="glass-panel p-6 rounded-lg text-center relative overflow-hidden border-glow">
            {!bothTeamsReady ? (
              <div className="py-8">
                {isTeam1 ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-400 mb-4 animate-pulse">AWAITING CHALLENGER</h3>
                    <div className="inline-block p-4 border border-dashed border-gray-600 rounded bg-black/50 mb-4">
                      <span className="text-2xl font-mono tracking-widest text-[var(--color-primary)]">{battleData.joinCode}</span>
                    </div>
                    <button onClick={copyJoinCode} className="block mx-auto text-sm text-[var(--color-primary)] hover:underline">
                      [ COPY ACCESS CODE ]
                    </button>
                  </>
                ) : (
                  <h3 className="text-xl font-bold text-gray-400 animate-pulse">CONNECTING TO LOBBY...</h3>
                )}
              </div>
            ) : (
              <div className="py-4">
                {countdown !== null ? (
                  <div>
                    <p className="text-[var(--color-accent)] font-bold tracking-widest mb-2">IMMIMENT DEPLOYMENT</p>
                    <div className="text-8xl font-black text-white font-mono countdown-glitch">{countdown}</div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--color-success)] mb-2">SYSTEMS READY</h3>
                    <p className="text-gray-400 mb-6">All operators online. Initialize combat sequence.</p>
                    {!isStarting && (
                      <button
                        onClick={startCountdown}
                        className="px-12 py-4 bg-[var(--color-success)] text-black font-bold text-xl rounded clip-path-polygon hover:scale-105 transition-transform"
                        style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                      >
                        INITIATE
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
              <div className="h-full flex items-center justify-center glass-panel border border-gray-800 text-gray-500">
                Spectator Mode - Chat Disabled
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN - TEAM 2 */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className={`glass-panel p-4 rounded-lg flex-1 border-t-4 ${isTeam2 ? 'border-[var(--color-secondary)]' : 'border-gray-700'}`}>
            <h2 className="text-xl font-bold mb-4 text-[var(--color-secondary)] flex justify-between items-center text-right">
              {battleData.team2 ? battleData.team2.name : "OPPONENT"}
              {isTeam2 && <span className="text-[10px] bg-[var(--color-secondary)] text-white px-2 py-0.5 rounded">YOU</span>}
            </h2>

            {battleData.team2 ? (
              <div className="space-y-3">
                {battleData.team2.members.map((member, i) => (
                  <div key={member.id} className="flex flex-row-reverse items-center gap-3 p-2 bg-[rgba(255,255,255,0.03)] rounded border-r-2 border-[var(--color-secondary)] text-right">
                    <div className="w-8 h-8 bg-[var(--color-secondary)] text-white font-bold flex items-center justify-center rounded-sm">
                      {member.username[0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate">{member.username}</p>
                      <p className="text-[10px] text-gray-500">READY</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center opacity-30">
                <div className="text-center">
                  <div className="text-4xl mb-2">?</div>
                  <p>SEARCHING...</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
