"use client";

import { useEffect } from "react";

interface LandingSelectionRedirectProps {
    campaignSlug: string;
    programSlug?: string;
}

async function persistLandingSelection(campaignSlug: string, programSlug?: string) {
    await fetch("/api/landing-page/selection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action: "select",
            campaignSlug,
            programSlug,
        }),
    });
}

export function LandingSelectionRedirect({ campaignSlug, programSlug }: LandingSelectionRedirectProps) {
    useEffect(() => {
        void persistLandingSelection(campaignSlug, programSlug)
            .catch((error) => {
                console.error("[LandingPage] Failed to persist compatibility selection", error);
            })
            .finally(() => {
                window.location.replace("/landing-page");
            });
    }, [campaignSlug, programSlug]);

    return (
        <div className="lp-page lp-no-toc">
            <div className="lp-selector-wrapper">
                <div className="lp-selector-header">
                    <div className="lp-section-tag lp-tag-light">
                        <i className="fas fa-compass" aria-hidden="true"></i> Redirecting
                    </div>
                    <h1>
                        <span style={{ color: "var(--lp-gold-light)" }}>Đang chuyển tới landing page</span>
                    </h1>
                </div>
            </div>
        </div>
    );
}
