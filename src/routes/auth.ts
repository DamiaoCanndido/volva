import { FastifyInstance } from 'fastify';
import { Users } from '../controllers';

export async function authRoutes(fastify: FastifyInstance) {
  const users = new Users(fastify);
  fastify.post('/users', users.signin.bind(users));
}
