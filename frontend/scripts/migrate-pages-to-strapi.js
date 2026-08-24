#!/usr/bin/env node
/**
 * VAST ITES — Strapi Page Content Migration Script
 *
 * For each HTML page in /html/:
 *   1. Extracts content between #site-header and #site-footer
 *   2. Strips inline <script> tags (incompatible with innerHTML injection)
 *   3. Derives a full-path slug  (e.g. html/ai-ml/consulting.html → ai-ml-consulting)
 *   4. POSTs to Strapi as a site-content entry (type=page)
 *   5. Replaces static content in the HTML file with <div id="page-content"></div>
 *   6. Injects <script src="/js/page-loader.js"> if not already present
 *
 * Usage:
 *   node scripts/migrate-pages-to-strapi.js            # full migration
 *   node scripts/migrate-pages-to-strapi.js --dry-run  # Strapi POST only, no HTML file changes
 */

const fs   = require('fs');
const path = require('path');
const http = require('http');

// Load .env from vastites-cms
require(path.resolve(__dirname, '../vastites-cms/node_modules/dotenv')).config({
    path: path.resolve(__dirname, '../vastites-cms/.env')
});

// ─── Config ────────────────────────────────────────────────────────────────
const STRAPI_HOST = process.env.MIGRATION_HOST;
const STRAPI_PORT = parseInt(process.env.MIGRATION_PORT, 10);
const API_TOKEN   = process.env.MIGRATION_API_TOKEN;
const HTML_DIR    = path.resolve(__dirname, '..', 'html');
const DRY_RUN     = process.argv.includes('--dry-run');
// ───────────────────────────────────────────────────────────────────────────

/** html/ai-ml/consulting.html  →  ai-ml-consulting */
function getSlug(filePath) {
    const rel = path.relative(HTML_DIR, filePath).replace(/\.html$/, '');
    return rel.split(path.sep).join('-');
}

