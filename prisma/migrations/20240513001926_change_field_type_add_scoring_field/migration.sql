/*
  Warnings:

  - You are about to drop the column `type` on the `Pool` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TypePool" AS ENUM ('normal');

-- CreateEnum
CREATE TYPE "TypeScore" AS ENUM ('oneZero');

-- AlterTable
ALTER TABLE "Pool" DROP COLUMN "type",
ADD COLUMN     "mode" "TypePool" NOT NULL DEFAULT 'normal',
ADD COLUMN     "scoring" "TypeScore" NOT NULL DEFAULT 'oneZero';

-- DropEnum
DROP TYPE "TypePoint";
