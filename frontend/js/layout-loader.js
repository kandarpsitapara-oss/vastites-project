/**
 * VAST ITES - Layout Loader (Strapi CMS version)
 * Fetches header and footer from Strapi API and injects into every page.
 */

(function () {
    'use strict';

    const API = STRAPI_BASE_URL + '/api/site-contents';

    async function fetchComponent(type) {
        const res = await fetch(`${API}?filters[type][$eq]=${type}&fields[0]=html_content`);
        if (!res.ok) throw new Error(`Strapi fetch failed for type="${type}": ${res.status}`);
        const json = await res.json();
        const entry = json.data?.[0];
        if (!entry) throw new Error(`No Strapi entry found for type="${type}"`);
        // Support Strapi v4 (entry.attributes) and v5 (flat)
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

    /**
     * VastBot Chat Widget - Loads the chatbot icon (bottom-right, fixed position).
     * Uses createElement to ensure the script executes (innerHTML won't run scripts).
     */
    function loadVastBotWidget() {
        if (document.getElementById('vastbot-widget-script')) return; // prevent duplicate
        var s = document.createElement('script');
        s.id = 'vastbot-widget-script';
        s.src = VASTBOT_WIDGET_URL;
        s.setAttribute('data-api-key', VASTBOT_API_KEY);
        s.setAttribute('data-api', VASTBOT_API_URL);
        s.setAttribute('data-theme', '#ff9326');
        s.setAttribute('data-position', 'right');
        s.setAttribute('data-greeting', 'Hi there! How can I help you today?');
        s.setAttribute('data-bot-name', 'VAST ITES Bot');
        s.setAttribute('data-logo', VASTBOT_LOGO);
        s.async = true;
        document.body.appendChild(s);
    }

    async function init() {
        document.body.style.visibility = 'hidden';

        const [headerResult, footerResult] = await Promise.allSettled([
            fetchComponent('header'),
            fetchComponent('footer'),
        ]);

        if (headerResult.status === 'fulfilled') injectHTML('site-header', headerResult.value);
        else console.error('[layout-loader] header:', headerResult.reason);

        if (footerResult.status === 'fulfilled') injectHTML('site-footer', footerResult.value);
        else console.error('[layout-loader] footer:', footerResult.reason);

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

    /**
     * Load layout (header/footer) from Strapi
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * VastBot widget loads independently — not tied to Strapi success.
     * This ensures the chatbot appears on EVERY page.
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadVastBotWidget);
    } else {
        loadVastBotWidget();
    }
})();
