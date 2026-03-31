export default function EditorPane({ children }) {
  return (
    <div className="flex-1 bg-[var(--color-bg-dark)] border-l border-[var(--glass-border)] shadow-lg rounded-tl-2xl">
      {children}
    </div>
  );
}
