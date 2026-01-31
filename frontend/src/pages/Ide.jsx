import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import EditorToolbar from "../components/EditorToolbar";
import EditorPane from "../components/EditorPane";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";

import { getBattle, submitBattleCode } from "../../store/api/battle.thunk";

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

export default function Ide() {
  const { battleId } = useParams();
  const dispatch = useDispatch();

  const { currentBattle, submissionResult } = useSelector(
    (state) => state.battle
  );

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(LANGUAGES.python.defaultCode);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  // 🔥 Load battle
  useEffect(() => {
    dispatch(getBattle({ battleId }));
  }, [battleId]);

  // 🔥 Poll battle every 3s to check opponent
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getBattle({ battleId }));
    }, 6000);

    return () => clearInterval(interval);
  }, [battleId]);

  // 🔥 Watch for battle result
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

    await dispatch(
      submitBattleCode({ battleId, code, language })
    );

    setStatus("submitted");
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(LANGUAGES[lang].defaultCode);
  };

  return (
    <div className="h-screen flex overflow-hidden">
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

          <OutputPanel
            output={message}
            error={""}
            status={status}
          />
        </div>
      </EditorPane>
    </div>
  );
}
