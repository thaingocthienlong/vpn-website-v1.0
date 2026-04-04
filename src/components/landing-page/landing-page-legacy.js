function showError(input, message) {
    if (!input) return;

    input.classList.add("lp-input-error");
    const group = input.closest(".lp-form-group");
    const errorNode = group ? group.querySelector(".lp-form-error") : null;
    if (errorNode) {
        errorNode.textContent = message;
        errorNode.style.display = "block";
    }
}

function clearErrors(form) {
    form.querySelectorAll(".lp-form-error").forEach((node) => {
        node.textContent = "";
        node.style.display = "none";
    });

    form.querySelectorAll(".lp-input-error").forEach((node) => {
        node.classList.remove("lp-input-error");
    });
}

function showPopupMessage(isSuccess, message) {
    const existing = document.getElementById("lp-ajax-popup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.id = "lp-ajax-popup";

    const backgroundColor = isSuccess ? "#10b981" : "#ef4444";
    const icon = isSuccess ? "fa-check-circle" : "fa-exclamation-circle";
    const title = isSuccess ? "Thành Công!" : "Lỗi Đăng Ký";

    popup.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.72);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity 0.3s ease;
        font-family: "Momo Sans", sans-serif;
    `;

    popup.innerHTML = `
        <div style="background: #ffffff; padding: 32px 24px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); max-width: 420px; width: calc(100% - 32px); text-align: center; transform: translateY(20px); transition: transform 0.3s ease;">
            <div style="color: ${backgroundColor}; font-size: 56px; margin-bottom: 16px;">
                <i class="fas ${icon}"></i>
            </div>
            <h3 style="margin: 0 0 12px; font-size: 22px; color: #1e293b; font-weight: 700;">${title}</h3>
            <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">${message}</p>
            <button id="lp-popup-close" style="background: ${backgroundColor}; color: #ffffff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: opacity 0.2s; width: 100%;">
                Đóng
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        popup.style.opacity = "1";
        const panel = popup.firstElementChild;
        if (panel) {
            panel.style.transform = "translateY(0)";
        }
    });

    const closePopup = () => {
        popup.style.opacity = "0";
        const panel = popup.firstElementChild;
        if (panel) {
            panel.style.transform = "translateY(20px)";
        }
        window.setTimeout(() => popup.remove(), 300);
    };

    const closeButton = popup.querySelector("#lp-popup-close");
    if (closeButton) {
        closeButton.addEventListener("click", closePopup, { once: true });
    }
}

function toggleGoogleDocButtons() {
    document.querySelectorAll('a[href*="docs.google.com/document"]').forEach((anchor) => {
        if (!anchor.classList.contains("lp-btn-doc")) {
            anchor.classList.add("lp-btn-doc");
            anchor.innerHTML = `<i class="fas fa-file-word"></i> ${anchor.innerHTML}`;
        }
    });
}

function initSmoothScroll(navbar) {
    const handlers = [];

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        const handler = (event) => {
            const href = anchor.getAttribute("href");
            if (!href) return;
            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();

            if (anchor.closest(".lp-floating-toc")) {
                document.querySelectorAll(".lp-floating-toc a, .lp-floating-toc button.lp-toc-link").forEach((item) => {
                    item.classList.remove("lp-toc-active");
                });
                anchor.classList.add("lp-toc-active");
            }

            const navbarHeight = navbar ? navbar.offsetHeight + 24 : 80;
            const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({ top, behavior: "smooth" });
        };

        anchor.addEventListener("click", handler);
        handlers.push(() => anchor.removeEventListener("click", handler));
    });

    return handlers;
}

function initTocSpy() {
    const tocAnchors = document.querySelectorAll(".lp-floating-toc a");
    const tocCurriculumButton = document.getElementById("lp-toc-curriculum-btn");
    const allItems = [...tocAnchors];
    if (tocCurriculumButton) {
        allItems.push(tocCurriculumButton);
    }

    if (allItems.length === 0 || !("IntersectionObserver" in window)) {
        return () => {};
    }

    const sectionMap = [];
    tocAnchors.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (target) {
            sectionMap.push({ el: target, tocItem: link });
        }
    });

    if (tocCurriculumButton) {
        const curriculumSection = document.getElementById("lp-curriculum");
        if (curriculumSection) {
            sectionMap.push({ el: curriculumSection, tocItem: tocCurriculumButton });
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            allItems.forEach((item) => item.classList.remove("lp-toc-active"));
            const match = sectionMap.find((item) => item.el === entry.target);
            if (match) {
                match.tocItem.classList.add("lp-toc-active");
            }
        });
    }, { threshold: 0, rootMargin: "-100px 0px -60% 0px" });

    sectionMap.forEach((item) => observer.observe(item.el));

    return () => observer.disconnect();
}

