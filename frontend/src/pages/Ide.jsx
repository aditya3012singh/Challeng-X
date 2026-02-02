import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../../lib/socket";
import EditorToolbar from "../components/EditorToolbar";
import EditorPane from "../components/EditorPane";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";
import { Skeleton } from "../components/Skeleton";

import { getBattle, submitBattleCode } from "../../store/api/battle.thunk";
import { BattleProblem } from "../components/BattleProblem";

const LANGUAGES = {
  javascript: { monaco: "javascript", defaultCode: `console.log("Hello");` },
  python: { monaco: "python", defaultCode: `print("Hello")` },
  java: {
    monaco: "java",
    defaultCode: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello");
  }
}`,
  },
};

const WaitingForOpponent = ({ battleId }) => {
  const inviteLink = `${window.location.origin}/battle/${battleId}/join`;

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <h2 className="text-2xl font-bold mb-4">Waiting for opponent...</h2>

      <p className="text-gray-600 mb-6">
        Share this battle link with your friend to start the match.
      </p>

      <div className="bg-gray-100 px-4 py-3 rounded-lg text-sm mb-4 break-all">
        {inviteLink}
      </div>
    </div>
  );
};

export default function Ide() {
  const { battleId } = useParams();
  const dispatch = useDispatch();

  const { currentBattle, submissionResult } = useSelector(
    (state) => state.battle
  );

  const isBattleLoading = !currentBattle;
  const isWaitingForOpponent =
    currentBattle?.status === "WAITING" && !currentBattle?.player2Id;

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(LANGUAGES.python.defaultCode);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(getBattle({ battleId }));
  }, [battleId]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    const socket = getSocket();

    // Join the battle room
    socket.emit("joinBattle", battleId);

    // Listen for player joined event
    socket.on("playerJoined", () => {
      console.log("Player joined the battle");
      dispatch(getBattle({ battleId }));
    });

    // Listen for battle started event
    socket.on("battleStarted", () => {
      console.log("Battle started");
      dispatch(getBattle({ battleId }));
    });

    // Listen for battle finished event
    socket.on("battleFinished", ({ winnerId }) => {
      console.log("Battle finished, winner:", winnerId);
      dispatch(getBattle({ battleId }));
    });

    return () => {
      socket.off("playerJoined");
      socket.off("battleStarted");
      socket.off("battleFinished");
    };
  }, [battleId, dispatch]);

  useEffect(() => {
    if (!currentBattle) return;

    if (currentBattle.status === "FINISHED") {
      setMessage(`🏆 Winner: ${currentBattle.winnerId}`);
      setStatus("finished");
    } else if (submissionResult) {
      setMessage("✅ Code submitted. Waiting for opponent...");
      setStatus("waiting");
    }
  }, [currentBattle, submissionResult]);

  const handleSubmit = async () => {
    setStatus("running");
    setMessage("");

    try {
      const result = await dispatch(submitBattleCode({ battleId, code, language })).unwrap();
      setStatus("submitted");
      
      if (result.status === "PASSED") {
        if (currentBattle?.status === "WAITING") {
          setMessage("✅ All test cases passed! Waiting for opponent to join...");
        } else {
          setMessage("✅ All test cases passed! You won the battle!");
        }
      } else if (result.status === "FAILED") {
        setMessage(`❌ Some test cases failed`);
      } else if (result.status === "ERROR") {
        setMessage(`❌ Compilation/Runtime Error: ${result.error || ''}`);
      } else {
        setMessage(`⚠️ ${result.status}: ${result.message || ''}`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(`❌ Error: ${error.message || 'Submission failed'}`);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(LANGUAGES[lang].defaultCode);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* LEFT — Problem */}
      <div className="w-[40%] border-r border-gray-300 overflow-y-auto">
        <BattleProblem problem={currentBattle?.problem} />
      </div>

      {/* RIGHT — IDE */}
      <div className="w-[60%] flex flex-col">
        {isBattleLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[60%] w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            {/* Waiting for opponent banner */}
            {isWaitingForOpponent && (
              <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-yellow-800">⏳ Waiting for opponent...</p>
                    <p className="text-xs text-yellow-700">Share battle ID: <span className="font-mono font-bold">{battleId}</span></p>
                  </div>
                  <p className="text-xs text-yellow-700">You can practice while waiting!</p>
                </div>
              </div>
            )}

            <EditorPane>
              <EditorToolbar
                language={language}
                onLanguageChange={handleLanguageChange}
                onRun={handleSubmit}
                status={status}
              />

              <div className="flex flex-col h-[calc(100%-3rem)]">
                <div className="flex-1">
                  <CodeEditor
                    language={LANGUAGES[language].monaco}
                    value={code}
                    onChange={(v) => setCode(v || "")}
                  />
                </div>

                <OutputPanel output={message} error={""} status={status} />
              </div>
            </EditorPane>
          </>
        )}
      </div>
    </div>
  );
}
