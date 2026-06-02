import logger from '../../core/logger/logger.js';
import SocketEmitter from '../../core/config/socket.js';
import { EventTypes } from '../../core/events/eventTypes.js';

/**
 * Socket Module Event Listeners
 * Phase 3A: Implement socket emissions via events (DUAL MODE)
 * 
 * Socket module listens to battle and submission events to broadcast real-time updates
 * This decouples BattleService from direct SocketEmitter calls
 */

/**
 * Handle BattleSocketJoined event - Notify players that opponent joined
 */
export async function handleBattleSocketJoined(payload) {
    const { battleId, playerId } = payload;
    
    if (!battleId || !playerId) {
        logger.warn('[Socket Listener] ⚠️ BattleSocketJoined event missing battleId or playerId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleSocketJoined event received', {
            battleId,
            playerId
        });

        SocketEmitter.emitToBattle(battleId, 'battle_joined', {
            playerId
        });

        logger.info('[Socket Listener] ✅ battle_joined emitted', { battleId, playerId });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleSocketJoined event:', error);
    }
}

/**
 * Handle BattleSocketCountdown event - Start countdown before battle
 */
export async function handleBattleSocketCountdown(payload) {
    const { battleId, seconds } = payload;
    
    if (!battleId) {
        logger.warn('[Socket Listener] ⚠️ BattleSocketCountdown event missing battleId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleSocketCountdown event received', {
            battleId,
            seconds
        });

        SocketEmitter.emitToBattle(battleId, 'battle_countdown', {
            seconds
        });

        logger.info('[Socket Listener] ✅ battle_countdown emitted', { battleId, seconds });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleSocketCountdown event:', error);
    }
}

/**
 * Handle BattleSocketStarted event - Notify battle has started
 */
export async function handleBattleSocketStarted(payload) {
    const { battleId, startedAt } = payload;
    
    if (!battleId) {
        logger.warn('[Socket Listener] ⚠️ BattleSocketStarted event missing battleId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleSocketStarted event received', {
            battleId,
            startedAt
        });

        SocketEmitter.emitToBattle(battleId, 'battle_start', {
            startedAt
        });

        logger.info('[Socket Listener] ✅ battle_start emitted', { battleId });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleSocketStarted event:', error);
    }
}

/**
 * Handle BattleSocketTimeout event - Notify battle timeout
 */
export async function handleBattleSocketTimeout(payload) {
    const { battleId, draw } = payload;
    
    if (!battleId) {
        logger.warn('[Socket Listener] ⚠️ BattleSocketTimeout event missing battleId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleSocketTimeout event received', {
            battleId,
            draw
        });

        SocketEmitter.emitToBattle(battleId, 'battle_timeout', {
            draw
        });

        logger.info('[Socket Listener] ✅ battle_timeout emitted', { battleId, draw });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleSocketTimeout event:', error);
    }
}

/**
 * Handle BattleSocketEnd event - Notify battle end
 */
export async function handleBattleSocketEnd(payload) {
    const { battleId, winnerId, draw } = payload;
    
    if (!battleId) {
        logger.warn('[Socket Listener] ⚠️ BattleSocketEnd event missing battleId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleSocketEnd event received', {
            battleId,
            winnerId,
            draw
        });

        SocketEmitter.emitToBattle(battleId, 'battle_end', {
            winnerId,
            draw
        });

        logger.info('[Socket Listener] ✅ battle_end emitted', { battleId, winnerId, draw });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleSocketEnd event:', error);
    }
}

/**
 * Handle BattleSocketAttemptsUpdated event - Notify attempt count update
 */
export async function handleBattleSocketAttemptsUpdated(payload) {
    const { battleId, player1Attempts, player2Attempts } = payload;
    
    if (!battleId) {
        logger.warn('[Socket Listener] ⚠️ BattleSocketAttemptsUpdated event missing battleId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleSocketAttemptsUpdated event received', {
            battleId,
            player1Attempts,
            player2Attempts
        });

        SocketEmitter.emitToBattle(battleId, 'attempts_updated', {
            player1Attempts,
            player2Attempts
        });

        logger.info('[Socket Listener] ✅ attempts_updated emitted', { battleId, player1Attempts, player2Attempts });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleSocketAttemptsUpdated event:', error);
    }
}

/**
 * Handle BattleSocketCommentary event - Emit AI commentary to spectators
 */
export async function handleBattleSocketCommentary(payload) {
    const { battleId, commentary, timestamp } = payload;
    
    if (!battleId) {
        logger.warn('[Socket Listener] ⚠️ BattleSocketCommentary event missing battleId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleSocketCommentary event received', {
            battleId
        });

        if (SocketEmitter.io) {
            SocketEmitter.io.to(`spectator_${battleId}`).emit('battle_commentary', {
                commentary,
                timestamp
            });
        }

        logger.info('[Socket Listener] ✅ battle_commentary emitted', { battleId });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleSocketCommentary event:', error);
    }
}

