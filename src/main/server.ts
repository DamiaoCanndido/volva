import fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import { authRoutes } from '../routes';

const app = fastify();

app.register(jwt, {
  secret: String(process.env.JWT_SECRET),
});
app.register(cors, {
  origin: true,
});
app.register(authRoutes);

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('Server running on port 3333.');
});
