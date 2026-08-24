const fs = require('fs');
const path = require('path');

// Load .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

const required = ['STRAPI_BASE_URL', 'CONTACT_EMAIL', 'VASTBOT_WIDGET_URL', 'VASTBOT_API_URL', 'VASTBOT_API_KEY', 'VASTBOT_LOGO'];
const missing = required.filter(k => !process.env[k]);

if (missing.length) {
    console.error('Error: Missing required env vars:', missing.join(', '));
    process.exit(1);
}

const content = `// Auto-generated from .env — Do not edit manually.
const STRAPI_BASE_URL = '${process.env.STRAPI_BASE_URL}';
const CONTACT_EMAIL = '${process.env.CONTACT_EMAIL}';
const VASTBOT_WIDGET_URL = '${process.env.VASTBOT_WIDGET_URL}';
const VASTBOT_API_URL = '${process.env.VASTBOT_API_URL}';
const VASTBOT_API_KEY = '${process.env.VASTBOT_API_KEY}';
const VASTBOT_LOGO = '${process.env.VASTBOT_LOGO}';
`;

fs.writeFileSync(path.join(__dirname, 'js', 'strapi-config.js'), content);
console.log('strapi-config.js generated:', {
    STRAPI_BASE_URL: process.env.STRAPI_BASE_URL,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    VASTBOT_WIDGET_URL: process.env.VASTBOT_WIDGET_URL,
    VASTBOT_API_URL: process.env.VASTBOT_API_URL,
    VASTBOT_API_KEY: '***masked***',
    VASTBOT_LOGO: process.env.VASTBOT_LOGO,
});
