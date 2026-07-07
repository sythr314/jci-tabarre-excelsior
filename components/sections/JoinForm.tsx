"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  joinSchema,
  type JoinFormData,
  INTERESTS_OPTIONS,
  HOW_HEARD_OPTIONS,
  EDUCATION_OPTIONS,
} from "@/lib/utils/schemas";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const today = new Date();
const BIRTH_DATE_MAX = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  .toISOString()
  .split("T")[0];
const BIRTH_DATE_MIN = new Date(today.getFullYear() - 40, today.getMonth(), today.getDate())
  .toISOString()
  .split("T")[0];

const inputClass = cn(
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent",
  "placeholder:text-gray-400"
);

const sectionClass = "border-t border-gray-100 pt-5";

export function JoinForm() {
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      interests: [],
    },
  });

  async function onSubmit(data: JoinFormData) {
    setStatus("loading");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="alert" className="bg-success/10 border border-success/20 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3" aria-hidden="true">🎉</div>
        <h3 className="font-heading font-bold text-navy text-lg mb-2">Candidature reçue !</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Merci pour votre intérêt. Notre équipe examinera votre candidature et vous contactera
          prochainement pour la suite du processus d&apos;adhésion.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
    >
      {/* Honeypot */}
      <input
        {...register("_honeypot")}
        type="text"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
      />

      {status === "error" && (
        <div role="alert" className="bg-error/10 border border-error/20 rounded-lg p-4 text-sm text-error">
          Une erreur est survenue. Veuillez réessayer.
        </div>
      )}

      {/* ── Identité ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="join-firstName" className="block text-sm font-medium text-navy mb-1">
            Prénom <span aria-hidden="true">*</span>
          </label>
          <input
            id="join-firstName"
            type="text"
            autoComplete="given-name"
            className={cn(inputClass, errors.firstName && "border-error focus:ring-error")}
            {...register("firstName")}
          />
          {errors.firstName && <p role="alert" className="mt-1 text-xs text-error">{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="join-lastName" className="block text-sm font-medium text-navy mb-1">
            Nom <span aria-hidden="true">*</span>
          </label>
          <input
            id="join-lastName"
            type="text"
            autoComplete="family-name"
            className={cn(inputClass, errors.lastName && "border-error focus:ring-error")}
            {...register("lastName")}
          />
          {errors.lastName && <p role="alert" className="mt-1 text-xs text-error">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="join-birthDate" className="block text-sm font-medium text-navy mb-1">
            Date de naissance <span aria-hidden="true">*</span>
          </label>
          <input
            id="join-birthDate"
            type="date"
            min={BIRTH_DATE_MIN}
            max={BIRTH_DATE_MAX}
            className={cn(inputClass, errors.birthDate && "border-error focus:ring-error")}
            {...register("birthDate")}
          />
          {errors.birthDate && <p role="alert" className="mt-1 text-xs text-error">{errors.birthDate.message}</p>}
          <p className="mt-1 text-xs text-gray-400">JCI est ouvert aux 18–40 ans</p>
        </div>
        <div>
          <label htmlFor="join-commune" className="block text-sm font-medium text-navy mb-1">
            Commune de résidence <span aria-hidden="true">*</span>
          </label>
          <input
            id="join-commune"
            type="text"
            placeholder="Ex : Tabarre, Pétion-Ville…"
            className={cn(inputClass, errors.commune && "border-error focus:ring-error")}
            {...register("commune")}
          />
          {errors.commune && <p role="alert" className="mt-1 text-xs text-error">{errors.commune.message}</p>}
        </div>
      </div>

      {/* ── Contact ── */}
      <div className={sectionClass}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="join-email" className="block text-sm font-medium text-navy mb-1">
              Adresse email <span aria-hidden="true">*</span>
            </label>
            <input
              id="join-email"
              type="email"
              autoComplete="email"
              className={cn(inputClass, errors.email && "border-error focus:ring-error")}
              {...register("email")}
            />
            {errors.email && <p role="alert" className="mt-1 text-xs text-error">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="join-phone" className="block text-sm font-medium text-navy mb-1">
              Téléphone <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              id="join-phone"
              type="tel"
              autoComplete="tel"
              placeholder="Ex : +509 ···"
              className={inputClass}
              {...register("phone")}
            />
          </div>
        </div>
      </div>

      {/* ── Profil ── */}
      <div className={sectionClass}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="join-profession" className="block text-sm font-medium text-navy mb-1">
              Profession / Secteur d&apos;activité <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              id="join-profession"
              type="text"
              placeholder="Ex : Ingénieur, Médecin, Étudiant…"
              className={inputClass}
              {...register("profession")}
            />
          </div>
          <div>
            <label htmlFor="join-educationLevel" className="block text-sm font-medium text-navy mb-1">
              Niveau d&apos;études <span className="text-gray-400">(optionnel)</span>
            </label>
            <select
              id="join-educationLevel"
              className={cn(inputClass, "cursor-pointer")}
              {...register("educationLevel")}
            >
              <option value="">Sélectionnez…</option>
              {EDUCATION_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Engagement ── */}
      <div className={sectionClass}>
        <fieldset>
          <legend className="block text-sm font-medium text-navy mb-3">
            Domaines d&apos;intérêt <span aria-hidden="true">*</span>
            <span className="block text-xs text-gray-400 font-normal mt-0.5">
              Sélectionnez un ou plusieurs axes dans lesquels vous souhaitez vous impliquer.
            </span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INTERESTS_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-gray-200 cursor-pointer hover:border-cyan hover:bg-cyan/5 transition-colors has-[:checked]:border-cyan has-[:checked]:bg-cyan/10"
              >
                <input
                  type="checkbox"
                  value={value}
                  className="w-4 h-4 rounded border-gray-300 accent-cyan"
                  {...register("interests")}
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
          {errors.interests && (
            <p role="alert" className="mt-2 text-xs text-error">
              {errors.interests.message as string}
            </p>
          )}
        </fieldset>

        <div className="mt-5">
          <label htmlFor="join-howHeard" className="block text-sm font-medium text-navy mb-1">
            Comment avez-vous connu JCI ? <span aria-hidden="true">*</span>
          </label>
          <select
            id="join-howHeard"
            className={cn(inputClass, "cursor-pointer", errors.howHeard && "border-error focus:ring-error")}
            {...register("howHeard")}
            defaultValue=""
          >
            <option value="" disabled>Sélectionnez une option…</option>
            {HOW_HEARD_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.howHeard && <p role="alert" className="mt-1 text-xs text-error">{errors.howHeard.message}</p>}
        </div>
      </div>

      {/* ── Motivation ── */}
      <div className={sectionClass}>
        <label htmlFor="join-motivation" className="block text-sm font-medium text-navy mb-1">
          Pourquoi souhaitez-vous rejoindre JCI ? <span aria-hidden="true">*</span>
          <span className="block text-xs text-gray-400 font-normal mt-0.5">
            Décrivez vos motivations, vos objectifs, ou ce que vous espérez apporter à la communauté. (20–1000 caractères)
          </span>
        </label>
        <textarea
          id="join-motivation"
          rows={5}
          className={cn(inputClass, "resize-none", errors.motivation && "border-error focus:ring-error")}
          {...register("motivation")}
        />
        {errors.motivation && <p role="alert" className="mt-1 text-xs text-error">{errors.motivation.message}</p>}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <><Spinner className="text-navy" /> Envoi en cours…</>
        ) : (
          "Envoyer ma candidature"
        )}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Les champs marqués <span aria-hidden="true">*</span> sont obligatoires.
      </p>
    </form>
  );
}
