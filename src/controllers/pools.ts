import { FastifyReply, FastifyRequest } from 'fastify';
import ShortUniqueId from 'short-unique-id';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import axios from 'axios';
import { Match } from '../entities';

export class Pools {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createPoolBody = z.object({
      mode: z.enum(['normal', 'custom']),
      nPlayers: z.optional(z.number().gte(2)),
      nGames: z.number().gte(1),
      leagueId: z.optional(z.number()),
      scoring: z.enum(['oneZero']),
    });

    const { mode, nGames, nPlayers, leagueId, scoring } = createPoolBody.parse(
      request.body
    );

    const generate = new ShortUniqueId({ length: 10 });
    const code = String(generate.rnd()).toUpperCase();

    let matches: Match[];

    try {
      const foot = await axios({
        method: 'GET',
        url: leagueId
          ? `${String(process.env.API)}/match/${leagueId}/league?t=${nGames}`
          : `${String(process.env.API)}/match?t=${nGames}`,
      });
      matches = foot.data;
    } catch (error) {
      return reply.status(400).send({ error: 'Error with external api' });
    }

    try {
      await prisma.pool.create({
        data: {
          mode,
          code,
          nGames: matches!.length,
          nPlayers,
          games: matches!.map((e) => {
            return e.id;
          }),
          leagueId,
          scoring,
          ownerId: request.user.sub,
          players: {
            create: {
              userId: request.user.sub,
            },
          },
        },
      });
      return reply.status(201).send({ code });
    } catch (error) {
      return reply.status(400).send({ error });
    }
  }

  async joinNormal(request: FastifyRequest, reply: FastifyReply) {
    const pool = await prisma.pool.findFirst({
      where: {
        mode: 'normal',
        poolClosed: false,
      },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!pool) {
      return reply.status(400).send({ error: 'no pool available create one.' });
    }

    const playerAlready = await prisma.player.findUnique({
      where: {
        userId_poolId: {
          userId: request.user.sub,
          poolId: pool.id,
        },
      },
    });

    if (playerAlready) {
      return reply.status(400).send({ error: 'you are already in this pool.' });
    }

    await prisma.player.create({
      data: {
        poolId: pool?.id!,
        userId: request.user.sub,
      },
    });

    const poolCreate = await prisma.pool.findFirst({
      where: {
        mode: 'normal',
        poolClosed: false,
      },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (poolCreate?._count.players! >= poolCreate?.nPlayers!) {
      await prisma.pool.update({
        where: {
          id: poolCreate?.id,
        },
        data: {
          poolClosed: true,
        },
      });
    }

    return reply.status(200).send({ pool: pool.code });
  }
}
