export const TeamTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "myTeams", label: "My Teams" },
    { id: "create", label: "Create Team" },
    { id: "join", label: "Join Team" },
  ];

  return (
    <div className="flex justify-center gap-12 mb-16 border-b border-white/[0.03]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`pb-4 px-2 text-[10px] font-bold tracking-[0.2em] transition-all relative uppercase ${activeTab === tab.id
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-primary)]"></div>
          )}
        </button>
      ))}
    </div>
  );
};
