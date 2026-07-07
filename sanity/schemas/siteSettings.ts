import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Paramètres du site",
  type: "document",
  fields: [
    defineField({ name: "siteName", title: "Nom du site", type: "string", initialValue: "JCI Tabarre Excelsior" }),
    defineField({ name: "tagline", title: "Slogan", type: "string" }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "heroImage", title: "Image hero (accueil)", type: "image", options: { hotspot: true } }),
    defineField({ name: "heroTitle", title: "Titre hero", type: "string" }),
    defineField({ name: "heroSubtitle", title: "Sous-titre hero", type: "text", rows: 2 }),
    defineField({ name: "contactEmail", title: "Email de contact", type: "string" }),
    defineField({ name: "contactPhone", title: "Téléphone", type: "string" }),
    defineField({ name: "address", title: "Adresse", type: "string" }),
    defineField({
      name: "socialLinks",
      title: "Réseaux sociaux",
      type: "object",
      fields: [
        { name: "facebook", type: "url", title: "Facebook" },
        { name: "instagram", type: "url", title: "Instagram" },
        { name: "linkedin", type: "url", title: "LinkedIn" },
        { name: "twitter", type: "url", title: "X / Twitter" },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Paramètres du site" }) },
});
