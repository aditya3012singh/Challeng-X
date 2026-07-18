import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getBattleById } from "../../store/api/teamBattle.thunk";
import { TeamChat } from "../components/TeamChat";
import { getSocket } from "../../lib/socket";
import { toast } from "react-hot-toast";
import ShareModal from "../components/common/ShareModal";
import { useBattle } from "../hooks/useBattle";
import { queryClient } from "../lib/queryClient";
import { 
  Swords, 
  Radio, 
  Check, 
  Clock, 
  Settings2, 
  Flame, 
  Timer, 
  Code2, 
  Layers, 
  Zap, 
  X 
} from "lucide-react";

export const BattleRoom = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { data: battleData, isLoading: loading } = useBattle(battleId);
  const [countdown, setCountdown] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python");

  // Fetch initial battle data (fallback for socket events)
  const fetchBattleData = async () => {
    try {
      const result = await dispatch(getBattleById(battleId)).unwrap();
      queryClient.setQueryData(['battle', battleId], result);
    } catch (error) {
      console.error("Failed to fetch battle:", error);
      toast.error("Failed to load battle room. Redirecting...");
      navigate("/team-battle");
    }
  };

  useEffect(() => {
    if (battleId) {
      fetchBattleData();
    }
  }, [battleId]);

  // Socket Integration
  useEffect(() => {
    if (!battleId || !user || !battleData) return;

    const socket = getSocket();
    const isTeam1 = battleData.team1.members.some(m => m.userId === user?.id);
    const isTeam2 = battleData.team2?.members.some(m => m.userId === user?.id);
    const teamId = isTeam1 ? battleData.team1Id : (isTeam2 ? battleData.team2Id : null);

    // Join the lobby room via socket
    socket.emit("join_team_lobby", { 
      battleId, 
      teamId, 
      username: user.username 
    });

    // Listen for events
    socket.on("player_joined_lobby", (data) => {
      console.log("New player joined lobby:", data);
      queryClient.invalidateQueries({ queryKey: ['battle', battleId] });
    });

    socket.on("battle_countdown_start", (data) => {
      console.log("Battle countdown started!");
      setIsStarting(true);
      setCountdown(data.seconds || 5);
    });

    socket.on("battle_start_redirect", (data) => {
      console.log("Redirecting to IDE...");
      if (!data.isTeamBattle) {
        navigate(`/battle/${data.battleCode}/ide`);
      }
    });

    socket.on("team_battle_match_start", (data) => {
      console.log("Team match starting! Redirecting to specific IDE:", data.matchId);
      localStorage.setItem("active_battle_id", data.matchId);
      navigate(`/battle/${data.matchId}/ide`);
    });

    return () => {
      socket.off("player_joined_lobby");
      socket.off("battle_countdown_start");
      socket.off("battle_start_redirect");
      socket.off("team_battle_match_start");
    };
  }, [battleId, user, battleData?.id]);

  // Local Countdown timer
  useEffect(() => {
    if (countdown === null || countdown === 0) {
        if (countdown === 0 && isTeam1) {
            const socket = getSocket();
            socket.emit("trigger_final_battle_start", { 
                battleId, 
                battleCode: battleData.battleCode 
            });
        }
        return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    const socket = getSocket();
    socket.emit("start_battle_countdown", { battleId });
  };

  const getPlayerLeague = (pts) => {
    const points = pts || 1000;
    if (points < 1200) return "Bronze";
    if (points < 1500) return "Silver";
    if (points < 1800) return "Gold";
    if (points < 2200) return "Diamond";
    return "Master";
  };

  if (!battleData || loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-mono animate-pulse">CONNECTING...</p>
        </div>
      </div>
    );
  }

  const isTeam1 = battleData.team1.members.some(m => m.userId === user?.id);
  const isTeam2 = battleData.team2?.members.some(m => m.userId === user?.id);
  const userTeam = isTeam1 ? battleData.team1 : (isTeam2 ? battleData.team2 : null);
  const bothTeamsReady = battleData.team1 && battleData.team2;

  // Find the leader of Team1 (creator of the battle)
  const isBattleLeader = battleData.createdByUserId === user?.id;

  const player1 = battleData.team1?.members?.[0]?.user;
  const player2 = battleData.team2?.members?.[0]?.user;

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-50 overflow-x-hidden relative font-[family:var(--font-body)] pt-20">
      {/* Ambient Grid Background Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="bg-[radial-gradient(circle_at_50%_40%,rgba(18,18,18,0.6),transparent_70%)] absolute inset-0" />
        <div className="bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:40px_40px] absolute inset-0" />
      </div>

      <div className="relative z-10 flex px-4 sm:px-12 py-8 flex-col gap-6 w-full max-w-[1280px] mx-auto min-h-[calc(100vh-80px)]">
        
        {/* Pregame Room Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-neutral-200 text-neutral-900 flex justify-center items-center select-none">
              <Swords className="size-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-[family:var(--font-heading)] font-bold text-lg leading-7 tracking-tight text-white">
                ChallengX
              </span>
              <span className="text-neutral-400 text-xs leading-4">
                Pregame Battle Room
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer"
            >
              Invite Friends
            </button>
            <div className="rounded-full bg-neutral-900 border border-white/10 flex px-4 py-2 items-center gap-2 select-none ml-auto sm:ml-0">
              <Radio className="size-4 text-emerald-500 animate-pulse" />
              <span className="font-mono text-neutral-400 text-sm leading-5">
                Room #{battleData.battleCode || "A7F3-9K2"}
              </span>
            </div>
          </div>
        </div>

        {/* Pregame Main Grid Area */}
        <div className="flex flex-col lg:flex-row gap-8 w-full flex-1">
          
          {/* Left Main Column: Players VS Panel + Match Settings */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Player 1 vs Player 2 Duel Cards */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 w-full">
              
              {/* Player 1 Card (Ninja Creator) */}
              <div className="backdrop-blur-sm rounded-xl bg-[#18181b]/60 border border-white/5 p-6 flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <div className="size-20 rounded-full border-emerald-500/60 border-2 overflow-hidden bg-neutral-800 flex items-center justify-center text-white font-black text-2xl">
                    {player1?.profilePic ? (
                      <img src={player1.profilePic} alt="" className="object-cover w-full h-full" />
                    ) : (
                      player1?.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="size-4 rounded-full bg-emerald-500 border-neutral-900 border-2 absolute right-1 bottom-1 animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-[family:var(--font-heading)] font-semibold text-base leading-6 text-white truncate max-w-[120px]">
                      {player1?.username || "Creator"}
                    </span>
                    <span className="font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] flex px-2 py-0.5 items-center gap-1 uppercase tracking-wider">
                      <Check className="size-3" />
                      READY
                    </span>
                  </div>
                  <span className="font-mono text-neutral-500 text-xs leading-4">
                    Rank: {getPlayerLeague(player1?.rankPoints)}
                  </span>
                </div>
                <div className="border-t border-white/5 flex pt-4 justify-around items-center w-full select-none">
                  <div className="flex flex-col items-center">
                    <span className="font-[family:var(--font-heading)] font-bold text-lg leading-7 text-white">
                      {player1?.rankPoints || 1000}
                    </span>
                    <span className="text-neutral-500 text-[10px] font-bold">ELO</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-[family:var(--font-heading)] font-bold text-emerald-500 text-lg leading-7">
                      87%
                    </span>
                    <span className="text-neutral-500 text-[10px] font-bold">WIN RATE</span>
                  </div>
                </div>
              </div>

              {/* VS Middle Badge */}
              <div className="size-16 shadow-lg rounded-full bg-[#18181b] border border-white/10 flex justify-center items-center mx-auto select-none">
                <span className="font-[family:var(--font-heading)] font-black text-neutral-400 text-xl tracking-tighter">
                  VS
                </span>
              </div>

              {/* Player 2 Card (Challenger Friend) */}
              <div className="backdrop-blur-sm rounded-xl bg-[#18181b]/60 border border-white/5 p-6 flex flex-col items-center gap-4 text-center">
                {player2 ? (
                  <>
                    <div className="relative">
                      <div className="size-20 rounded-full border-emerald-500/60 border-2 overflow-hidden bg-neutral-800 flex items-center justify-center text-white font-black text-2xl">
                        {player2?.profilePic ? (
                          <img src={player2.profilePic} alt="" className="object-cover w-full h-full" />
                        ) : (
                          player2?.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="size-4 rounded-full bg-emerald-500 border-neutral-900 border-2 absolute right-1 bottom-1 animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-[family:var(--font-heading)] font-semibold text-base leading-6 text-white truncate max-w-[120px]">
                          {player2?.username || "You"}
                        </span>
                        <span className="font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] flex px-2 py-0.5 items-center gap-1 uppercase tracking-wider">
                          <Check className="size-3" />
                          READY
                        </span>
                      </div>
                      <span className="font-mono text-neutral-500 text-xs leading-4">
                        Rank: {getPlayerLeague(player2?.rankPoints)}
                      </span>
                    </div>
                    <div className="border-t border-white/5 flex pt-4 justify-around items-center w-full select-none">
                      <div className="flex flex-col items-center">
                        <span className="font-[family:var(--font-heading)] font-bold text-lg leading-7 text-white">
                          {player2?.rankPoints || 1000}
                        </span>
                        <span className="text-neutral-500 text-[10px] font-bold">ELO</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-[family:var(--font-heading)] font-bold text-emerald-500 text-lg leading-7">
                          91%
                        </span>
                        <span className="text-neutral-500 text-[10px] font-bold">WIN RATE</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="size-20 rounded-full border border-white/10 overflow-hidden bg-neutral-900 flex items-center justify-center text-neutral-600 font-bold text-2xl">
                        ?
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-[family:var(--font-heading)] font-semibold text-base leading-6 text-neutral-400">
                          Waiting...
                        </span>
                        <span className="font-bold rounded-full bg-neutral-800 text-neutral-500 border border-white/5 text-[9px] flex px-2 py-0.5 items-center gap-1 uppercase tracking-wider">
                          <Clock className="size-3" />
                          WAITING
                        </span>
                      </div>
                      <span className="font-mono text-neutral-600 text-xs leading-4">
                        Rank: Unranked
                      </span>
                    </div>
                    <div className="border-t border-white/5 flex pt-4 justify-around items-center w-full select-none">
                      <div className="flex flex-col items-center">
                        <span className="font-[family:var(--font-heading)] font-bold text-lg leading-7 text-neutral-600">
                          -
                        </span>
                        <span className="text-neutral-600 text-[10px] font-bold">ELO</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-[family:var(--font-heading)] font-bold text-neutral-600 text-lg leading-7">
                          -
                        </span>
                        <span className="text-neutral-600 text-[10px] font-bold">WIN RATE</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Match Settings Panel */}
            <div className="rounded-xl bg-[#18181b]/50 border border-white/5 p-6 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 mb-2 select-none">
                <Settings2 className="size-4 text-neutral-400" />
                <span className="font-[family:var(--font-heading)] font-semibold text-base leading-6 text-white uppercase tracking-wider text-sm">
                  Match Settings
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-neutral-950/40 border border-white/5 flex p-4 justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Flame className="size-4 text-neutral-500" />
                    <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Difficulty</span>
                  </div>
                  <span className="rounded-full bg-white/5 border border-white/10 text-white font-bold text-[10px] px-3 py-1 uppercase tracking-widest">
                    {battleData.difficulty || "Hard"}
                  </span>
                </div>

                <div className="rounded-lg bg-neutral-950/40 border border-white/5 flex p-4 justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Timer className="size-4 text-neutral-500" />
                    <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Time Limit</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-white">
                    45:00
                  </span>
                </div>

                <div className="rounded-lg bg-neutral-950/40 border border-white/5 flex p-4 justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Code2 className="size-4 text-neutral-500" />
                    <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Language</span>
                  </div>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="font-mono text-xs rounded-lg bg-neutral-900 border border-white/10 text-white px-3 py-1.5 outline-none cursor-pointer focus:border-white/20"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                  </select>
                </div>

                <div className="rounded-lg bg-neutral-950/40 border border-white/5 flex p-4 justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Layers className="size-4 text-neutral-500" />
                    <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Problems</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-white">
                    3 Algorithms
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Battle Chat Panel */}
          <div className="shrink-0 flex flex-col">
            {userTeam ? (
              <TeamChat teamName={userTeam.name} teamId={userTeam.id} battleId={battleId} user={user} />
            ) : (
              <div className="h-full flex items-center justify-center bg-[#18181b] border border-white/5 rounded-xl w-full md:w-80 text-[10px] font-bold text-neutral-500 uppercase tracking-widest min-h-[300px]">
                Spectating Area
              </div>
            )}
          </div>

        </div>

        {/* Commander ready state trigger button */}
        <div className="w-full mt-4 select-none">
          {countdown !== null ? (
            <button
              disabled
              className="w-full h-16 bg-neutral-800 text-white font-bold rounded-xl text-lg tracking-widest flex items-center justify-center gap-2 cursor-not-allowed uppercase font-[family:var(--font-heading)] opacity-85"
            >
              <span className="animate-pulse">Starting in {countdown}s</span>
            </button>
          ) : isBattleLeader ? (
            <button
              onClick={startCountdown}
              disabled={!bothTeamsReady || isStarting}
              className={`w-full h-16 rounded-xl text-lg tracking-widest font-black flex items-center justify-center gap-2 transition-all active:scale-[0.99] font-[family:var(--font-heading)] uppercase ${
                (!bothTeamsReady || isStarting)
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50 border border-white/5"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900 cursor-pointer shadow-2xl"
              }`}
            >
              <Zap className="size-5" />
              {!bothTeamsReady ? "Waiting for Opponent" : "Start Battle Sequence"}
            </button>
          ) : (
            <button
              disabled
              className="w-full h-16 bg-neutral-900/60 border border-white/5 text-neutral-500 font-bold rounded-xl text-lg tracking-widest flex items-center justify-center gap-2 cursor-not-allowed uppercase font-[family:var(--font-heading)]"
            >
              <Clock className="size-5" />
              Awaiting Host Authorization
            </button>
          )}
        </div>

      </div>

      {/* SHARE MODAL */}
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        link={`${window.location.origin}/join/${battleData.joinCode}`}
        title="INVITE TO BATTLE"
        message={`Hey! Join me for a coding battle on ChallengX. Use code: ${battleData.joinCode}`}
      />
    </div>
  );
};
