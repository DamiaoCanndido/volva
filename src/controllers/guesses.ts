import { FastifyReply, FastifyRequest } from 'fastify';

export class Guesses {
  async create(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ ok: true });
  }
}
