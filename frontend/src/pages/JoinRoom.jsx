import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { joinBattle } from "../../store/api/battle.thunk";
import { toast } from "react-hot-toast";

const JoinRoom = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (index, value) => {
        if (value.length > 1) {
            handlePaste({ clipboardData: { getData: () => value } });
            return;
        }
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        if (e.preventDefault) e.preventDefault();
        const pasteData = (e.clipboardData || e).getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasteData) return;
        const newCode = [...code];
        pasteData.split("").forEach((char, i) => {
            if (i < 6) newCode[i] = char;
        });
        setCode(newCode);
        const nextIndex = Math.min(pasteData.length, 5);
        if (inputRefs.current[nextIndex]) inputRefs.current[nextIndex].focus();
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        const fullCode = code.join("");
        if (fullCode.length !== 6) return;
        try {
            setLoading(true);
            const res = await dispatch(joinBattle({ battleCode: fullCode })).unwrap();
            navigate(`/battle/${res.id}/ide`);
        } catch (err) {
            toast.error(err.message || "Invalid Room Code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-neutral-50 flex items-center justify-center px-4 relative overflow-hidden">
            {/* AMBIENT BACKGROUND SYSTEM */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    alt="Dark code editor"
                    className="object-cover opacity-[0.03] absolute inset-0 w-full h-full"
                    src="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                />
                <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,18,18,0.7),transparent_60%)] absolute inset-0" />
                <div className="bg-gradient-to-br from-[#09090b]/80 via-transparent to-[#09090b]/90 absolute inset-0" />
                <div className="bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] absolute inset-0" />
            </div>

            <div className="w-full max-w-md p-16 text-center shadow-[0_10px_30px_rgba(0,0,0,0.35)] rounded-2xl bg-neutral-900 border border-zinc-800 relative z-10">
                <div className="text-[10px] font-bold tracking-[0.6em] text-neutral-400 uppercase mb-6">Battle Protocol</div>

                <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase font-[family:var(--font-heading)]">
                    Join Room
                </h1>
                <p className="text-[#a1a1a1] text-sm font-light mb-12">
                    Enter the synchronization code to join the arena.
                </p>

                <form onSubmit={handleJoin} className="space-y-10">
                    <div className="flex justify-center gap-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                autoFocus={index === 0}
                                className="w-10 h-14 text-center text-4xl font-mono bg-zinc-950 border border-zinc-800 text-neutral-50 focus:outline-none focus:border-white/20 transition-all rounded-lg"
                                maxLength={1}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.join("").length !== 6}
                        className="w-full py-5 bg-neutral-200 text-neutral-900 font-bold uppercase tracking-[0.2em] text-xs disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white transition-all transform active:scale-95 shadow-xl rounded-xl cursor-pointer"
                    >
                        {loading ? "Initializing..." : "Establish Connection →"}
                    </button>
                </form>

                <div className="mt-12 pt-12 border-t border-white/[0.03]">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">
                        Security: 256-Bit Encrypted Link
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JoinRoom;
