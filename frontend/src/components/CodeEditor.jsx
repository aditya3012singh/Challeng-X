import Editor from "@monaco-editor/react";

export default function CodeEditor({ value, onChange, language, readOnly = false, onMount }) {
  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
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
