import { useState } from "react";
import EditorToolbar from "../components/EditorToolbar";
import EditorPane from "../components/EditorPane";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";

const LANGUAGES = {
  javascript: {
    monaco: "javascript",
    defaultCode: `console.log("Hello JavaScript");`,
  },
  python: {
    monaco: "python",
    defaultCode: `print("Hello Python")`,
  },
  java: {
    monaco: "java",
    defaultCode: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello Java");
  }
}`,
  },
};

export default function Ide() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(LANGUAGES.python.defaultCode);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  const runCode = async () => {
    setStatus("running");
    setOutput("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      console.log("RUN RESPONSE:", data, typeof data.output);
      if (data.error) {
        setError(data.error);
        setStatus("error");
      } else {
        setOutput(data.output);
        setStatus("success");
      }
    } catch (e) {
      setError("Failed to reach backend");
      setStatus("error");
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(LANGUAGES[lang].defaultCode);
    setOutput("");
    setError("");
    setStatus("idle");
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* <Sidebar /> */}

      <EditorPane>
        <EditorToolbar
          language={language}
          onLanguageChange={handleLanguageChange}
          onRun={runCode}
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
            output={output}
            error={error}
            status={status}
          />
        </div>
      </EditorPane>
    </div>
  );
}
