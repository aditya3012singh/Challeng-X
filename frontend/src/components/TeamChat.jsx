import { useState, useRef, useEffect } from 'react';
import { getSocket } from '../../lib/socket';

export const TeamChat = ({ teamName, teamId, battleId, user }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: "System", text: `Connected to ${teamName} secure channel.`, type: "system" }
    ]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);

    const quickMessages = [
        "I'm stuck 🛑",
        "Solved mine ✅",
        "Need help 🆘",
        "2 left ⏳",
        "Hurry up 🏃"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Socket Integration
    useEffect(() => {
        if (!battleId || !teamId) return;

        const socket = getSocket();

        // Listen for new messages
        socket.on("new_team_message", (message) => {
            console.log("New team message received:", message);
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.off("new_team_message");
        };
    }, [battleId, teamId]);

    const sendMessage = (text) => {
        if (!text.trim()) return;

        const socket = getSocket();
        
        // Emit message to backend
        socket.emit("send_team_message", {
            battleId,
            teamId,
            text: text.trim(),
            username: user?.username || "Anonymous"
        });

        setInputText("");
    };

    return (
        <div className="flex flex-col h-full bg-[rgba(0,0,0,0.3)] border border-[var(--color-primary)] rounded-lg overflow-hidden glass-panel">
            {/* Header */}
            <div className="p-3 bg-[rgba(0,240,255,0.05)] border-b border-[var(--color-primary)] flex justify-between items-center">
                <h3 className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                    Team Comms: {teamName}
                </h3>
                <span className="text-[9px] text-gray-500 font-bold tracking-widest">E2E ENCRYPTED</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.type === 'system' ? 'items-center' : 'items-start'}`}>
                        {msg.type === 'system' ? (
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic my-2">{msg.text}</span>
                        ) : (
                            <div className={`max-w-[85%] ${msg.userId === user?.id ? 'ml-auto' : ''}`}>
                                <div className={`text-[10px] font-bold mb-1 flex justify-between gap-4 ${msg.userId === user?.id ? 'text-[var(--color-primary)] flex-row-reverse' : 'text-slate-500'}`}>
                                    <span>{msg.userId === user?.id ? 'ME' : msg.sender}</span>
                                    <span className="opacity-40">{msg.timestamp}</span>
                                </div>
                                <div className={`p-3 border-l-2 text-sm ${
                                    msg.userId === user?.id 
                                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white rounded-l-lg rounded-br-lg' 
                                    : 'bg-white/[0.03] border-slate-700 text-gray-200 rounded-r-lg rounded-bl-lg'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-2 border-t border-white/[0.05] grid grid-cols-5 gap-1.5 bg-black/20">
                {quickMessages.map((msg, idx) => (
                    <button
                        key={idx}
                        onClick={() => sendMessage(msg)}
                        className="text-[9px] font-bold px-1.5 py-2 bg-white/[0.02] hover:bg-[var(--color-primary)] hover:text-black transition-all border border-white/5 hover:border-[var(--color-primary)] truncate uppercase tracking-tighter"
                    >
                        {msg}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black/60 border-t border-white/[0.05]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                        maxLength={60}
                        placeholder="DEPLOY INTEL..."
                        className="flex-1 bg-white/[0.02] border border-white/10 rounded-sm p-3 text-xs text-white focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-700 placeholder:font-bold placeholder:tracking-widest"
                    />
                    <button
                        onClick={() => sendMessage(inputText)}
                        disabled={!inputText.trim()}
                        className="px-6 bg-[var(--color-primary)] text-black font-black text-[10px] tracking-widest hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-[var(--color-primary)]"
                        style={{ borderRadius: "1px" }}
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
};
