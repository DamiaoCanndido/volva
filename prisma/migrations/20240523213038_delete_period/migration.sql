/*
  Warnings:

  - You are about to drop the column `period` on the `Pool` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pool" DROP COLUMN "period",
ADD COLUMN     "leagueId" INTEGER;
