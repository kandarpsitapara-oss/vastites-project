module.exports = {
  apps: [
    {
      name: 'vastites-backend',
      script: './node_modules/@strapi/strapi/bin/strapi.js',
      args: 'start',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',

      env: {
        NODE_ENV: 'production',
        PORT: 1337
      },

      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
