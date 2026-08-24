/**
 * VAST ITES - Page Loader (Strapi CMS version)
 * Fetches page body content from Strapi by slug and injects into #page-content.
 * Falls back to existing static HTML if Strapi is unavailable.
 */

(function () {
    'use strict';

    const API = STRAPI_BASE_URL + '/api/site-contents';

    function getSlugFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('slug')) return params.get('slug');
        // Build full-path slug: /html/ai-ml/consulting.html → ai-ml-consulting
        const parts = window.location.pathname.split('/').filter(Boolean);
        // Root URL (/) or just /index.html → slug is 'index'
        if (parts.length === 0 || (parts.length === 1 && parts[0] === 'index.html')) return 'index';
        const start = parts[0] === 'html' ? 1 : 0;
        const relevant = parts.slice(start).map((p, i, arr) =>
            i === arr.length - 1 ? p.replace(/\.html$/, '') : p
        );
        return relevant.join('-');
    }

    async function loadPage() {
        const slug = getSlugFromURL();
        if (!slug) return;

        let res;
        try {
            res = await fetch(
                `${API}?filters[type][$eq]=page&filters[slug][$eq]=${encodeURIComponent(slug)}` +
                `&fields[0]=html_content&fields[1]=title&fields[2]=meta_title&fields[3]=meta_description`
            );
        } catch (err) {
            // Network error or Strapi offline — keep static fallback content
            console.warn('[page-loader] Strapi unreachable, using static fallback.', err);
            return;
        }

        if (!res.ok) {
            console.warn('[page-loader] Strapi returned', res.status, '— using static fallback.');
            return;
        }

        const json = await res.json();
        const entry = json.data?.[0];
        if (!entry) {
            console.warn('[page-loader] No Strapi entry for slug:', slug, '— using static fallback.');
            return;
        }

        // Support Strapi v4 (entry.attributes) and v5 (flat)
        const attrs = entry.attributes ?? entry;

        // Inject body content only if Strapi returned something
        if (attrs.html_content) {
            const container = document.getElementById('page-content');
            if (container) {
                container.innerHTML = attrs.html_content;
                document.dispatchEvent(new CustomEvent('page-content-loaded'));
            }
        }

        // Update SEO fields
        if (attrs.title) document.title = attrs.title;
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
