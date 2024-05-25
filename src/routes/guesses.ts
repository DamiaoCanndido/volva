import { FastifyInstance } from 'fastify';
import { authenticate } from '../plugins';
import { Guesses } from '../controllers';

export async function guessRoutes(fastify: FastifyInstance) {
  const guesses = new Guesses();
  fastify.post(
    '/pool/:poolId/game/:gameId/guess',
    { onRequest: [authenticate] },
    guesses.create
  );
  fastify.get(
    '/pool/:poolId/game/:gameId/guess',
    { onRequest: [authenticate] },
    guesses.getGuesses
  );
}
