import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:5501',
        'http://127.0.0.1:5501',
        'https://vastites.ca',
        'https://www.vastites.ca',
        'https://vastites.com',
        'https://www.vastites.com',
        'https://strapi.vastites.com',
        'https://www.strapi.vastites.com',
        'https://restreamer.in',
        'https://www.restreamer.in',
        'https://vastites-ca.restreamer.in',
      ],
      methods: ['GET', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
