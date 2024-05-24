import { FastifyInstance } from 'fastify';
import { authenticate } from '../plugins';
import { Pools } from '../controllers';

export async function poolRoutes(fastify: FastifyInstance) {
  const pools = new Pools();
  fastify.post('/pools', { onRequest: [authenticate] }, pools.create);
  fastify.post(
    '/pools/normal',
    { onRequest: [authenticate] },
    pools.joinNormal
  );
  fastify.post(
    '/pools/custom',
    { onRequest: [authenticate] },
    pools.joinCustom
  );
  fastify.get('/pools/my', { onRequest: [authenticate] }, pools.myPools);
}
