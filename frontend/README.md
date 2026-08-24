# Vastites.ca

Website for [vastites.ca](https://vastites.ca) — static HTML/CSS/JS frontend + Strapi CMS backend.

---

## Project Structure

```
/
├── js/                  # Frontend JavaScript
│   ├── strapi-config.js # Auto-generated from .env — do not edit manually
│   ├── layout-loader.js # Loads header/footer from Strapi
│   ├── contact-form.js  # Contact form handler
│   └── ...
├── vastites-cms/        # Strapi CMS backend
├── generate-config.js   # Reads .env → generates js/strapi-config.js
├── .env                 # Local environment variables (gitignored)
├── .env.example         # Template — copy this to .env
└── package.json
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL (for Strapi)

---

## Local Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd vastites.ca
```

### 2. Frontend config

```bash
cp .env.example .env
# Edit .env and fill in your values
npm install
npm run setup   # generates js/strapi-config.js from .env
```

### 3. Strapi (backend)

```bash
cp vastites-cms/.env.example vastites-cms/.env
# Edit vastites-cms/.env and fill in DB + SMTP credentials

cd vastites-cms
npm install
npm run develop   # starts Strapi in dev mode at http://localhost:1337
```

### 4. Open the site

Open any `.html` file directly in your browser, or serve with a local server:

```bash
npx serve .
```

---

## Environment Variables

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `STRAPI_BASE_URL` | Full URL to Strapi instance (e.g. `http://localhost:1337`) |
| `CONTACT_EMAIL` | Email shown in contact form error messages |

> After editing `.env`, always run `npm run setup` to regenerate `js/strapi-config.js`.

### Strapi (`vastites-cms/.env`)

| Variable | Description |
|----------|-------------|
| `HOST` / `PORT` | Strapi server host and port |
| `APP_KEYS`, `JWT_SECRET`, etc. | Strapi security keys |
| `DATABASE_*` | PostgreSQL connection details |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` | SMTP credentials for email |
| `SMTP_FROM` | Sender email address |
| `SMTP_TO` | Recipient email for contact form notifications |

---

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production |
| `development` | Live on restreamer.in (DevOps pulls from here) |
| `strapi-cms` | Active development branch |

---

## Deployment

Deployment is automated via GitHub Actions on push to `development` branch.

The workflow:
1. Writes `.env` files from GitHub Secrets (`FRONTEND_ENV`, `STRAPI_ENV`)
2. Rsyncs files to the server
3. Runs `npm install && npm run setup` (generates frontend config)
4. Builds Strapi (`npm run build`)
5. Restarts the PM2 process (`vastites-strapi`)

### GitHub Secrets required

| Secret | Description |
|--------|-------------|
| `FRONTEND_ENV` | Contents of frontend `.env` file |
| `STRAPI_ENV` | Contents of `vastites-cms/.env` file |
| `SSH_PRIVATE_KEY` | SSH key for server access |
| `SSH_USERNAME` | SSH username |
| `SERVER_IP` | Server IP address |
