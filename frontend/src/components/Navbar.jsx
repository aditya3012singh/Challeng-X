import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../store/api/auth.thunk";
import { 
  Menu, 
  X, 
  User, 
  Shield, 
  LogOut, 
  Bell, 
  ChevronRight, 
  Sun, 
  Moon, 
  Home, 
  Zap, 
  Trophy, 
  Target, 
  LogIn 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from "../context/ThemeContext";
import NotificationsDropdown from "./notifications/NotificationsDropdown";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close sidebar on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isMenuOpen) {
        if (!event.target.closest('.mobile-menu-toggle')) {
          setIsMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Hide navbar completely when inside the battle IDE or spectator mode
  const isBattleIde = /^\/battle\/[^/]+\/ide/.test(location.pathname);
  const isSpectator = /^\/spectate\/[^/]+/.test(location.pathname);
  if (isBattleIde || isSpectator) return null;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    // { label: "MATCHMAKING", path: "/matchmaking", type: "link" },
    // {
    //   label: "ARENA",
    //   type: "dropdown",
    //   items: [
    //     { label: "Battle Room", path: "/battles", icon: <Shield size={14} /> },
    //     // { label: "Team Wars", path: "/team-battle", icon: <User size={14} /> },
    //     // { label: "Squid Game", path: "/squid-game", icon: <Shield size={14} /> },
    //   ]
    // },
    // { label: "LIVE ARENAS", path: "/live", type: "link" },
    // {
    //   label: "CONTESTS",
    //   type: "dropdown",
    //   items: [
    //     { label: "All Contests", path: "/contests", icon: <Award size={14} /> },
    //     { label: "Leaderboard", path: "/leaderboard", icon: <Activity size={14} /> },
    //     { label: "Achievements", path: "/achievements", icon: <Award size={14} /> },
    //     ...(user?.role === "ADMIN" ? [{ label: "Host Contest", path: "/admin-contests", icon: <Shield size={14} /> }] : []),
    //   ]
    // },
    { label: "Home", path: "/", icon: <Home className="size-4" /> },
    { label: "Battles", path: "/battles", icon: <Zap className="size-4" /> },
    { label: "Leaderboard", path: "/leaderboard", icon: <Trophy className="size-4" /> },
    { label: "JOIN LOBBY", path: "/join-room", type: "link" },
    // { label: "Tournaments", path: "/contests", icon: <Target className="size-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/10 font-[family:var(--font-heading)] transition-all duration-300 h-16">
      <div className="max-w-[1400px] mx-auto px-8 h-full flex justify-between items-center relative">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-lg bg-neutral-200 flex justify-center items-center text-neutral-900 font-bold text-xl transition-all duration-300 group-hover:bg-slate-300">
            X
          </div>
          <span className="font-[family:var(--font-heading)] font-semibold text-lg leading-7 tracking-tight text-white">
            ChallengX
          </span>
        </Link>

        {/* NAVIGATION (Desktop) */}
        <div className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`transition-all rounded-lg text-sm leading-5 flex px-3 py-2 items-center gap-2 cursor-pointer font-[family:var(--font-body)] ${
                isActive(item.path) 
                  ? "bg-white/10 text-white font-semibold" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {/* Guest Login CTA */}
          {!isAuthenticated && (
            <button 
              onClick={() => navigate("/login")}
              className="rounded-full bg-neutral-200 hover:bg-slate-300 text-neutral-900 ml-3 px-5 h-9 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <LogIn className="size-4" />
              Login
            </button>
          )}
        </div>

        {/* ACTIONS (Right Side - Authenticated & Theme Controls) */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated && (
            <>
              <div className="h-6 w-[1px] bg-white/10 hidden lg:block"></div>
              
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative p-2 transition-all cursor-pointer ${isNotificationsOpen ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#09090b] shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationsDropdown
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                />
              </div>

              <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>

              {/* User Avatar & Submenu Dropdown */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block select-none">
                  <div className="text-[8px] text-neutral-500 uppercase tracking-widest leading-none mb-1">PLAYER</div>
                  <div className="text-xs font-bold text-white leading-none">{user?.username}</div>
                </div>
                <div className="relative group cursor-pointer">
                  <div className="w-9 h-9 border border-white/10 p-0.5 rounded-sm overflow-hidden bg-neutral-900">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute right-0 top-full pt-2 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-[-10px] group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto z-50">
                    <div className="bg-[#18181b] border border-white/5 shadow-2xl overflow-hidden" style={{ borderRadius: "2px" }}>
                      <div className="grid grid-cols-2 border-b border-white/5 bg-white/[0.01]">
                        <div className="p-3 border-r border-white/5 text-center">
                          <div className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Rating</div>
                          <div className="text-base font-black text-white tabular-nums">{user?.rankPoints || 1000}</div>
                        </div>
                        <div className="p-3 text-center">
                          <div className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Cores</div>
                          <div className="text-base font-black text-blue-500 tabular-nums">{user?.cyberCores || 0}</div>
                        </div>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => navigate(`/profile/${user?.username}`)}
                          className="block w-full text-left px-5 py-3 text-[9px] font-bold text-neutral-400 hover:bg-white/5 hover:text-white transition-all uppercase tracking-wider"
                        >
                          My Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-5 py-3 text-[9px] font-bold text-red-500/80 hover:bg-red-500 hover:text-white transition-all uppercase tracking-wider border-t border-white/5"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <div className="flex xl:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white transition-colors mobile-menu-toggle cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={22} /> : (
                <div className="relative">
                  <Menu size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-[#09090b]"></span>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR NAVIGATION */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              ref={sidebarRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="xl:hidden fixed top-0 right-0 h-screen w-[280px] bg-[#09090b] border-l border-white/5 z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-sm" style={{ borderRadius: "2px" }}>
                    X
                  </div>
                  <span className="text-xs font-bold tracking-widest text-white uppercase">Menu</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0">
                {isAuthenticated && (
                  <div className="mb-10 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-sm border border-white/10 p-0.5 overflow-hidden">
                        {user?.profilePic ? (
                          <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#111] flex items-center justify-center text-white font-black text-sm">
                            {user?.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white leading-none mb-1">{user?.username}</div>
                        <div className="text-[8px] text-neutral-500 uppercase tracking-widest leading-none">Authenticated</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div>
                        <div className="text-[7px] font-bold text-neutral-500 uppercase mb-0.5">Rating</div>
                        <div className="text-xs font-black text-white tabular-nums">{user?.rankPoints || 1000}</div>
                      </div>
                      <div>
                        <div className="text-[7px] font-bold text-neutral-500 uppercase mb-0.5">Cores</div>
                        <div className="text-xs font-black text-blue-500 tabular-nums">{user?.cyberCores || 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3.5 rounded-md flex items-center justify-between group transition-all cursor-pointer ${
                        isActive(item.path) 
                          ? 'bg-white/10 text-white font-semibold' 
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive(item.path) ? 'text-white' : 'text-neutral-500'}>{item.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{item.label}</span>
                      </div>
                      <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive(item.path) ? 'opacity-100' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-white/5 space-y-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => { navigate(`/profile/${user?.username}`); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 font-bold text-[9px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all rounded-md cursor-pointer"
                    >
                      <User size={14} /> My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500/80 font-bold text-[9px] uppercase tracking-widest hover:bg-red-500/10 hover:text-white transition-all rounded-md cursor-pointer"
                    >
                      <LogOut size={14} /> Terminate
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { navigate("/login"); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-200 hover:bg-slate-300 text-neutral-900 font-bold text-[10px] uppercase tracking-widest transition-all rounded-md cursor-pointer"
                  >
                    <LogIn size={14} /> Authenticate
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
