import { defineType, defineField } from "sanity";

export const partner = defineType({
  name: "partner",
  title: "Partenaire",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nom de l'organisation",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
      description: "Recommandé : fond transparent (PNG) ou fond blanc",
    }),
    defineField({
      name: "website",
      title: "Site web",
      type: "url",
    }),
    defineField({
      name: "category",
      title: "Catégorie",
      type: "string",
      options: {
        list: [
          { title: "Institutionnel", value: "institutionnel" },
          { title: "Communautaire", value: "communautaire" },
          { title: "Financier / Sponsor", value: "financier" },
          { title: "Médias", value: "medias" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "description",
      title: "Description courte",
      type: "text",
      rows: 2,
      description: "Optionnel — rôle ou nature du partenariat",
    }),
    defineField({
      name: "order",
      title: "Ordre d'affichage",
      type: "number",
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: "Ordre d'affichage",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "category", media: "logo" },
    prepare({ title, subtitle, media }) {
      const categories: Record<string, string> = {
        institutionnel: "Institutionnel",
        communautaire: "Communautaire",
        financier: "Financier / Sponsor",
        medias: "Médias",
      };
      return { title, subtitle: subtitle ? categories[subtitle] : "", media };
    },
  },
});
