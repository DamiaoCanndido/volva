/*
  Warnings:

  - Added the required column `endTime` to the `Pool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Pool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pool" ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;
