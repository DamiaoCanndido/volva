/*
  Warnings:

  - You are about to drop the column `startDate` on the `Guess` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Guess" DROP COLUMN "startDate",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT false;
