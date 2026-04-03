-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "hints" TEXT[];

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "aiFeedback" TEXT;

-- CreateTable
CREATE TABLE "UserHint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "hintIndex" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserHint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserHint_userId_problemId_hintIndex_key" ON "UserHint"("userId", "problemId", "hintIndex");

-- AddForeignKey
ALTER TABLE "UserHint" ADD CONSTRAINT "UserHint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHint" ADD CONSTRAINT "UserHint_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
