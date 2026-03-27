import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSubmission } from "../hooks/useSubmission";
import axiosInstance from "../../lib/axios";
import { BattleProblem } from "../components/BattleProblem";
import EditorToolbar from "../components/EditorToolbar";
import EditorPane from "../components/EditorPane";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";

const LANGUAGES = {
  java: { monaco: "java", defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello contest!");\n    }\n}` },
  cpp: { monaco: "cpp", defaultCode: `#include <iostream>\nint main() {\n  std::cout << "Hello\\n";\n  return 0;\n}` },
  python: { monaco: "python", defaultCode: `print("Hello world")`},
  javascript: { monaco: "javascript", defaultCode: `console.log("Hello JS")`},
};

export default function ContestArena() {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [contest, setContest] = useState(null);
  
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(LANGUAGES["java"].defaultCode);
  const [message, setMessage] = useState("");

  const {
    handleSubmit: handleContestSubmit,
    status: submissionStatus,
  } = useSubmission();

  useEffect(() => {
    const init = async () => {
      try {
         const [probRes, conRes] = await Promise.all([
             axiosInstance.get(`/problem/${problemId}`),
             axiosInstance.get(`/contest/${contestId}`)
         ]);
         setProblem(probRes.data.problem || probRes.data);
         setContest(conRes.data.contest);
      } catch (e) {
         console.error(e);
      }
    };
    init();
  }, [contestId, problemId]);

  const handleSubmit = async () => {
      setMessage("Evaluating codebase...");
      try {
          // Send request with contestId
          await handleContestSubmit({ code, language, problemId, contestId });
          setMessage("Submitted. Waiting for full execution to complete... check leaderboard later!");
      } catch (err) {
          setMessage(`Error: ${err.message}`);
      }
  };

  const statusMap = () => {
      if (submissionStatus?.isProcessing) return "running";
      if (submissionStatus?.status === "PASSED") return "success";
      if (submissionStatus?.status === "FAILED") return "error";
      return "idle";
  };

  if (!problem || !contest) return <div className="h-screen flex items-center justify-center bg-[#050505] text-[var(--color-primary)] font-mono uppercase">Loading Arena...</div>;

  return (
    <div className="h-screen flex bg-[#050505] flex-col overflow-hidden pt-20">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between px-6 py-3 bg-black border-b border-white/[0.03] z-50 shrink-0">
          <button
              onClick={() => navigate(`/contests/${contestId}`)}
              className="px-6 py-2 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all"
          >
              ← RETURN TO CONTEST PAGE
          </button>
          <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Competitive Arena: {contest.title}
          </div>
      </div>

      <div className="flex flex-1 min-h-0">
          {/* LEFT — Problem Info */}
          <div className="w-[35%] border-r border-slate-800">
             <BattleProblem problem={problem} />
          </div>

          {/* RIGHT — IDE */}
          <div className="w-[65%] bg-[#080808] flex flex-col h-full">
              <EditorPane>
                  <EditorToolbar
                      language={language}
                      onLanguageChange={(lang) => { setLanguage(lang); setCode(LANGUAGES[lang]?.defaultCode || ""); }}
                      onRun={handleSubmit}
                      onSubmit={handleSubmit}
                      attempts={0}
                      status={statusMap()}
                      loadingAction={submissionStatus?.isProcessing ? "SUBMIT" : null}
                  />
                  <div className="flex flex-col h-[calc(100%-3rem)]">
                      <div className="flex-1 min-h-0">
                          <CodeEditor
                              language={LANGUAGES[language]?.monaco || language}
                              value={code}
                              onChange={(v) => setCode(v || "")}
                          />
                      </div>
                      <div className="h-[30%] min-h-[150px] border-t border-slate-800 bg-[#0a0a0a]">
                          <OutputPanel 
                              status={statusMap()} 
                              message={message}
                          />
                      </div>
                  </div>
              </EditorPane>
          </div>
      </div>
    </div>
  );
}
