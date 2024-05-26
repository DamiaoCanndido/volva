import { setPoints } from '../helpers';
import { prisma } from '../lib/prisma';

let isFetching = false;

type Match = {
  id: number;
  homeScore: number;
  awayScore: number;
};

export const getMatch = async (match: Match) => {
  if (isFetching) {
    return;
  }
  isFetching = true;
  try {
    const guesses = await prisma.guess.findMany({
      where: { gameId: match.id },
    });

    for (const guess of guesses) {
      await prisma.guess.update({
        where: {
          id: guess.id,
        },
        data: {
          points: setPoints(
            guess.homeScore,
            guess.awayScore,
            match.homeScore,
            match.awayScore
          ),
        },
      });
    }

    const sum = await prisma.guess.groupBy({
      by: ['playerId'],
      _sum: { points: true },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
    });

    for (const s of sum) {
      await prisma.player.update({
        where: {
          id: s.playerId,
        },
        data: {
          points: s._sum.points!,
        },
      });
    }
    /*
    const pools = await prisma.pool.updateMany({
      where: {
        games: {
          has: match.id,
        },
      },
      data: {
        queue: {
          increment: 1,
        },
      },
    });
    */
  } finally {
    isFetching = false;
  }
};
