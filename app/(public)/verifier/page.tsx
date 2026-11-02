import { Suspense } from "react";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import type { JciCertificateRecord } from "@/lib/data/national";
import { CertificateVerifierClient } from "./CertificateVerifierClient";

export const metadata: Metadata = {
  title: "Vérifier un Certificat Officiel | Institut de Formation JCI Haïti",
  description:
    "Portail officiel de vérification de l'authenticité des certificats de formation, d'académie de leadership et de distinction délivrés par JCI Haïti et JCI Tabarre Excelsior.",
};

export const dynamic = "force-dynamic";

export default async function VerifierCertificatPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("jci_certificates")
    .select(
      "certificate_code, recipient_name, course_title, course_category, local_org_name, trainer_name, issued_date, is_valid"
    )
    .eq("is_valid", true)
    .limit(100);

  const dbCertificates: JciCertificateRecord[] = (data ?? []) as JciCertificateRecord[];

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan/15 text-navy text-xs font-heading font-semibold uppercase tracking-wider mb-3">
            Institut National de Formation JCI
          </span>
          <h1 className="font-heading font-bold text-3xl text-navy mb-3">
            Vérification d&apos;Authenticité des Certificats JCI
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Saisissez le code unique inscrit sur un certificat de formation officielle (JCI Impact,
            JCI Admin, JCI Effective Communication, Académie de Leadership) pour vérifier sa
            validité auprès du registre national.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
              Chargement du registre des certificats…
            </div>
          }
        >
          <CertificateVerifierClient dbCertificates={dbCertificates} />
        </Suspense>
      </div>
    </div>
  );
}
