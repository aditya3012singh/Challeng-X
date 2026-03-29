import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Users, User, Shield, Zap, Check, X, 
    ChevronLeft, ChevronRight, UserPlus, LogOut, 
    Settings, Play, Target, Radio, MessageSquare, Send
} from 'lucide-react';
import { getSocket } from '../../lib/socket';
import { getFriends } from '../../store/api/social.thunk';
import { joinMatchmaking } from '../../store/api/matchmaking.thunk';
import { setActiveChat, addPrivateMessage, clearActiveChat } from '../../store/slices/chat.slice';
import { getChatHistory } from '../../store/api/chat.thunk';

const SocialLobby = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { currentLobby, invites, friends } = useSelector((state) => state.lobby);
    const { conversations, activeChatId } = useSelector((state) => state.chat);
    const [isOpen, setIsOpen] = useState(false);
    const [messageText, setMessageText] = useState('');
    const sidebarRef = useRef(null);
    const toggleBtnRef = useRef(null);
    const chatRef = useRef(null);
    const chatEndRef = useRef(null);
    const socket = getSocket();

    useEffect(() => {
        if (!isAuthenticated || !socket) return;

        // Fetch friends list on mount
        dispatch(getFriends());

        // Sync lobby status
        socket.emit("lobby:get_status");

        // Listen for updates
        socket.on("lobby:update", (lobby) => {
            dispatch(setLobby(lobby));
        });

        socket.on("lobby:invitation_received", (invite) => {
            dispatch(addInvite(invite));
        });

        socket.on("user_presence_update", (data) => {
            dispatch(updateUserPresence(data));
        });

        socket.on("new_private_message", (message) => {
            dispatch(addPrivateMessage({ message, myUserId: user.id }));
        });

        socket.on("message_sent_success", (message) => {
            dispatch(addPrivateMessage({ message, myUserId: user.id }));
        });

        return () => {
            socket.off("lobby:update");
            socket.off("lobby:invitation_received");
            socket.off("user_presence_update");
            socket.off("new_private_message");
            socket.off("message_sent_success");
        };
    }, [isAuthenticated, socket, dispatch]);

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            dispatch(getFriends());
        }
    }, [isOpen, isAuthenticated, dispatch]);

    const toggleMatchmaking = () => {
        const nextMode = currentLobby?.mode === 'TEAM' ? 'SOLO' : 'TEAM';
        socket.emit("lobby:set_mode", { mode: nextMode });
    };

    const handleInvite = (friendId) => {
        socket.emit("lobby:invite", { friendId });
    };

    const handleAcceptInvite = (lobbyId) => {
        socket.emit("lobby:accept_invite", { lobbyId });
        dispatch(removeInvite(lobbyId));
    };

    const handleLeaveLobby = () => {
        socket.emit("lobby:leave");
    };

    const startMatchmaking = () => {
        // Navigate to matchmaking page which will handle the actual queue join
        navigate('/matchmaking');
        setIsOpen(false);
    };

    const openChat = (friendId) => {
        dispatch(setActiveChat(friendId));
        if (!conversations[friendId]) {
            dispatch(getChatHistory(friendId));
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeChatId) return;

        socket.emit("send_private_message", {
            receiverId: activeChatId,
            text: messageText.trim()
        });

        setMessageText('');
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [conversations, activeChatId]);

    const activeFriend = friends.find(f => f.id === activeChatId);
    const activeMessages = conversations[activeChatId] || [];

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check for sidebar closing
            if (isOpen && 
                sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                toggleBtnRef.current && !toggleBtnRef.current.contains(event.target)) {
                setIsOpen(false);
                dispatch(clearActiveChat());
            }
            
            // Check for individual chat window closing (if open)
            if (activeChatId && chatRef.current && !chatRef.current.contains(event.target)) {
                // We only close if they didn't click the "Message" button again
                // (which is already inside the sidebar, but let's be safe)
                if (!event.target.closest('button[title="Direct Message"]')) {
                    dispatch(clearActiveChat());
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, activeChatId, dispatch]);

    if (!isAuthenticated) return null;

    const isLeader = currentLobby ? currentLobby.leaderId === user.id : true;
    const teamSize = currentLobby?.members.length || 1;

    return (
        <>
            {/* Toggle Button (Right Side) */}
            <button 
                ref={toggleBtnRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-4 bottom-8 z-40 p-3 rounded-full bg-[#0a0a0a] border border-[#222] text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all group ${isOpen ? '-translate-x-[calc(100vw-60px)] sm:-translate-x-[360px]' : ''}`}
                title="Social Lobby"
            >
                <div className="relative">
                    <Users size={24} className="group-hover:scale-110 transition-transform" />
                    {invites.length > 0 && (
                        <span className="absolute -top-2 -left-2 bg-[var(--color-primary)] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                            {invites.length}
                        </span>
                    )}
                </div>
            </button>

            {/* Sidebar */}
            <div 
                ref={sidebarRef}
                className={`fixed top-0 right-0 h-full w-full sm:w-[350px] bg-[#050505]/95 backdrop-blur-xl border-l border-[#1a1a1a] z-[60] transform transition-transform duration-300 ease-in-out shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                
                {/* Lobby Header */}
                <div className="p-6 border-b border-[#222] bg-[#0d0d0d]/80">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Radio className="text-[var(--color-primary)] animate-pulse" size={18} />
                            <h2 className="font-bold font-mono tracking-tighter text-sm uppercase">Arena Lobby</h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Active Party Display */}
                    <div className="bg-[#111] rounded-xl border border-[#222] p-4 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-gray-500 uppercase">Current Mode</span>
                                <span className="text-xs font-bold text-white uppercase tracking-widest">
                                    {currentLobby?.mode || 'SOLO'} MISSION
                                </span>
                            </div>
                            {isLeader && (
                                <button 
                                    onClick={toggleMatchmaking}
                                    className="p-1.5 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-primary)] text-gray-400 hover:text-[var(--color-primary)] transition-all"
                                    title="Toggle Mode"
                                >
                                    <Settings size={14} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {/* Current Members */}
                            {(currentLobby?.members || [{ id: user.id, username: user.username, profilePic: user.profilePic }]).map((m) => (
                                <div key={m.id} className="relative group/member">
                                    <div className={`w-10 h-10 rounded-lg bg-[#0a0a0a] border-2 ${m.id === currentLobby?.leaderId ? 'border-[var(--color-primary)]' : 'border-[#333]'} overflow-hidden`}>
                                        {m.profilePic ? (
                                            <img src={m.profilePic} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600 bg-[#1a1a1a]">
                                                {m.username?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    {m.id === currentLobby?.leaderId && (
                                        <div className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-black p-0.5 rounded-full">
                                            <Shield size={8} />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black border border-[#333] px-2 py-1 rounded text-[8px] whitespace-nowrap opacity-0 group-hover/member:opacity-100 transition-opacity z-10">
                                        {m.username}
                                    </div>
                                </div>
                            ))}
                            {/* Empty Slots */}
                            {Array.from({ length: 5 - teamSize }).map((_, i) => (
                                <div key={`empty-${i}`} className="w-10 h-10 rounded-lg border-2 border-dashed border-[#222] flex items-center justify-center text-[#222]">
                                    <UserPlus size={16} />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={startMatchmaking}
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[var(--color-primary)] hover:bg-[#ccff00] text-black rounded-lg font-bold font-mono text-[10px] uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(204,255,0,0.2)]"
                            >
                                <Play size={12} fill="currentColor" /> Ready Up
                            </button>
                            {currentLobby && (
                                <button 
                                    onClick={handleLeaveLobby}
                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all"
                                    title="Leave Lobby"
                                >
                                    <LogOut size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Invitations Section */}
                {invites.length > 0 && (
                    <div className="p-4 border-b border-[#222] bg-[#0f0a0a]">
                        <h3 className="text-[10px] font-mono text-red-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                            <Zap size={10} /> Incoming transmissions
                        </h3>
                        <div className="space-y-2">
                            {invites.map((inv) => (
                                <div key={inv.lobbyId} className="p-3 bg-black border border-red-500/20 rounded-lg flex items-center justify-between group animate-pulse">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-[#111] border border-[#222] overflow-hidden">
                                            <img src={inv.from.profilePic} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-300 font-bold">{inv.from.username}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleAcceptInvite(inv.lobbyId)}
                                            className="p-1.5 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black transition-all border border-green-500/20"
                                        >
                                            <Check size={12} />
                                        </button>
                                        <button 
                                            onClick={() => dispatch(removeInvite(inv.lobbyId))}
                                            className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-black transition-all border border-red-500/20"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Friends List (Online Tracking) */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 flex items-center justify-between border-b border-[#111]">
                        <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Squad Selection</h3>
                        <span className="text-[10px] font-mono text-[var(--color-primary)]">{friends.filter(f => f.isOnline).length} Online</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {friends.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-8">
                                <UserPlus size={40} className="mb-4" />
                                <p className="text-[10px] font-mono uppercase">Go to matchmaking and add friends to form a squad</p>
                            </div>
                        ) : (
                            [...friends].sort((a,b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0)).map((friend) => (
                                <div key={friend.id} className="flex items-center justify-between group/friend">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className={`w-10 h-10 rounded-xl bg-[#0a0a0a] border ${friend.isOnline ? 'border-[var(--color-primary)]/50' : 'border-[#222]'} overflow-hidden transition-colors`}>
                                                {friend.profilePic ? (
                                                    <img src={friend.profilePic} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600 bg-[#1a1a1a]">
                                                        {friend.username?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {friend.isOnline && (
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <Link to={`/profile/${friend.username}`} onClick={() => setIsOpen(false)} className="text-xs font-bold font-mono text-gray-300 hover:text-[var(--color-primary)] transition-colors">
                                                {friend.username}
                                            </Link>
                                            <span className="text-[8px] font-mono text-gray-600 uppercase tracking-tighter">
                                                LVL {Math.floor(friend.rankPoints / 100)} • {friend.isOnline ? 'Active' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {friend.isOnline ? (
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => openChat(friend.id)}
                                                className="p-1.5 rounded-lg bg-[#111] border border-[#222] hover:border-[var(--color-primary)] text-gray-400 hover:text-[var(--color-primary)] transition-all"
                                                title="Direct Message"
                                            >
                                                <MessageSquare size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleInvite(friend.id)}
                                                className="px-3 py-1.5 rounded-lg bg-[#111] border border-[#222] hover:border-[var(--color-primary)] text-gray-500 hover:text-[var(--color-primary)] opacity-0 group-hover/friend:opacity-100 transition-all font-mono text-[9px] uppercase tracking-tighter"
                                            >
                                                Invite
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => openChat(friend.id)}
                                            className="p-1.5 rounded-lg bg-[#111] border border-[#222] hover:border-[var(--color-primary)] text-gray-600 hover:text-gray-400 transition-all"
                                            title="Message (Offline)"
                                        >
                                            <MessageSquare size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="p-4 border-t border-[#1a1a1a] bg-[#0d0d0d]/80 text-center">
                    <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest italic flex items-center justify-center gap-2">
                        <Target size={10} /> Dominance requires coordination
                    </p>
                </div>

                {/* Private Chat Window Overlay */}
                {activeChatId && activeFriend && (
                    <div 
                        ref={chatRef}
                        className="absolute top-0 right-full mr-2 h-[450px] w-[300px] bg-[#050505] border border-[#222] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300"
                    >
                        {/* Chat Header */}
                        <div className="p-4 border-b border-[#222] bg-[#0a0a0a] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg border border-[#333] overflow-hidden">
                                    <img src={activeFriend.profilePic} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">{activeFriend.username}</span>
                                    <span className="text-[8px] text-[var(--color-primary)] uppercase tracking-widest">Signal Active</span>
                                </div>
                            </div>
                            <button onClick={() => dispatch(clearActiveChat())} className="text-gray-500 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                            {activeMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
                                    <Zap size={24} className="mb-2" />
                                    <p className="text-[8px] font-mono uppercase">Establish connection...</p>
                                </div>
                            ) : (
                                activeMessages.map((msg, i) => (
                                    <div key={i} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-3 py-2 rounded-xl text-[10px] max-w-[90%] ${msg.senderId === user.id ? 'bg-[var(--color-primary)] text-black rounded-tr-none' : 'bg-[#1a1a1a] text-gray-200 rounded-tl-none border border-[#333]'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#222] bg-[#0a0a0a]">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Type signal..."
                                    className="flex-1 bg-[#111] border border-[#222] rounded-lg px-3 py-1.5 text-[10px] font-mono outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                                    autoFocus
                                />
                                <button type="submit" disabled={!messageText.trim()} className="p-1.5 bg-[var(--color-primary)] text-black rounded-lg disabled:opacity-50">
                                    <Send size={14} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default SocialLobby;
