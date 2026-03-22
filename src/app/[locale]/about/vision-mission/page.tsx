"use client";

import { useTranslations } from "next-intl";
import VisionMissionPageTemplate from "@/components/about/VisionMissionPageTemplate";

export default function VisionMissionPage() {
    const t = useTranslations("about.visionMission");

    return (
        <VisionMissionPageTemplate
            title={t("title")}
            visionTitle={t("vision")}
            visionText={t("visionText")}
            missionTitle={t("mission")}
            missionText={t("missionText")}
            coreValuesTitle={t("coreValues")}
            values={[
                { icon: "star", title: t("integrity"), description: t("integrityDesc") },
                { icon: "target", title: t("quality"), description: t("qualityDesc") },
                { icon: "eye", title: t("innovation"), description: t("innovationDesc") },
            ]}
            learnMoreTitle={t("learnMore")}
            links={[
                { href: "/en/about/structure", label: "Organizational Structure" },
                { href: "/en/about/advisory-board", label: "Advisory Board" },
            ]}
        />
    );
}
