-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('RUN', 'SUBMIT');

-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "attemptsPlayer1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "attemptsPlayer2" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "type" "SubmissionType" NOT NULL DEFAULT 'SUBMIT';

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false;
