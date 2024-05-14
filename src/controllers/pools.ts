import { FastifyReply, FastifyRequest } from 'fastify';
import ShortUniqueId from 'short-unique-id';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export class Pools {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createPoolBody = z.object({
      mode: z.enum(['normal', 'custom']),
      nPlayers: z.optional(z.number().gte(2)),
      nGames: z.number().gte(1),
      games: z.array(z.number()).nonempty(),
      scoring: z.enum(['oneZero']),
    });

    const { mode, nGames, nPlayers, games, scoring } = createPoolBody.parse(
      request.body
    );

    const generate = new ShortUniqueId({ length: 10 });
    const code = String(generate.rnd()).toUpperCase();

    if (games.length !== nGames) {
      return reply.status(400).send({ error: 'number of games is not equal.' });
    }

    try {
      await prisma.pool.create({
        data: {
          mode,
          code,
          nGames,
          nPlayers,
          games,
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
}