function initAccordion() {
    const handlers = [];

    document.querySelectorAll(".lp-accordion-header").forEach((header) => {
        const handler = () => {
            const item = header.closest(".lp-accordion-item");
            if (!item) return;
            const body = item.querySelector(".lp-accordion-body");
            if (!body) return;

            const isOpen = item.classList.contains("lp-accordion-open");
            const accordion = item.closest(".lp-accordion");

            if (accordion) {
                accordion.querySelectorAll(".lp-accordion-item.lp-accordion-open").forEach((openItem) => {
                    if (openItem === item) return;

                    openItem.classList.remove("lp-accordion-open");
                    const openBody = openItem.querySelector(".lp-accordion-body");
                    if (openBody) {
                        openBody.style.maxHeight = "0";
                    }
                    const openButton = openItem.querySelector(".lp-accordion-header");
                    if (openButton) {
                        openButton.setAttribute("aria-expanded", "false");
                    }
                });
            }

            if (isOpen) {
                item.classList.remove("lp-accordion-open");
                body.style.maxHeight = "0";
                header.setAttribute("aria-expanded", "false");
            } else {
                item.classList.add("lp-accordion-open");
                body.style.maxHeight = `${body.scrollHeight}px`;
                header.setAttribute("aria-expanded", "true");
            }
        };

        header.addEventListener("click", handler);
        handlers.push(() => header.removeEventListener("click", handler));
    });

    document.querySelectorAll(".lp-accordion").forEach((accordion) => {
        const defaultBody = accordion.querySelector(".lp-accordion-item.lp-accordion-open .lp-accordion-body");
        if (defaultBody && defaultBody.style.maxHeight !== `${defaultBody.scrollHeight}px`) {
            defaultBody.style.maxHeight = `${defaultBody.scrollHeight}px`;
        }
    });

    return handlers;
}

