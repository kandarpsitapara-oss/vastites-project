# Strapi CMS Integration — VAST ITES Static Site

## Overview

This document describes how to integrate **Strapi v5** as a headless CMS with the existing
HTML/CSS/JS static site. The frontend keeps its current structure. Strapi manages content
(pages, header, footer) via its admin panel, exposing a REST API that the frontend fetches
at runtime.

---

## Architecture

```
┌─────────────────────────────────┐     REST API      ┌──────────────────────────────┐
│  Strapi Admin Panel             │ ◄────────────────► │  Static HTML/CSS/JS Frontend │
│  (Content Management)           │  http://localhost  │  (Vastites.ca)               │
│                                 │  :1337/api         │                              │
│  Collection: site-contents      │                    │  layout-loader.js            │
│    - header entry               │                    │  → fetches header            │
│    - footer entry               │                    │  → fetches footer            │
│    - page entries (by slug)     │                    │  → injects into DOM          │
└─────────────────────────────────┘                    └──────────────────────────────┘
```

---

## Part 1: Strapi Setup

### 1.1 Install Strapi

Run this in a **separate folder** outside the frontend project (e.g., `vastites-cms/`).

```bash
npx create-strapi-app@latest vastites-cms
```

When prompted, select **Custom (manual settings)** and choose **PostgreSQL** as the database.
You will need a running PostgreSQL instance with a database created beforehand.

```
? Choose your installation type: Custom (manual settings)
? Choose your preferred language: JavaScript  
? Choose your default database client: postgres
? Database name: vastites_cms
? Host: 127.0.0.1
? Port: 5432
? Username: your_pg_user
? Password: your_pg_password
? Enable SSL connection: No (Yes for production)
```

- Opens admin at `http://localhost:1337/admin`
- Create your first admin user when prompted

### 1.2 Create the Collection Type

In the Strapi admin:

1. Go to **Content-Type Builder → Create new collection type**
2. Name: `SiteContent` (Strapi will pluralize the API to `site-contents`)

Add the following fields:

| Field Name       | Type        | Settings / Notes                                              |
|------------------|-------------|---------------------------------------------------------------|
| `type`           | Enumeration | Values: `page`, `header`, `footer` — **Required**            |
| `html_content`   | Long Text   | Stores raw HTML — **Required**                                |
| `title`          | Short Text  | Page `<title>` tag — Optional (only used for `type=page`)     |
| `slug`           | UID         | Target field: `title`. URL path e.g. `android-app-development` — Optional |
| `meta_title`     | Short Text  | `<meta name="title">` content — Optional                     |
| `meta_description` | Long Text | `<meta name="description">` content — Optional               |

3. Click **Save** and wait for Strapi to rebuild.

### 1.3 Configure API Permissions

1. Go to **Settings → Users & Permissions Plugin → Roles → Public**
2. Under `SiteContent`, enable:
   - `find` (GET all entries)
   - `findOne` (GET single entry)
3. Click **Save**

This lets the static frontend call the API without authentication.

### 1.4 Enable CORS for Your Frontend Domain

Edit `vastites-cms/config/middlewares.js`:

```js
// vastites-cms/config/middlewares.js
module.exports = [
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
        'http://localhost:5500',   // VS Code Live Server
        'http://127.0.0.1:5500',
        'https://vastites.ca',     // Production domain
        'https://www.vastites.ca',
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
```

Restart Strapi after saving.

---

## Part 2: Adding Content in Strapi Admin

### 2.1 Header Entry

1. **Content Manager → SiteContent → Create new entry**
2. Set:
   - `type`: `header`
   - `html_content`: Paste entire contents of `header.template.html` (the `<header>...</header>` block)
   - Leave all page/SEO fields empty
3. Click **Save → Publish**

### 2.2 Footer Entry

1. Create new entry
2. Set:
   - `type`: `footer`
   - `html_content`: Paste entire contents of `footer.template.html`
   - Leave all page/SEO fields empty
3. **Save → Publish**

### 2.3 Page Entry (example)

1. Create new entry
2. Set:
   - `type`: `page`
   - `title`: `Android App Development`
   - `slug`: `android-app-development` (auto-generated from title, or type manually)
   - `html_content`: Paste the `<main>` body content of `html/mobile-development/android-app-development.html`
   - `meta_title`: `Android App Development Services | VAST ITES`
   - `meta_description`: `Expert Android app development...`
