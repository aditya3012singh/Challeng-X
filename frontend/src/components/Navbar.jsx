import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../store/api/auth.thunk";
import { Menu, X, User, Shield, LogOut, Award, Activity, History, Bell, ChevronRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.png";
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
    { label: "MATCHMAKING", path: "/matchmaking", type: "link" },
    {
      label: "ARENA",
      type: "dropdown",
      items: [
        { label: "Battle Room", path: "/battles", icon: <Shield size={14} /> },
        // { label: "Team Wars", path: "/team-battle", icon: <User size={14} /> },
        // { label: "Squid Game", path: "/squid-game", icon: <Shield size={14} /> },
      ]
    },
    { label: "LIVE ARENAS", path: "/live", type: "link" },
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
    { label: "JOIN LOBBY", path: "/join-room", type: "link" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] font-[family:var(--font-heading)] transition-all duration-300">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-20 flex justify-between items-center relative">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-10 overflow-hidden" style={{ borderRadius: "2px" }}>
            <img
              src={logo}
              alt="ChallengX Logo"
              className="w-full h-full object-contain scale-[1.5] transition-transform group-hover:scale-[1.6]"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-black tracking-tighter text-[var(--color-text-main)] uppercase leading-none">
              CHALLENG<span className="text-[var(--color-primary)]">X</span>
            </span>
            <span className="hidden md:block text-[8px] font-bold tracking-[0.3em] text-[var(--color-text-muted)] uppercase opacity-30 mt-1">Arena Platform</span>
          </div>
        </Link>

        {/* NAVIGATION (Desktop) */}
        <div className="hidden xl:flex items-center gap-10">
          {navItems.map((item) => (
            item.type === "link" ? (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[10px] font-bold tracking-[0.3em] transition-all hover:text-[var(--color-primary)] ${isActive(item.path) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
              >
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className="relative group py-8">
                <button className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.3em] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-all">
                  {item.label}
                  <ChevronRight size={10} className="rotate-90 opacity-40 group-hover:opacity-100 transition-all" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-[-10px] group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto z-50">
                  <div className="bg-[var(--color-bg-dark)] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[240px] overflow-hidden" style={{ borderRadius: "2px" }}>
                    <div className="bg-white/[0.01] p-3 border-b border-white/5">
                      <div className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em]">{item.label} PROTOCOLS</div>
                    </div>
                    <div className="py-2">
                      {item.items.map((subItem) => (
                        <button
                          key={subItem.path}
                          onClick={() => navigate(subItem.path)}
                          className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-all group/item ${isActive(subItem.path) ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-main)]'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`transition-transform group-hover/item:scale-110 ${isActive(subItem.path) ? 'text-[var(--color-primary)]' : 'text-slate-600'}`}>
                              {subItem.icon}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{subItem.label}</span>
                          </div>
                          {isActive(subItem.path) ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]" />
                          ) : (
                            <ChevronRight size={10} className="opacity-0 group-hover/item:opacity-40 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* ACTIONS (Right Side) */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated ? (
            <>
              <div className="h-8 w-[1px] bg-gray-800 hidden lg:block"></div>
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative p-2 transition-all group ${isNotificationsOpen ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[var(--color-text-main)] text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[var(--color-bg-dark)] shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationsDropdown
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                />
              </div>

              <div className="h-8 w-[1px] bg-gray-800 hidden md:block"></div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest leading-none mb-1">PLAYER</div>
                  <div className="text-sm font-bold text-[var(--color-text-main)] leading-none">{user?.username}</div>
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
                  <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-[-10px] group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto z-50">
                    <div className="bg-[var(--color-bg-card)] border border-[var(--glass-border)] shadow-2xl overflow-hidden" style={{ borderRadius: "2px" }}>
                      <div className="grid grid-cols-2 border-b border-white/5 bg-white/[0.01]">
                        <div className="p-4 border-r border-white/5 text-center">
                          <div className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">Rating</div>
                          <div className="text-xl font-black text-[var(--color-primary)] tabular-nums">{user?.rankPoints || 1000}</div>
                        </div>
                        <div className="p-4 text-center">
                          <div className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">Cores</div>
                          <div className="text-xl font-black text-blue-500 tabular-nums">{user?.cyberCores || 0}</div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => navigate(`/profile/${user?.username}`)}
                          className="block w-full text-left px-6 py-4 text-[9px] font-bold text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-primary)] transition-all uppercase tracking-[0.2em]"
                        >
                          My Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-6 py-4 text-[9px] font-bold text-red-500/80 hover:bg-red-500 hover:text-[var(--color-text-main)] transition-all uppercase tracking-[0.2em] border-t border-white/5"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-6 md:px-8 py-2 md:py-3 bg-[var(--color-primary)] text-black text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl flex items-center" style={{ borderRadius: "2px" }}>
                ARENA ACCESS →
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <div className="flex xl:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors mobile-menu-toggle"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : (
                <div className="relative">
                  <Menu size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-[var(--color-bg-dark)]"></span>
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
              className="xl:hidden fixed top-0 right-0 h-screen w-[280px] bg-[var(--color-bg-dark)] border-l border-[var(--glass-border)] z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 overflow-hidden" style={{ borderRadius: "2px" }}>
                    <img
                      src={logo}
                      alt="ChallengX Logo"
                      className="w-full h-full object-contain scale-[1.3]"
                    />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-[var(--color-text-main)] uppercase">Menu</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0">
                {isAuthenticated && (
                  <div className="mb-10 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-sm border border-[var(--color-primary)]/40 p-0.5 overflow-hidden">
                        {user?.profilePic ? (
                          <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#111] flex items-center justify-center text-[var(--color-primary)] font-black text-sm">
                            {user?.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[var(--color-text-main)] leading-none mb-1">{user?.username}</div>
                        <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest leading-none">Authenticated</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div>
                        <div className="text-[7px] font-bold text-slate-600 uppercase mb-0.5">Rating</div>
                        <div className="text-xs font-black text-[var(--color-text-main)] tabular-nums">{user?.rankPoints || 1000}</div>
                      </div>
                      <div>
                        <div className="text-[7px] font-bold text-slate-600 uppercase mb-0.5">Cores</div>
                        <div className="text-xs font-black text-blue-500 tabular-nums">{user?.cyberCores || 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  {navItems.map((cat) => (
                    <div key={cat.label}>
                      <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em] mb-4 pl-2 border-l-2 border-[var(--color-primary)]/20">{cat.label}</div>
                      <div className="space-y-1">
                        {cat.type === "link" ? (
                          <button
                            onClick={() => { navigate(cat.path); setIsMenuOpen(false); }}
                            className={`w-full text-left px-4 py-3.5 rounded-md flex items-center justify-between group transition-all ${isActive(cat.path) ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-main)]'}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={isActive(cat.path) ? 'text-[var(--color-primary)]' : 'text-slate-600'}><Activity size={14} /></span>
                              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{cat.label}</span>
                            </div>
                            <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive(cat.path) ? 'opacity-100' : ''}`} />
                          </button>
                        ) : (
                          cat.items.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                              className={`w-full text-left px-4 py-3.5 rounded-md flex items-center justify-between group transition-all ${isActive(item.path) ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-main)]'}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={isActive(item.path) ? 'text-[var(--color-primary)]' : 'text-slate-600'}>{item.icon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{item.label}</span>
                              </div>
                              <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive(item.path) ? 'opacity-100' : ''}`} />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-white/5 space-y-2">
                <button
                  onClick={() => { navigate(`/profile/${user?.username}`); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[var(--color-text-muted)] font-bold text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all rounded-md"
                >
                  <User size={14} /> My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500/80 font-bold text-[9px] uppercase tracking-widest hover:bg-red-500/10 transition-all rounded-md"
                >
                  <LogOut size={14} /> Terminate
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

