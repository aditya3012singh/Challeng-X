import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0f14] text-gray-200">

      {/* HERO */}
      <section className="text-center py-20 px-6 bg-[#0f1720] border-b border-gray-800">
        <h1 className="text-5xl font-bold text-white mb-6">
          Real-Time Coding Battles ⚔️
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
          No tutorials. No hints. <span className="font-semibold text-white">Just skill vs skill.</span>
        </p>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Fight coding duels with random players, challenge friends in private
          rooms, or survive elimination rounds in Squid Game style contests.
        </p>

        <div className="flex justify-center gap-6 flex-wrap mb-6">
          <button
            onClick={() => navigate("/battles")}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Find Match
          </button>

          <button
            onClick={() => navigate("/battles")}
            className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition"
          >
            Create Room
          </button>
        </div>

        <p className="text-red-400 font-semibold animate-pulse">
          🔴 128 players battling right now
        </p>

        <p className="text-gray-500 mt-4">
          Supports Python • Java • C++ • JavaScript
        </p>
      </section>

      {/* GAME MODES */}
      <section className="py-20 px-6 bg-[#0b0f14]">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Game Modes in CodeArena
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "⚔️ 1v1 Duel",
              desc: "Classic head-to-head coding battle. First player to submit the correct solution wins ELO points.",
            },
            {
              title: "🧑‍🤝‍🧑 6v6 Team Battle",
              desc: "Each team has 6 players and 6 different problems. Every player solves a unique challenge. The first team to complete all 6 problems wins.",
            },
            {
              title: "🦑 Squid Game Mode",
              desc: "Many players join. Each round difficulty increases. Slowest players get eliminated until only one survives.",
            },
          ].map((mode, i) => (
            <div key={i} className="bg-[#111827] p-8 rounded-lg border border-gray-800 text-center hover:border-blue-500 transition">
              <h3 className="text-2xl font-bold mb-4 text-white">{mode.title}</h3>
              <p className="text-gray-400">{mode.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-[#0f1720] border-y border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          How CodeArena Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">
          {[
            {
              title: "1. Create or Join",
              desc: "Start a public match, create a private room, or join using a 6-digit code.",
            },
            {
              title: "2. Real-time IDE",
              desc: "Compete in a live coding environment with equal problems and time.",
            },
            {
              title: "3. Win & Climb",
              desc: "Gain ELO, win battles, survive rounds, and climb the leaderboard.",
            },
          ].map((step, i) => (
            <div key={i} className="bg-[#111827] p-8 rounded-lg border border-gray-800">
              <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
              <p className="text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section className="py-20 px-6 bg-[#0b0f14]">
        <h2 className="text-3xl font-bold text-center mb-10 text-white">
          Top Players Today 🏆
        </h2>

        <div className="max-w-md mx-auto bg-[#111827] rounded-lg p-6 border border-gray-800">
          <p className="flex justify-between mb-2 text-gray-300"><span>#1 codeNinja</span> <span>1842 ELO</span></p>
          <p className="flex justify-between mb-2 text-gray-300"><span>#2 byteMaster</span> <span>1760 ELO</span></p>
          <p className="flex justify-between text-gray-300"><span>#3 aditya</span> <span>1702 ELO</span></p>
        </div>

        <p className="text-center text-gray-500 mt-4">
          Spectate live battles (coming soon)
        </p>
      </section>

      {/* WHY CODEARENA */}
      <section className="bg-[#0f1720] py-20 px-6 border-t border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Why CodeArena?
        </h2>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center text-gray-300">
          <div>⚡<p className="font-semibold">Real-time Battles</p></div>
          <div>👥<p className="font-semibold">Multiplayer Modes</p></div>
          <div>🔒<p className="font-semibold">Private Rooms</p></div>
          <div>🏆<p className="font-semibold">ELO & Leaderboard</p></div>
        </div>
      </section>

      <div className="border-t border-gray-800 my-10"></div>

      {/* PROFILE */}
      {user && (
        <section className="py-20 px-6 text-center">
          <h2 className="text-2xl font-bold mb-6 text-white">Your Profile</h2>

          <div className="bg-[#111827] p-8 rounded-lg border border-gray-800 inline-block text-left text-gray-300">
            <p><span className="font-medium">Username:</span> {user.username}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
            <p>
              <span className="font-medium">Rating:</span>{" "}
              {user.rankPoints || "N/A"}
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;




// [ Team Chat ]

// • I'm stuck
// • Solved mine
// • Need help
// • 2 left
// • Hurry up
// Plus small text input limited to 60 chars.