3. **Save → Publish**

---

## Part 3: Frontend Integration

### 3.1 Strapi Config File

Create `js/strapi-config.js`:

```js
// js/strapi-config.js
const STRAPI_BASE_URL = 'http://localhost:1337'; // Change to production URL when deployed
```

### 3.2 Update `layout-loader.js`

Replace the current `layout-loader.js` with the Strapi-powered version.

Current behaviour: fetches `/components/header.html` and `/components/footer.html` from disk.
New behaviour: fetches the header and footer entries from the Strapi REST API and injects them.

```js
// js/layout-loader.js
(function () {
  'use strict';

  const API = STRAPI_BASE_URL + '/api/site-contents';

  async function fetchComponent(type) {
    const res = await fetch(`${API}?filters[type][$eq]=${type}&fields[0]=html_content`);
    if (!res.ok) throw new Error(`Strapi fetch failed for type="${type}": ${res.status}`);
    const json = await res.json();
    const entry = json.data?.[0];
    if (!entry) throw new Error(`No Strapi entry found for type="${type}"`);
    return entry.attributes?.html_content ?? entry.html_content;
  }

  function injectHTML(placeholderId, html) {
    const el = document.getElementById(placeholderId);
    if (el) el.innerHTML = html;
  }

  function reinitHeader() {
    if (typeof initStickyHeader   === 'function') initStickyHeader();
    if (typeof initMobileMenu     === 'function') initMobileMenu();
    if (typeof initMobileMegaMenu === 'function') initMobileMegaMenu();
    if (typeof initActiveState    === 'function') initActiveState();
  }

  async function init() {
    document.body.style.visibility = 'hidden';

    try {
      const [headerHTML, footerHTML] = await Promise.all([
        fetchComponent('header'),
        fetchComponent('footer'),
      ]);
      injectHTML('site-header', headerHTML);
      injectHTML('site-footer', footerHTML);
    } catch (err) {
      console.error('[layout-loader]', err);
      // Fallback: show body even if CMS fetch fails
    }

    requestAnimationFrame(() => {
      reinitHeader();
      const siteHeader = document.getElementById('site-header');
      if (siteHeader) {
        const firstContent = siteHeader.nextElementSibling;
        if (firstContent && !firstContent.id) {
          firstContent.id = 'main-content';
          firstContent.setAttribute('role', 'main');
        }
      }
      document.body.style.visibility = 'visible';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

### 3.3 Create `js/page-loader.js` (for CMS-driven pages)

This script is added to any HTML shell page that should load its body content from Strapi by slug.

```js
// js/page-loader.js
(function () {
  'use strict';

  const API = STRAPI_BASE_URL + '/api/site-contents';

  function getSlugFromURL() {
    // Use the query param ?slug=some-page  OR derive from the pathname
    const params = new URLSearchParams(window.location.search);
    if (params.has('slug')) return params.get('slug');
    // Fallback: last path segment without .html
    const parts = window.location.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    return last.replace(/\.html$/, '');
  }

  async function loadPage() {
    const slug = getSlugFromURL();
    if (!slug) return;

    const res = await fetch(
      `${API}?filters[type][$eq]=page&filters[slug][$eq]=${slug}` +
      `&fields[0]=html_content&fields[1]=title&fields[2]=meta_title&fields[3]=meta_description`
    );

    if (!res.ok) {
      console.error('[page-loader] Strapi error', res.status);
      return;
    }

    const json = await res.json();
    const entry = json.data?.[0];
    if (!entry) {
      console.warn('[page-loader] No page found for slug:', slug);
      return;
    }

    // Support both Strapi v4 (attributes) and v5 (flat) response shapes
    const attrs = entry.attributes ?? entry;

    // Inject body content
    const main = document.getElementById('page-content');
    if (main && attrs.html_content) main.innerHTML = attrs.html_content;

    // Set SEO fields
    if (attrs.title)            document.title = attrs.title + ' - VAST ITES';
    if (attrs.meta_title) {
      let mt = document.querySelector('meta[name="title"]');
      if (!mt) { mt = document.createElement('meta'); mt.name = 'title'; document.head.appendChild(mt); }
      mt.content = attrs.meta_title;
    }
    if (attrs.meta_description) {
      let md = document.querySelector('meta[name="description"]');
      if (!md) { md = document.createElement('meta'); md.name = 'description'; document.head.appendChild(md); }
      md.content = attrs.meta_description;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPage);
  } else {
    loadPage();
  }
})();
```

### 3.4 Shell Page Template for CMS Pages

For every page managed by Strapi, the HTML file becomes a thin shell:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VAST ITES</title><!-- overwritten by page-loader.js -->
  <link rel="stylesheet" href="../css/variables.css">
  <link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../css/layout.css">
  <link rel="stylesheet" href="../css/components.css">
  <link rel="stylesheet" href="../css/header.css">
  <link rel="stylesheet" href="../css/sections.css">
  <link rel="stylesheet" href="../css/footer.css">
  <link rel="stylesheet" href="../css/responsive.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="site-header"></div>
  <main>
    <div id="page-content"><!-- injected by page-loader.js --></div>
  </main>
  <div id="site-footer"></div>

  <script src="../js/strapi-config.js"></script>
  <script src="../js/main.js"></script>
  <script src="../js/layout-loader.js"></script>
  <script src="../js/page-loader.js"></script>
</body>
</html>
```

