/**
 * VAST ITES - Main JavaScript
 * Pure Vanilla JS interactions
 */

window.toggleAccordion = function (header) {
    const content = header.nextElementSibling;
    const chevron = header.querySelector('.chevron');
    const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
    document.querySelectorAll('.accord-content').forEach(c => c.style.maxHeight = '0px');
    document.querySelectorAll('.chevron').forEach(c => c.style.transform = 'rotate(0deg)');
    if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + 'px';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Core Tech Section (Priority)
    try {
        initTechTabs();
        initMobileTechSlider();
        initTechStackTabs();
    } catch (e) { console.error("Tech section init failed:", e); }

    // 2. Header functions are now called by layout-loader.js AFTER header is injected.
    //    They are kept here as a safe fallback for pages that still have an inline header.
    initStickyHeader();
    initMobileMenu();
    initMobileMegaMenu();
    initAccordions();
    initActiveState();
    initScrollAnimations();
    initSkillLimits();

    // 3. Optional Dependencies
    try {
        initServicesSwiper();
    } catch (e) { console.error("Swiper init failed:", e); }

    try {
        initHeroSlider();
    } catch (e) { console.error("Hero slider init failed:", e); }

    try {
        initVerticalTabs();
        initHorizontalTechTabs();
        initWhyChooseHub();
        initCMSPlatformTabs();
        initEngagementAccordion();
    } catch (e) { console.error("Tabs init failed:", e); }

    initFaqAccordion();

    // Homepage-specific inits (safe to call on any page — guards inside)
    initHomeFaqAccordion();
    initDynamicServicesPanel();
});

// Re-run page content inits after Strapi injection
document.addEventListener('page-content-loaded', () => {
    try { initHeroSlider(); } catch (e) { console.error("Hero slider re-init failed:", e); }
    try { initServicesSwiper(); } catch (e) { console.error("Swiper re-init failed:", e); }
    try { initTechTabs(); initMobileTechSlider(); } catch (e) { console.error("Tech slider re-init failed:", e); }
    try { initVerticalTabs(); initTechStackTabs(); initHorizontalTechTabs(); initWhyChooseHub(); initCMSPlatformTabs(); initEngagementAccordion(); } catch (e) { console.error("Tabs re-init failed:", e); }
    initHomeFaqAccordion();
    initFaqAccordion();
    initPageFaqAccordion();
    initAccordions();
    initDynamicServicesPanel();
    initScrollAnimations();
    initProgressCircles();
    initMetricCircles();
    initOnPremiseCircles();
    initLoggingStats();
    initLoggingAccordion();
    initAccordionTriggers();
    initTechAccordion();
    initStatCircles();
    initDetailsAccordion();
    initSkillLimits();
});

/* -------------------------------------------------------------------------- */
/*                                7. Generic Sliders                           */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                7. Services Swiper Slider                    */
/* -------------------------------------------------------------------------- */
function initServicesSwiper() {
    const swiperContainer = document.querySelector('.servicesSwiper');
    if (!swiperContainer) return;

    // Services Swiper (Strict 3 per view for Desktop)
    const servicesSwiper = new Swiper(".servicesSwiper", {
        slidesPerView: 5,
        spaceBetween: 30,
        loop: false,
        speed: 600,
        grabCursor: true,
        centerInsufficientSlides: true,
        mousewheel: {
            forceToAxis: true,
        },
        navigation: {
            nextEl: ".services-next",
            prevEl: ".services-prev",
        },
        breakpoints: {
            320: { slidesPerView: 1, spaceBetween: 15 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 5, spaceBetween: 30 }
        },
        observer: true,
        observeParents: true,
        watchSlidesProgress: true
    });

    // Initialize Tab Filtering for Services Slider
    setupSwiperTabs(servicesSwiper, '.service-tabs li', 'web');
}

/**
 * Generic Tab Filtering for Swiper instances
 */
