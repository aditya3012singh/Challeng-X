import ServerApp from "./server.js";
import { registerAllListeners } from "./events/listeners/index.js";
import logger from "./utils/logger.js";

// ✅ PHASE 1: Register all event listeners BEFORE starting server
try {
    registerAllListeners();
    logger.info('✅ [Phase 1] Event bus initialized successfully');
} catch (error) {
    logger.error('❌ [Phase 1] Failed to initialize event bus:', error);
    process.exit(1);
}

// Entry point for the main backend server
ServerApp.start();
