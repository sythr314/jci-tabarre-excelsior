import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez JCI Tabarre Excelsior. Nous sommes à votre écoute pour toute question ou collaboration.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Contactez-nous"
            subtitle="Une question, une suggestion ou une proposition de partenariat ? Nous vous répondons dans les meilleurs délais."
            light
          />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Coordonnées */}
            <div>
              <h2 className="font-heading font-bold text-navy text-2xl mb-8">
                Nos coordonnées
              </h2>
              <dl className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-light flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy font-heading text-sm uppercase tracking-wide mb-1">Adresse</dt>
                    <dd className="text-gray-600">Tabarre, Haïti</dd>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-light flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy font-heading text-sm uppercase tracking-wide mb-1">Email</dt>
                    <dd className="text-gray-600">À renseigner</dd>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-light flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy font-heading text-sm uppercase tracking-wide mb-1">Site national</dt>
                    <dd>
                      <a href="https://jcihaiti.org" target="_blank" rel="noopener noreferrer" className="text-cyan hover:text-cyan-dark transition-colors">
                        jcihaiti.org
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Formulaire */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
