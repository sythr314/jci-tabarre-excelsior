"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  DEFAULT_CERTIFICATES,
  type JciCertificateRecord,
} from "@/lib/data/national";

interface Props {
  dbCertificates: JciCertificateRecord[];
}

export function CertificateVerifierClient({ dbCertificates }: Props) {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const [code, setCode] = useState(initialCode);
  const [searchedCode, setSearchedCode] = useState(initialCode);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setSearchedCode(initialCode);
    }
  }, [initialCode]);

  const allCertificates = [...dbCertificates, ...DEFAULT_CERTIFICATES];

  const found = searchedCode.trim()
    ? allCertificates.find(
        (c) => c.certificate_code.toUpperCase() === searchedCode.trim().toUpperCase()
      )
    : undefined;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchedCode(code.trim());
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm"
      >
        <label
          htmlFor="cert-code-input"
          className="block text-sm font-heading font-semibold text-navy mb-2"
        >
          Numéro / Code d&apos;authenticité du certificat JCI
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="cert-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex : JCI-HT-2026-0001"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-cyan"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-navy text-white text-sm font-heading font-semibold hover:bg-navy/90 transition-colors"
          >
            Vérifier l&apos;authenticité
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span>Exemples vérifiables :</span>
          {DEFAULT_CERTIFICATES.map((c) => (
            <button
              key={c.certificate_code}
              type="button"
              onClick={() => {
                setCode(c.certificate_code);
                setSearchedCode(c.certificate_code);
              }}
              className="px-2 py-0.5 rounded bg-gray-100 hover:bg-cyan/15 text-navy font-mono transition-colors"
            >
              {c.certificate_code}
            </button>
          ))}
        </div>
      </form>

      {searchedCode.trim() !== "" && (
        <div>
          {found ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      Certificat Officiel Authentifié & Valide
                    </span>
                    <h2 className="font-heading font-bold text-xl text-navy mt-1">
                      {found.course_title}
                    </h2>
                  </div>
                </div>
                <span className="font-mono text-xs bg-gray-100 text-navy px-3 py-1.5 rounded-lg font-semibold">
                  {found.certificate_code}
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-xl p-4">
                  <dt className="text-xs text-gray-400">Récipiendaire certifié(e)</dt>
                  <dd className="font-heading font-bold text-navy text-base mt-0.5">
                    {found.recipient_name}
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <dt className="text-xs text-gray-400">Organisation Locale Membre (OLM)</dt>
                  <dd className="font-semibold text-navy mt-0.5">{found.local_org_name}</dd>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <dt className="text-xs text-gray-400">Formateur / Institut certificateur</dt>
                  <dd className="font-medium text-gray-700 mt-0.5">{found.trainer_name}</dd>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <dt className="text-xs text-gray-400">Date d&apos;émission officielle</dt>
                  <dd className="font-medium text-gray-700 mt-0.5">
                    {new Date(found.issued_date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="font-heading font-bold text-red-800 text-base mb-1">
                Aucun certificat trouvé pour le code « {searchedCode} »
              </p>
              <p className="text-xs text-red-600">
                Vérifiez l&apos;orthographe exacte du code figurant au bas de l&apos;attestation
                (format : JCI-HT-AAAA-XXXX).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
