/**
 * VAST ITES - Contact Form Handler
 * Intercepts contact form submission, POSTs to Strapi, shows thank you message.
 */

(function () {
    'use strict';

    function initContactForm() {
        const form = document.querySelector('form');
        if (!form) return;
        // Prevent double-binding
        if (form.dataset.contactBound) return;
        form.dataset.contactBound = 'true';

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]') ||
                        form.querySelector('button');
            const originalBtnText = btn ? btn.innerHTML : '';

            if (btn) {
                btn.disabled = true;
                btn.innerHTML = 'Sending...';
            }

            const nameEl     = form.querySelector('input[name="name"], input[id*="name"], input[placeholder*="John"]');
            const emailEl    = form.querySelector('input[type="email"], input[name="email"], input[id*="email"]');
            const serviceEl  = form.querySelector('select');
            const detailsEl  = form.querySelector('textarea');

            const data = {
                name:            nameEl    ? nameEl.value.trim()    : '',
                email:           emailEl   ? emailEl.value.trim()   : '',
                interested_in:   serviceEl ? serviceEl.value.trim() : '',
                project_details: detailsEl ? detailsEl.value.trim() : '',
            };

            try {
                const res = await fetch(STRAPI_BASE_URL + '/api/contact-submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data }),
                });

                if (!res.ok) throw new Error('Server error ' + res.status);

                // Replace the section containing the form with thank you message
                const wrapper = form.closest('section') || form.parentElement;
                wrapper.innerHTML = `
                    <div style="text-align:center; padding:80px 20px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" style="margin-bottom:20px;">
                            <circle cx="12" cy="12" r="12" fill="#6633d7"/>
                            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h2 style="font-size:28px;font-weight:700;color:#111827;margin-bottom:12px;">Thank you for contacting VAST ITES.</h2>
                        <p style="font-size:17px;color:#4B5563;">Our team will review your request and get back to you shortly.</p>
                    </div>
                `;
            } catch (err) {
                console.error('[contact-form] Submission failed:', err);
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = originalBtnText;
                }
                alert('Something went wrong. Please try again or email us at ' + CONTACT_EMAIL);
            }
        });
    }

    // Form is injected dynamically via page-loader
    document.addEventListener('page-content-loaded', initContactForm);

    // Also try on DOMContentLoaded for static fallback
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactForm);
    } else {
        initContactForm();
    }
})();
