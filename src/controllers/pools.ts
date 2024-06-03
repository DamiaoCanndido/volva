import { FastifyReply, FastifyRequest } from 'fastify';
import ShortUniqueId from 'short-unique-id';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import axios from 'axios';
import { League, Match } from '../entities';
import { BadRequest } from '../errors';
import { dateUTC } from '../helpers';

export class Pools {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createPoolBody = z.object({
      name: z.string(),
      mode: z.enum(['normal', 'custom']),
      nGames: z.number().gte(1).lte(16),
      leagueId: z.optional(z.number()),
    });

    const { name, mode, nGames, leagueId } = createPoolBody.parse(request.body);

    let league: League | undefined = undefined;

    if (leagueId) {
      try {
        const result = await axios({
          method: 'GET',
          url: `${String(process.env.API)}/league/${leagueId}`,
        });
        league = result.data;
      } catch (error) {
        throw new BadRequest('League not exists.');
      }
    }

    const generate = new ShortUniqueId({ length: 10 });
    const code = String(generate.rnd()).toUpperCase();

    let matches: Match[];

    try {
      const result = await axios({
        method: 'GET',
        url: leagueId
          ? `${String(
              process.env.API
            )}/match/${leagueId}/league?ft=false&t=${nGames}`
          : `${String(process.env.API)}/match?ft=false&t=${nGames}`,
      });
      matches = result.data;
    } catch (error) {
      throw new BadRequest('Error with external api');
    }

    try {
      await prisma.pool.create({
        data: {
          name,
          mode,
          code,
          nGames: matches!.length,
          games: matches!.map((e) => {
            return e.id;
          }),
          leagueId,
          league: league?.name,
          ownerId: request.user.sub,
          players: {
            create: {
              userId: request.user.sub,
            },
          },
          startTime: matches[0].startDate,
          endTime: matches[matches.length - 1].startDate,
        },
      });
      return reply.status(201).send({ code });
    } catch (error) {
      throw new BadRequest('some field is missing.');
    }
  }

  async getPoolById(request: FastifyRequest, reply: FastifyReply) {
    const paramId = z.object({
      id: z.string().uuid(),
    });
    const { id } = paramId.parse(request.params);

    const pool = await prisma.pool.findUnique({
      where: {
        id,
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    });

    return reply.status(200).send({ pool });
  }

  async getNormalPools(request: FastifyRequest, reply: FastifyReply) {
    const pools = await prisma.pool.findMany({
      where: {
        mode: 'normal',
        startTime: {
          gt: dateUTC(Date.now()),
        },
        players: {
          none: {
            userId: request.user.sub,
          },
        },
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    });
    return reply.status(200).send({ pools });
  }

  async joinNormal(request: FastifyRequest, reply: FastifyReply) {
    const normalParam = z.object({
      id: z.string().uuid(),
    });
    const { id } = normalParam.parse(request.params);

    const pool = await prisma.pool.findUnique({
      where: {
        id,
        mode: 'normal',
        startTime: {
          gt: dateUTC(Date.now()),
        },
        players: {
          none: {
            userId: request.user.sub,
          },
        },
      },
    });

    if (!pool) {
      throw new BadRequest('no pool available create one.');
    }

    await prisma.player.create({
      data: {
        poolId: pool?.id!,
        userId: request.user.sub,
      },
    });

    return reply.status(200).send({ pool: pool.code });
  }

  async joinCustom(request: FastifyRequest, reply: FastifyReply) {
    const joinCustomBody = z.object({
      code: z.string(),
    });

    const { code } = joinCustomBody.parse(request.body);

    const pool = await prisma.pool.findUnique({
      where: {
        code,
        startTime: {
          gt: dateUTC(Date.now()),
        },
        players: {
          none: {
            userId: request.user.sub,
          },
        },
      },
    });

    if (!pool) {
      throw new BadRequest('no pool available create one.');
    }

    await prisma.player.create({
      data: {
        poolId: pool?.id!,
        userId: request.user.sub,
      },
    });

    return reply.status(200).send({ pool: pool.code });
  }

  async myPools(request: FastifyRequest, reply: FastifyReply) {
    const myPools = await prisma.pool.findMany({
      where: {
        players: {
          some: {
            userId: {
              equals: request.user.sub,
            },
          },
        },
      },
      orderBy: { poolFinished: 'asc' },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    });
    return reply.status(200).send({ pools: myPools });
  }

  async poolRank(request: FastifyRequest, reply: FastifyReply) {
    const getPoolParam = z.object({
      id: z.string().uuid(),
    });
    const { id } = getPoolParam.parse(request.params);

    const pool = await prisma.pool.findUnique({ where: { id } });
    if (!pool) {
      throw new BadRequest('pool not exists.');
    }

    const players = await prisma.player.findMany({
      where: {
        poolId: id,
      },
      select: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
        points: true,
      },
      orderBy: {
        points: 'desc',
      },
    });
    return reply.status(200).send({ players });
  }
}
