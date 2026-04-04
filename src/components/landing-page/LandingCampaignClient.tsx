"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LandingRegistrationForm } from "./LandingRegistrationForm";
import type { LandingCampaignPageData } from "@/lib/landing-page/types";
import type { SiteLayoutData } from "@/lib/services/site-content";

interface LandingCampaignClientProps {
    data: LandingCampaignPageData;
    siteLayout: SiteLayoutData;
    mode: "selector" | "single";
    homeHref?: string;
}

declare global {
    interface Window {
        switchCourse?: (key: string) => void;
        toggleTocFlyout?: () => void;
        closeTocFlyout?: () => void;
        scrollToCurriculum?: () => void;
        uniData?: unknown;
    }
}

function getPhoneHref(value: string) {
    return value.replace(/[^\d+]/g, "");
}

function renderHtml(html: string | null | undefined) {
    return { __html: html || "" };
}

async function updateLandingSelection(
    action: "select" | "clear",
    campaignSlug?: string,
    programSlug?: string,
) {
    await fetch("/api/landing-page/selection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action,
            campaignSlug,
            programSlug,
        }),
    });
}

export function LandingCampaignClient({
    data,
    siteLayout,
    mode,
    homeHref,
}: LandingCampaignClientProps) {
    const { campaign, activeProgramKey, activeProgram } = data;
    const programKeys = campaign.programOrder;
    const sourceOptions = campaign.content.sourceOptions || [];
    const hasAnyProgramPhuluc = programKeys.some((key) => !!campaign.programsMap[key]?.content.phuluc?.sections?.length);
    const currentHasPhuluc = !!campaign.programsMap[activeProgramKey]?.content.phuluc?.sections?.length;
    const campaignLogo = campaign.logoUrl || siteLayout.logo;
    const footerContact = campaign.content.footerContact || {};
    const footerSocial = campaign.content.socialLinks || {};
    const footerBrandText = campaign.content.footerBrandText || siteLayout.organizationName;
    const footerAddress = footerContact.address || "45 Đinh Tiên Hoàng, Phường Sài Gòn, TP. Hồ Chí Minh";
    const footerPhone = footerContact.phone || siteLayout.footer.contactInfo.phone;
    const footerEmail = footerContact.email || siteLayout.footer.contactInfo.email;
    const resolvedHomeHref = homeHref || (mode === "single" ? "/ai-ptdl-cbqt" : "/landing-page");
    const showProgramChooser = mode === "selector" && programKeys.length > 1;
    const canReturnToSelector = mode === "selector";

    useEffect(() => {
        const uniData = {
            slug: campaign.slug,
            name: campaign.name,
            shortName: campaign.shortName,
            heritage: campaign.heritage,
            defaultProgram: campaign.defaultProgramSlug,
            seo: {
                title: campaign.seoTitle,
                description: campaign.seoDescription,
                keywords: campaign.seoKeywords,
            },
            benefits: campaign.content.benefits || [],
            programs: Object.fromEntries(
                programKeys.map((key) => {
                    const program = campaign.programsMap[key];
                    return [key, program.content];
                }),
            ),
        };

        const courses = Object.fromEntries(
            programKeys.map((key) => {
                const program = campaign.programsMap[key];
                return [key, {
                    title: program.content.title,
                    date: program.content.subtitle || "",
                    courseId: program.content.courseId || program.titlePlain || program.title,
                    programId: program.id,
                    phulucTitle: program.content.phuluc?.title || "",
                    phulucDesc: program.content.phuluc?.description || "",
                    curriculumTitle: program.content.curriculumTitle || program.content.titlePlain || program.titlePlain || program.title,
                    curriculumDesc: program.content.curriculumDesc || "",
                }];
            }),
        );

        window.uniData = uniData;

        window.switchCourse = (key: string) => {
            const courseData = courses[key as keyof typeof courses];
            if (!courseData) return;

            const heroTitle = document.getElementById("dynamic-hero-title");
            if (heroTitle) heroTitle.innerHTML = courseData.title;

            const heroDate = document.getElementById("dynamic-hero-date");
            if (heroDate) heroDate.textContent = courseData.date;

            const selectedCourseId = document.getElementById("selected-course-id") as HTMLInputElement | null;
            if (selectedCourseId) selectedCourseId.value = courseData.courseId;

            const selectedProgramId = document.getElementById("selected-program-id") as HTMLInputElement | null;
            if (selectedProgramId) selectedProgramId.value = courseData.programId;

            const phulucTitle = document.getElementById("dynamic-phuluc-title");
            if (phulucTitle) phulucTitle.textContent = courseData.phulucTitle || "Phụ lục chương trình";

            const phulucDesc = document.getElementById("dynamic-phuluc-desc");
            if (phulucDesc) phulucDesc.textContent = courseData.phulucDesc || "";

            const curriculumTitle = document.getElementById("dynamic-curriculum-title");
            if (curriculumTitle) curriculumTitle.textContent = courseData.curriculumTitle || "";

            const curriculumDesc = document.getElementById("dynamic-curriculum-desc");
            if (curriculumDesc) curriculumDesc.textContent = courseData.curriculumDesc || "";

            const hasPhuluc = !!campaign.programsMap[key]?.content.phuluc?.sections?.length;
            const phulucSection = document.getElementById("lp-phuluc");
            const tocPhulucLink = document.getElementById("toc-phuluc-link");
            if (phulucSection) phulucSection.style.display = hasPhuluc ? "" : "none";
            if (tocPhulucLink) tocPhulucLink.style.display = hasPhuluc ? "" : "none";

            programKeys.forEach((programKey) => {
                ["dynamic-hotline-", "nav-hotline-", "curriculum-", "curriculum-meta-", "phuluc-"].forEach((prefix) => {
                    const element = document.getElementById(prefix + programKey);
                    if (!element) return;

                    if (prefix === "dynamic-hotline-" || prefix === "nav-hotline-" || prefix === "curriculum-meta-") {
                        element.style.display = programKey === key ? "flex" : "none";
                    } else {
                        element.style.display = programKey === key ? "block" : "none";
                    }
                });
            });

            document.querySelectorAll(".lp-toc-flyout-item").forEach((item) => {
                item.classList.toggle("lp-flyout-active", (item as HTMLElement).dataset.program === key);
            });

            if (mode === "selector") {
                void updateLandingSelection("select", campaign.slug, key).catch((error) => {
                    console.error("[LandingPage] Failed to persist program switch", error);
                });
            }
        };

        window.toggleTocFlyout = () => {
            const flyout = document.getElementById("lp-toc-flyout");
            const parent = flyout?.closest(".lp-toc-has-flyout");
            if (!flyout || !parent) return;

            if (flyout.classList.contains("lp-flyout-visible")) {
                window.closeTocFlyout?.();
            } else {
                flyout.classList.add("lp-flyout-visible");
                parent.classList.add("lp-toc-flyout-open");
            }
        };

        window.closeTocFlyout = () => {
            const flyout = document.getElementById("lp-toc-flyout");
            const parent = flyout?.closest(".lp-toc-has-flyout");
            if (!flyout || !parent) return;
            flyout.classList.remove("lp-flyout-visible");
            parent.classList.remove("lp-toc-flyout-open");
        };

        window.scrollToCurriculum = () => {
            const element = document.getElementById("lp-curriculum");
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        };

        const sourceUrl = document.getElementById("selected-source-url") as HTMLInputElement | null;
        if (sourceUrl) {
            sourceUrl.value = window.location.href;
        }

        let cleanupLegacy: (() => void) | undefined;

        void import("./landing-page-legacy.js").then(({ initLegacyLandingPage }) => {
            cleanupLegacy = initLegacyLandingPage();
            window.switchCourse?.(activeProgramKey);
        });

        return () => {
            cleanupLegacy?.();
            delete window.switchCourse;
            delete window.toggleTocFlyout;
            delete window.closeTocFlyout;
            delete window.scrollToCurriculum;
        };
    }, [activeProgramKey, campaign, mode, programKeys]);

    return (
        <div className="lp-page">
            <canvas id="lp-hero-canvas" aria-hidden="true"></canvas>

            <nav className="lp-floating-toc" aria-label="Table of Contents">
                <ul>
                    <li><a href="#lp-hero" className="lp-toc-link"><i className="fas fa-home"></i><span className="lp-toc-text">Giới thiệu</span></a></li>
                    <li><a href="#lp-form" className="lp-toc-link lp-toc-cta"><i className="fas fa-paper-plane"></i><span className="lp-toc-text">Đăng ký</span></a></li>
                    {showProgramChooser ? (
                        <li className="lp-toc-has-flyout">
                            <button className="lp-toc-link" id="lp-toc-curriculum-btn" onClick={() => window.toggleTocFlyout?.()} type="button">
                                <i className="fas fa-book-open"></i>
                                <span className="lp-toc-text">Chương trình</span>
                                <i className="fas fa-chevron-right lp-toc-chevron"></i>
                            </button>
                            <div className="lp-toc-flyout" id="lp-toc-flyout">
                                {programKeys.map((key) => {
                                    const program = campaign.programsMap[key];
                                    return (
                                        <button
                                            key={key}
                                            className={`lp-toc-flyout-item${key === activeProgramKey ? " lp-flyout-active" : ""}`}
                                            onClick={() => {
                                                window.switchCourse?.(key);
                                                window.closeTocFlyout?.();
                                                window.scrollToCurriculum?.();
                                            }}
                                            data-program={key}
                                            type="button"
                                        >
                                            {program.content.titlePlain || key}
                                        </button>
                                    );
                                })}
                            </div>
                        </li>
                    ) : (
                        <li><a href="#lp-curriculum" className="lp-toc-link"><i className="fas fa-book-open"></i><span className="lp-toc-text">Chương trình</span></a></li>
                    )}
                    {hasAnyProgramPhuluc ? (
                        <li id="toc-phuluc-link" style={{ display: currentHasPhuluc ? undefined : "none" }}>
                            <a href="#lp-phuluc" className="lp-toc-link"><i className="fas fa-list-alt"></i><span className="lp-toc-text">Phụ lục</span></a>
                        </li>
                    ) : null}
                </ul>
            </nav>

            <nav className="lp-navbar" id="lp-navbar" role="navigation" aria-label="Navigation">
                <div className="lp-navbar-inner">
                    <Link href={resolvedHomeHref} className="lp-navbar-logo" title={siteLayout.siteName}>
                        <img src={campaignLogo} alt={siteLayout.siteName} />
                    </Link>

                    <div className="lp-navbar-right">
                        <div className="lp-contact-phones-nav">
                            {programKeys.map((key) => {
                                const program = campaign.programsMap[key];
                                const phones = program.content.contact?.phones || [];
                                return (
                                    <div
                                        key={`nav-hotline-${key}`}
                                        id={`nav-hotline-${key}`}
                                        style={{ display: key === activeProgramKey ? "flex" : "none" }}
                                        className="lp-dynamic-nav-phones"
                                    >
                                        {phones.map((phone, index) => (
                                            <span key={`${phone.number}-${index}`} style={{ display: "contents" }}>
                                                <a href={`tel:${getPhoneHref(phone.number)}`}><i className="fas fa-phone-alt"></i> {phone.display || phone.number}</a>
                                                {index < phones.length - 1 ? <span className="lp-divider">|</span> : null}
                                            </span>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                        {canReturnToSelector ? (
                            <button
                                type="button"
                                className="lp-navbar-cta lp-navbar-cta-secondary"
                                onClick={() => {
                                    void updateLandingSelection("clear")
                                        .catch((error) => {
                                            console.error("[LandingPage] Failed to clear selector choice", error);
                                        })
                                        .finally(() => {
                                            window.location.assign("/landing-page");
                                        });
                                }}
                            >
                                <i className="fas fa-arrow-left" aria-hidden="true"></i> Chọn chương trình khác
                            </button>
                        ) : null}
                        <a href="#lp-form" className="lp-navbar-cta" aria-label="Đăng ký ngay">
                            <i className="fas fa-pen-to-square" aria-hidden="true"></i> Đăng ký
                        </a>
                    </div>
                </div>
            </nav>

            <section className="lp-hero" id="lp-hero" aria-label="Giới thiệu khoá học">
                <div className="lp-container">
                    <div className="lp-hero-content">
                        <div className="lp-section-tag lp-tag-light">
                            <span className="lp-hero-badge-dot" aria-hidden="true"></span>
                            {campaign.content.heroBadge || "Khoá học Chuyên gia"}
                        </div>

                        <h1 className="lp-hero-title" id="dynamic-hero-title" dangerouslySetInnerHTML={renderHtml(activeProgram.content.title)} />

                        <p className="lp-hero-desc" id="dynamic-hero-date">
                            {activeProgram.content.subtitle || ""}
                        </p>

                        <div className="lp-hero-actions">
                            <a href="#lp-form" className="lp-btn-primary" aria-label="Đăng ký tham gia">
                                <i className="fas fa-paper-plane" aria-hidden="true"></i>
                                Đăng ký tham gia
                            </a>
                            <a href="#lp-curriculum" className="lp-btn-secondary">
                                <i className="fas fa-play-circle" aria-hidden="true"></i>
                                Chương trình chi tiết
                            </a>
                        </div>
                    </div>
                </div>
                <div className="lp-hero-wave" aria-hidden="true">
                    <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#ffffff" />
                    </svg>
                </div>
            </section>

            <section className="lp-form-section lp-section" id="lp-form" aria-label="Đăng ký tư vấn">
                <div className="lp-container">
                    <div className="lp-form-header">
                        <div className="lp-section-tag lp-tag-light lp-reveal"><i className="fas fa-paper-plane" aria-hidden="true"></i> Đăng ký tham gia</div>
                        <p className="lp-section-subtitle lp-light lp-reveal" data-delay="2" style={{ margin: "0 auto" }}>
                            {campaign.content.formDescription || "Quý anh/chị vui lòng để lại thông tin, đội ngũ chuyên viên của chúng tôi sẽ chủ động liên hệ hỗ trợ trong thời gian sớm nhất."}
                        </p>
                        <div
                            className="lp-reveal"
                            data-delay="3"
                            style={{
                                margin: "20px auto 0",
                                maxWidth: "620px",
                                padding: "14px 20px",
                                background: "rgba(56, 189, 248, 0.08)",
                                border: "1px solid rgba(56, 189, 248, 0.25)",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <i className="fas fa-shield-alt" style={{ color: "var(--lp-gold-light)", fontSize: "1.4rem", flexShrink: 0 }}></i>
                            <span style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                                Viện Phương Nam <strong style={{ color: "var(--lp-gold-light)" }}>cam kết bảo mật tuyệt đối</strong> thông tin cá nhân của quý anh/chị và chỉ sử dụng thông tin bên dưới để phục vụ cho việc quản lý khoá học.
                            </span>
                        </div>
                    </div>
                    <div className="lp-form-wrapper lp-reveal" data-delay="1">
                        <div className="lp-form-card">
                            <LandingRegistrationForm
                                campaignId={campaign.id}
                                programId={activeProgram.id}
                                courseId={activeProgram.content.courseId || activeProgram.titlePlain || activeProgram.title}
                                privacyUrl={campaign.content.privacyUrl || "/chinh-sach-bao-mat"}
                                sourceOptions={sourceOptions}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="lp-tab-content lp-tab-show" id="tab-featured" role="tabpanel">
                <section className="lp-curriculum lp-section" id="lp-curriculum" aria-label="Nội dung chương trình">
                    <div className="lp-container">
                        <div className="lp-curriculum-layout">
                            <div className="lp-curriculum-sidebar lp-reveal">
                                <div className="lp-section-tag lp-tag-light" style={{ marginBottom: "20px" }}>
                                    <i className="fas fa-list-check" aria-hidden="true"></i> Thông tin khoá học
                                </div>
                                <h2 className="lp-section-title" id="dynamic-curriculum-title" style={{ fontSize: "1.8rem", marginBottom: "16px" }}>
                                    {activeProgram.content.curriculumTitle || activeProgram.content.titlePlain || activeProgram.titlePlain || activeProgram.title}
                                </h2>
                                <p id="dynamic-curriculum-desc">{activeProgram.content.curriculumDesc || ""}</p>
                                {programKeys.map((key) => {
                                    const program = campaign.programsMap[key];
                                    return (
                                        <div
                                            key={`curriculum-meta-${key}`}
                                            className="lp-curriculum-meta"
                                            id={`curriculum-meta-${key}`}
                                            style={{ display: key === activeProgramKey ? "flex" : "none" }}
                                        >
                                            {(program.content.meta || []).map((metaItem) => (
                                                <div key={`${key}-${metaItem.icon}-${metaItem.label}`} className="lp-curriculum-meta-item">
                                                    <i className={`fas ${metaItem.icon}`} aria-hidden="true"></i>
                                                    <span>{metaItem.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="lp-accordion lp-reveal" role="list">
                                {programKeys.map((key) => {
                                    const program = campaign.programsMap[key];
                                    const items = program.content.curriculum || [];
                                    return (
                                        <div key={`curriculum-${key}`} id={`curriculum-${key}`} style={{ display: key === activeProgramKey ? "block" : "none" }}>
                                            {items.map((item, index) => {
                                                const isOpen = item.defaultOpen || (!items.some((entry) => entry.defaultOpen) && index === 0);
                                                return (
                                                    <div key={`${key}-${item.num}-${item.title}`} className={`lp-accordion-item${isOpen ? " lp-accordion-open" : ""}`} role="listitem">
                                                        <button className="lp-accordion-header" aria-expanded={isOpen ? "true" : "false"}>
                                                            <span>{item.num}. {item.title}</span>
                                                            <i className="fas fa-chevron-down lp-accordion-icon" aria-hidden="true"></i>
                                                        </button>
                                                        <div className="lp-accordion-body" style={{ maxHeight: isOpen ? "9999px" : "0" }}>
                                                            <div className="lp-accordion-body-inner" style={{ listStyle: "none" }} dangerouslySetInnerHTML={renderHtml((item.items || []).join(""))}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="lp-contact-banner lp-section" aria-label="Liên hệ tư vấn" style={{ paddingTop: 0, paddingBottom: "20px" }}>
                <div className="lp-container">
                    <div className="lp-contact-banner-inner lp-reveal">
                        <div className="lp-contact-banner-content">
                            <div className="lp-contact-icon">
                                <i className="fas fa-headset"></i>
                            </div>
                            <div className="lp-contact-text">
                                <h3>Liên hệ tư vấn khoá học</h3>
                            </div>
                        </div>
                        {programKeys.map((key) => {
                            const program = campaign.programsMap[key];
                            return (
                                <div key={`dynamic-hotline-${key}`} className="lp-contact-banner-phones" id={`dynamic-hotline-${key}`} style={{ display: key === activeProgramKey ? "flex" : "none" }}>
                                    {(program.content.contact?.phones || []).map((phone) => (
                                        <a key={`${key}-${phone.number}-${phone.name}`} href={`tel:${getPhoneHref(phone.number)}`} className="lp-phone-pill">
                                            <i className="fas fa-phone-alt"></i>
                                            <span><strong>{phone.display || phone.number}</strong>{phone.name ? ` (${phone.name})` : ""}</span>
                                        </a>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {hasAnyProgramPhuluc ? (
                <section className="lp-phuluc lp-section" id="lp-phuluc" aria-label="Phụ lục chương trình" style={{ display: currentHasPhuluc ? undefined : "none" }}>
                    <div className="lp-container">
                        <div style={{ textAlign: "center", marginBottom: "36px" }}>
                            <div className="lp-section-tag lp-tag-light lp-reveal"><i className="fas fa-list-alt" aria-hidden="true"></i> Phụ lục</div>
                            <h2 className="lp-section-title lp-reveal" id="dynamic-phuluc-title" data-delay="1">{activeProgram.content.phuluc?.title || "Phụ lục chương trình"}</h2>
                            <p className="lp-section-subtitle lp-reveal" id="dynamic-phuluc-desc" data-delay="2" style={{ margin: "0 auto", maxWidth: "600px" }}>
                                {activeProgram.content.phuluc?.description || ""}
                            </p>
                        </div>

                        {programKeys.map((key) => {
                            const program = campaign.programsMap[key];
                            const phulucSections = program.content.phuluc?.sections || [];
                            if (phulucSections.length === 0) return null;

                            return (
                                <div key={`phuluc-${key}`} id={`phuluc-${key}`} style={{ display: key === activeProgramKey ? "block" : "none" }}>
                                    <div className="lp-phuluc-table-wrapper lp-reveal" data-delay="1">
                                        <div className="lp-phuluc-table">
                                            <div className="lp-phuluc-table-header">
                                                <div className="lp-phuluc-col-stt">STT</div>
                                                <div className="lp-phuluc-col-content">Nội dung chi tiết</div>
                                            </div>
                                            {phulucSections.map((row, index) => {
                                                const isSpecial = !!row.special;
                                                return (
                                                    <div key={`${key}-${row.title}-${index}`} className={isSpecial ? "lp-phuluc-table-row lp-phuluc-table-special" : "lp-phuluc-table-row"}>
                                                        <div className="lp-phuluc-col-stt">
                                                            {isSpecial ? <i className="fas fa-star"></i> : String(index + 1).padStart(2, "0")}
                                                        </div>
                                                        <div className="lp-phuluc-col-content">
                                                            <h3 className="lp-phuluc-row-title">{row.title}</h3>
                                                            {row.items?.length ? (
                                                                <ul className="lp-phuluc-list">
                                                                    {row.items.map((item, itemIndex) => (
                                                                        <li key={`${row.title}-${itemIndex}`} dangerouslySetInnerHTML={renderHtml(item)}></li>
                                                                    ))}
                                                                </ul>
                                                            ) : null}
                                                            {row.testNote ? (
                                                                <div className="lp-phuluc-test-note"><i className="fas fa-file-alt"></i> {row.testNote}</div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ) : null}

            <footer className="lp-footer" role="contentinfo">
                <div className="lp-container">
                    <div className="lp-footer-inner">
                        <div className="lp-footer-brand-wrapper">
                            <div className="lp-footer-brand">
                                <img src={campaignLogo} alt={siteLayout.organizationName} />
                            </div>
                            <p style={{ textAlign: "center" }} className="lp-footer-brand-text">{footerBrandText}</p>
                        </div>
                        <div className="lp-footer-contact">
                            <p><i className="fas fa-map-marker-alt" aria-hidden="true"></i>{footerAddress}</p>
                            <p><i className="fas fa-phone" aria-hidden="true"></i>{footerPhone}</p>
                            <p><i className="fas fa-envelope" aria-hidden="true"></i>{footerEmail}</p>
                            <div className="lp-footer-social">
                                {footerSocial.facebook ? (
                                    <a href={footerSocial.facebook} target="_blank" rel="noopener noreferrer nofollow" title="Facebook" aria-label="Trang Facebook"><i className="fab fa-facebook-f" aria-hidden="true"></i></a>
                                ) : null}
                                {footerSocial.youtube ? (
                                    <a href={footerSocial.youtube} target="_blank" rel="noopener noreferrer nofollow" title="YouTube" aria-label="Kênh YouTube"><i className="fab fa-youtube" aria-hidden="true"></i></a>
                                ) : null}
                                {footerSocial.zalo ? (
                                    <a href={footerSocial.zalo.startsWith("http") ? footerSocial.zalo : `https://zalo.me/${footerSocial.zalo}`} target="_blank" rel="noopener noreferrer nofollow" title="Zalo" aria-label="Chat Zalo" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Zalo</a>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="lp-footer-copyright">
                        {campaign.content.footerCopyright || siteLayout.footer.copyright}
                    </div>
                </div>
            </footer>
        </div>
    );
}
