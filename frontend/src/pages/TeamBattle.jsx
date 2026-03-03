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
      alert("Team name must be at least 3 characters");
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
      alert("Enter a team code");
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

  const handleLeaveTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to leave this team?")) {
      try {
        await dispatch(leaveTeam(teamId)).unwrap();
        dispatch(getUserTeams());
      } catch (err) {
        console.error("Leave team error:", err);
      }
    }
  };

  const handleDisbandTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to disband this team?")) {
      try {
        await dispatch(disbandTeam(teamId)).unwrap();
        dispatch(getUserTeams());
      } catch (err) {
        console.error("Disband team error:", err);
      }
    }
  };

  const handleStartBattle = (team) => {
    setSelectedTeam(team);
    setActiveTab("battle");
  };

  // Battle handlers
  const handleCreateBattle = async () => {
    if (!selectedTeam || !selectedOpponent) {
      alert("Select both your team and opponent team");
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
      alert("Enter code first");
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
    alert("Team code copied to clipboard!");
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
          <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Tactical Cluster // Social</div>
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase font-[family:var(--font-heading)]">Team Battle</h1>
          <p className="text-slate-500 text-lg font-light max-w-2xl mx-auto">Build your consensus. Coordinate your logic. Overload the opponent node.</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-6 mb-16 justify-center flex-wrap">
          <button
            onClick={() => setShowCreateBattleModal(true)}
            className="px-10 py-4 bg-[var(--color-primary)] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg"
            style={{ borderRadius: "2px" }}
          >
            Create Battle Protocol
          </button>
          <button
            onClick={() => setShowJoinBattleModal(true)}
            className="px-10 py-4 border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:border-white transition-all transform hover:-translate-y-1"
            style={{ borderRadius: "2px" }}
          >
            Proxy Join Battle
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
      </div>
    </div>
  );
};
