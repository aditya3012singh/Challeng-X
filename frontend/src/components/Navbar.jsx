import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../store/api/auth.thunk";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Hide navbar completely when inside the battle IDE or spectator mode
  const isBattleIde = /^\/battle\/[^/]+\/ide/.test(location.pathname);
  const isSpectator = /^\/spectate\/[^/]+/.test(location.pathname);
  if (isBattleIde || isSpectator) return null;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "MATCHMAKING", path: "/matchmaking" },
    { label: "BATTLE ROOM", path: "/battles" },
    { label: "LIVE ARENAS", path: "/live" },
    { label: "TEAM WARS", path: "/team-battle" },
    { label: "SQUID GAME", path: "/squid-game" },
    { label: "JOIN LOBBY", path: "/join-room" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/[0.03] font-[family:var(--font-heading)]">
      <div className="max-w-[1800px] mx-auto px-6 h-20 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[var(--color-primary)] text-black flex items-center justify-center font-black text-xl hover:shadow-[0_0_20px_rgba(255,170,0,0.3)] transition-all" style={{ borderRadius: "2px" }}>
            CA
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-none">CODE</span>
            <span className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] block leading-none mt-1">ARENA</span>
          </div>
        </Link>

        {/* NAVIGATION */}
        {isAuthenticated && (
          <div className="hidden xl:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-5 py-2 text-[10px] font-bold tracking-[0.2em] transition-all relative group/item ${isActive(item.path)
                  ? "text-[var(--color-primary)]"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[var(--color-primary)] rounded-full"></div>
                )}
                {!isActive(item.path) && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-white opacity-20 group-hover/item:w-4 transition-all duration-300"></div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* USER / AUTH */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {/* Leaderboard Link for Mobile/Tablets */}
              <button
                onClick={() => navigate("/leaderboard")}
                className="text-[var(--color-text-muted)] hover:text-white transition hidden md:block"
              >
                LEADERBOARD
              </button>

              <div className="h-8 w-[1px] bg-gray-800 hidden md:block"></div>

              {/* User Profile */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">OPERATOR</div>
                  <div className="text-sm font-bold text-white leading-none">{user?.username}</div>
                </div>

                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 border border-[var(--color-primary)] p-0.5 rounded-sm overflow-hidden">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Hover Dropdown */}
                  <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-[-10px] group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto z-50">
                    <div className="bg-[#050505] border border-white/10 shadow-2xl overflow-hidden" style={{ borderRadius: "2px" }}>
                      <div className="p-5 border-b border-white/5 text-center bg-white/[0.01]">
                        <div className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-2">Current Rating</div>
                        <div className="text-2xl font-black text-[var(--color-primary)] tabular-nums">{user?.rankPoints || 1000}</div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => navigate(`/profile/${user?.username}`)}
                          className="block w-full text-left px-6 py-4 text-[9px] font-bold text-slate-400 hover:bg-white/5 hover:text-[var(--color-primary)] transition-all uppercase tracking-[0.2em]"
                        >
                          [ Operator Profile ]
                        </button>
                        <button
                          onClick={() => navigate('/history')}
                          className="block w-full text-left px-6 py-4 text-[9px] font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all uppercase tracking-[0.2em]"
                        >
                          [ Battle History ]
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-6 py-4 text-[9px] font-bold text-red-500/80 hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.2em] border-t border-white/5"
                        >
                          Disconnect Node
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-6 py-2 text-[10px] font-bold text-white hover:text-[var(--color-primary)] transition-colors uppercase tracking-widest flex items-center">
                Login
              </Link>
              <Link to="/register" className="px-8 py-3 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl" style={{ borderRadius: "2px" }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
