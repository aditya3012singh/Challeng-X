import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getBattle({ battleId }));
    }, 6000);

    return () => clearInterval(interval);
  }, [battleId]);

  useEffect(() => {
    if (!currentBattle) return;

    if (currentBattle.status === "FINISHED") {
      setMessage(`🏆 Winner: ${currentBattle.winnerName}`);
      setStatus("finished");
    } else if (submissionResult) {
      setMessage("✅ Code submitted. Waiting for opponent...");
      setStatus("waiting");
    }
  }, [currentBattle, submissionResult]);

  const handleSubmit = async () => {
    setStatus("running");
    setMessage("");

    await dispatch(submitBattleCode({ battleId, code, language }));

    setStatus("submitted");
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
        ) : isWaitingForOpponent ? (
          <WaitingForOpponent battleId={battleId} />
        ) : (
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
        )}
      </div>
    </div>
  );
}
