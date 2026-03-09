import Editor from "@monaco-editor/react";

export default function CodeEditor({ value, onChange, language, readOnly = false }) {
  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={value}
      onChange={onChange}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: readOnly,
      }}
    />
  );
}
