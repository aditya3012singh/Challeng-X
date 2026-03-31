import Editor from "@monaco-editor/react";
import { useTheme } from "../context/ThemeContext";

export default function CodeEditor({ value, onChange, language, readOnly = false, onMount }) {
  const { theme } = useTheme();

  return (
    <Editor
      height="100%"
      language={language}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      value={value}
      onChange={onChange}
      onMount={onMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: readOnly,
      }}
    />
  );
}
