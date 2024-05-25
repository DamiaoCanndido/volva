import { FastifyInstance } from 'fastify';
import { authenticate } from '../plugins';
import { Guesses } from '../controllers';

export async function guessRoutes(fastify: FastifyInstance) {
  const guesses = new Guesses();
  fastify.post('/guesses', { onRequest: [authenticate] }, guesses.create);
}
