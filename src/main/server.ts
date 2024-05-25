import fastify from 'fastify';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { authRoutes, poolRoutes, guessRoutes } from '../routes';
import { errorHandler } from '../errors';

const app = fastify();

app.register(jwt, {
  secret: String(process.env.JWT_SECRET),
});
app.register(cookie, {
  secret: String(process.env.JWT_SECRET),
  hook: 'onRequest',
});
app.register(cors, {
  origin: true,
});
app.register(authRoutes);
app.register(poolRoutes);
app.register(guessRoutes);

app.setErrorHandler(errorHandler);

app.listen({ port: 4444, host: '0.0.0.0' }).then(() => {
  console.log('Server running on port 4444.');
});
