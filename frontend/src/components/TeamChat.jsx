import { useState, useRef, useEffect } from 'react';
import { getSocket } from '../../lib/socket';
import { MessagesSquare, Send } from 'lucide-react';

export const TeamChat = ({ teamName, teamId, battleId, user }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: "System", text: `Connected to secure room channel.`, type: "system" }
    ]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);

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
        <div className="flex flex-col h-full bg-[#18181b] border border-white/5 overflow-hidden w-full md:w-80 rounded-xl">
            {/* Header */}
            <div className="border-b border-white/5 flex p-4 flex-row justify-between items-center gap-2 select-none">
                <div className="flex items-center gap-2">
                    <MessagesSquare className="size-4 text-neutral-400" />
                    <span className="font-[family:var(--font-heading)] font-semibold text-sm leading-5 text-white">
                        Battle Chat
                    </span>
                </div>
                <span className="text-emerald-500 text-[10px] flex items-center gap-1 font-bold">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    2 online
                </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[300px] min-h-[220px] custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.type === 'system' ? 'items-center' : (msg.sender === user?.username ? 'items-end' : 'items-start')}`}>
                        {msg.type === 'system' ? (
                            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest italic my-1">{msg.text}</span>
                        ) : (
                            <div className="max-w-[85%] flex flex-col gap-0.5">
                                <span className="text-neutral-500 text-[9px] font-bold px-1 select-none">
                                    {msg.sender === user?.username ? 'You' : msg.sender}
                                </span>
                                <div className={`text-xs leading-4 px-3 py-2 ${
                                    msg.sender === user?.username 
                                        ? 'bg-white/10 text-white rounded-l-lg rounded-br-lg' 
                                        : 'bg-neutral-800 text-neutral-300 rounded-r-lg rounded-bl-lg'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="border-t border-white/5 flex p-3 flex-row items-center gap-2 bg-neutral-950/20">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                    maxLength={60}
                    placeholder="Type a message..."
                    className="rounded-lg bg-neutral-950 text-xs text-white border border-white/10 flex-1 px-3 py-2 focus:border-white/20 focus:outline-none transition-all placeholder:text-neutral-600"
                />
                <button
                    onClick={() => sendMessage(inputText)}
                    disabled={!inputText.trim()}
                    className="size-9 shrink-0 rounded-lg bg-neutral-200 text-neutral-900 flex items-center justify-center cursor-pointer hover:bg-white active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-neutral-200"
                >
                    <Send className="size-4" />
                </button>
            </div>
        </div>
    );
};