function initRevealObserver() {
    const reveals = document.querySelectorAll(".lp-reveal");
    if (reveals.length === 0) {
        return () => {};
    }

    if (!("IntersectionObserver" in window)) {
        reveals.forEach((element) => element.classList.add("lp-visible"));
        return () => {};
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("lp-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    reveals.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
}

function initCaptchaRefresh() {
    const captchaImage = document.getElementById("lp-captcha-img");
    if (!captchaImage) return () => {};

    const refresh = () => {
        const base = captchaImage.src.split("?")[0];
        captchaImage.src = `${base}?r=${Date.now()}`;
    };

    captchaImage.addEventListener("click", refresh);
    return () => captchaImage.removeEventListener("click", refresh);
}

function initFormSubmission() {
    const form = document.getElementById("lp-register-form");
    if (!form) return () => {};

    const submitHandler = async (event) => {
        event.preventDefault();
        clearErrors(form);

        let isValid = true;

        const lastName = form.querySelector('[name="ho_lot"]');
        if (!lastName || lastName.value.trim().length < 2) {
            showError(lastName, "Vui lòng nhập họ và chữ lót (tối thiểu 2 ký tự)");
            isValid = false;
        }

        const firstName = form.querySelector('[name="ten"]');
        if (!firstName || firstName.value.trim().length < 1) {
            showError(firstName, "Vui lòng nhập tên");
            isValid = false;
        }

        const phone = form.querySelector('[name="phoneregister"]');
        if (!phone || !/^[0-9+\-\s]{8,15}$/.test(phone.value.trim())) {
            showError(phone, "Số điện thoại không hợp lệ (8-15 ký tự)");
            isValid = false;
        }

        const province = form.querySelector('[name="tinh_thanh"]');
        if (!province || !province.value.trim()) {
            showError(province, "Vui lòng chọn tỉnh/thành từ danh sách");
            isValid = false;
        }

        const email = form.querySelector('[name="emailcontact"]');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            showError(email, "Địa chỉ email không hợp lệ");
            isValid = false;
        }

        const captcha = form.querySelector('[name="captcha_challenge"]');
        if (!captcha || captcha.value.trim().length < 4) {
            showError(captcha, "Vui lòng nhập mã xác nhận");
            isValid = false;
        }

        const agreement = form.querySelector('[name="agreement"]');
        if (!agreement || !agreement.checked) {
            showError(agreement, "Bạn cần đồng ý với chính sách bảo mật");
            isValid = false;
        }

        const discoverySource = form.querySelector('[name="biet_qua"]:checked');
        if (!discoverySource) {
            const firstOption = form.querySelector('[name="biet_qua"]');
            showError(firstOption, "Vui lòng chọn nguồn biết đến chương trình");
            isValid = false;
        } else if (discoverySource.value === "Khác") {
            const other = form.querySelector('[name="biet_qua_other"]');
            if (!other || !other.value.trim()) {
                showError(other, "Vui lòng nhập rõ nguồn biết đến chương trình");
                isValid = false;
            }
        }

        if (!isValid) {
            const firstError = form.querySelector(".lp-input-error");
            if (firstError) {
                const top = firstError.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top, behavior: "smooth" });
            }
            return;
        }

        const submitButton = form.querySelector(".lp-form-submit");
        const originalButtonHtml = submitButton ? submitButton.innerHTML : "";
        const allInputs = form.querySelectorAll("input, select, textarea, button");
        const formData = new FormData(form);

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; Đang xử lý...';
        }
        allInputs.forEach((input) => {
            input.disabled = true;
        });

        try {
            const response = await fetch("/api/landing-page/leads", {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: formData,
            });

            const result = await response.json().catch(() => null);
            const succeeded = Boolean(result?.success);
            const message = succeeded
                ? result?.data?.message || "Đăng ký thành công!"
                : result?.error?.message || "Không thể gửi đăng ký. Vui lòng thử lại.";

            if (!succeeded && Array.isArray(result?.error?.details)) {
                result.error.details.forEach((detail) => {
                    const fieldMap = {
                        firstName: '[name="ten"]',
                        lastName: '[name="ho_lot"]',
                        email: '[name="emailcontact"]',
                        phone: '[name="phoneregister"]',
                        gender: '[name="gioi_tinh"]',
                        birthday: '[name="ngay_sinh"]',
                        province: '[name="tinh_thanh"]',
                        position: '[name="vi_tri"]',
                        workplace: '[name="don_vi"]',
                        discoverySource: '[name="biet_qua"]',
                        discoverySourceOther: '[name="biet_qua_other"]',
                        captchaAnswer: '[name="captcha_challenge"]',
                        agreementAccepted: '[name="agreement"]',
                    };
                    const input = form.querySelector(fieldMap[detail.field] || "");
                    if (input) {
                        showError(input, detail.message);
                    }
                });
            }

            showPopupMessage(succeeded, message);

            if (succeeded) {
                form.reset();
                const otherContainer = document.getElementById("other-text-container");
                if (otherContainer) {
                    otherContainer.style.display = "none";
                }
                const captchaImage = document.getElementById("lp-captcha-img");
                if (captchaImage) {
                    captchaImage.click();
                }
            }
        } catch (error) {
            console.error("[LandingPage] Lead submission failed", error);
            showPopupMessage(false, "Lỗi mạng! Vui lòng kiểm tra kết nối internet.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHtml;
            }
            allInputs.forEach((input) => {
                input.disabled = false;
            });
        }
    };

    form.addEventListener("submit", submitHandler);

    const inputHandlers = [];
    form.querySelectorAll(".lp-form-input, .lp-form-select, input[type='checkbox'], input[type='radio']").forEach((input) => {
        const handler = () => {
            input.classList.remove("lp-input-error");
            const group = input.closest(".lp-form-group");
            const errorNode = group ? group.querySelector(".lp-form-error") : null;
            if (errorNode) {
                errorNode.textContent = "";
                errorNode.style.display = "none";
            }
        };

        input.addEventListener("input", handler);
        input.addEventListener("change", handler);
        inputHandlers.push(() => {
            input.removeEventListener("input", handler);
            input.removeEventListener("change", handler);
        });
    });

    return () => {
        form.removeEventListener("submit", submitHandler);
        inputHandlers.forEach((cleanup) => cleanup());
    };
}

function initNavbar(navbar) {
    if (!navbar) return () => {};

    const onScroll = () => {
        navbar.classList.toggle("lp-navbar-scrolled", window.scrollY > 60);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
}

function initParticles() {
    const canvas = document.getElementById("lp-hero-canvas");
    if (!canvas) return () => {};

    const context = canvas.getContext("2d");
    if (!context) return () => {};

    let width = 0;
    let height = 0;
    let frameId = 0;
    let particles = [];
    const particleCount = window.innerWidth > 768 ? 60 : 30;

    const initCanvas = () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
        particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 1.5 + 0.5,
        }));
    };

    const draw = () => {
        context.clearRect(0, 0, width, height);
        context.fillStyle = "rgba(56, 189, 248, 1)";
        context.strokeStyle = "rgba(56, 189, 248, 0.8)";

        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > height) particle.vy *= -1;

            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fill();

            for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
                const other = particles[nextIndex];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = dx * dx + dy * dy;

                if (distance < 10000) {
                    context.beginPath();
                    context.moveTo(particle.x, particle.y);
                    context.lineTo(other.x, other.y);
                    context.stroke();
                }
            }
        });

        frameId = window.requestAnimationFrame(draw);
    };

    initCanvas();
    draw();
    window.addEventListener("resize", initCanvas);

    return () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", initCanvas);
    };
}

