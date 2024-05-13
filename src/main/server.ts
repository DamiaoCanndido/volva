import fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import { authRoutes, poolRoutes } from '../routes';

const app = fastify();

app.register(jwt, {
  secret: String(process.env.JWT_SECRET),
});
app.register(cors, {
  origin: true,
});
app.register(authRoutes);
app.register(poolRoutes);

app.listen({ port: 4444, host: '0.0.0.0' }).then(() => {
  console.log('Server running on port 4444.');
});
