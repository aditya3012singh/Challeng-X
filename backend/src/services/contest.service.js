import Database from "../config/db.js";
import logger from "../utils/logger.js";

class ContestService {
  static async createContest(creatorId, data) {
    const { title, description, startTime, endTime, problems } = data;
    return await Database.client.contest.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        creatorId,
        problems: {
          create: problems.map((p, index) => ({
            problemId: p.problemId,
            points: p.points || 100,
            order: index
          }))
        }
      },
      include: { problems: true }
    });
  }

  static async getAllContests() {
    return await Database.client.contest.findMany({
      orderBy: { startTime: 'desc' },
      include: {
        _count: { select: { participants: true } }
      }
    });
  }

  static async getContestById(id) {
    const contest = await Database.client.contest.findUnique({
      where: { id },
      include: {
        creator: { select: { username: true } },
        _count: { select: { participants: true } }
      }
    });

    if (!contest) {
      const error = new Error("Contest not found");
      error.status = 404;
      throw error;
    }

    return contest;
  }

  static async registerForContest(id, userId) {
    const contest = await Database.client.contest.findUnique({ where: { id } });
    if (!contest) {
      const error = new Error("Contest not found");
      error.status = 404;
      throw error;
    }
    
    return await Database.client.contestParticipant.create({
      data: { contestId: id, userId }
    });
  }

  static async getContestProblems(id, user) {
    const contest = await Database.client.contest.findUnique({ where: { id } });
    
    if (!contest) {
      const error = new Error("Contest not found");
      error.status = 404;
      throw error;
    }

    const now = new Date();
    if (now < contest.startTime && user.role !== "ADMIN") {
      const error = new Error("Contest has not started yet");
      error.status = 403;
      throw error;
    }

    return await Database.client.contestProblem.findMany({
      where: { contestId: id },
      orderBy: { order: 'asc' },
      include: {
        problem: { select: { id: true, title: true, difficulty: true } }
      }
    });
  }

  static async getContestLeaderboard(id) {
    return await Database.client.contestParticipant.findMany({
      where: { contestId: id },
      orderBy: [{ score: 'desc' }, { penaltyMs: 'asc' }],
      include: { user: { select: { username: true, profilePic: true } } },
      take: 100
    });
  }

  /**
   * Called by server.js when the worker finishes a contest submission.
   */
  static async handleContestResult(data) {
    try {
      const { contestId, submissionId, status, userId } = data;
      
      if (status !== "PASSED" && status !== "FAILED") return;

      // 1. Fetch submission details
      const submission = await Database.client.submission.findUnique({
        where: { id: submissionId },
        include: { problem: true }
      });

      if (!submission) return;

      // 2. Fetch contest and problem points
      const contest = await Database.client.contest.findUnique({ where: { id: contestId } });
      const contestProblem = await Database.client.contestProblem.findUnique({
        where: { contestId_problemId: { contestId, problemId: submission.problemId } }
      });
      
      if (!contest || !contestProblem) return;

      // 3. Score calculation
      const participant = await Database.client.contestParticipant.findUnique({
        where: { contestId_userId: { contestId, userId } }
      });

      if (!participant) return;

      // Ensure the points haven't already been awarded by checking passed submissions
      const passedCount = await Database.client.submission.count({
        where: { contestId, userId, problemId: submission.problemId, status: "PASSED" }
      });

      // Avoid double scoring if already passed
      if (passedCount > 1) return; 

      if (status === "PASSED" && passedCount === 1) { // 1 means THIS was the passing one
        // Base points + slight penalty for time taken
        const timeElapsedMs = Date.now() - new Date(contest.startTime).getTime();
        const baseScore = contestProblem.points;

        await Database.client.contestParticipant.update({
          where: { id: participant.id },
          data: { 
            score: { increment: baseScore },
            penaltyMs: { increment: timeElapsedMs }
          }
        });
      } else if (status === "FAILED" && passedCount === 0) { // Penalize if haven't passed
        // 10 minutes penalty standard
        await prisma.contestParticipant.update({
          where: { id: participant.id },
          data: { penaltyMs: { increment: 10 * 60 * 1000 } }
        });
      }

      logger.info(`🏆 Contest Score Updated for userId=${userId} contestId=${contestId}`);
    } catch (err) {
      logger.error(`❌ Contest result error: ${err.message}`);
    }
  }
}

export default ContestService;