function initTypingEffect() {
    const typingElements = document.querySelectorAll('[data-typing="true"]');
    if (typingElements.length === 0) return () => {};

    const observers = [];

    typingElements.forEach((element) => {
        const htmlToType = element.innerHTML.trim();
        element.innerHTML = '<span class="lp-typing-text"></span><span class="lp-typing-cursor"></span>';
        const textSpan = element.querySelector(".lp-typing-text");
        if (!textSpan || !("IntersectionObserver" in window)) return;

        let index = 0;
        let isTyping = false;
        let timeoutId = 0;

        const typeCharacter = () => {
            if (index >= htmlToType.length) {
                timeoutId = window.setTimeout(() => {
                    const cursor = element.querySelector(".lp-typing-cursor");
                    if (cursor) {
                        cursor.style.display = "none";
                    }
                }, 5000);
                return;
            }

            if (htmlToType.charAt(index) === "<") {
                let tag = "";
                while (index < htmlToType.length && htmlToType.charAt(index) !== ">") {
                    tag += htmlToType.charAt(index);
                    index += 1;
                }
                tag += ">";
                index += 1;
                textSpan.innerHTML += tag;
                typeCharacter();
                return;
            }

            textSpan.innerHTML += htmlToType.charAt(index);
            index += 1;
            timeoutId = window.setTimeout(typeCharacter, Math.random() * 30 + 10);
        };

        const observer = new IntersectionObserver((entries) => {
            if (!entries[0]?.isIntersecting || isTyping) return;
            isTyping = true;
            timeoutId = window.setTimeout(typeCharacter, 500);
            observer.unobserve(element);
        }, { threshold: 0.5 });

        observer.observe(element);
        observers.push(() => {
            observer.disconnect();
            window.clearTimeout(timeoutId);
        });
    });

    return () => {
        observers.forEach((cleanup) => cleanup());
    };
}

function initTiltCards() {
    const tiltItems = document.querySelectorAll(".lp-benefit-item, .lp-phuluc-col-content, .lp-course-card");
    if (tiltItems.length === 0) return () => {};

    const cleanups = [];

    tiltItems.forEach((item) => {
        item.classList.add("lp-tilt-card");

        if (!item.querySelector(".lp-tilt-glare")) {
            const glare = document.createElement("div");
            glare.className = "lp-tilt-glare";
            item.appendChild(glare);
        }

        const moveHandler = (event) => {
            const rect = item.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rotateX = ((y / rect.height) - 0.5) * -8;
            const rotateY = ((x / rect.width) - 0.5) * 8;
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;

            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            item.style.setProperty("--glare-x", `${glareX}%`);
            item.style.setProperty("--glare-y", `${glareY}%`);
            item.style.setProperty("--glare-opacity", "1");
        };

        const leaveHandler = () => {
            item.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            item.style.setProperty("--glare-opacity", "0");
        };

        item.addEventListener("mousemove", moveHandler);
        item.addEventListener("mouseleave", leaveHandler);
        cleanups.push(() => {
            item.removeEventListener("mousemove", moveHandler);
            item.removeEventListener("mouseleave", leaveHandler);
        });
    });

    return () => {
        cleanups.forEach((cleanup) => cleanup());
    };
}

export function initLegacyLandingPage() {
    const cleanups = [];
    const navbar = document.getElementById("lp-navbar");

    cleanups.push(initNavbar(navbar));
    initSmoothScroll(navbar).forEach((cleanup) => cleanups.push(cleanup));
    cleanups.push(initTocSpy());
    initAccordion().forEach((cleanup) => cleanups.push(cleanup));
    cleanups.push(initRevealObserver());
    cleanups.push(initCaptchaRefresh());
    cleanups.push(initFormSubmission());
    cleanups.push(initParticles());
    cleanups.push(initTypingEffect());
    cleanups.push(initTiltCards());

    const closeFlyoutOnOutsideClick = (event) => {
        const flyout = document.getElementById("lp-toc-flyout");
        const button = document.getElementById("lp-toc-curriculum-btn");
        if (!flyout || !button) return;

        if (!flyout.contains(event.target) && !button.contains(event.target) && typeof window.closeTocFlyout === "function") {
            window.closeTocFlyout();
        }
    };

    document.addEventListener("click", closeFlyoutOnOutsideClick);
    cleanups.push(() => document.removeEventListener("click", closeFlyoutOnOutsideClick));

    toggleGoogleDocButtons();

    return () => {
        cleanups.forEach((cleanup) => {
            if (typeof cleanup === "function") {
                cleanup();
            }
        });
    };
}
