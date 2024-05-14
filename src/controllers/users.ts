import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export class Users {
  constructor(private fastify: FastifyInstance) {}

  async signin(request: FastifyRequest, reply: FastifyReply) {
    const createUserBody = z.object({
      access_token: z.string(),
    });

    const { access_token } = createUserBody.parse(request.body);

    const client = new OAuth2Client();

    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: access_token,
        audience: String(process.env.CLIENT_ID),
      });
      const payload = ticket.getPayload();
      return payload;
    }

    let userData;

    try {
      userData = await verify();
    } catch (error) {
      return reply.status(400).send({ error: 'token expired or invalid.' });
    }

    const userInfoSchema = z.object({
      sub: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    const userInfo = userInfoSchema.parse(userData);

    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.sub,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture,
        },
      });
    }

    const token = this.fastify.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: '7 days',
      }
    );

    return reply.status(201).send({ token });
  }
}
