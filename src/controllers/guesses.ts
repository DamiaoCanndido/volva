import { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest, Forbidden } from '../errors';
import axios from 'axios';
import { Match } from '../entities';
import { dateUTC } from '../helpers';

export class Guesses {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createGuessParams = z.object({
      poolId: z.string(),
      gameId: z.string(),
    });

    const { gameId, poolId } = createGuessParams.parse(request.params);

    const player = await prisma.player.findUnique({
      where: {
        userId_poolId: {
          userId: request.user.sub,
          poolId,
        },
      },
    });
    if (!player) {
      throw new Forbidden('you are already in this pool.');
    }

    const pool = await prisma.pool.findUnique({
      where: {
        id: poolId,
      },
    });
    if (!pool) {
      throw new BadRequest('pool not exists.');
    }

    let game: Match;

    try {
      const response = await axios({
        method: 'GET',
        url: `${String(process.env.API)}/match/${gameId}`,
      });
      game = response.data;
    } catch (error) {
      throw new BadRequest('game not exists.');
    }

    if (game.startDate < dateUTC(Date.now())) {
      return reply.status(400).send({
        message: 'You cannot send guesses after the game date',
      });
    }

    const gameExistsOnPool = await prisma.pool.findMany({
      where: {
        games: {
          has: Number(gameId),
        },
      },
    });
    if (gameExistsOnPool.length === 0) {
      throw new BadRequest('The game does not exist in the pool.');
    }

    const guess = await prisma.guess.findUnique({
      where: {
        gameId_playerId: {
          gameId: Number(gameId),
          playerId: player.id,
        },
      },
    });

    if (guess) {
      throw new BadRequest('There is already a guess for this pool.');
    }

    return reply.send({ ok: gameExistsOnPool });
  }
}
