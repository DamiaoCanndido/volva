/*
  Warnings:

  - You are about to drop the column `nPlayers` on the `Pool` table. All the data in the column will be lost.
  - You are about to drop the column `queue` on the `Pool` table. All the data in the column will be lost.
  - Added the required column `name` to the `Pool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pool" DROP COLUMN "nPlayers",
DROP COLUMN "queue",
ADD COLUMN     "gamesClosed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "name" TEXT NOT NULL;
