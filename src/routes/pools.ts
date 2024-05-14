import { FastifyInstance } from 'fastify';
import { authenticate } from '../plugins';
import { Pools } from '../controllers';

export async function poolRoutes(fastify: FastifyInstance) {
  const pools = new Pools();
  fastify.post('/pools', { onRequest: [authenticate] }, pools.create);
}