import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import axios from 'axios';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from '../errors';

type User = {
  name: string;
  avatarUrl: string;
  sub: string;
  iat: number;
  exp: number;
};

export class Users {
  constructor(private fastify: FastifyInstance) {}

  async signin(request: FastifyRequest, reply: FastifyReply) {
    const createUserBody = z.object({
      access_token: z.string(),
    });

    const { access_token } = createUserBody.parse(request.body);

    let userData;

    try {
      userData = await axios({
        method: 'GET',
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        headers: { Authorization: `Bearer ${access_token}` },
      });
    } catch (error) {
      throw new BadRequest('token expired or invalid.');
    }

    const userInfoSchema = z.object({
      sub: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    const userInfo = userInfoSchema.parse(userData.data);

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

    return reply
      .setCookie('token', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: true,
      })
      .status(201)
      .send({ token });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({ user: request.user });
  }
}
