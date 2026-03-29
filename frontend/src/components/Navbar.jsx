import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../store/api/auth.thunk";
import { Menu, X, User, Shield, LogOut, Award, Activity, History, Bell } from 'lucide-react';
import React, { useState } from 'react';
import NotificationsDropdown from "./notifications/NotificationsDropdown";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
    { label: "MATCHMAKING", path: "/matchmaking" },
    { label: "BATTLE ROOM", path: "/battles" },
    { label: "CONTESTS", path: "/contests" },
    { label: "LIVE ARENAS", path: "/live" },
    { label: "TEAM WARS", path: "/team-battle" },
    { label: "SQUID GAME", path: "/squid-game" },
    { label: "ACHIEVEMENTS", path: "/achievements" },
    { label: "JOIN LOBBY", path: "/join-room" },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ label: "HOST CONTEST", path: "/admin-contests" });
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] font-[family:var(--font-heading)] transition-all duration-300">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-20 flex justify-between items-center relative">

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

        {/* NAVIGATION (Desktop) */}
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

        {/* USER / AUTH / MOBILE TOGGLE */}
        <div className="flex items-center gap-4 md:gap-6">
          {isAuthenticated ? (
            <>
              {/* Leaderboard Link for Desktop */}
              <button
                onClick={() => navigate("/leaderboard")}
                className="text-[var(--color-text-muted)] hover:text-white transition hidden lg:block text-[10px] font-bold tracking-widest"
              >
                LEADERBOARD
              </button>

              <div className="h-8 w-[1px] bg-gray-800 hidden lg:block"></div>

              {/* Notifications Bell */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative p-2 transition-all group ${isNotificationsOpen ? 'text-[var(--color-primary)]' : 'text-slate-400 hover:text-white'}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(220,38,38,0.5)]">
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

              {/* User Profile (Desktop) */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest leading-none mb-1">PLAYER</div>
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

                  {/* Desktop Dropdown */}
                  <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-[-10px] group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto z-50">
                    <div className="bg-[#050505] border border-white/10 shadow-2xl overflow-hidden" style={{ borderRadius: "2px" }}>
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
                          className="block w-full text-left px-6 py-4 text-[9px] font-bold text-slate-400 hover:bg-white/5 hover:text-[var(--color-primary)] transition-all uppercase tracking-[0.2em]"
                        >
                          My Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-6 py-4 text-[9px] font-bold text-red-500/80 hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.2em] border-t border-white/5"
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
            {isAuthenticated && (
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={24} /> : (
                  <div className="relative">
                    <Menu size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-[#050505]"></span>
                    )}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isAuthenticated && (
        <div className={`xl:hidden fixed inset-0 top-20 bg-[#050505]/95 backdrop-blur-2xl z-[49] transform transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col p-6 overflow-y-auto pb-32">
            
            {/* User Quick Stats */}
            <div className="mb-10 p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-[var(--color-primary)]/50 p-0.5 overflow-hidden text-center justify-center">
                   {user?.profilePic ? (
                      <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#111] flex items-center justify-center text-[var(--color-primary)] font-black text-xl">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Authenticated Player</div>
                  <div className="text-xl font-black text-white leading-none tracking-tight">{user?.username}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-black text-white tabular-nums">{user?.rankPoints || 1000}</span>
                    <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">ELO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-black text-blue-500 tabular-nums">{user?.cyberCores || 0}</span>
                    <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">CORES</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-1 gap-1 mb-10">
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.4em] mb-4 px-4">ARENA PROTOCOLS</div>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                  className={`w-full text-left px-6 py-4 rounded-xl flex items-center justify-between group transition-all ${isActive(item.path) ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-slate-400 hover:bg-white/5'}`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
                  <div className={`w-1.5 h-1.5 rounded-full transition-all ${isActive(item.path) ? 'bg-[var(--color-primary)] shadow-[0_0_10px_rgba(255,170,0,0.5)]' : 'bg-transparent group-hover:bg-white/20'}`} />
                </button>
              ))}
            </div>

            {/* Account Actions */}
            <div className="mt-auto space-y-2 border-t border-white/5 pt-8">
              <button 
                onClick={() => { navigate(`/profile/${user?.username}`); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors"
              >
                <User size={16} className="text-slate-600" /> View Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 text-red-500/80 font-bold text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                <LogOut size={16} /> Terminate Session
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
