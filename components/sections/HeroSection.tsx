import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SanityImage } from "@/components/ui/SanityImage";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  heroImage?: object;
}

export function HeroSection({
  title = "Des jeunes leaders pour un Haïti meilleur",
  subtitle = "JCI Tabarre Excelsior rassemble de jeunes professionnels engagés pour le développement communautaire, l'entrepreneuriat et la formation.",
  heroImage,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-navy overflow-hidden">
      {/* Image de fond */}
      {heroImage && (
        <div className="absolute inset-0 z-0">
          <SanityImage
            source={heroImage}
            alt="JCI Tabarre Excelsior"
            width={1920}
            height={1080}
            fill
            priority
            sizes="100vw"
            className="opacity-20"
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/40" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-px w-8 bg-cyan" />
            <span className="text-cyan font-heading font-semibold text-sm uppercase tracking-widest">
              JCI Tabarre Excelsior
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-white leading-tight mb-6">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
            {subtitle}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/join">
              <Button size="lg" variant="primary">
                Nous rejoindre
              </Button>
            </Link>
            <Link href="/initiatives">
              <Button size="lg" variant="ghost" className="border-white/40 text-white hover:bg-white/10 hover:border-white/60">
                Nos initiatives
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
