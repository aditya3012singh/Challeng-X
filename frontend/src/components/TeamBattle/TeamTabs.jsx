export const TeamTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "myTeams", label: "My Teams" },
    { id: "create", label: "Create Team" },
    { id: "join", label: "Join Team" },
    { id: "battle", label: "Active Tournaments" },
  ];

  return (
    <div className="flex justify-center gap-4 mb-8 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === tab.id
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
