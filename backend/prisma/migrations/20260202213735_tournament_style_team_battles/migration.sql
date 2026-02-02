/*
  Warnings:

  - You are about to drop the column `currentRound` on the `TeamBattle` table. All the data in the column will be lost.
  - You are about to drop the column `problemId` on the `TeamBattle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TeamBattle" DROP CONSTRAINT "TeamBattle_problemId_fkey";

-- AlterTable
ALTER TABLE "TeamBattle" DROP COLUMN "currentRound",
DROP COLUMN "problemId",
ADD COLUMN     "team1Wins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "team2Wins" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TeamBattleMatch" (
    "id" TEXT NOT NULL,
    "teamBattleId" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "player1Submission" TEXT,
    "player2Submission" TEXT,
    "player1Language" TEXT,
    "player2Language" TEXT,
    "player1Output" TEXT,
    "player2Output" TEXT,
    "status" "BattleStatus" NOT NULL DEFAULT 'WAITING',
    "winnerId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamBattleMatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeamBattleMatch" ADD CONSTRAINT "TeamBattleMatch_teamBattleId_fkey" FOREIGN KEY ("teamBattleId") REFERENCES "TeamBattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamBattleMatch" ADD CONSTRAINT "TeamBattleMatch_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamBattleMatch" ADD CONSTRAINT "TeamBattleMatch_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamBattleMatch" ADD CONSTRAINT "TeamBattleMatch_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
