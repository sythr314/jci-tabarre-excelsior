import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CallToAction() {
  return (
    <section className="bg-navy py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="h-px w-8 bg-cyan" />
          <span className="text-cyan font-heading font-semibold text-sm uppercase tracking-widest">
            Rejoignez-nous
          </span>
          <div className="h-px w-8 bg-cyan" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6 leading-tight">
          Devenez membre de JCI Tabarre Excelsior
        </h2>

        <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Rejoignez un réseau de jeunes leaders engagés, développez vos compétences
          et contribuez au développement de votre communauté.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/join">
            <Button size="lg" variant="primary">
              Nous rejoindre
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="ghost" className="border-white/40 text-white hover:bg-white/10">
              En savoir plus
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