/**
 * Handle BattleStateChanged event - Broadcast state to clients
 * Triggered when battle state changes (WAITING → COUNTDOWN → ONGOING → FINISHED)
 */
export async function handleBattleStateChanged(payload) {
    const { battleId, oldState, newState, metadata } = payload;
    
    if (!battleId || !newState) {
        logger.warn('[Socket Listener] ⚠️ BattleStateChanged event missing battleId or newState');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleStateChanged event received', {
            battleId,
            oldState,
            newState
        });

        // Emit state change to battle room
        SocketEmitter.emitToBattle(battleId, 'battle_state_changed', {
            battleId,
            oldState,
            newState,
            metadata
        });

        logger.info('[Socket Listener] ✅ Battle state change broadcasted', {
            battleId,
            newState
        });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleStateChanged event:', error);
    }
}

/**
 * Handle BattleAttemptUpdated event - Broadcast attempt count
 * Triggered when submission attempt count is updated
 */
export async function handleBattleAttemptUpdated(payload) {
    const { battleId, player1Attempts, player2Attempts } = payload;
    
    if (!battleId) {
        logger.warn('[Socket Listener] ⚠️ BattleAttemptUpdated event missing battleId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleAttemptUpdated event received', {
            battleId,
            player1Attempts,
            player2Attempts
        });

        // Emit attempt update to battle room
        SocketEmitter.emitToBattle(battleId, 'attempts_updated', {
            player1Attempts,
            player2Attempts
        });

        logger.info('[Socket Listener] ✅ Attempt count broadcasted', {
            battleId,
            player1Attempts,
            player2Attempts
        });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleAttemptUpdated event:', error);
    }
}

/**
 * Handle SubmissionCompleted event - Broadcast submission result
 * Triggered when a submission completes (RUN or SUBMIT)
 */
export async function handleSubmissionCompleted(payload) {
    const { submissionId, userId, status, type, context, testCaseResults, failureDetails } = payload;
    
    if (!submissionId || !userId) {
        logger.warn('[Socket Listener] ⚠️ SubmissionCompleted event missing submissionId or userId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 SubmissionCompleted event received', {
            submissionId,
            userId,
            status,
            type,
            battleId: context?.battleId
        });

        const battleId = context?.battleId;

        // Emit submission result to user
        if (SocketEmitter.io) {
            SocketEmitter.io.to(`user_${userId}`).emit('submission_result', {
                submissionId,
                status,
                type,
                testCaseResults,
                failureDetails
            });
        }

        // Emit opponent submission to battle room
        if (battleId && SocketEmitter.io) {
            SocketEmitter.io.to(battleId).emit('opponent_submission_result', {
                submissionId,
                userId,
                status,
                type
            });
        }

        logger.info('[Socket Listener] ✅ Submission result broadcasted', {
            submissionId,
            userId,
            status,
            battleId
        });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling SubmissionCompleted event:', error);
    }
}

/**
 * Handle BattleCreated event - Notify players
 * Triggered when a new battle is created
 */
export async function handleBattleCreated(payload) {
    const { battleId, player1Id, player2Id, problemId } = payload;
    
    if (!battleId || !player1Id || !player2Id) {
        logger.warn('[Socket Listener] ⚠️ BattleCreated event missing required fields');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleCreated event received', {
            battleId,
            player1Id,
            player2Id,
            problemId
        });

        // Emit battle created to both players
        if (SocketEmitter.io) {
            SocketEmitter.io.to(`user_${player1Id}`).emit('battle_created', {
                battleId,
                opponent: player2Id,
                problemId
            });

            SocketEmitter.io.to(`user_${player2Id}`).emit('battle_created', {
                battleId,
                opponent: player1Id,
                problemId
            });
        }

        logger.info('[Socket Listener] ✅ Battle creation broadcasted', {
            battleId,
            players: [player1Id, player2Id]
        });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleCreated event:', error);
    }
}

/**
 * Handle BattleFinished event - Broadcast battle end
 * Triggered when a battle finishes
 */
export async function handleBattleFinished(payload) {
    const { battleId, winnerId, loserId } = payload;
    
    if (!battleId) {
        logger.warn('[Socket Listener] ⚠️ BattleFinished event missing battleId');
        return;
    }

    try {
        logger.info('[Socket Listener] 📥 BattleFinished event received', {
            battleId,
            winnerId,
            loserId
        });

        // Emit battle end to battle room
        SocketEmitter.emitToBattle(battleId, 'battle_end', {
            battleId,
            winnerId,
            loserId,
            draw: !winnerId
        });

        logger.info('[Socket Listener] ✅ Battle end broadcasted', {
            battleId,
            winnerId,
            loserId
        });
    } catch (error) {
        logger.error('[Socket Listener] ❌ Error handling BattleFinished event:', error);
    }
}
