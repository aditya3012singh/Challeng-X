import { useState, useRef, useEffect } from 'react';

export const TeamChat = ({ teamName, isOwnTeam }) => {
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

    const sendMessage = (text) => {
        if (!text.trim()) return;

        // In a real app, this would emit a socket event
        const newMessage = {
            id: Date.now(),
            sender: "Me",
            text: text,
            type: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText("");
    };

    return (
        <div className="flex flex-col h-full bg-[rgba(0,0,0,0.3)] border border-[var(--color-primary)] rounded-lg overflow-hidden glass-panel">
            {/* Header */}
            <div className="p-3 bg-[rgba(0,240,255,0.05)] border-b border-[var(--color-primary)] flex justify-between items-center">
                <h3 className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                    Team Comms
                </h3>
                <span className="text-xs text-gray-500">ENCRYPTED</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.type === 'system' ? 'items-center' : 'items-start'}`}>
                        {msg.type === 'system' ? (
                            <span className="text-xs text-[var(--color-text-muted)] italic">{msg.text}</span>
                        ) : (
                            <div className="max-w-[85%]">
                                <div className="text-xs text-[var(--color-primary)] mb-1 flex justify-between gap-4">
                                    <span>{msg.sender}</span>
                                    <span className="text-gray-600">{msg.timestamp}</span>
                                </div>
                                <div className="bg-[rgba(255,255,255,0.05)] p-2 rounded-r-lg rounded-bl-lg border-l-2 border-[var(--color-primary)] text-sm text-gray-200">
                                    {msg.text}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-2 border-t border-gray-800 grid grid-cols-3 gap-2">
                {quickMessages.map((msg, idx) => (
                    <button
                        key={idx}
                        onClick={() => sendMessage(msg)}
                        className="text-xs px-2 py-1 bg-[rgba(255,255,255,0.05)] hover:bg-[var(--color-primary)] hover:text-black transition-colors rounded border border-gray-700 hover:border-[var(--color-primary)] truncate"
                    >
                        {msg}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black/40 border-t border-gray-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                        maxLength={60}
                        placeholder="Type message (max 60 chars)..."
                        className="flex-1 bg-transparent border border-gray-700 rounded p-2 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    />
                    <button
                        onClick={() => sendMessage(inputText)}
                        className="px-3 py-2 bg-[var(--color-primary)] text-black font-bold text-sm rounded hover:bg-cyan-300 transition-colors"
                    >
                        SEND
                    </button>
                </div>
                <div className="text-right text-[10px] text-gray-600 mt-1">
                    {inputText.length}/60
                </div>
            </div>
        </div>
    );
};
