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

    const queueIncrement = await prisma.guess.findFirst({
      where: {
        gameId: match.id,
        gameFull: false,
      },
    });

    if (queueIncrement) {
      await prisma.pool.updateMany({
        where: {
          games: {
            has: match.id,
          },
        },
        data: {
          gamesClosed: {
            increment: 1,
          },
        },
      });
    }

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
          gameFull: true,
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

    const pools = await prisma.pool.findMany({
      where: {
        games: {
          has: match.id,
        },
      },
    });

    for (const p of pools) {
      if (p.gamesClosed === p.nGames) {
        const rank = await prisma.player.findMany({
          where: {
            poolId: p.id,
          },
          select: {
            user: {
              select: {
                name: true,
                id: true,
              },
            },
            points: true,
          },
          orderBy: {
            points: 'desc',
          },
        });
        // criar função para definir vencedor, empates e derrotas.//
        await prisma.pool.update({
          where: {
            id: p.id,
          },
          data: {
            winners: [rank[0].user.id],
            poolFinished: true,
          },
        });
      }
    }
  } finally {
    isFetching = false;
  }
};
