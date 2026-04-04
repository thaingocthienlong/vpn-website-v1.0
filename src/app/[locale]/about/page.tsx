import { getTranslations } from "next-intl/server";
import AboutLandingPage from "@/components/about/AboutLandingPage";

export default async function AboutPage() {
    const t = await getTranslations({ locale: "en", namespace: "about" });

    return (
        <AboutLandingPage
            badge={t("hero.badge")}
            title={t("hero.title")}
            titleHighlight={t("hero.titleHighlight")}
            description={t("hero.description")}
            statsLabels={[
                t("stats.students"),
                t("stats.experience"),
                t("stats.projects"),
                t("stats.courses"),
            ]}
            timelineTitle={t("timeline.title")}
            timelineDescription={t("timeline.description")}
            milestones={[
                { year: "2009", title: t("timeline.items.0.title"), description: t("timeline.items.0.description") },
                { year: "2012", title: t("timeline.items.1.title"), description: t("timeline.items.1.description") },
                { year: "2016", title: t("timeline.items.2.title"), description: t("timeline.items.2.description") },
                { year: "2020", title: t("timeline.items.3.title"), description: t("timeline.items.3.description") },
                { year: "2024", title: t("timeline.items.4.title"), description: t("timeline.items.4.description") },
            ]}
            ctaTitle={t("cta.title")}
            ctaDescription={t("cta.description")}
            ctaButtonLabel={t("cta.button")}
            visionButtonLabel={t("visionMission.vision")}
            hrefs={{
                visionMission: "/en/about/vision-mission",
                contact: "/en/contact",
            }}
        />
    );
}
