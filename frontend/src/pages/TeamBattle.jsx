import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTeamBattleByLeader,
  getAvailableBattles,
  joinTeamBattleWithCode,
  createTeamBattle,
  startTeamBattle,
  submitMatchSolution,
  determineMatchWinner,
  completeTeamBattle,
} from "../../store/api/teamBattle.thunk";
import { createTeam, joinTeam, getUserTeams, leaveTeam, disbandTeam } from "../../store/api/team.thunk";
import { clearSuccessMessage } from "../../store/slices/teamBattle.slice";
import { clearSuccessMessage as clearTeamSuccess } from "../../store/slices/team.slice";
import { TeamTabs } from "../components/TeamBattle/TeamTabs";
import { MessageAlerts } from "../components/TeamBattle/MessageAlerts";
import { MyTeamsTab } from "../components/TeamBattle/MyTeamsTab";
import { CreateTeamTab } from "../components/TeamBattle/CreateTeamTab";
import { JoinTeamTab } from "../components/TeamBattle/JoinTeamTab";
import { TournamentCreationPanel } from "../components/TeamBattle/TournamentCreationPanel";
import { TournamentDisplay } from "../components/TeamBattle/TournamentDisplay";
import { CodeSubmissionModal } from "../components/TeamBattle/CodeSubmissionModal";
import { CreateBattleModal } from "../components/TeamBattle/CreateBattleModal";
import { JoinBattleModal } from "../components/TeamBattle/JoinBattleModal";
import { toast } from "react-hot-toast";

// Components


