/*
  Warnings:

  - A unique constraint covering the columns `[battleCode]` on the table `Battle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `battleCode` to the `Battle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "battleCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Battle_battleCode_key" ON "Battle"("battleCode");
