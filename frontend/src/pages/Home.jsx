import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="text-center py-20 px-6 bg-white shadow-sm">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Real-Time Coding Battles ⚔️
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
          No tutorials. No hints. <span className="font-semibold">Just skill vs skill.</span>
        </p>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
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

        {/* LIVE STRIP */}
        <p className="text-red-500 font-semibold animate-pulse">
          🔴 128 players battling right now
        </p>

        {/* LANGUAGES */}
        <p className="text-gray-500 mt-4">
          Supports Python • Java • C++ • JavaScript
        </p>
      </section>

      {/* GAME MODES */}
      <section className="py-20 px-6 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-12">
          Game Modes in CodeArena
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h3 className="text-2xl font-bold mb-4">⚔️ 1v1 Duel</h3>
            <p className="text-gray-600">
              Classic head-to-head coding battle. First player to submit the
              correct solution wins ELO points.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h3 className="text-2xl font-bold mb-4">🧑‍🤝‍🧑 6v6 Team Battle</h3>
            <p className="text-gray-600">
              Each team has 6 players and 6 different problems. Every player solves a
              unique challenge. The first team to complete all 6 problems wins.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h3 className="text-2xl font-bold mb-4">🦑 Squid Game Mode</h3>
            <p className="text-gray-600">
              Many players join. Each round difficulty increases. Slowest
              players get eliminated until only one survives.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          How CodeArena Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">1. Create or Join</h3>
            <p className="text-gray-600">
              Start a public match, create a private room, or join using a
              6-digit code.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">2. Real-time IDE</h3>
            <p className="text-gray-600">
              Compete in a live coding environment with equal problems and time.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">3. Win & Climb</h3>
            <p className="text-gray-600">
              Gain ELO, win battles, survive rounds, and climb the leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">
          Top Players Today 🏆
        </h2>

        <div className="max-w-md mx-auto bg-gray-100 rounded-lg p-6 shadow">
          <p className="flex justify-between mb-2"><span>#1 codeNinja</span> <span>1842 ELO</span></p>
          <p className="flex justify-between mb-2"><span>#2 byteMaster</span> <span>1760 ELO</span></p>
          <p className="flex justify-between"><span>#3 aditya</span> <span>1702 ELO</span></p>
        </div>

        <p className="text-center text-gray-500 mt-4">
          Spectate live battles (coming soon)
        </p>
      </section>

      {/* WHY CODEARENA */}
      <section className="bg-blue-50 py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why CodeArena?
        </h2>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
          <div>⚡<p className="font-semibold">Real-time Battles</p></div>
          <div>👥<p className="font-semibold">Multiplayer Modes</p></div>
          <div>🔒<p className="font-semibold">Private Rooms</p></div>
          <div>🏆<p className="font-semibold">ELO & Leaderboard</p></div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="border-t my-10"></div>

      {/* PROFILE */}
      {user && (
        <section className="py-20 px-6 text-center">
          <h2 className="text-2xl font-bold mb-6">Your Profile</h2>

          <div className="bg-white p-8 rounded-lg shadow inline-block text-left">
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