export const TeamBattle = () => {
  // Local state - LEGACY
  const [activeTab, setActiveTab] = useState("myTeams");
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(2);
  const [joinCode, setJoinCode] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");

  // NEW JOIN-CODE FLOW STATE
  const [showCreateBattleModal, setShowCreateBattleModal] = useState(false);
  const [showJoinBattleModal, setShowJoinBattleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", action: null });

  const dispatch = useDispatch();
  const { userTeams, loading: teamLoading, error: teamError, successMessage: teamSuccess } = useSelector(
    (state) => state.team
  );
  const {
    currentBattle,
    currentMatches,
    availableBattles,
    loading: battleLoading,
    error: battleError,
    successMessage: battleSuccess,
  } = useSelector((state) => state.teamBattle);
  const { user } = useSelector((state) => state.auth);

  // Determine available teams for opponent selection
  const availableTeams = userTeams.filter(
    (team) => team.creatorId === user?.id || team.members.some((m) => m.userId === user?.id)
  );

  // Initialize data on mount
  useEffect(() => {
    dispatch(getUserTeams());
  }, [dispatch]);

  // Clear success messages after 3 seconds
  useEffect(() => {
    if (battleSuccess || teamSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        dispatch(clearTeamSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [battleSuccess, teamSuccess, dispatch]);

  // Team handlers
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || teamName.length < 3) {
      toast.error("Team name must be at least 3 characters");
      return;
    }

    try {
      await dispatch(createTeam({ teamName, maxTeamSize: teamSize })).unwrap();
      setTeamName("");
      setActiveTab("myTeams");
      dispatch(getUserTeams());
    } catch (err) {
      console.error("Create team error:", err);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Enter a team code");
      return;
    }

    try {
      await dispatch(joinTeam({ teamCode: joinCode })).unwrap();
      setJoinCode("");
      setActiveTab("myTeams");
      dispatch(getUserTeams());
    } catch (err) {
      console.error("Join team error:", err);
    }
  };

  const handleLeaveTeam = (teamId) => {
    setConfirmConfig({
      title: "Leave Team?",
      message: "Are you sure you want to leave this team? You will lose access to team matches.",
      action: async () => {
        try {
          await dispatch(leaveTeam(teamId)).unwrap();
          dispatch(getUserTeams());
          toast.success("Left team successfully");
        } catch (err) {
          console.error("Leave team error:", err);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleDisbandTeam = (teamId) => {
    setConfirmConfig({
      title: "Disband Team?",
      message: "This action is permanent and will remove all members from the team.",
      action: async () => {
        try {
          await dispatch(disbandTeam(teamId)).unwrap();
          dispatch(getUserTeams());
          toast.success("Team disbanded successfully");
        } catch (err) {
          console.error("Disband team error:", err);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleStartBattle = (team) => {
    setSelectedTeam(team);
    setActiveTab("battle");
  };

  // Battle handlers
  const handleCreateBattle = async () => {
    if (!selectedTeam || !selectedOpponent) {
      toast.error("Select both your team and opponent team");
      return;
    }

    try {
      await dispatch(
        createTeamBattle({
          team1Id: selectedTeam.id,
          team2Id: selectedOpponent.id,
          maxTeamSize: teamSize,
        })
      ).unwrap();
    } catch (err) {
      console.error("Create battle error:", err);
    }
  };

  const handleStartTournament = async () => {
    if (!currentBattle?.battleCode) return;
    try {
      await dispatch(startTeamBattle(currentBattle.battleCode)).unwrap();
    } catch (err) {
      console.error("Start battle error:", err);
    }
  };

  const handleCompleteTournament = async () => {
    if (!currentBattle?.battleCode) return;
    try {
      await dispatch(completeTeamBattle(currentBattle.battleCode)).unwrap();
    } catch (err) {
      console.error("Complete battle error:", err);
    }
  };

  const handleSubmitMatchCode = async () => {
    if (!code.trim()) {
      toast.error("Enter code first");
      return;
    }

    try {
      await dispatch(
        submitMatchSolution({
          battleCode: currentBattle.battleCode,
          matchId: selectedMatch.id,
          code,
          language,
          output: "",
        })
      ).unwrap();
      setCode("");
      setSelectedMatch(null);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleCompleteMatch = async () => {
    const winnerId = selectedMatch.winnerId || selectedMatch.player1Id;

    try {
      await dispatch(
        determineMatchWinner({
          matchId: selectedMatch.id,
          winnerId,
        })
      ).unwrap();
    } catch (err) {
      console.error("Complete match error:", err);
    }
  };

  // Utility functions
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Team code copied to clipboard!");
  };

  const getMatchStatus = (match) => {
    if (match.winnerId) return "Completed";
    if (match.submissions?.length > 0) return "Submitted";
    return "Pending";
  };

  const isUserInMatch = (match) => {
    return match.player1Id === user?.id || match.player2Id === user?.id;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] py-16 font-[family:var(--font-body)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="mb-20 text-center">
          <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Team Battles</div>
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase font-[family:var(--font-heading)]">Team Battle</h1>
          <p className="text-slate-500 text-lg font-light max-w-2xl mx-auto">Work together with your team to solve problems and win matches.</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-6 mb-16 justify-center flex-wrap">
          <button
            onClick={() => setShowCreateBattleModal(true)}
            className="px-10 py-4 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg"
            style={{ borderRadius: "2px" }}
          >
            Create Team Battle
          </button>
          <button
            onClick={() => setShowJoinBattleModal(true)}
            className="px-10 py-4 border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:border-white transition-all transform hover:-translate-y-1"
            style={{ borderRadius: "2px" }}
          >
            Join Team Battle
          </button>
        </div>

        {/* Tabs */}
        <TeamTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Messages */}
        <MessageAlerts
          battleSuccess={battleSuccess}
          teamSuccess={teamSuccess}
          battleError={battleError}
          teamError={teamError}
        />

        {/* My Teams Tab */}
        {activeTab === "myTeams" && (
          <MyTeamsTab
            userTeams={userTeams}
            user={user}
            teamLoading={teamLoading}
            onLeaveTeam={handleLeaveTeam}
            onDisbandTeam={handleDisbandTeam}
            onStartBattle={handleStartBattle}
            copyToClipboard={copyToClipboard}
          />
        )}

        {/* Create Team Tab */}
        {activeTab === "create" && (
          <CreateTeamTab
            teamName={teamName}
            setTeamName={setTeamName}
            teamSize={teamSize}
            setTeamSize={setTeamSize}
            teamLoading={teamLoading}
            onCreateTeam={handleCreateTeam}
          />
        )}

        {/* Join Team Tab */}
        {activeTab === "join" && (
          <JoinTeamTab
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            teamLoading={teamLoading}
            onJoinTeam={handleJoinTeam}
          />
        )}



        {/* Code Submission Modal */}
        <CodeSubmissionModal
          selectedMatch={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          onSubmitCode={handleSubmitMatchCode}
          onMarkWinner={handleCompleteMatch}
          battleLoading={battleLoading}
        />

        {/* NEW JOIN-CODE FLOW MODALS */}
        <CreateBattleModal
          isOpen={showCreateBattleModal}
          onClose={() => setShowCreateBattleModal(false)}
          teams={userTeams}
        />

        <JoinBattleModal
          isOpen={showJoinBattleModal}
          onClose={() => setShowJoinBattleModal(false)}
          teams={userTeams}
        />

        {/* REUSABLE CONFIRMATION MODAL */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-10 shadow-2xl relative overflow-hidden" style={{ borderRadius: "2px" }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
              <div className="text-[10px] font-bold tracking-[0.4em] text-red-500 uppercase mb-6">Action Confirmation</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{confirmConfig.title}</h3>
              <p className="text-slate-500 text-xs font-mono leading-relaxed mb-10">{confirmConfig.message}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 border border-white/5 text-slate-500 font-bold uppercase tracking-widest text-[9px] hover:text-white transition-colors"
                  style={{ borderRadius: "2px" }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { confirmConfig.action(); setShowConfirmModal(false); }}
                  className="flex-1 py-4 bg-red-500 text-white font-black uppercase tracking-widest text-[9px] hover:bg-red-400 transition-all shadow-xl"
                  style={{ borderRadius: "2px" }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
