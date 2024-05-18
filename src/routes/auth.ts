import { FastifyInstance } from 'fastify';
import { Users } from '../controllers';
import { authenticate } from '../plugins';

export async function authRoutes(fastify: FastifyInstance) {
  const users = new Users(fastify);
  fastify.post('/users', users.signin.bind(users));
  fastify.get('/me', { onRequest: [authenticate] }, users.getMe.bind(users));
}