function setupSwiperTabs(swiperInstance, tabSelector, defaultCategory) {
    const tabs = document.querySelectorAll(tabSelector);
    if (!tabs.length || !swiperInstance) return;

    const filterSlides = (category) => {
        const lowerCat = category.toLowerCase().trim();

        // 1. If loop is enabled, we need to handle clones
        const isLoop = swiperInstance.params.loop;

        // 2. Filter slides
        const slides = Array.from(swiperInstance.wrapperEl.children);
        slides.forEach(slide => {
            // Internal Swiper clones shouldn't be counted for filtering but should be handled
            if (slide.classList.contains('swiper-slide-duplicate')) {
                slide.remove(); // Clean up old clones
                return;
            }

            const slideCat = (slide.getAttribute('data-category') || "").toLowerCase().trim();
            if (slideCat === lowerCat || lowerCat === 'all') {
                slide.style.removeProperty('display');
            } else {
                slide.style.setProperty('display', 'none', 'important');
            }
        });

        // 3. Update Swiper to recognize display changes
        swiperInstance.update();

        // 4. Reset loop if needed
        if (isLoop) {
            swiperInstance.loopDestroy();
            swiperInstance.loopCreate();
            swiperInstance.update();
        }

        swiperInstance.slideTo(0, 0);

        // Autoplay intentionally disabled for services slider
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterSlides(tab.textContent || tab.innerText);
        });
    });

    // Initial Filter
    if (defaultCategory) filterSlides(defaultCategory);
}

/* -------------------------------------------------------------------------- */
/*                                8. Tech Swiper Slider                        */
/* -------------------------------------------------------------------------- */
function initTechSwiper() {
    const techSwiperContainer = document.querySelector('.techSwiper');
    if (!techSwiperContainer) return;

    // Tech Stack Swiper (Icon Slider)
    const techSwiper = new Swiper(".techSwiper", {
        slidesPerView: 'auto',
        spaceBetween: 40,
        loop: false,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        grabCursor: true, /* Show hand cursor */
        freeMode: true,   /* Allow smooth scrolling without snapping */
        mousewheel: {
            forceToAxis: true,
        },
        observer: true,
        observeParents: true,
        navigation: {
            nextEl: ".tech-next",
            prevEl: ".tech-prev",
        },
        breakpoints: {
            // Auto layout handles responsiveness naturally, but we can tune spacing
            640: { spaceBetween: 20 },
            1024: { spaceBetween: 40 }
        }
    });

    // Initialize Tab Filtering for Tech Slider
    setupSwiperTabs(techSwiper, '.tech-tabs li', 'mobile');
}

/* -------------------------------------------------------------------------- */
/*                                1. Sticky Header                             */
/* -------------------------------------------------------------------------- */
function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let tick = false;

    window.addEventListener('scroll', () => {
        if (!tick) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 20) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                tick = false;
            });
            tick = true;
        }
    });
}

/* -------------------------------------------------------------------------- */
/*                                2. Mobile Menu                               */
/* -------------------------------------------------------------------------- */
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');
    const body = document.body;

    if (!mobileToggle || !nav) return;

    mobileToggle.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent accidental double-taps behavior
        const isActive = nav.classList.toggle('active');
        mobileToggle.classList.toggle('active');

        // Lock body scroll when menu is open
        if (isActive) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }

        // Hamburger Animation logic
        animateHamburger(mobileToggle, isActive);
    });
}

