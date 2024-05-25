import { FastifyInstance } from 'fastify';
import { BadRequest } from './bad-request';
import { ZodError } from 'zod';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      errors: error.flatten().fieldErrors,
    });
  }
  if (error instanceof BadRequest) {
    return reply.status(400).send({ error: error.message });
  }
  return reply.status(500).send({ error: 'internal server error.' });
};
