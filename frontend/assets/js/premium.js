/* ============================================================
   SAAP — PREMIUM MOTION LAYER (light theme)
   IMPORTANT: reveal animations are left to the template's AOS
   library. This layer only adds NON-opacity motion (parallax,
   3D tilt, magnetic buttons, counters) + the hero dashboard,
   so nothing can leave content stuck invisible.
   ============================================================ */
(function () {
    'use strict';

    /* ---- 1. Faint background layer ---- */
    function injectBackground() {
        if (document.querySelector('.p-bg-fx')) return;
        var fx = document.createElement('div');
        fx.className = 'p-bg-fx';
        fx.innerHTML = '<div class="p-orb o1"></div><div class="p-orb o2"></div><div class="p-orb o3"></div>';
        document.body.appendChild(fx);

        // mouse-following gradient glow (desktop / motion-ok only)
        if (window.matchMedia('(hover: none)').matches ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var glow = document.createElement('div');
        glow.className = 'p-cursor-glow';
        document.body.appendChild(glow);
        window.addEventListener('mousemove', function (e) {
            glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%, -50%)';
        }, { passive: true });
    }

    /* ---- 2. Replace hero placeholder image with a glass dashboard ---- */
    function injectDashboard() {
        var holder = document.querySelector('.hero-img');
        if (!holder || holder.querySelector('.p-dash')) return;

        // pairs of monthly bars: spend (purple) trending down, savings (teal) trending up
        var bars = [
            { h: 82 }, { h: 34, t: 1 },
            { h: 74 }, { h: 44, t: 1 },
            { h: 66 }, { h: 52, t: 1 },
            { h: 58 }, { h: 60, t: 1 }
        ];
        var barHtml = bars.map(function (b, i) {
            return '<span class="' + (b.t ? 't' : '') + '" style="height:' + b.h + '%;animation-delay:' + (i * 0.06) + 's"></span>';
        }).join('');

        holder.innerHTML =
            '<div class="p-dash p-float">' +
                '<div class="p-dash__bar"><i></i><i></i><i></i><span>app.cloudpi.ai / dashboard</span><span class="p-dash__live">Live</span></div>' +
                '<div class="p-dash__body">' +
                    '<div class="p-dash__nav"><b></b><b></b><b></b><b></b></div>' +
                    '<div class="p-dash__main">' +
                        '<div class="p-dash__stats">' +
                            '<div class="p-dash__stat"><small>Cloud spend</small><strong>$84.2k</strong><em class="down">&#9660; 30%</em></div>' +
                            '<div class="p-dash__stat"><small>Saved this month</small><strong>$26.4k</strong><em>&#9650; 12.4%</em></div>' +
                            '<div class="p-dash__stat"><small>Resources</small><strong>12,480</strong><em>optimized</em></div>' +
                        '</div>' +
                        '<div class="p-dash__chart">' +
                            '<div class="lbl"><span>Spend vs. savings</span><span class="p-dash__legend"><i class="c1"></i>Spend<i class="c2"></i>Saved</span></div>' +
                            '<div class="p-dash__bars">' + barHtml + '</div>' +
                            '<div class="p-dash__clouds"><span><i></i>AWS</span><span><i></i>Azure</span><span><i></i>GCP</span></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ---- Stacking cards: scale each card down as the next covers it ---- */
    function stackCards() {
        if (!(window.gsap && window.ScrollTrigger)) return;
        gsap.registerPlugin(ScrollTrigger);
        var cards = gsap.utils.toArray('.p-stack__card');
        cards.forEach(function (card, i) {
            if (i === cards.length - 1) return;
            gsap.to(card, {
                scale: 0.93,
                ease: 'none',
                scrollTrigger: {
                    trigger: cards[i + 1],
                    start: 'top 88%',
                    end: 'top 30%',
                    scrub: true
                }
            });
        });
    }

    /* ---- Hero slider: cycle badge + headline + subheading (staging slides) ---- */
    function heroSlider() {
        var rot = document.querySelector('.hero-rotator');
        if (!rot) return;
        var b = rot.querySelector('.hb-text'),
            t = rot.querySelector('.hero-h1'),
            s = rot.querySelector('.hero-sub');
        if (!b || !t || !s) return;
        var shots = document.querySelectorAll('.hero-shots img');
        var slides = [
            { badge: 'True Savings', title: 'TRUE Automated Savings', sub: 'Automatically identify optimization opportunities, eliminate idle resources, and implement cost-saving actions across AWS, Azure, and GCP — without manual effort.' },
            { badge: 'Cost Assignment', title: 'Reduce Your Cloud Costs Up to 30%', sub: 'Automatically detect waste, optimize resources, and reduce cloud spending across AWS, Azure, and GCP.' },
            { badge: 'Zero Tagging', title: 'Zero Tagging Pre-requisite', sub: 'Get meaningful cloud cost visibility from day one without waiting for perfect resource tags. CloudPi maps spend across AWS, Azure, and GCP using billing, usage, and metadata signals so teams can allocate and act faster.' },
            { badge: 'FinOps Bridge', title: 'The CloudPi FinOps Bridge', sub: "CloudPi's FinOps Bridge closes the execution gap through context synchronization, prioritized triage, policy-driven optimization, and approved audit workflows — turning static reports into an active savings cycle." },
            { badge: 'Intelligent Workflows', title: 'Workflow-Based Cost Remediations', sub: 'Automate cloud cost optimizations with workflow-driven remediations — rightsize resources, eliminate idle usage, and enforce cost-saving policies seamlessly.' }
        ];
        function splitWords(text) {
            t.innerHTML = text.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
            return t.querySelectorAll('.w');
        }
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var hasGsap = !!window.gsap && !reduce;
        if (hasGsap) splitWords(slides[0].title);   // wrap initial title in word spans

        var i = 0;
        setInterval(function () {
            i = (i + 1) % slides.length;
            var sl = slides[i];
            if (shots.length) {
                shots.forEach(function (im, idx) { im.classList.toggle('is-active', idx === i % shots.length); });
            }
            if (hasGsap) {
                // animate current words out (rise + blur, staggered)
                gsap.to(t.querySelectorAll('.w'), { yPercent: -45, opacity: 0, filter: 'blur(6px)', duration: .4, ease: 'power2.in', stagger: 0.03 });
                gsap.to([b, s], { opacity: 0, y: -10, duration: .35, onComplete: function () {
                    b.textContent = sl.badge;
                    s.textContent = sl.sub;
                    var words = splitWords(sl.title);
                    // animate new words in (rise from below, blur -> sharp, staggered)
                    gsap.fromTo(words,
                        { yPercent: 60, opacity: 0, filter: 'blur(8px)' },
                        { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: .65, ease: 'power3.out', stagger: 0.05 });
                    gsap.fromTo([b, s], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', delay: .05 });
                } });
            } else {
                rot.classList.add('is-out');
                setTimeout(function () {
                    b.textContent = sl.badge; t.textContent = sl.title; s.textContent = sl.sub;
                    rot.classList.remove('is-out');
                }, 500);
            }
        }, 4500);
    }

    /* ---- Auto-switching hero headline ---- */
    function rotatingHeadline() {
        var el = document.querySelector('.p-rotate');
        if (!el) return;
        var items;
        try { items = JSON.parse(el.getAttribute('data-rotate')); } catch (e) { return; }
        if (!items || items.length < 2) return;
        var i = 0;
        setInterval(function () {
            i = (i + 1) % items.length;
            el.style.opacity = '0';
            el.style.transform = 'translateY(10px)';
            setTimeout(function () {
                el.textContent = items[i];
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 400);
        }, 2800);
    }

    /* ---- 3. Hero mouse-move 3D parallax ---- */
    function heroParallax() {
        var hero = document.querySelector('.hero-area');
        var img = document.querySelector('.hero-img');
        if (!hero || !img || window.matchMedia('(hover: none)').matches) return;
        hero.addEventListener('mousemove', function (e) {
            var r = hero.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            img.style.transform = 'perspective(1200px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
        });
        hero.addEventListener('mouseleave', function () {
            img.style.transform = 'perspective(1200px) rotateY(0) rotateX(0)';
        });
    }

    /* ---- 4. 3D tilt on cards (transform only — never touches opacity) ---- */
    function cardTilt() {
        if (window.matchMedia('(hover: none)').matches) return;
        var cards = document.querySelectorAll('.block-style-one, .block-style-two, .pricing-item, .blog-post-item, .p-int__card');
        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width;
                var py = (e.clientY - r.top) / r.height;
                card.style.transform = 'translateY(-6px) perspective(900px) rotateY(' + ((px - .5) * 5) + 'deg) rotateX(' + ((.5 - py) * 5) + 'deg)';
            });
            card.addEventListener('mouseleave', function () { card.style.transform = ''; });
        });
    }

    /* ---- 5. Magnetic buttons ---- */
    function magneticButtons() {
        if (window.matchMedia('(hover: none)').matches) return;
        document.querySelectorAll('.main-btn').forEach(function (btn) {
            btn.classList.add('p-magnetic');
            btn.addEventListener('mousemove', function (e) {
                var r = btn.getBoundingClientRect();
                var x = e.clientX - r.left - r.width / 2;
                var y = e.clientY - r.top - r.height / 2;
                btn.style.transform = 'translate(' + x * 0.25 + 'px,' + y * 0.35 + 'px)';
            });
            btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
        });
    }

    /* ---- 6. Light scroll parallax on block/cta images (transform only) ---- */
    function imageParallax() {
        if (!(window.gsap && window.ScrollTrigger)) return;
        gsap.registerPlugin(ScrollTrigger);
        gsap.utils.toArray('.fancy-text-block .img-holder .img-one, .cta-img img').forEach(function (img) {
            gsap.to(img, {
                yPercent: -10, ease: 'none',
                scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
            });
        });
    }

    /* ---- 7. Counter fallback (only if template counterUp is absent) ---- */
    function counters() {
        var nums = document.querySelectorAll('.counter-item .count');
        if (!nums.length || !('IntersectionObserver' in window)) return;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting || e.target.dataset.done) return;
                var el = e.target; el.dataset.done = '1';
                var target = parseInt(el.textContent.replace(/\D/g, ''), 10) || 0;
                var start = null, dur = 1700;
                function step(t) {
                    if (!start) start = t;
                    var p = Math.min((t - start) / dur, 1);
                    el.textContent = Math.floor(p * target).toLocaleString();
                    if (p < 1) requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
                io.unobserve(el);
            });
        }, { threshold: 0.5 });
        nums.forEach(function (n) { io.observe(n); });
    }

    /* ---- Pause SVG demo animations while off-screen (60fps / battery) ---- */
    function pauseOffscreenDemos() {
        if (!('IntersectionObserver' in window)) return;
        var svgs = document.querySelectorAll('.cp-screen svg');
        if (!svgs.length) return;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                var svg = e.target;
                try { e.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations(); } catch (_) {}
            });
        }, { threshold: 0 });
        svgs.forEach(function (s) { io.observe(s); });
    }

    function init() {
        injectBackground();
        rotatingHeadline();
        heroSlider();
        pauseOffscreenDemos();
        stackCards();
        heroParallax();
        cardTilt();
        magneticButtons();
        imageParallax();
        if (!(window.jQuery && jQuery.fn && jQuery.fn.counterUp)) counters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
