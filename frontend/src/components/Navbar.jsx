import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../store/api/auth.thunk";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

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
    { label: "MATCHMAKING", path: "/matchmaking", icon: "📡" },
    { label: "BATTLE ROOM", path: "/battles", icon: "⚔️" },
    { label: "TEAM WARS", path: "/team-battle", icon: "🛡️" },
    { label: "SQUID PROTOCOL", path: "/squid-mode", icon: "🦑" },
    { label: "JOIN LOBBY", path: "/join-room", icon: "🔑" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] shadow-lg font-[family:var(--font-heading)]">
      <div className="max-w-[1800px] mx-auto px-6 h-20 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[var(--color-primary)] text-black flex items-center justify-center font-black text-xl clip-path-polygon group-hover:shadow-[0_0_15px_var(--color-primary)] transition-all" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)" }}>
            CA
          </div>
          <div>
            <span className="text-xl font-bold tracking-widest text-white block leading-none">CODE</span>
            <span className="text-sm font-bold tracking-[0.3em] text-[var(--color-primary)] block leading-none">ARENA</span>
          </div>
        </Link>

        {/* NAVIGATION */}
        {isAuthenticated && (
          <div className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2 border-b-2 transition-all ${isActive(item.path)
                  ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[rgba(0,240,255,0.05)]"
                  : "text-gray-400 border-transparent hover:text-white hover:bg-[rgba(255,255,255,0.02)]"
                  }`}
              >
                <span className="text-lg opacity-70">{item.icon}</span>
                {item.label}
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
                  <div className="w-10 h-10 border border-[var(--color-primary)] p-0.5 rounded-sm">
                    <div className="w-full h-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Hover Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-black border border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-[-10px] group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                    <div className="p-3 border-b border-gray-800 text-center">
                      <div className="text-xs text-gray-500">CURRENT RATING</div>
                      <div className="text-xl font-bold text-[var(--color-success)]">{user?.rankPoints || 0}</div>
                    </div>
                    <button onClick={() => navigate('/history')} className="block w-full text-left px-4 py-3 text-sm hover:bg-[var(--color-primary)] hover:text-black transition-colors">
                      BATLLE HISTORY
                    </button>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-900/20 transition-colors">
                      DISCONNECT
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-6 py-2 text-sm font-bold text-white hover:text-[var(--color-primary)] transition-colors">
                LOGIN
              </Link>
              <Link to="/register" className="px-6 py-2 bg-[var(--color-primary)] text-black text-sm font-bold clip-path-polygon hover:bg-white transition-colors" style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}>
                REGISTER
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
