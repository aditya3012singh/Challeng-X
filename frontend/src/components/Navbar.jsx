import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../store/api/auth.thunk";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  return (
    <nav className="bg-[#0f0f0f] border-b border-gray-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">

          {/* LEFT — Brand */}
          <Link to="/" className="text-2xl font-bold tracking-wide">
            CodeArena ⚔️
          </Link>

          {/* CENTER — Game Actions */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button
                onClick={() => navigate("/matchmaking")}
                className="hover:text-blue-400 transition"
              >
                🎯 Find Match
              </button>

              <button
                onClick={() => navigate("/battles")}
                className="hover:text-purple-400 transition"
              >
                ⚔️ 1v1 Battle
              </button>

              <button
                onClick={() => navigate("/team-battle")}
                className="hover:text-green-400 transition"
              >
                🧑‍🤝‍🧑 Team Battle
              </button>

              <button
                onClick={() => navigate("/squid-mode")}
                className="hover:text-pink-400 transition"
              >
                🦑 Squid Mode
              </button>

              <button
                onClick={() => navigate("/join-room")}
                className="hover:text-yellow-400 transition"
              >
                🔑 Join Room
              </button>
            </div>
          )}

          {/* RIGHT — Stats + User */}
          <div className="flex items-center gap-5">

            {isAuthenticated && (
              <>
                {/* Live Online Count */}
                {/* <div className="hidden lg:flex items-center text-green-400 text-sm font-semibold">
                  🟢 128 Online
                </div> */}

                {/* Leaderboard */}
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="hover:text-orange-400 transition text-sm"
                >
                  🏆 Leaderboard
                </button>

                {/* History */}
                <button
                  onClick={() => navigate("/history")}
                  className="hover:text-gray-300 transition text-sm"
                >
                  📜 History
                </button>

                {/* Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm">
                    {user?.rankPoints || 0} ELO
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-400 hover:text-red-500 transition"
                >
                  Logout
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link to="/login" className="text-sm hover:text-gray-300">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
