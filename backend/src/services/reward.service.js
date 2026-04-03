import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger.js";
import NotificationService from "./notification.service.js";

const prisma = new PrismaClient();

class RewardService {
  /**
   * Calculate and grant Cyber-Cores for a battle
   */
  static async grantBattleRewards(battleId) {
    try {
      const battle = await prisma.battle.findUnique({
        where: { id: battleId },
        include: { 
          player1: true, 
          player2: true,
          problem: true
        }
      });

      if (!battle || !battle.winnerId || battle.status !== "FINISHED") return;

      const isPlayer1Winner = battle.winnerId === battle.player1Id;
      const winner = isPlayer1Winner ? battle.player1 : battle.player2;
      const loser = isPlayer1Winner ? battle.player2 : battle.player1;

      // Base reward logic
      // Difficulty: EASY=50, MEDIUM=100, HARD=200
      const difficultyMultipliers = {
        EASY: 50,
        MEDIUM: 100,
        HARD: 200
      };

      const baseReward = difficultyMultipliers[battle.problem.difficulty] || 50;
      
      // Grant to winner
      await prisma.user.update({
        where: { id: winner.id },
        data: { cyberCores: { increment: baseReward } }
      });

      // Grant a small amount to loser for participation
      if (loser) {
        await prisma.user.update({
          where: { id: loser.id },
          data: { cyberCores: { increment: Math.floor(baseReward / 5) } }
        });
      }

      // Notify winner
      await NotificationService.sendNotification(winner.id, {
        type: "REWARD",
        title: "Cyber-Cores Earned!",
        message: `You earned ${baseReward} Cyber-Cores for winning the battle!`,
        metadata: { battleId, amount: baseReward }
      });

      // Check for achievements
      await this.checkAchievements(winner.id, "BATTLE_WIN", winner.wins + 1);
      
      logger.info(`Battle rewards granted for battle ${battleId}`);
    } catch (error) {
      logger.error("Error granting battle rewards:", error);
    }
  }

  /**
   * Calculate and grant Cyber-Cores for solo problem solving
   */
  static async grantProblemRewards(userId, problemId) {
    try {
      // 1. Check if already rewarded to prevent double-claiming
      const existingSubmission = await prisma.submission.findFirst({
        where: { userId, problemId, status: "PASSED" },
        orderBy: { createdAt: "asc" }
      });

      // If this isn't the FIRST time they passed this problem, don't grant rewards again
      const passCount = await prisma.submission.count({
        where: { userId, problemId, status: "PASSED" }
      });
      if (passCount > 1) return;

      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        select: { difficulty: true }
      });

      const difficultyMultipliers = {
        EASY: 30,
        MEDIUM: 60,
        HARD: 120
      };

      let reward = difficultyMultipliers[problem.difficulty] || 30;
      const initialReward = reward;

      // 2. Check for hints usage
      const hintsUsed = await prisma.userHint.count({
        where: { userId, problemId }
      });

      // Deduction: 5 cores per hint (total cost of hint was 5)
      // This effectively makes hints "refundable" if you solve it? 
      // No, let's make it a penalty. 
      const hintPenalty = hintsUsed * 8; // Penalty is more than the cost to encourage no-hint solves
      
      reward = Math.max(5, reward - hintPenalty);

      // 3. Update user
      await prisma.user.update({
        where: { id: userId },
        data: { cyberCores: { increment: reward } }
      });

      // 4. Notify
      await NotificationService.sendNotification(userId, {
        type: "REWARD",
        title: "Mission Accomplished!",
        message: hintsUsed === 0 
          ? `Perfect solve! You earned ${reward} Cyber-Cores.`
          : `Problem solved! You earned ${reward} Cyber-Cores (${hintsUsed} hints used).`,
        metadata: { problemId, amount: reward, perfect: hintsUsed === 0 }
      });

      logger.info(`Solo rewards granted for user ${userId} on problem ${problemId}`);
    } catch (error) {
      logger.error("Error granting problem rewards:", error);
    }
  }

  /**
   * Process daily login rewards and streaks
   */
  static async processDailyLogin(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      const now = new Date();
      const lastLogin = new Date(user.lastLogin);
      
      // Check if it's a new day (UTC)
      const isSameDay = now.getUTCFullYear() === lastLogin.getUTCFullYear() &&
                        now.getUTCMonth() === lastLogin.getUTCMonth() &&
                        now.getUTCDate() === lastLogin.getUTCDate();

      if (isSameDay) return;

      // Check if streak is broken (more than 24h since last login window)
      const diffTime = Math.abs(now - lastLogin);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = 1;
      if (diffDays === 1) {
        newStreak = user.dailyLoginStreak + 1;
      }

      const reward = 10 * newStreak; // 10, 20, 30...

      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyLoginStreak: newStreak,
          lastLogin: now,
          cyberCores: { increment: reward }
        }
      });

      await NotificationService.sendNotification(userId, {
        type: "DAILY_REWARD",
        title: "Daily Login Reward!",
        message: `Welcome back! You earned ${reward} Cyber-Cores. Streak: ${newStreak} days.`,
        metadata: { amount: reward, streak: newStreak }
      });

      await this.checkAchievements(userId, "LOGIN_STREAK", newStreak);

    } catch (error) {
      logger.error("Error processing daily login:", error);
    }
  }

  /**
   * Universal achievement checker
   */
  static async checkAchievements(userId, type, currentVal) {
    try {
      // Find eligible achievements the user hasn't unlocked yet
      const achievements = await prisma.achievement.findMany({
        where: {
          users: { none: { userId } }
        }
      });

      for (const ach of achievements) {
        const criteria = ach.criteria;
        if (criteria.type === type && currentVal >= criteria.threshold) {
          // Unlock!
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: ach.id
            }
          });

          // Grant reward
          if (ach.rewardType === "CORES") {
            await prisma.user.update({
              where: { id: userId },
              data: { cyberCores: { increment: parseInt(ach.rewardValue) } }
            });
          } else if (ach.rewardType === "BADGE") {
            await prisma.userBadge.create({
              data: {
                userId,
                badgeId: ach.rewardValue
              }
            });
          }

          await NotificationService.sendNotification(userId, {
            type: "ACHIEVEMENT",
            title: "Achievement Unlocked!",
            message: `Congratulations! You unlocked: ${ach.name}`,
            metadata: { achievementId: ach.id, rewardType: ach.rewardType }
          });
        }
      }
    } catch (error) {
      logger.error("Error checking achievements:", error);
    }
  }
}

export default RewardService;
