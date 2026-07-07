"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/utils/schemas";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const inputClass = cn(
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent",
  "placeholder:text-gray-400"
);

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
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
        <div className="text-4xl mb-3" aria-hidden="true">✅</div>
        <h3 className="font-heading font-bold text-navy text-lg mb-2">Message envoyé !</h3>
        <p className="text-gray-600 text-sm">Nous vous répondrons dans les meilleurs délais.</p>
        <button onClick={() => setStatus("idle")} className="mt-4 text-cyan text-sm hover:underline focus-visible:outline-none focus-visible:underline">
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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

      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-navy mb-1">Nom complet <span aria-hidden="true">*</span></label>
        <input id="contact-name" type="text" autoComplete="name" className={cn(inputClass, errors.name && "border-error focus:ring-error")} {...register("name")} />
        {errors.name && <p role="alert" className="mt-1 text-xs text-error">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-navy mb-1">Adresse email <span aria-hidden="true">*</span></label>
        <input id="contact-email" type="email" autoComplete="email" className={cn(inputClass, errors.email && "border-error focus:ring-error")} {...register("email")} />
        {errors.email && <p role="alert" className="mt-1 text-xs text-error">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-navy mb-1">Sujet <span aria-hidden="true">*</span></label>
        <input id="contact-subject" type="text" className={cn(inputClass, errors.subject && "border-error focus:ring-error")} {...register("subject")} />
        {errors.subject && <p role="alert" className="mt-1 text-xs text-error">{errors.subject.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-navy mb-1">Message <span aria-hidden="true">*</span></label>
        <textarea id="contact-message" rows={5} className={cn(inputClass, "resize-none", errors.message && "border-error focus:ring-error")} {...register("message")} />
        {errors.message && <p role="alert" className="mt-1 text-xs text-error">{errors.message.message}</p>}
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? <><Spinner className="text-navy" /> Envoi en cours...</> : "Envoyer le message"}
      </Button>
    </form>
  );
}