function animateHamburger(toggle, isActive) {
    const spans = toggle.querySelectorAll('span');
    if (!spans || spans.length < 3) return;

    if (isActive) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

/* -------------------------------------------------------------------------- */
/*                             3. Mobile Mega Menu                             */
/* -------------------------------------------------------------------------- */
function initMobileMegaMenu() {
    // Check initial state
    let isMobile = window.innerWidth <= 992;

    // Update on resize
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 992;
        // Optional: Reset open menus on resize to prevent layout bugs
        if (!isMobile) {
            document.querySelectorAll('.nav-item.has-mega-menu.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });

    const megaMenuToggles = document.querySelectorAll('.nav-item.has-mega-menu > .nav-link');

    megaMenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            // Check if we are in mobile view
            if (isMobile) {
                e.preventDefault(); // Prevent jump/navigation

                const parent = toggle.parentElement;
                const wasActive = parent.classList.contains('active');

                // Close all other mega menus for accordion effect
                document.querySelectorAll('.nav-item.has-mega-menu').forEach(item => {
                    item.classList.remove('active');
                    const arrow = item.querySelector('.arrow');
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                });

                // Toggle current
                if (!wasActive) {
                    parent.classList.add('active');
                    const arrow = toggle.querySelector('.arrow');
                    if (arrow) arrow.style.transform = 'rotate(180deg)';
                }
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                                4. Accordions                                */
/* -------------------------------------------------------------------------- */
function initAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    if (!accordionHeaders.length) return;

    accordionHeaders.forEach(header => {
        // Add ARIA and keyboard accessibility to div-based accordion headers
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'false');
        const body = header.parentElement && header.parentElement.querySelector('.accordion-body');
        if (body) {
            if (!body.id) body.id = 'acc-body-' + Math.random().toString(36).slice(2, 7);
            header.setAttribute('aria-controls', body.id);
        }

        const toggle = () => {
            const currentItem = header.parentElement;
            const container = currentItem.parentElement;
            const isActive = currentItem.classList.contains('active');

            // 1. Close all other items (Auto Close)
            const allItems = container.querySelectorAll('.accordion-item');
            allItems.forEach(item => {
                if (item !== currentItem) {
                    item.classList.remove('active');
                    const otherBody = item.querySelector('.accordion-body');
                    if (otherBody) otherBody.style.display = 'none';
                    const otherHeader = item.querySelector('.accordion-header');
                    if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                }
            });

            // 2. Toggle current item
            const currentBody = currentItem.querySelector('.accordion-body');
            if (isActive) {
                currentItem.classList.remove('active');
                if (currentBody) currentBody.style.display = 'none';
                header.setAttribute('aria-expanded', 'false');
            } else {
                currentItem.classList.add('active');
                if (currentBody) currentBody.style.display = 'block';
                header.setAttribute('aria-expanded', 'true');
            }
        };

        header.addEventListener('click', toggle);
        header.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                        Accordion Trigger (.accordion-trigger)               */
/* -------------------------------------------------------------------------- */
function initAccordionTriggers() {
    const triggers = document.querySelectorAll('.accordion-trigger');
    if (!triggers.length) return;

    triggers.forEach(trigger => {
        if (trigger.dataset.triggerBound) return;
        trigger.dataset.triggerBound = 'true';

        trigger.addEventListener('click', () => {
            const body = trigger.nextElementSibling;
            if (!body || !body.classList.contains('accordion-body')) return;

            const isOpen = body.style.display === 'block';
            const item = trigger.closest('.accordion-item') || trigger.parentElement;
            const container = item.parentElement;

            // Auto-close all other triggers + bodies in same container
            container.querySelectorAll('.accordion-trigger').forEach(t => {
                t.classList.remove('active');
                const b = t.nextElementSibling;
                if (b && b.classList.contains('accordion-body')) b.style.display = 'none';
            });

            // Open current if it was closed
            if (!isOpen) {
                body.style.display = 'block';
                trigger.classList.add('active');
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                              FAQ Accordion                                  */
/* -------------------------------------------------------------------------- */
function initFaqAccordion() {
    const faqButtons = document.querySelectorAll('.faq-button');
    if (!faqButtons.length) return;

    faqButtons.forEach(button => {
        button.setAttribute('aria-expanded', 'false');
        const content = button.nextElementSibling;
        if (content && content.classList.contains('faq-content')) {
            const contentId = 'faq-content-' + Math.random().toString(36).slice(2, 7);
            content.id = contentId;
            button.setAttribute('aria-controls', contentId);
        }

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            const content = button.nextElementSibling;
            if (isExpanded) {
                button.setAttribute('aria-expanded', 'false');
                if (content) content.style.maxHeight = '0px';
            } else {
                button.setAttribute('aria-expanded', 'true');
                if (content) content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                              5. Active State                                */
/* -------------------------------------------------------------------------- */
function initActiveState() {
    try {
        const currentPath = window.location.pathname.split('/').pop();
        if (!currentPath) return;

        // Get navigation links
        const navLinks = document.querySelectorAll('.nav-link, .mega-menu-col ul li a');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // Normalize comparison
            const normalizedHref = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
            const normalizedPath = currentPath === 'index.html' ? '' : currentPath; // Handle root

            if (href === currentPath || href.endsWith(currentPath)) {
                link.classList.add('active');

                // Highlight Parent Mega Menu
                const megaMenuCol = link.closest('.mega-menu-col');
                if (megaMenuCol) {
                    const navItem = link.closest('.nav-item');
                    if (navItem) {
                        navItem.querySelector('.nav-link').classList.add('active');
                    }
                }
            }
        });
    } catch (err) {
        console.warn('Active state logic skipped', err);
    }
}

/* -------------------------------------------------------------------------- */
/*                            6. Scroll Animations                             */
/* -------------------------------------------------------------------------- */
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return; // Fallback for really old browsers

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class with a slight delay if multiple items appear at once? No, keep it responsive.
                window.requestAnimationFrame(() => {
                    entry.target.classList.add('visible');
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Target elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .service-card, .section-title, .hero-content');

    animatedElements.forEach(el => {
        el.classList.add('fade-up-init');
        observer.observe(el);
    });
}
function initMetricCircles() {
    const cards = document.querySelectorAll('.metric-card[data-target]');
    if (!cards.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const target = parseFloat(card.getAttribute('data-target'));
                const circle = card.querySelector('.metric-progress') || card.querySelector('.progress-ring');
                const numEl = card.querySelector('.metric-number') || card.querySelector('.pct-text');
                if (circle) {
                    const dashoffset = 282.7 - (282.7 * target / 100);
                    circle.style.strokeDashoffset = dashoffset;
                }
                if (numEl) numEl.textContent = target + '%';
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.3 });
    cards.forEach(card => observer.observe(card));
}
function initOnPremiseCircles() {
    const circles = document.querySelectorAll('.progress-anim');
    if (!circles.length) return;
    circles.forEach(c => {
        c.style.animation = 'none';
        c.style.strokeDashoffset = '376.8';
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.getBoundingClientRect();
                el.style.animation = '';
                el.style.strokeDashoffset = '';
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.3 });
    circles.forEach(c => observer.observe(c));
}
function initLoggingStats() {
    const cards = document.querySelectorAll('.stat-card.reveal-on-scroll');
    if (!cards.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                card.classList.add('active');
                const path = card.querySelector('.stat-progress-path');
                if (path) {
                    const target = path.getAttribute('data-target');
                    path.style.strokeDasharray = target + ', 100';
                }
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.3 });
    cards.forEach(card => observer.observe(card));
}
function initLoggingAccordion() {
    const headers = document.querySelectorAll('.p-accordion-header');
    if (!headers.length) return;
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.p-accordion-item');
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.p-accordion-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}
function initProgressCircles() {
    const bars = document.querySelectorAll('.progress-bar[data-target]');
    if (!bars.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.strokeDashoffset = entry.target.getAttribute('data-target');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    bars.forEach(bar => observer.observe(bar));
}
/* -------------------------------------------------------------------------- */
/*                    Stat Circle Cards (.stat-circle-card)                    */
/* -------------------------------------------------------------------------- */
function initStatCircles() {
    const cards = document.querySelectorAll('.stat-circle-card[data-target]');
    if (!cards.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const target = parseFloat(card.getAttribute('data-target'));
                const circle = card.querySelector('.active-circle');
                const label = card.querySelector('.percentage-label');
                if (circle) {
                    const dashoffset = 282.7 - (282.7 * target / 100);
                    circle.style.strokeDashoffset = dashoffset;
                }
                if (label) label.textContent = target + '%';
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.3 });
    cards.forEach(card => observer.observe(card));
}

/* -------------------------------------------------------------------------- */
/*                  Tech Accordion (.tech-accordion-item)                      */
/* -------------------------------------------------------------------------- */
function initTechAccordion() {
    const headers = document.querySelectorAll('.tech-accordion-item .accordion-header');
    if (!headers.length) return;
    headers.forEach(header => {
        if (header.dataset.techBound) return;
        header.dataset.techBound = 'true';
        header.addEventListener('click', () => {
            const item = header.closest('.tech-accordion-item');
            const container = item.parentElement;
            const isActive = item.classList.contains('active');

            // Close all others in same container
            container.querySelectorAll('.tech-accordion-item').forEach(i => {
                if (i !== item) {
                    i.classList.remove('active');
                    const b = i.querySelector('.accordion-body');
                    if (b) b.style.display = 'none';
                }
            });

            // Toggle current
            const body = item.querySelector('.accordion-body');
            if (isActive) {
                item.classList.remove('active');
                if (body) body.style.display = 'none';
            } else {
                item.classList.add('active');
                if (body) body.style.display = 'block';
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*              Details/Summary Accordion (.v-details-item)                   */
/* -------------------------------------------------------------------------- */
function initDetailsAccordion() {
    const items = document.querySelectorAll('.v-details-item');
    if (!items.length) return;
    items.forEach(item => {
        if (item.dataset.detailsBound) return;
        item.dataset.detailsBound = 'true';
        item.addEventListener('toggle', () => {
            if (item.open) {
                items.forEach(other => {
                    if (other !== item) other.removeAttribute('open');
                });
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                                5. Tech Tabs                                */
/* -------------------------------------------------------------------------- */
function initTechTabs() {
    const tabs = document.querySelectorAll('.tech-tabs li');
    const slider = document.getElementById('mobile-tech-slider');
    if (!tabs.length || !slider) return;



    const filterTech = (category) => {
        if (!category) return;
        const lowerCat = category.toLowerCase().trim();
        const cards = slider.querySelectorAll('.mobile-tech-item-card');

        cards.forEach(card => {
            const cardCat = (card.getAttribute('data-category') || "").toLowerCase().trim();
            if (cardCat === lowerCat || lowerCat === 'all') {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        // Force a layout recalculation for the slider
        slider.dispatchEvent(new CustomEvent('categoryChanged'));
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Use textContent for cleaner text extraction
            const category = tab.textContent || tab.innerText;
            filterTech(category);
        });
    });

    // Initial Filter (Force Mobile)
    filterTech('mobile');
}

/* -------------------------------------------------------------------------- */
/*                                9. Hero Slider Initialization                */
/* -------------------------------------------------------------------------- */
function initHeroSlider() {
    const heroSliderElem = document.querySelector('.heroSlider');
    if (!heroSliderElem) return;

    const heroSlider = new Swiper('.heroSlider', {
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 40,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        speed: 800,
        pagination: {
            el: '.hero-slider-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.hero-slider-next',
            prevEl: '.hero-slider-prev',
        },
        keyboard: {
            enabled: true,
        },
        breakpoints: {
            320: {
                spaceBetween: 20
            },
            768: {
                spaceBetween: 30
            },
            1024: {
                spaceBetween: 40
            }
        }
    });
}

/* -------------------------------------------------------------------------- */
/*                        10. Custom Mobile Tech Slider                        */
/* -------------------------------------------------------------------------- */
function initMobileTechSlider() {
    const slider = document.getElementById('mobile-tech-slider');
    if (!slider) return;

    const track = slider.querySelector('.mobile-tech-slider-track');
    const viewport = slider.querySelector('.mobile-tech-slider-viewport');
    const prevBtn = slider.querySelector('.tech-prev');
    const nextBtn = slider.querySelector('.tech-next');

    if (!track || !viewport) return;

    // Clone content for infinite loop
    const originalCards = Array.from(track.children);
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('clone');
        track.appendChild(clone);
    });

    let currentX = 0;
    let targetX = 0;
    let isDragging = false;
    let startX = 0;
    let velocity = 0;
    let lastX = 0;
    let pullOffset = 0;
    let rafId = null;
    let isHovered = false;

    slider.addEventListener('mouseenter', () => isHovered = true);
    slider.addEventListener('mouseleave', () => isHovered = false);

    const lerp = (start, end, factor) => start + (end - start) * factor;
    const getScrollAmount = () => {
        if (window.innerWidth <= 425) return 130;  // 110px item + 20px gap
        if (window.innerWidth <= 768) return 150;  // 130px item + 20px gap
        return 220; // 180px item + 40px gap
    };

    const updateSlider = () => {
        const cards = Array.from(track.querySelectorAll('.mobile-tech-item-card')).filter(c => c.style.display !== 'none');

        if (cards.length > 0) {
            // Calculate loop point (half of total visible items)
            const singleSetWidth = (cards.length / 2) * getScrollAmount();

            // Inertia and Momentum
            if (!isDragging) {
                // Auto Scroll Logic
                if (!isHovered) {
                    targetX += 0.5; // Constant speed
                }

                velocity *= 0.92; // Friction
                targetX += velocity;

                // Infinite Loop Reset
                if (singleSetWidth > 0) {
                    if (targetX >= singleSetWidth) {
                        targetX -= singleSetWidth;
                        currentX -= singleSetWidth;
                    } else if (targetX < 0) {
                        targetX += singleSetWidth;
                        currentX += singleSetWidth;
                    }
                }

                currentX = lerp(currentX, targetX, 0.1);
            } else {
                currentX = lerp(currentX, targetX, 0.2);
            }

            // Magnetic Pull Decays
            pullOffset = lerp(pullOffset, 0, 0.1);

            // Apply Transform
            track.style.transform = `translate3d(-${currentX + pullOffset}px, 0, 0)`;

            // Update Arrows Opacity & Pointer Events (Always active for infinite loop)
            if (prevBtn && nextBtn) {
                prevBtn.style.opacity = '1';
                nextBtn.style.opacity = '1';
            }
        }

        rafId = requestAnimationFrame(updateSlider);
    };

    // Magnetic Arrow Logic
    const setupMagneticArrow = (btn, direction) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Button following cursor
            btn.style.transform = `translate3d(${x * 0.3}px, calc(-50% + ${y * 0.3}px), 0) scale(1.12)`;

            // Temporary Pull Offset (Magnetic Effect)
            if (!isDragging) {
                pullOffset = x * 0.2 * direction;
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate3d(0, -50%, 0) scale(1)`;
        });
    };

    if (prevBtn) setupMagneticArrow(prevBtn, -1);
    if (nextBtn) setupMagneticArrow(nextBtn, 1);

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const scrollAmount = getScrollAmount();
            targetX += scrollAmount;
            velocity += 10; // Extra nudge
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const scrollAmount = getScrollAmount();
            targetX -= scrollAmount;
            velocity -= 10; // Extra nudge
        });
    }

    // Drag Logic
    const onStart = (e) => {
        isDragging = true;
        startX = e.type === 'touchstart' ? e.touches[0].pageX : e.pageX;
        lastX = startX;
        velocity = 0;
        track.style.cursor = 'grabbing';
    };

    const onMove = (e) => {
        if (!isDragging) return;
        const x = e.type === 'touchmove' ? e.touches[0].pageX : e.pageX;
        const delta = x - lastX;
        targetX -= delta;
        velocity = delta * -0.5;
        lastX = x;
    };

    const onEnd = () => {
        isDragging = false;
        track.style.cursor = 'grab';
    };

    viewport.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    viewport.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    slider.addEventListener('categoryChanged', () => {
        targetX = 0;
        currentX = 0;
        velocity = 0;
    });

    rafId = requestAnimationFrame(updateSlider);
}

/* -------------------------------------------------------------------------- */
/*                        11. Vertical Services Tabs                           */
/* -------------------------------------------------------------------------- */
function initVerticalTabs() {
    const tabs = document.querySelectorAll('.v-tab-btn');
    const panes = document.querySelectorAll('.v-tab-pane');

    if (!tabs.length || !panes.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

/* Tech Stack Tab Functionality (Scoped for Inner Pages) */
function initTechStackTabs() {
    const tabs = document.querySelectorAll('.tech-filter-tabs li');
    const panes = document.querySelectorAll('.tech-category-pane');

    if (!tabs.length || !panes.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panes
            panes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}


/* 12. Horizontal Technologies Tabs */
function initHorizontalTechTabs() {
    const tabs = document.querySelectorAll('.tech-tab-btn');
    const panes = document.querySelectorAll('.tech-pane');

    if (!tabs.length || !panes.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panes
            panes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

/**
 * 13. Why Choose Hub Horizontal Tabs
 */
function initWhyChooseHub() {
    const tabs = document.querySelectorAll('.hub-tab-btn');
    const panes = document.querySelectorAll('.hub-pane');

    if (!tabs.length || !panes.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panes
            panes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                        CMS Platform Tabs Functionality                      */
/* -------------------------------------------------------------------------- */
function initCMSPlatformTabs() {
    const tabs = document.querySelectorAll('.cms-tab-btn');
    const panes = document.querySelectorAll('.cms-tab-pane');

    if (!tabs.length || !panes.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-cms-target');

            // Update tabs - remove active from all, add to clicked
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = '#ffffff';
                t.style.color = '#475569';
                t.style.borderColor = '#e2e8f0';
            });
            tab.classList.add('active');
            tab.style.background = '#0f172a';
            tab.style.color = '#ffffff';
            tab.style.borderColor = '#0f172a';

            // Update panes - hide all, show target
            panes.forEach(pane => {
                pane.classList.remove('active');
                pane.style.display = 'none';
            });
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
                targetPane.style.display = 'flex';
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                        Engagement Accordion (CMS Page)                      */
/* -------------------------------------------------------------------------- */
function initEngagementAccordion() {
    const tabs = document.querySelectorAll('.eng-accordion-btn');
    const panes = document.querySelectorAll('.eng-accordion-pane');

    if (!tabs.length || !panes.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);

            // Toggle logic: If clicking active, close it (accordion style). If clicking inactive, open it and close others (tab style).
            // Let's do pure accordion: toggle current, leave others? Or auto-close others?
            // "Accordion" usually implies one open at a time or independent.
            // Let's do: One open at a time to keep it clean.

            if (tab.classList.contains('active')) {
                // If already open, close it (collapsible)
                tab.classList.remove('active');
                if (targetPane) {
                    targetPane.classList.remove('active');
                    targetPane.style.display = 'none';
                }
            } else {
                // Close all others
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => {
                    p.classList.remove('active');
                    p.style.display = 'none';
                });

                // Open this one
                tab.classList.add('active');
                if (targetPane) {
                    targetPane.classList.add('active');
                    targetPane.style.display = 'block';
                }
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                        Homepage FAQ Accordion (.faq-header)                 */
/* -------------------------------------------------------------------------- */
function initHomeFaqAccordion() {
    const faqHeaders = document.querySelectorAll('.faq-header');
    if (!faqHeaders.length) return;

    faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const body = item.querySelector('.faq-body');
            const isActive = item.classList.contains('active');

            // Close all others
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherBody = otherItem.querySelector('.faq-body');
                    if (otherBody) otherBody.style.maxHeight = null;
                }
            });

            // Toggle current
            if (isActive) {
                item.classList.remove('active');
                if (body) body.style.maxHeight = null;
            } else {
                item.classList.add('active');
                if (body) body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                   Inner-Page FAQ Accordion (.faq-question)                  */
/* -------------------------------------------------------------------------- */
function initPageFaqAccordion() {
    const questions = document.querySelectorAll('.faq-question');
    if (!questions.length) return;

    questions.forEach(question => {
        if (question.dataset.faqBound) return;
        question.dataset.faqBound = 'true';

        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            if (!item) return;
            const body = item.querySelector('.faq-answer') || question.nextElementSibling;
            const isActive = item.classList.contains('active');

            // Close all others in same container
            const container = item.parentElement;
            container.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem === item) return;
                otherItem.classList.remove('active');
                const otherBody = otherItem.querySelector('.faq-answer') || otherItem.querySelector('.faq-question').nextElementSibling;
                if (otherBody) otherBody.style.maxHeight = null;
            });

            // Toggle current
            if (isActive) {
                item.classList.remove('active');
                if (body) body.style.maxHeight = null;
            } else {
                item.classList.add('active');
                if (body) body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                        Dynamic Services Panel                               */
/* -------------------------------------------------------------------------- */
function initDynamicServicesPanel() {
    const links = document.querySelectorAll('.ds-link');
    const mobileAccordion = document.getElementById('ds-mobile-accordion');

    if (!links.length && !mobileAccordion) return;

    const dsData = {
        software: {
            title: "Development Services",
            desc: `<p style="margin-bottom: 20px;">Seeking a top software development company worldwide? Look no further than VaST ITES for cost-effective and adaptable software development solutions. With over 12 years of experience in the industry, we specialize in creating cutting edge AI driven applications and cloud-native software to meet all your digital transformation needs.</p>
                   <p>Let us take your business to the next level and transform your vision into a profitable investment.</p>`,
            btnText: "Explore Development Services",
            link: "software-development.html"
        },
        staffing: {
            title: "Staffing & Recruitment Solutions",
            desc: `<p style="margin-bottom: 20px;">Bridging the talent gap with precision. We provide end-to-end recruitment solutions to help you build high-performing teams with the right technical expertise.</p>
                   <p>From dedicated offshore centers to specialized IT staffing, we connect you with the expertise you need to scale your business operations faster and more efficiently.</p>`,
            btnText: "Explore Staffing",
            link: "staffing-recruitment.html"
        },
        it_consulting: {
            title: "IT Consulting and Services",
            desc: `<p style="margin-bottom: 20px;">Strategic technology advisory for the modern enterprise. We help you navigate digital transformation and optimize your IT landscape for sustainable growth.</p>
                   <p>Our consultants align your technology investments with your long-term business goals to drive operational efficiency and create a lasting competitive advantage.</p>`,
            btnText: "Explore Consulting Services",
            link: "strategy-consulting.html"
        },
        mobile: {
            title: "Mobile Development",
            desc: `<p style="margin-bottom: 20px;">Reach your customers wherever they are with powerful, user-friendly mobile applications. We specialize in both native (iOS, Android) and cross-platform (Flutter, React Native) development.</p>
                   <p>From concept to app store deployment, we build apps that are secure, scalable, and engaging, leveraging the latest device features for innovation.</p>`,
            btnText: "Explore Mobile Apps",
            link: "mobile-development.html"
        },
        devops: {
            title: "DevOps & Cloud",
            desc: `<p style="margin-bottom: 20px;">Accelerate your software delivery and improve system reliability. We implement CI/CD pipelines, containerization, and infrastructure-as-code to streamline your operations.</p>
                   <p>Our goal is to bridge the gap between development and operations with automation. Scale your infrastructure effortlessly and detect issues earlier.</p>`,
            btnText: "Explore DevOps",
            link: "devops-infra.html"
        },
        ai: {
            title: "AI & ML",
            desc: `<p style="margin-bottom: 20px;">Harness the power of AI to automate processes and gain insights. Our services include predictive analytics, NLP, computer vision, and recommendation engines.</p>
                   <p>We help you identify high-impact use cases and build custom models that drive efficiency, turning your data into actionable intelligence.</p>`,
            btnText: "Explore AI Solutions",
            link: "ai-ml.html"
        },
        soc2: {
            title: "SOC 2 & Penetration Testing",
            desc: `<p style="margin-bottom: 20px;">Ensure your organization meets the highest standards of security. We provide SOC 2 readiness assessments and rigorous penetration testing to protect your data.</p>
                   <p>Our experts implement robust controls and remediate gaps, helping you build trust through proven security assurance.</p>`,
            btnText: "Explore Security Services",
            link: "soc-2-penetration-testing.html"
        },
        digital: {
            title: "Digital Experience",
            desc: `<p style="margin-bottom: 20px;">Craft compelling digital journeys that captivate your audience. We combine data-driven insights with creative design for seamless user experiences.</p>
                   <p>Our services encompass UI/UX design and customer journey mapping, helping you connect with users on a deeper level.</p>`,
            btnText: "Explore Digital Experience",
            link: "digital-experience.html"
        },
        iot: {
            title: "Internet Of Things (IoT)",
            desc: `<p style="margin-bottom: 20px;">Connect your physical and digital worlds. From smart device integration to real-time analytics, we enable you to monitor and control operations remotely.</p>
                   <p>We build secure, scalable IoT ecosystems. Whether it's smart home or industrial IoT, we turn connectivity into actionable business value.</p>`,
            btnText: "Explore IoT Solutions",
            link: "iot.html"
        }
    };

    // 1. Desktop Tabs Logic
    const contentArea = document.getElementById('ds-content-area');
    const titleEl = document.getElementById('ds-title');
    const descEl = document.getElementById('ds-desc');
    const btnEl = document.getElementById('ds-btn');

    if (links.length > 0 && titleEl) {
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const key = link.getAttribute('data-service');
                const data = dsData[key];
                if (!data) return;

                links.forEach(l => {
                    l.classList.remove('active');
                    l.style.fontWeight = '500';
                    l.style.color = '#64748b';
                    l.style.borderLeftColor = 'transparent';
                    l.style.backgroundColor = 'transparent';
                });

                link.classList.add('active');
                link.style.fontWeight = '600';
                link.style.color = '#0f172a';
                link.style.borderLeftColor = '#6633d7';
                link.style.backgroundColor = '#f8fafc';

                contentArea.style.opacity = '0';
                setTimeout(() => {
                    titleEl.textContent = data.title;
                    descEl.innerHTML = data.desc;
                    btnEl.textContent = data.btnText;
                    btnEl.href = data.link ? (data.link.includes('html/') ? data.link : './html/' + data.link) : '#';
                    contentArea.style.opacity = '1';
                }, 300);
            });
        });
    }

    // 2. Mobile Accordion Logic
    if (mobileAccordion) {
        // Clear before re-populating (in case called multiple times)
        mobileAccordion.innerHTML = '';

        Object.keys(dsData).forEach(key => {
            const data = dsData[key];
            const item = document.createElement('div');
            item.className = 'ds-acc-item';
            if (key === 'software') item.classList.add('active');

            item.innerHTML = `
                <button class="ds-acc-header">
                    <span>${data.title}</span>
                    <i class="fas fa-chevron-down ds-acc-icon"></i>
                </button>
                <div class="ds-acc-body" style="${key === 'software' ? 'max-height: 1000px;' : ''}">
                    <div class="ds-acc-content">
                        <div class="ds-acc-desc">${data.desc}</div>
                        <a href="${data.link.includes('html/') ? data.link : './html/' + data.link}" class="ds-acc-btn">${data.btnText}</a>
                    </div>
                </div>
            `;
            mobileAccordion.appendChild(item);
        });

        const accHeaders = mobileAccordion.querySelectorAll('.ds-acc-header');
        accHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const isActive = item.classList.contains('active');

                mobileAccordion.querySelectorAll('.ds-acc-item').forEach(otherItem => {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.ds-acc-body').style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('active');
                    const body = item.querySelector('.ds-acc-body');
                    body.style.maxHeight = body.scrollHeight + 'px';
                }
            });
        });
    }
}

/**
 * Limits the number of skills visible in cards and adds a (...) trigger
 */
function initSkillLimits() {
    const skillLists = document.querySelectorAll('.skills-list');

    skillLists.forEach(list => {
        const tags = list.querySelectorAll('.skill-tag');

        // If more than 2 tags, add "has-more" class and "..." indicator
        if (tags.length > 2) {
            list.classList.add('has-more');

            // Avoid duplicate (...) if function is re-called
            if (!list.querySelector('.skill-more')) {
                const moreTag = document.createElement('span');
                moreTag.className = 'skill-more';
                moreTag.innerText = '(...)';
                list.appendChild(moreTag);
            }
        }
    });
}

