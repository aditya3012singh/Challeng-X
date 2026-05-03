import Database from "../../core/config/db.js";
import logger from "../../core/logger/logger.js";
import SocketEmitter from "../../core/config/socket.js";

class ContestCronService {
  static start() {
    logger.info("⏱️ Starting Contest State Manager Cron...");
    
    // Check every 30 seconds
    setInterval(async () => {
      try {
        const now = new Date();

        // 1. Transition UPCOMING -> ACTIVE
        const toActive = await Database.client.contest.findMany({
          where: { status: "UPCOMING", startTime: { lte: now } }
        });

        for (const contest of toActive) {
          await Database.client.contest.update({
            where: { id: contest.id },
            data: { status: "ACTIVE" }
          });
          logger.info(`🏆 Contest [${contest.id}] is now ACTIVE!`);
          
          if (SocketEmitter.io) {
            SocketEmitter.io.to(`contest-${contest.id}`).emit("contest_started", { contestId: contest.id });
          }
        }

        // 2. Transition ACTIVE -> FINISHED
        const toFinished = await Database.client.contest.findMany({
          where: { status: "ACTIVE", endTime: { lte: now } }
        });

        for (const contest of toFinished) {
          await Database.client.contest.update({
            where: { id: contest.id },
            data: { status: "FINISHED" }
          });
          logger.info(`🏆 Contest [${contest.id}] is now FINISHED!`);
          
          if (SocketEmitter.io) {
            SocketEmitter.io.to(`contest-${contest.id}`).emit("contest_ended", { contestId: contest.id });
          }
        }
      } catch (error) {
        logger.error(`❌ ContestCron error: ${error.message}`);
      }
    }, 30000);
  }
}

export default ContestCronService;
