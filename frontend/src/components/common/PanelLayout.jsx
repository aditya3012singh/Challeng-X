import React, { useState } from "react";
import { 
    ChevronLeft, 
    ChevronRight, 
    ChevronUp, 
    ChevronDown, 
    EyeOff, 
    Eye,
    Terminal,
    Users,
    Activity,
    LogOut
} from "lucide-react";
import { useLayout } from "../../context/LayoutContext";

/**
 * Reusable VS Code-like panel layout component.
 * Position, size, collapse state, and active content tabs are managed by useLayout context.
 */
const PanelLayout = ({
    topPanel,
    leftPanel,
    editorPanel,
    rightPanel,
    bottomPanel,
    bottomStatusText = "Console HUD",
    showLayoutControls = true,
    onAbandon
}) => {
    const {
        layout,
        activeTabs,
        leftWidth,
        rightWidth,
        bottomHeight,
        setLeftWidth,
        setRightWidth,
        setBottomHeight,
        togglePanel,
        setPanelState,
        toggleActivityItem,
        selectTab,
        activityItems
    } = useLayout();

    const [isDragging, setIsDragging] = useState(null); // 'left' | 'right' | 'bottom' | null

    // 1. Drag Handlers using functional state updates for staleness immunity
    const startLeftDrag = (e) => {
        e.preventDefault();
        setIsDragging("left");
        let lastX = e.clientX;

        const handleMouseMove = (moveEvent) => {
            const delta = moveEvent.clientX - lastX;
            lastX = moveEvent.clientX;
            setLeftWidth(prev => Math.max(200, Math.min(550, prev + delta)));
        };

        const handleMouseUp = () => {
            setIsDragging(null);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const startRightDrag = (e) => {
        e.preventDefault();
        setIsDragging("right");
        let lastX = e.clientX;

        const handleMouseMove = (moveEvent) => {
            const delta = lastX - moveEvent.clientX;
            lastX = moveEvent.clientX;
            setRightWidth(prev => Math.max(200, Math.min(550, prev + delta)));
        };

        const handleMouseUp = () => {
            setIsDragging(null);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const startBottomDrag = (e) => {
        e.preventDefault();
        setIsDragging("bottom");
        let lastY = e.clientY;

        const handleMouseMove = (moveEvent) => {
            const delta = lastY - moveEvent.clientY;
            lastY = moveEvent.clientY;
            setBottomHeight(prev => Math.max(120, Math.min(450, prev + delta)));
        };

        const handleMouseUp = () => {
            setIsDragging(null);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const resetLeftWidth = () => setLeftWidth(320);
    const resetRightWidth = () => setRightWidth(320);
    const resetBottomHeight = () => setBottomHeight(240);

    // 2. Panel dimensions in pixels
    const topHeightPx = layout.top === "expanded" ? 76 : (layout.top === "collapsed" ? 48 : 0);
    const leftWidthPx = layout.left === "expanded" ? leftWidth : 0;
    const rightWidthPx = layout.right === "expanded" ? rightWidth : 0;
    const bottomHeightPx = layout.bottom === "expanded" ? bottomHeight : (layout.bottom === "collapsed" ? 40 : 0);

    // Helper to render tabs inside the panel headers
    const renderPanelTabs = (panelName) => {
        if (panelName === "right") return null; // Right panel uses custom unified headers
        const panelItems = activityItems.filter(item => item.panel === panelName);
        if (panelItems.length <= 1) return null; // No tabs needed for single items

        return (
            <div className="flex items-center gap-1 overflow-x-auto select-none border-b border-zinc-800/80 bg-zinc-950/40 px-2 py-0.5">
                {panelItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTabs[panelName] === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => selectTab(panelName, item.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-t-lg transition-colors cursor-pointer border-t border-x ${
                                isActive 
                                    ? "bg-zinc-900/60 text-emerald-400 border-zinc-800/80 font-bold" 
                                    : "text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-900/20"
                            }`}
                        >
                            <Icon size={11} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div 
            className="w-screen h-screen flex flex-col overflow-hidden bg-zinc-950 text-neutral-50 relative select-none font-sans"
            style={{
                height: "100vh",
                width: "100vw"
            }}
        >
            {/* AMBIENT BACKGROUND SYSTEM */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    alt="Dark code editor"
                    className="object-cover opacity-[0.02] absolute inset-0 w-full h-full"
                    src="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                />
                <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,18,18,0.7),transparent_60%)] absolute inset-0" />
                <div className="bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:40px_40px] absolute inset-0" />
            </div>

            {/* --- TOP HEADER BAR --- */}
            {layout.top !== "hidden" && (
                <div 
                    className="relative border-b border-zinc-800/80 bg-zinc-900/90 flex items-center justify-between px-6 z-30 transition-all select-none"
                    style={{ height: `${topHeightPx}px` }}
                >
                    <div className="flex-1 flex items-center justify-between h-full py-2">
                        {topPanel}
                    </div>

                    {/* Layout Controls for Top Header */}
                    {showLayoutControls && (
                        <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-zinc-800/60 h-8 text-zinc-500">
                            {layout.top === "expanded" ? (
                                <button 
                                    onClick={() => setPanelState("top", "collapsed")}
                                    title="Collapse Header"
                                    className="p-1 hover:bg-zinc-800 hover:text-white rounded transition-colors cursor-pointer"
                                >
                                    <ChevronUp size={14} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setPanelState("top", "expanded")}
                                    title="Expand Header"
                                    className="p-1 hover:bg-zinc-800 hover:text-white rounded transition-colors cursor-pointer"
                                >
                                    <ChevronDown size={14} />
                                </button>
                            )}
                            <button 
                                onClick={() => setPanelState("top", "hidden")}
                                title="Hide Header"
                                className="p-1 hover:bg-zinc-800 hover:text-red-500 rounded transition-colors cursor-pointer"
                            >
                                <EyeOff size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* --- MIDDLE ROW (Activity Bar + Left Sidebar + Resizer + Editor + Resizer + Right Sidebar) --- */}
            <div className="relative flex flex-row flex-grow overflow-hidden z-20 w-full h-full bg-zinc-950">
                {/* 0. ACTIVITY BAR (Far Left, persistent like VS Code) */}
                <div className="w-14 h-full flex flex-col items-center py-4 bg-zinc-950 border-r border-zinc-850 justify-between select-none z-30">
                    <div className="flex flex-col items-center gap-5 w-full">
                        {activityItems.map(item => {
                            const Icon = item.icon;
                            const isPanelOpen = layout[item.panel] === "expanded";
                            const isActive = activeTabs[item.panel] === item.id;
                            const isHighlighted = isActive && isPanelOpen;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleActivityItem(item.id)}
                                    className={`group relative p-2.5 rounded-xl cursor-pointer hover:bg-zinc-900 hover:text-white transition-all ${
                                        isHighlighted 
                                            ? "text-emerald-500 bg-emerald-500/5 border border-emerald-500/20" 
                                            : "text-zinc-500"
                                    }`}
                                    title={item.label}
                                >
                                    <Icon size={18} />
                                    {/* Active sidebar line indicator */}
                                    {isActive && (
                                        <div className={`absolute left-0 top-[25%] bottom-[25%] w-1 rounded-r-md transition-all ${
                                            isPanelOpen ? "bg-emerald-500" : "bg-zinc-500"
                                        }`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {onAbandon && (
                        <button
                            onClick={onAbandon}
                            className="group p-2.5 rounded-xl cursor-pointer hover:bg-red-950/80 hover:text-red-500 text-zinc-500 transition-all active:scale-90 border border-transparent hover:border-red-900/40 mb-1 shrink-0"
                            title="Abandon Match (Forfeit)"
                        >
                            <LogOut size={18} className="text-red-500" />
                        </button>
                    )}
                </div>

                {/* 1. LEFT SIDEBAR */}
                {layout.left === "expanded" && (
                    <div 
                        className="relative border-r border-zinc-800/80 bg-zinc-900/90 flex flex-col h-full overflow-hidden select-none shrink-0"
                        style={{ width: `${leftWidth}px` }}
                    >
                        {renderPanelTabs("left")}
                        <div className="flex-1 flex flex-col overflow-hidden relative">
                            {leftPanel}
                            {/* Panel Controls Floating Top Right */}
                            {showLayoutControls && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-zinc-950/80 border border-zinc-800/80 px-1.5 py-0.5 rounded shadow-lg z-50 opacity-40 hover:opacity-100 transition-all select-none">
                                    <button 
                                        onClick={() => setPanelState("left", "collapsed")}
                                        title="Collapse Sidepanel"
                                        className="p-0.5 hover:bg-zinc-800 hover:text-white rounded text-zinc-400 cursor-pointer"
                                    >
                                        <ChevronLeft size={13} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Left Resizer Drag Handle */}
                {layout.left === "expanded" && (
                    <div 
                        onMouseDown={startLeftDrag}
                        onDoubleClick={resetLeftWidth}
                        className="w-1 bg-transparent hover:bg-emerald-500/50 active:bg-emerald-500 cursor-col-resize transition-all select-none z-45 h-full self-stretch border-r border-zinc-900 shrink-0"
                        title="Drag to resize sidebar (Double click to reset)"
                    />
                )}

                {/* 2. MIDDLE EDITOR PANE */}
                <div className="relative flex flex-col bg-zinc-950 overflow-hidden h-full z-10 select-none flex-1 min-w-0">
                    <div className="flex-1 flex flex-col overflow-hidden relative">
                        {editorPanel}


                    </div>
                </div>

                {/* Right Resizer Drag Handle */}
                {layout.right === "expanded" && (
                    <div 
                        onMouseDown={startRightDrag}
                        onDoubleClick={resetRightWidth}
                        className="w-1 bg-transparent hover:bg-emerald-500/50 active:bg-emerald-500 cursor-col-resize transition-all select-none z-45 h-full self-stretch border-l border-zinc-900 shrink-0"
                        title="Drag to resize sidebar (Double click to reset)"
                    />
                )}

                {/* 3. RIGHT SIDEBAR */}
                {layout.right === "expanded" && (
                    <div 
                        className="relative border-l border-zinc-800/80 bg-zinc-900/90 flex flex-col h-full overflow-hidden select-none shrink-0"
                        style={{ width: `${rightWidth}px` }}
                    >
                        {renderPanelTabs("right")}
                        <div className="flex-1 flex flex-col overflow-hidden relative">
                            {rightPanel}
                            {/* Panel Controls Floating Top Right */}
                            {showLayoutControls && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-zinc-950/80 border border-zinc-800/80 px-1.5 py-0.5 rounded shadow-lg z-50 opacity-40 hover:opacity-100 transition-all select-none">
                                    <button 
                                        onClick={() => setPanelState("right", "collapsed")}
                                        title="Collapse Sidepanel"
                                        className="p-0.5 hover:bg-zinc-800 hover:text-white rounded text-zinc-400 cursor-pointer"
                                    >
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* --- BOTTOM CONSOLE PANEL --- */}
            {layout.bottom !== "hidden" && (
                <div 
                    className="relative border-t border-zinc-800/80 bg-zinc-900 z-30 flex flex-col transition-all overflow-hidden select-none"
                    style={{ height: `${bottomHeightPx}px` }}
                >
                    {layout.bottom === "expanded" ? (
                        <div className="flex-1 flex flex-col overflow-hidden relative">
                            {/* Drag handle overlay at top boundary */}
                            <div 
                                onMouseDown={startBottomDrag}
                                onDoubleClick={resetBottomHeight}
                                className="absolute top-0 left-0 right-0 h-1 bg-transparent hover:bg-emerald-500/50 active:bg-emerald-500 cursor-row-resize transition-all select-none z-50 border-t border-zinc-900"
                                title="Drag to resize console (Double click to reset)"
                            />
                            {renderPanelTabs("bottom")}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {bottomPanel}
                            </div>
                            {/* Panel Controls Floating Top Right */}
                            {showLayoutControls && (
                                <div className="absolute top-4 right-6 flex items-center gap-1 bg-zinc-950/80 border border-zinc-800/80 px-1.5 py-0.5 rounded shadow-lg z-50 opacity-40 hover:opacity-100 transition-all select-none">
                                    <button 
                                        onClick={() => setPanelState("bottom", "collapsed")}
                                        title="Collapse Console"
                                        className="p-0.5 hover:bg-zinc-800 hover:text-white rounded text-zinc-400 cursor-pointer"
                                    >
                                        <ChevronDown size={13} />
                                    </button>
                                    <button 
                                        onClick={() => setPanelState("bottom", "hidden")}
                                        title="Hide Console"
                                        className="p-0.5 hover:bg-zinc-800 hover:text-red-500 rounded text-zinc-400 cursor-pointer"
                                    >
                                        <EyeOff size={13} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Collapsed Bottom Bar (Compact status line)
                        <div 
                            onClick={() => setPanelState("bottom", "expanded")}
                            className="w-full h-10 px-6 bg-zinc-950 flex items-center justify-between border-t border-zinc-855 cursor-pointer hover:bg-zinc-900 transition-colors select-none text-xs"
                        >
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Terminal size={14} className="text-emerald-500" />
                                <span className="font-mono text-[10px] tracking-wide uppercase font-semibold text-zinc-300">{bottomStatusText}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500">
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Expand Console</span>
                                <ChevronUp size={14} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- FULLSCREEN DRAG BACKDROP --- */}
            {isDragging && (
                <div 
                    className={`fixed inset-0 z-[9999] bg-transparent ${
                        isDragging === "bottom" ? "cursor-row-resize" : "cursor-col-resize"
                    }`}
                />
            )}
        </div>
    );
};

export default PanelLayout;
