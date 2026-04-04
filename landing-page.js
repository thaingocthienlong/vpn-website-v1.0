/**
 * Landing Page JS v2.0 — Viện Phương Nam
 * ui-ux-pro-max design - updated for v2.0 HTML structure
 */

(function () {
    'use strict';

    /* ================================================================
       1. FLOATING NAVBAR — scroll-aware glass blur
       ================================================================ */
    const navbar = document.getElementById('lp-navbar');
    if (navbar) {
        const onScroll = () => {
            navbar.classList.toggle('lp-navbar-scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ================================================================
       2. SMOOTH SCROLL — anchor links
       ================================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();

            // Instant feedback for TOC links
            if (this.closest('.lp-floating-toc')) {
                document.querySelectorAll('.lp-floating-toc a, .lp-floating-toc button.lp-toc-link').forEach(link => link.classList.remove('lp-toc-active'));
                this.classList.add('lp-toc-active');
            }

            const navbarH = navbar ? navbar.offsetHeight + 24 : 80;
            const top = target.getBoundingClientRect().top + window.scrollY - navbarH;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    /* ================================================================
       2.5 FLOATING TOC SPY — highlight active section
       ================================================================ */
    const tocAnchors = document.querySelectorAll('.lp-floating-toc a');
    const tocCurriculumBtn = document.getElementById('lp-toc-curriculum-btn');
    const allTocItems = [...tocAnchors];
    if (tocCurriculumBtn) allTocItems.push(tocCurriculumBtn);

    if (allTocItems.length > 0 && 'IntersectionObserver' in window) {
        /* Build a map: sectionId → tocElement */
        const sectionMap = [];

        tocAnchors.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) sectionMap.push({ el: target, tocItem: link });
            }
        });

        /* Add curriculum section → button mapping */
        if (tocCurriculumBtn) {
            const curriculumSection = document.getElementById('lp-curriculum');
            if (curriculumSection) {
                sectionMap.push({ el: curriculumSection, tocItem: tocCurriculumBtn });
            }
        }

        const tocObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    /* Remove active from all TOC items (both <a> and <button>) */
                    allTocItems.forEach(item => item.classList.remove('lp-toc-active'));
                    /* Find matching TOC item and activate */
                    const match = sectionMap.find(m => m.el === entry.target);
                    if (match) match.tocItem.classList.add('lp-toc-active');
                }
            });
        }, { threshold: 0, rootMargin: '-100px 0px -60% 0px' });

        sectionMap.forEach(m => tocObserver.observe(m.el));
    }

    /* ================================================================
       3. TAB SWITCHER — pill tabs
       ================================================================ */
    const tabBtns = document.querySelectorAll('.lp-tab-btn');
    const tabContents = document.querySelectorAll('.lp-tab-content');

    tabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const targetId = this.getAttribute('data-tab');

            // Update buttons
            tabBtns.forEach(function (b) {
                b.classList.remove('lp-tab-active');
                b.setAttribute('aria-selected', 'false');
            });
            this.classList.add('lp-tab-active');
            this.setAttribute('aria-selected', 'true');

            // Update content panels
            tabContents.forEach(function (panel) {
                panel.classList.remove('lp-tab-show');
            });
            const target = document.getElementById(targetId);
            if (target) {
                target.classList.add('lp-tab-show');
                // Re-trigger reveal animations inside the newly shown tab
                target.querySelectorAll('.lp-reveal').forEach(function (el) {
                    el.classList.remove('lp-visible');
                    setTimeout(function () { el.classList.add('lp-visible'); }, 50);
                });
            }
        });
    });

    /* ================================================================
       4. ACCORDION — curriculum & FAQ
       ================================================================ */
    document.querySelectorAll('.lp-accordion-header').forEach(function (header) {
        header.addEventListener('click', function () {
            const item = this.closest('.lp-accordion-item');
            const body = item.querySelector('.lp-accordion-body');
            const isOpen = item.classList.contains('lp-accordion-open');

            // Close siblings within the same accordion
            const accordion = item.closest('.lp-accordion');
            if (accordion) {
                accordion.querySelectorAll('.lp-accordion-item.lp-accordion-open').forEach(function (openItem) {
                    if (openItem !== item) {
                        openItem.classList.remove('lp-accordion-open');
                        openItem.querySelector('.lp-accordion-body').style.maxHeight = '0';
                        const btn = openItem.querySelector('.lp-accordion-header');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            // Toggle current
            if (isOpen) {
                item.classList.remove('lp-accordion-open');
                body.style.maxHeight = '0';
                this.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('lp-accordion-open');
                body.style.maxHeight = body.scrollHeight + 'px';
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Open first accordion by default
    document.querySelectorAll('.lp-accordion').forEach(function (acc) {
        const first = acc.querySelector('.lp-accordion-item.lp-accordion-open .lp-accordion-body');
        if (first && first.style.maxHeight === '0') {
            first.style.maxHeight = first.scrollHeight + 'px';
        }
    });

    /* ================================================================
       5. SCROLL REVEAL — IntersectionObserver
       ================================================================ */
    const reveals = document.querySelectorAll('.lp-reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('lp-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        reveals.forEach(function (el) { observer.observe(el); });
    } else {
        // Fallback: show all immediately
        reveals.forEach(function (el) { el.classList.add('lp-visible'); });
    }

    /* ================================================================
       6. CAPTCHA REFRESH
       ================================================================ */
    const captchaImg = document.getElementById('lp-captcha-img');
    if (captchaImg) {
        captchaImg.addEventListener('click', function () {
            const base = this.src.split('?')[0];
            this.src = base + '?r=' + Date.now();
        });
    }

    /* ================================================================
       7. FORM VALIDATION — client-side
       ================================================================ */
    const form = document.getElementById('lp-register-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            let valid = true;

            // Clear previous errors
            form.querySelectorAll('.lp-form-error').forEach(function (el) {
                el.style.display = 'none';
                el.textContent = '';
            });
            form.querySelectorAll('.lp-input-error').forEach(function (el) {
                el.classList.remove('lp-input-error');
            });

            // Full name
            const name = form.querySelector('[name="fullnamecontact"]');
            if (name && name.value.trim().length < 2) {
                showError(name, 'Vui lòng nhập họ tên (tối thiểu 2 ký tự)');
                valid = false;
            }

            // Phone
            const phone = form.querySelector('[name="phoneregister"]');
            if (phone && !/^[0-9]{9,11}$/.test(phone.value.trim())) {
                showError(phone, 'Số điện thoại không hợp lệ (9-11 chữ số)');
                valid = false;
            }

            // Province
            const province = form.querySelector('[name="tinh_thanh"]');
            if (province && !province.value.trim()) {
                showError(province, 'Vui lòng chọn tỉnh/thành từ danh sách');
                valid = false;
            }

            // Email (optional but validate format if filled)
            const email = form.querySelector('[name="emailcontact"]');
            if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                showError(email, 'Địa chỉ email không hợp lệ');
                valid = false;
            }

            // Captcha
            const captcha = form.querySelector('[name="captcha_challenge"]');
            if (captcha && captcha.value.trim().length < 4) {
                showError(captcha, 'Vui lòng nhập mã xác nhận');
                valid = false;
            }

            if (!valid) {
                e.preventDefault();
                // Scroll to first error
                const firstErr = form.querySelector('.lp-input-error');
                if (firstErr) {
                    const top = firstErr.getBoundingClientRect().top + window.scrollY - 120;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            } else {
                e.preventDefault(); // Prevent standard page reload

                // Show loading state and disable button
                const btn = form.querySelector('.lp-form-submit');
                const originalBtnHtml = btn ? btn.innerHTML : '';
                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; Đang xử lý...';
                }

                // Prepare Data. FormData must be constructed BEFORE disabling inputs
                const formData = new FormData(form);
                formData.append('action', 'ajax_register');

                // Disable all inputs
                const allInputs = form.querySelectorAll('input, select, textarea');
                allInputs.forEach(input => input.disabled = true);

                // Perform AJAX Request
                fetch(window.location.href, {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                    .then(response => response.text())
                    .then(text => {
                        let data;
                        try {
                            const jsonMatch = text.match(/\{"success":.*?\}/);
                            data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
                        } catch (err) {
                            data = { success: false, message: 'Có lỗi xảy ra kết nối từ máy chủ.' };
                        }

                        showPopupMessage(data.success, data.message);

                        // Re-enable button and inputs
                        if (btn) {
                            btn.disabled = false;
                            btn.innerHTML = originalBtnHtml;
                        }
                        allInputs.forEach(input => input.disabled = false);

                        // Reset if success
                        if (data.success) {
                            form.reset();
                            const captchaImg = document.getElementById('lp-captcha-img');
                            if (captchaImg) captchaImg.click(); // refresh captcha
                        }
                    })
                    .catch(err => {
                        showPopupMessage(false, 'Lỗi mạng! Vui lòng kiểm tra kết nối internet.');
                        if (btn) {
                            btn.disabled = false;
                            btn.innerHTML = originalBtnHtml;
                        }
                        allInputs.forEach(input => input.disabled = false);
                    });
            }
        });

        // ==========================================
        // Custom UI Popup Message
        // ==========================================
        function showPopupMessage(isSuccess, message) {
            const existing = document.getElementById('lp-ajax-popup');
            if (existing) existing.remove();

            const popup = document.createElement('div');
            popup.id = 'lp-ajax-popup';
            const bgColor = isSuccess ? '#10b981' : '#ef4444';
            const icon = isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle';
            const title = isSuccess ? 'Thành Công!' : 'Lỗi Đăng Ký';

            popup.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(15, 23, 42, 0.7); display: flex; align-items: center; justify-content: center;
                z-index: 999999; backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.3s ease;
                font-family: 'Inter', sans-serif;
            `;

            popup.innerHTML = `
                <div style="background: #ffffff; padding: 32px 24px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); max-width: 400px; width: 90%; text-align: center; transform: translateY(20px); transition: transform 0.3s ease;">
                    <div style="color: ${bgColor}; font-size: 56px; margin-bottom: 16px;">
                        <i class="fas ${icon}"></i>
                    </div>
                    <h3 style="margin: 0 0 12px; font-size: 22px; color: #1e293b; font-weight: 700;">${title}</h3>
                    <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">${message}</p>
                    <button id="lp-popup-close" style="background: ${bgColor}; color: #ffffff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; transition: opacity 0.2s; width: 100%;">
                        Đóng
                    </button>
                </div>
            `;

            document.body.appendChild(popup);

            // Trigger entry animation
            requestAnimationFrame(() => {
                popup.style.opacity = '1';
                popup.querySelector('div').style.transform = 'translateY(0)';
            });

            // Handle close
            document.getElementById('lp-popup-close').addEventListener('click', () => {
                popup.style.opacity = '0';
                popup.querySelector('div').style.transform = 'translateY(20px)';
                setTimeout(() => popup.remove(), 300);
            });
        }

        function showError(input, msg) {
            input.classList.add('lp-input-error');
            let errDiv = input.parentNode.querySelector('.lp-form-error');
            if (!errDiv) { errDiv = input.closest('.lp-form-group') && input.closest('.lp-form-group').querySelector('.lp-form-error'); }
            if (errDiv) {
                errDiv.textContent = msg;
                errDiv.style.display = 'block';
            }
        }

        // Live validation — remove error on input
        form.querySelectorAll('.lp-form-input, .lp-form-select').forEach(function (input) {
            input.addEventListener('input', function () {
                this.classList.remove('lp-input-error');
                const errDiv = this.closest('.lp-form-group') && this.closest('.lp-form-group').querySelector('.lp-form-error');
                if (errDiv) { errDiv.style.display = 'none'; }
            });
        });
    }

    /* ================================================================
       8. STAT COUNTER — animate numbers in hero
       ================================================================ */
    function animateCounter(el, end, suffix) {
        const duration = 1800;
        const start = 0;
        const startTime = performance.now();
        const update = function (currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(start + (end - start) * eased) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    const statNumbers = document.querySelectorAll('.lp-hero-stat-number');
    let statsAnimated = false;

    if (statNumbers.length) {
        const statObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !statsAnimated) {
                statsAnimated = true;
                statNumbers.forEach(function (el) {
                    const text = el.textContent.trim();
                    const num = parseInt(text.replace(/\D/g, ''), 10);
                    const suffix = text.replace(/[\d]/g, '');
                    if (!isNaN(num)) animateCounter(el, num, suffix);
                });
                statObserver.disconnect();
            }
        }, { threshold: 0.5 });
        statObserver.observe(statNumbers[0].closest('.lp-hero-stats') || statNumbers[0]);
    }

    /* ================================================================
       9. NETWORK PARTICLES (Canvas)
       ================================================================ */
    const canvas = document.getElementById('lp-hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        const particleCount = window.innerWidth > 768 ? 60 : 30;

        function initCanvas() {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 1.5 + 0.5
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(56, 189, 248, 1)';
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = dx * dx + dy * dy;

                    if (dist < 10000) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(drawParticles);
        }

        initCanvas();
        drawParticles();
        window.addEventListener('resize', initCanvas);
    }

    /* ================================================================
       10. TYPING EFFECT
       ================================================================ */
    const typingEls = document.querySelectorAll('[data-typing="true"]');
    typingEls.forEach(el => {
        const htmlToType = el.innerHTML.trim();
        el.innerHTML = '<span class="lp-typing-text"></span><span class="lp-typing-cursor"></span>';
        const textSpan = el.querySelector('.lp-typing-text');

        let i = 0;
        let isTyping = false;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isTyping) {
                isTyping = true;
                function typeChar() {
                    if (i < htmlToType.length) {
                        if (htmlToType.charAt(i) === '<') {
                            let tag = '';
                            while (i < htmlToType.length && htmlToType.charAt(i) !== '>') {
                                tag += htmlToType.charAt(i);
                                i++;
                            }
                            tag += '>';
                            textSpan.innerHTML += tag;
                            i++;
                            typeChar(); // instantly parse next char
                        } else {
                            textSpan.innerHTML += htmlToType.charAt(i);
                            i++;
                            setTimeout(typeChar, Math.random() * 30 + 10);
                        }
                    } else {
                        setTimeout(() => {
                            const cursor = el.querySelector('.lp-typing-cursor');
                            if (cursor) cursor.style.display = 'none';
                        }, 5000);
                    }
                }
                setTimeout(typeChar, 500);
                observer.unobserve(el);
            }
        }, { threshold: 0.5 });

        observer.observe(el);
    });

    /* ================================================================
       11. 3D TILT EFFECT & GLARE
       ================================================================ */
    const tiltItems = document.querySelectorAll('.lp-benefit-item, .lp-phuluc-col-content, .lp-course-card');
    tiltItems.forEach(item => {
        item.classList.add('lp-tilt-card');

        if (!item.querySelector('.lp-tilt-glare')) {
            const glare = document.createElement('div');
            glare.className = 'lp-tilt-glare';
            item.appendChild(glare);
        }

        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotX = ((y / rect.height) - 0.5) * -8;
            const rotY = ((x / rect.width) - 0.5) * 8;

            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;

            item.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
            item.style.setProperty('--glare-x', glareX + '%');
            item.style.setProperty('--glare-y', glareY + '%');
            item.style.setProperty('--glare-opacity', '1');
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            item.style.setProperty('--glare-opacity', '0');
        });
    });

})();
