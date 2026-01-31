-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_battleId_fkey";

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "battleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
