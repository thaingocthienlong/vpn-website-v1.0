"use client";

import { useEffect, useState } from "react";
import type { SiteLayoutData } from "@/lib/services/site-content";
import type { LandingCampaignSelectorItem } from "@/lib/landing-page/types";

interface LandingSelectorPageProps {
    campaigns: LandingCampaignSelectorItem[];
    siteLayout: SiteLayoutData;
    clearSelectionOnLoad?: boolean;
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

export function LandingSelectorPage({
    campaigns,
    siteLayout,
    clearSelectionOnLoad = false,
}: LandingSelectorPageProps) {
    const [pendingCampaignSlug, setPendingCampaignSlug] = useState<string | null>(null);

    useEffect(() => {
        let cleanup: (() => void) | undefined;

        void import("./landing-page-legacy.js").then(({ initLegacyLandingPage }) => {
            cleanup = initLegacyLandingPage();
        });

        if (clearSelectionOnLoad) {
            void updateLandingSelection("clear").catch((error) => {
                console.error("[LandingPage] Failed to clear stale selector cookie", error);
            });
        }

        return () => {
            cleanup?.();
        };
    }, [clearSelectionOnLoad]);

    async function handleSelectCampaign(campaign: LandingCampaignSelectorItem) {
        if (pendingCampaignSlug) {
            return;
        }

        setPendingCampaignSlug(campaign.slug);

        try {
            await updateLandingSelection("select", campaign.slug, campaign.defaultProgramSlug);
            window.location.assign("/landing-page");
        } catch (error) {
            console.error("[LandingPage] Failed to persist selector choice", error);
            setPendingCampaignSlug(null);
        }
    }

    return (
        <div className="lp-page lp-no-toc">
            <canvas id="lp-hero-canvas" aria-hidden="true"></canvas>

            <div className="lp-selector-wrapper">
                <div className="lp-selector-header">
                    <div className="lp-section-tag lp-tag-light">
                        <i className="fas fa-university" aria-hidden="true"></i> {siteLayout.siteName}
                    </div>
                    <h1>
                        <span style={{ color: "var(--lp-gold-light)" }}>Tuyển sinh 2026</span>
                    </h1>
                </div>

                <div className="lp-selector-grid">
                    {campaigns.length === 0 ? (
                        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", padding: "40px" }}>
                            <i className="fas fa-info-circle" style={{ fontSize: "2rem", marginBottom: "12px", display: "block" }}></i>
                            Chưa có chương trình đào tạo nào được cấu hình.
                        </div>
                    ) : (
                        campaigns.map((campaign) => {
                            return (
                                <button
                                    key={campaign.id}
                                    type="button"
                                    className="lp-uni-card"
                                    title={`Xem chương trình tại ${campaign.shortName}`}
                                    disabled={pendingCampaignSlug !== null}
                                    onClick={() => void handleSelectCampaign(campaign)}
                                >
                                    <div className="lp-uni-card-icon">
                                        <i className="fas fa-university"></i>
                                    </div>
                                    <h2 className="lp-uni-card-name">{campaign.name}</h2>
                                    <span className="lp-uni-card-arrow"><i className="fas fa-arrow-right"></i></span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