### 3.5 Script Load Order in All Existing Pages

Every existing HTML page must load `strapi-config.js` **before** `layout-loader.js`:

```html
<!-- At the bottom of <body>, in this order -->
<script src="/js/strapi-config.js"></script>
<script src="/js/main.js"></script>
<script src="/js/layout-loader.js"></script>
```

---

## Part 4: API Reference

### Get header HTML
```
GET /api/site-contents?filters[type][$eq]=header&fields[0]=html_content
```

### Get footer HTML
```
GET /api/site-contents?filters[type][$eq]=footer&fields[0]=html_content
```

### Get a page by slug
```
GET /api/site-contents?filters[type][$eq]=page&filters[slug][$eq]=android-app-development
```

### All pages (for a sitemap/index)
```
GET /api/site-contents?filters[type][$eq]=page&fields[0]=title&fields[1]=slug
```

---

## Part 5: File Changelist

| Action   | File                              | Change                                                         |
|----------|-----------------------------------|----------------------------------------------------------------|
| Create   | `js/strapi-config.js`             | Sets `STRAPI_BASE_URL` constant                                |
| Replace  | `js/layout-loader.js`             | Fetch header/footer from Strapi instead of local files         |
| Create   | `js/page-loader.js`               | Fetch page body + SEO by slug from Strapi                      |
| Update   | Every HTML page (script tags)     | Add `strapi-config.js` before `layout-loader.js`              |
| Optional | `html/template_root.html`         | Use shell template format with `id="page-content"`             |

---

## Part 6: Deployment Checklist

- [ ] Strapi running on a server (VPS / Railway / Render / DigitalOcean App Platform)
- [ ] PostgreSQL credentials updated in `config/database.js` for the production database
- [ ] `STRAPI_BASE_URL` in `strapi-config.js` updated to production URL
- [ ] CORS `origin` list updated with production domain
- [ ] All Strapi content entries published (not in Draft state)
- [ ] API token created (Settings → API Tokens) if you later want to restrict public read access
- [ ] CDN / caching layer in front of Strapi API recommended for high traffic

---

## Part 7: Migration Strategy (Existing Pages)

You do **not** need to migrate all pages at once. Migrate incrementally:

1. Start with header and footer only — the layout-loader change covers all pages immediately.
2. Pick one page (e.g. `android-app-development.html`) as a pilot:
   - Copy its `<main>` body HTML into a Strapi page entry.
   - Convert the HTML file to the shell template format.
   - Test locally.
3. Migrate remaining pages in batches.
4. Static pages not yet in Strapi continue to work as before.

---

## Part 8: Strapi v4 vs v5 API Response Shape

Strapi v5 flattens the response. The `page-loader.js` handles both:

```js
// Strapi v4: entry.attributes.html_content
// Strapi v5: entry.html_content
const attrs = entry.attributes ?? entry;
```

Check your installed version with `npx strapi version` in the `vastites-cms` folder.
