-- CreateEnum
CREATE TYPE "TypePoint" AS ENUM ('normal');

-- CreateTable
CREATE TABLE "Pool" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    "type" "TypePoint" NOT NULL DEFAULT 'normal',
    "queue" INTEGER NOT NULL DEFAULT 1,
    "nPlayers" INTEGER NOT NULL DEFAULT 2,
    "nGames" INTEGER NOT NULL,
    "games" INTEGER[],
    "winners" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "drawn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "losers" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
