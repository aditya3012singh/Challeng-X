import React, { createContext, useContext, useState, useEffect } from "react";
import { FileText, Terminal, Swords, Activity, Eye, ShieldAlert, Sparkles } from "lucide-react";

export const ACTIVITY_ITEMS = [
    { id: "problem", label: "Problem", icon: FileText, panel: "left" },
    { id: "console", label: "Console", icon: Terminal, panel: "bottom" },
    { id: "battle", label: "Battle", icon: Swords, panel: "right" },
    { id: "stats", label: "Stats", icon: Activity, panel: "right" },
    // { id: "spectators", label: "Spectators", icon: Eye, panel: "right" },
    // { id: "security", label: "Security", icon: ShieldAlert, panel: "right" },
    // { id: "ai", label: "AI Mentor", icon: Sparkles, panel: "right" }
];

const LayoutContext = createContext(null);

export const LayoutProvider = ({ children }) => {
    // 1. Initial State from localStorage
    const [layout, setLayout] = useState(() => {
        try {
            const saved = localStorage.getItem("arena-layout");
            return saved ? JSON.parse(saved) : {
                top: "expanded",
                left: "expanded",
                right: "expanded",
                bottom: "expanded"
            };
        } catch {
            return {
                top: "expanded",
                left: "expanded",
                right: "expanded",
                bottom: "expanded"
            };
        }
    });

    const [activeTabs, setActiveTabs] = useState(() => {
        try {
            const saved = localStorage.getItem("arena-active-tabs");
            return saved ? JSON.parse(saved) : {
                left: "problem",
                right: "battle",
                bottom: "console"
            };
        } catch {
            return {
                left: "problem",
                right: "battle",
                bottom: "console"
            };
        }
    });

    const [leftWidth, setLeftWidth] = useState(() => {
        try {
            const saved = localStorage.getItem("left-width");
            return saved ? parseInt(saved, 10) : 320;
        } catch {
            return 320;
        }
    });

    const [rightWidth, setRightWidth] = useState(() => {
        try {
            const saved = localStorage.getItem("right-width");
            return saved ? parseInt(saved, 10) : 320;
        } catch {
            return 320;
        }
    });

    const [bottomHeight, setBottomHeight] = useState(() => {
        try {
            const saved = localStorage.getItem("bottom-height");
            return saved ? parseInt(saved, 10) : 240;
        } catch {
            return 240;
        }
    });

    // 2. State persistence effect
    useEffect(() => {
        localStorage.setItem("arena-layout", JSON.stringify(layout));
    }, [layout]);

    useEffect(() => {
        localStorage.setItem("arena-active-tabs", JSON.stringify(activeTabs));
    }, [activeTabs]);

    useEffect(() => {
        localStorage.setItem("left-width", leftWidth.toString());
    }, [leftWidth]);

    useEffect(() => {
        localStorage.setItem("right-width", rightWidth.toString());
    }, [rightWidth]);

    useEffect(() => {
        localStorage.setItem("bottom-height", bottomHeight.toString());
    }, [bottomHeight]);

    // 3. Actions
    const togglePanel = (panel) => {
        setLayout(prev => {
            const current = prev[panel];
            const next = current === "expanded" ? "collapsed" : "expanded";
            return { ...prev, [panel]: next };
        });
    };

    const setPanelState = (panel, state) => {
        setLayout(prev => ({ ...prev, [panel]: state }));
    };

    const toggleActivityItem = (itemId) => {
        const item = ACTIVITY_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        const panel = item.panel;
        const currentActive = activeTabs[panel];
        const isPanelExpanded = layout[panel] === "expanded";

        if (!isPanelExpanded) {
            // Panel is collapsed or hidden: open it and select this tab
            setLayout(prev => ({ ...prev, [panel]: "expanded" }));
            setActiveTabs(prev => ({ ...prev, [panel]: itemId }));
        } else {
            if (currentActive === itemId) {
                // Clicking the already active item: collapse the panel
                setLayout(prev => ({ ...prev, [panel]: "collapsed" }));
            } else {
                // Switching tab on an already open panel: keep open and switch tab
                setActiveTabs(prev => ({ ...prev, [panel]: itemId }));
            }
        }
    };

    const selectTab = (panel, tabId) => {
        setActiveTabs(prev => ({ ...prev, [panel]: tabId }));
        setLayout(prev => ({ ...prev, [panel]: "expanded" }));
    };

    return (
        <LayoutContext.Provider value={{
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
            activityItems: ACTIVITY_ITEMS
        }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error("useLayout must be used within a LayoutProvider");
    }
    return context;
};
