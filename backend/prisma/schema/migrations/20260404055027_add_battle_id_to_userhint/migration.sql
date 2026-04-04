/*
  Warnings:

  - A unique constraint covering the columns `[userId,problemId,hintIndex,battleId,teamBattleMatchId]` on the table `UserHint` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserHint_userId_problemId_hintIndex_key";

-- AlterTable
ALTER TABLE "UserHint" ADD COLUMN     "battleId" TEXT,
ADD COLUMN     "teamBattleMatchId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserHint_userId_problemId_hintIndex_battleId_teamBattleMatc_key" ON "UserHint"("userId", "problemId", "hintIndex", "battleId", "teamBattleMatchId");

-- AddForeignKey
ALTER TABLE "UserHint" ADD CONSTRAINT "UserHint_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHint" ADD CONSTRAINT "UserHint_teamBattleMatchId_fkey" FOREIGN KEY ("teamBattleMatchId") REFERENCES "TeamBattleMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
