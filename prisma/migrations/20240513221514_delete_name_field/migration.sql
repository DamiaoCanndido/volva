/*
  Warnings:

  - You are about to drop the column `name` on the `Pool` table. All the data in the column will be lost.
  - Made the column `code` on table `Pool` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Pool" DROP COLUMN "name",
ALTER COLUMN "code" SET NOT NULL;
