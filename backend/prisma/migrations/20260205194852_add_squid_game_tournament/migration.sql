/*
  Warnings:

  - A unique constraint covering the columns `[joinCode]` on the table `TeamBattle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdByUserId` to the `TeamBattle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joinCode` to the `TeamBattle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SquidGameStatus" AS ENUM ('REGISTRATION', 'ROUND_ACTIVE', 'ROUND_ENDED', 'COMPLETED');

-- AlterTable
ALTER TABLE "TeamBattle" ADD COLUMN     "createdByUserId" TEXT NOT NULL,
ADD COLUMN     "joinCode" TEXT NOT NULL,
ADD COLUMN     "joinedByUserId" TEXT;

-- CreateTable
CREATE TABLE "SquidGame" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SquidGameStatus" NOT NULL DEFAULT 'REGISTRATION',
    "maxPlayers" INTEGER NOT NULL DEFAULT 50,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "totalRounds" INTEGER NOT NULL DEFAULT 5,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquidGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquidGameParticipant" (
    "id" TEXT NOT NULL,
    "squidGameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roundsEliminated" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "roundScores" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminatedAt" TIMESTAMP(3),

    CONSTRAINT "SquidGameParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquidGameRound" (
    "id" TEXT NOT NULL,
    "squidGameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "problemId" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "playersAtStart" INTEGER NOT NULL,
    "playersEliminated" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "SquidGameRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquidGameSubmission" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER,
    "testCasesPassed" INTEGER NOT NULL DEFAULT 0,
    "totalTestCases" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquidGameSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquidGameLeaderboard" (
    "id" TEXT NOT NULL,
    "squidGameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "playerRankings" JSONB NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquidGameLeaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SquidGameParticipant_squidGameId_userId_key" ON "SquidGameParticipant"("squidGameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SquidGameRound_squidGameId_roundNumber_key" ON "SquidGameRound"("squidGameId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SquidGameLeaderboard_squidGameId_roundNumber_key" ON "SquidGameLeaderboard"("squidGameId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TeamBattle_joinCode_key" ON "TeamBattle"("joinCode");

-- AddForeignKey
ALTER TABLE "TeamBattle" ADD CONSTRAINT "TeamBattle_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquidGameParticipant" ADD CONSTRAINT "SquidGameParticipant_squidGameId_fkey" FOREIGN KEY ("squidGameId") REFERENCES "SquidGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquidGameParticipant" ADD CONSTRAINT "SquidGameParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquidGameRound" ADD CONSTRAINT "SquidGameRound_squidGameId_fkey" FOREIGN KEY ("squidGameId") REFERENCES "SquidGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquidGameRound" ADD CONSTRAINT "SquidGameRound_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquidGameSubmission" ADD CONSTRAINT "SquidGameSubmission_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "SquidGameRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquidGameSubmission" ADD CONSTRAINT "SquidGameSubmission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "SquidGameParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquidGameLeaderboard" ADD CONSTRAINT "SquidGameLeaderboard_squidGameId_fkey" FOREIGN KEY ("squidGameId") REFERENCES "SquidGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;
