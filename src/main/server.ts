import fastify from 'fastify';
import env from '@fastify/env';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import { authRoutes } from '../routes';

const schema = {
  type: 'object',
  required: ['PORT'],
  properties: {
    PORT: {
      type: 'string',
      default: 3333,
    },
  },
};

const options = {
  confKey: 'config',
  schema,
};

const app = fastify();

app.register(env, options);
app.register(jwt, {
  secret: 'uaydkjahvwtygvw',
});
app.register(cors, {
  origin: true,
});
app.register(authRoutes);

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('Server running on port 3333.');
});
