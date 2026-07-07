import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { MissionSection } from "@/components/sections/MissionSection";
import { CallToAction } from "@/components/sections/CallToAction";
import { InitiativeCard } from "@/components/sections/InitiativeCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getSiteSettings } from "@/lib/sanity/queries/settings";
import { getRecentInitiatives } from "@/lib/sanity/queries/initiatives";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "JCI Tabarre Excelsior — Locale JCI Haïti. Jeunes leaders engagés pour le développement communautaire de Tabarre.",
};

export default async function HomePage() {
  const [settings, initiatives] = await Promise.all([
    getSiteSettings(),
    getRecentInitiatives(3),
  ]);

  return (
    <>
      <HeroSection
        title={settings?.heroTitle}
        subtitle={settings?.heroSubtitle}
        heroImage={settings?.heroImage}
      />

      <StatsSection />

      {/* Initiatives récentes */}
      {initiatives.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <SectionHeader
                title="Nos initiatives récentes"
                subtitle="Découvrez nos dernières actions sur le terrain."
              />
              <Link href="/initiatives">
                <Button variant="ghost" size="sm">
                  Voir toutes →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {initiatives.map((initiative) => (
                <InitiativeCard key={initiative._id} initiative={initiative} />
              ))}
            </div>
          </div>
        </section>
      )}

      <MissionSection />
      <CallToAction />
    </>
  );
}
