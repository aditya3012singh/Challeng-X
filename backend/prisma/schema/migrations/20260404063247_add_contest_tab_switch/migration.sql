-- CreateTable
CREATE TABLE "ContestTabSwitch" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVisible" BOOLEAN NOT NULL,

    CONSTRAINT "ContestTabSwitch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContestTabSwitch_contestId_userId_idx" ON "ContestTabSwitch"("contestId", "userId");

-- AddForeignKey
ALTER TABLE "ContestTabSwitch" ADD CONSTRAINT "ContestTabSwitch_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTabSwitch" ADD CONSTRAINT "ContestTabSwitch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
