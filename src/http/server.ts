import { join } from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import FastifyView from '@fastify/view';
import EJS from 'ejs';
import { router } from './router.js';
import { fastifyCookie } from '@fastify/cookie';
import { fastifySession } from '@fastify/session';
import { fastifyFormbody } from '@fastify/formbody';
import { authPlugin } from './authPlugin.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const makeServer = () => {
  const server = Fastify();

  server.register(FastifyView, {
    engine: {
      ejs: EJS,
    },
    includeViewExtension: true,
    root: join(__dirname, 'views'),
    layout: 'layouts/layout.ejs',
  });

  server.register(fastifyCookie, {
    secret: '69DB95EA161AC342B1AC7D45EAB22456',
    parseOptions: {}
  })

  server.register(fastifySession, { 
    secret: '69DB95EA161AC342B1AC7D45EAB22456', 
    cookie: { 
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    },
    saveUninitialized: false
  })

  server.register(authPlugin);
  server.register(fastifyFormbody);

  server.register(router);

  return server;
};

export { makeServer };
