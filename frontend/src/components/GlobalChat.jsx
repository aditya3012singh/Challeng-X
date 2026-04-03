import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, X, Users, User, Shield, Zap, Check, Activity } from 'lucide-react';
import { getSocket } from '../../lib/socket';
import { getIncomingRequests, respondToFriendRequest } from '../../store/api/social.thunk';

const GlobalChat = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { incomingRequests } = useSelector((state) => state.social);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'requests'
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const scrollRef = useRef(null);
    const messagesEndRef = useRef(null);
    const sidebarRef = useRef(null);
    const toggleBtnRef = useRef(null);
    const socket = getSocket();

    useEffect(() => {
        if (!isAuthenticated || !socket) return;

        // Listen for new messages
        socket.on("new_global_message", (message) => {
            setMessages((prev) => [...prev, message]);
            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        // Request history on mount/connection
        socket.on('global_chat_history', (history) => setMessages(history));

        // Fetch incoming friend requests
        dispatch(getIncomingRequests());

        return () => {
            socket.off('new_global_message');
            socket.off('global_chat_history');
        };
    }, [isAuthenticated, socket, isOpen, dispatch]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, activeTab]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && 
                sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                toggleBtnRef.current && !toggleBtnRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socket.emit("send_global_message", {
            text: newMessage,
            username: user.username,
            profilePic: user.profilePic
        });

        setNewMessage('');
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setUnreadCount(0);
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative z-50">
            {/* Toggle Button */}
            <button 
                ref={toggleBtnRef}
                onClick={toggleChat}
                className={`fixed left-4 bottom-8 z-50 p-3 rounded-full bg-[var(--color-bg-card)] border border-[#222] text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all group ${isOpen ? 'translate-x-[calc(100vw-60px)] sm:translate-x-[360px]' : ''}`}
                title="Global Chat"
            >
                <div className="relative">
                    <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && !isOpen && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-[var(--color-text-main)] text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </button>

            {/* Sidebar */}
            <div 
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full w-full sm:w-[350px] bg-[var(--color-bg-dark)]/95 backdrop-blur-xl border-r border-[#1a1a1a] z-[60] transform transition-transform duration-300 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                
                {/* Header */}
                <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--color-bg-dark)]/80 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="text-[var(--color-primary)]" size={18} />
                            <h2 className="font-bold font-mono tracking-tight text-sm text-[var(--color-text-main)]">GLOBAL CHALLENGX</h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-[var(--color-bg-dark)] rounded-lg border border-[var(--glass-border)]">
                        <button 
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-mono transition-all ${activeTab === 'chat' ? 'bg-[var(--color-bg-card)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
                        >
                            <MessageSquare size={12} /> CHAT
                        </button>
                        <button 
                            onClick={() => setActiveTab('requests')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-mono transition-all relative ${activeTab === 'requests' ? 'bg-[var(--color-bg-card)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
                        >
                            <Users size={12} /> REQUESTS
                            {incomingRequests.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-[var(--color-bg-dark)]" />
                            )}
                        </button>
                    </div>
                </div>

                {activeTab === 'chat' ? (
                    <>
                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide scroll-smooth"
                        >
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-30">
                                    <Zap size={32} className="mb-2" />
                                    <p className="text-xs font-mono uppercase tracking-widest">No signals detected... start the conversation</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={`flex gap-3 ${msg.userId === user.id ? 'flex-row-reverse' : ''}`}
                                    >
                                         <Link to={`/profile/${msg.sender}`} onClick={() => window.innerWidth < 1024 && setIsOpen(false)} className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-dark)] border border-[var(--glass-border)] overflow-hidden hover:border-[var(--color-primary)] transition-colors">
                                                {msg.profilePic ? (
                                                    <img src={msg.profilePic} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)] opacity-50">
                                                        <User size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        <div className={`max-w-[80%] flex flex-col ${msg.userId === user.id ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <Link to={`/profile/${msg.sender}`} onClick={() => window.innerWidth < 1024 && setIsOpen(false)} className="text-[10px] font-bold font-mono text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                                                    {msg.sender}
                                                </Link>
                                                <span className="text-[8px] font-mono text-[var(--color-text-muted)] opacity-50">
                                                    {msg.timestamp}
                                                </span>
                                            </div>
                                            <div className={`px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed ${
                                                msg.userId === user.id 
                                                    ? 'bg-[var(--color-primary)] text-black rounded-tr-none shadow-[0_4px_15px_rgba(204,255,0,0.1)]' 
                                                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-main)] rounded-tl-none border border-[var(--glass-border)]'
                                            }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-[var(--color-bg-dark)]/80 border-t border-[var(--glass-border)]">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a transmission..."
                                    className="flex-1 bg-[var(--color-bg-dark)] border border-[var(--glass-border)] rounded-lg px-4 py-2 text-xs font-mono text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-[var(--color-primary)] text-black p-2 rounded-lg hover:bg-[#ccff00] transition-colors disabled:opacity-50"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    /* Requests Tab Content */
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                            <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 px-1">Pending Identifications</h3>
                            
                            {incomingRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-30 mt-12">
                                    <Users size={40} className="mb-2" />
                                    <p className="text-[10px] font-mono uppercase">Zero pending requests</p>
                                </div>
                            ) : (
                                incomingRequests.map(req => (
                                    <div key={req.id} className="p-3 bg-[var(--color-bg-dark)]/50 border border-[var(--glass-border)] rounded-xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <Link to={`/profile/${req.sender.username}`} onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-lg bg-[var(--color-bg-card)] border border-[var(--glass-border)] overflow-hidden flex-shrink-0">
                                                {req.sender.profilePic ? (
                                                    <img src={req.sender.profilePic} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)] opacity-40">
                                                        <User size={16} />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex flex-col">
                                                <Link to={`/profile/${req.sender.username}`} onClick={() => setIsOpen(false)} className="text-xs font-bold font-mono text-gray-200 hover:text-[var(--color-primary)] transition-colors">
                                                    {req.sender.username}
                                                </Link>
                                                <div className="flex items-center gap-1 text-[8px] font-mono text-gray-500 uppercase tracking-tighter">
                                                    <Activity size={8} /> LVL {Math.floor(req.sender.rankPoints / 100)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => dispatch(respondToFriendRequest({ requestId: req.id, status: 'ACCEPTED' }))}
                                                className="p-1.5 rounded-md bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-black transition-all"
                                                title="Accept"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button 
                                                onClick={() => dispatch(respondToFriendRequest({ requestId: req.id, status: 'REJECTED' }))}
                                                className="p-1.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-black transition-all"
                                                title="Decline"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="p-4 bg-[var(--color-bg-dark)]/80 border-t border-[var(--glass-border)] text-center">
                            <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest italic">
                                Connections expand your arena network
                            </p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default GlobalChat;