/** Pull title + meta_description out of <head> */
function extractMeta(html) {
    const title   = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)  || [])[1]?.trim() || '';
    const metaDesc = (html.match(/<meta[^>]+name=["']description[""][^>]+content=["']([^"']*)["'][^>]*>/i)
                  || html.match(/<meta[^>]+content=["']([^"']*)[""][^>]+name=["']description["'][^>]*>/i)
                  || [])[1]?.trim() || '';
    return { title, meta_description: metaDesc };
}

/**
 * Return the HTML between #site-header and #site-footer,
 * with inline <script> tags removed.
 * Returns null if the markers aren't found.
 */
function extractBodyContent(html) {
    const match = html.match(
        /<div\s+id=["']site-header["'][^>]*><\/div>([\s\S]*?)<div\s+id=["']site-footer["'][^>]*><\/div>/i
    );
    if (!match) return null;
    return match[1]
        .replace(/<script[\s\S]*?<\/script>/gi, '')  // strip inline scripts
        .trim();
}

/** True if the page already has a #page-content div */
function isAlreadyMigrated(html) {
    return /id=["']page-content["']/.test(html);
}

/** Replace the static body content with an empty #page-content div */
function buildUpdatedHtml(original, bodyContent) {
    // Replace everything between site-header and site-footer
    let updated = original.replace(
        /(<div\s+id=["']site-header["'][^>]*><\/div>)([\s\S]*?)(<div\s+id=["']site-footer["'][^>]*><\/div>)/i,
        '$1\n\n    <div id="page-content"></div>\n\n    $3'
    );

    // Inject page-loader.js right after strapi-config.js (if not already present)
    if (!updated.includes('page-loader.js')) {
        updated = updated.replace(
            /(<script\s+src=["']\/js\/strapi-config\.js["'][^>]*><\/script>)/i,
            '$1\n    <script src="/js/page-loader.js"></script>'
        );
        // Fallback: inject before </body> if strapi-config.js wasn't found
        if (!updated.includes('page-loader.js')) {
            updated = updated.replace(
                /<\/body>/i,
                '    <script src="/js/page-loader.js"></script>\n</body>'
            );
        }
    }

    return updated;
}

// ─── HTTP helpers ───────────────────────────────────────────────────────────

function strapiGet(apiPath) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname : STRAPI_HOST,
            port     : STRAPI_PORT,
            path     : apiPath,
            method   : 'GET',
            headers  : { Authorization: `Bearer ${API_TOKEN}` }
        };
        const req = http.request(options, res => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => resolve({ status: res.statusCode, body: buf }));
        });
        req.on('error', reject);
        req.end();
    });
}

function strapiPost(data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ data });
        const options = {
            hostname : STRAPI_HOST,
            port     : STRAPI_PORT,
            path     : '/api/site-contents',
            method   : 'POST',
            headers  : {
                'Content-Type'  : 'application/json',
                'Authorization' : `Bearer ${API_TOKEN}`,
                'Content-Length': Buffer.byteLength(body)
            }
        };
        const req = http.request(options, res => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => resolve({ status: res.statusCode, body: buf }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function slugExistsInStrapi(slug) {
    const res = await strapiGet(
        `/api/site-contents?filters[type][$eq]=page&filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=slug`
    );
    const json = JSON.parse(res.body);
    return Array.isArray(json.data) && json.data.length > 0;
}

// ─── File walker ────────────────────────────────────────────────────────────

function collectHtmlFiles(dir, list = []) {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
            collectHtmlFiles(full, list);
        } else if (entry.endsWith('.html')) {
            list.push(full);
        }
    }
    return list;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    if (DRY_RUN) console.log('⚠️  DRY RUN — HTML files will NOT be modified.\n');

    const files = collectHtmlFiles(HTML_DIR);
    console.log(`Found ${files.length} HTML files in /html/\n`);

    let migrated = 0, skipped = 0, errors = 0;

    for (const file of files) {
        const rel         = path.relative(process.cwd(), file);
        const html        = fs.readFileSync(file, 'utf8');
        const slug        = getSlug(file);

        // Skip pages already converted to dynamic loading
        if (isAlreadyMigrated(html)) {
            console.log(`[SKIP]  ${rel}  —  already migrated`);
            skipped++;
            continue;
        }

        // Skip pages without the expected header/footer markers
        const bodyContent = extractBodyContent(html);
        if (!bodyContent) {
            console.log(`[SKIP]  ${rel}  —  site-header/site-footer markers not found`);
            skipped++;
            continue;
        }

        // Check if a Strapi entry for this slug already exists
        let exists = false;
        try {
            exists = await slugExistsInStrapi(slug);
        } catch (e) {
            console.log(`[ERROR] ${rel}  —  Strapi check failed: ${e.message}`);
            errors++;
            continue;
        }

        if (!exists) {
            // POST to Strapi
            const meta = extractMeta(html);
            let postRes;
            try {
                postRes = await strapiPost({
                    type             : 'page',
                    slug,
                    title            : meta.title,
                    meta_description : meta.meta_description,
                    html_content     : bodyContent
                });
            } catch (e) {
                console.log(`[ERROR] ${rel}  —  POST failed: ${e.message}`);
                errors++;
                continue;
            }

            if (postRes.status !== 200 && postRes.status !== 201) {
                console.log(`[ERROR] ${rel}  —  Strapi ${postRes.status}: ${postRes.body.slice(0, 120)}`);
                errors++;
                continue;
            }
        }

        console.log(`[OK]    ${rel}  →  slug: "${slug}"`);
        migrated++;

        // Update the HTML file (unless --dry-run)
        if (!DRY_RUN) {
            const updated = buildUpdatedHtml(html, bodyContent);
            fs.writeFileSync(file, updated, 'utf8');
        }
    }

    console.log(`\n✅ Done.  Migrated: ${migrated}  |  Skipped: ${skipped}  |  Errors: ${errors}`);
    if (DRY_RUN) console.log('   (Run without --dry-run to apply HTML changes.)');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
