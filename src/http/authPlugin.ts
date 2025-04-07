import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'
import { UserModel } from '../database/models/UsersModel.js';

interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

interface User {
  id: number;
  email: string;
}

const SECRET_KEY = process.env.JWT_SECRET || '69DB95EA161AC342B1AC7D45EAB22456'

export const authPlugin = fp(async (server: FastifyInstance) => {
  server.decorate('generateToken', (user: User) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    )
  })

  server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.cookies.auth_token
      if (!token) {
        return reply.view('login/index', {
          error: 'Token not provided'
        });
      }

      const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload

      const user = await UserModel.query()
        .findById(decoded.id)
        .select('id', 'email')
        .throwIfNotFound()

      request.user = user
    } catch (error) {
      reply.clearCookie('auth_token')

      if (error instanceof jwt.TokenExpiredError) {
        return reply.view('login/index', {
          error: 'Token expired'
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return reply.view('login/index', {
          error: 'Invalid token'
        });
      }

      return reply.view('login/index', {
        error: error
      });
    }
  })

})

declare module 'fastify' {
  interface FastifyInstance {
    generateToken(user: User): string;
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    verifyRole(role: string): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: User;
  }
}