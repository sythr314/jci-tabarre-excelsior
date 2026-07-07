import { defineType, defineField } from "sanity";

export const pastPresident = defineType({
  name: "pastPresident",
  title: "Président passé",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nom complet",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "mandateStart",
      title: "Début du mandat (année)",
      type: "number",
      validation: (R) => R.required().min(1990).max(new Date().getFullYear()),
    }),
    defineField({
      name: "mandateEnd",
      title: "Fin du mandat (année)",
      type: "number",
      validation: (R) => R.required().min(1990).max(new Date().getFullYear() + 1),
    }),
    defineField({
      name: "bio",
      title: "Biographie",
      type: "text",
      rows: 4,
      description: "Présentation courte du président",
    }),
    defineField({
      name: "achievements",
      title: "Réalisations clés",
      type: "array",
      of: [{ type: "string" }],
      description: "Principales réalisations sous ce mandat (max 5 recommandé)",
    }),
    defineField({
      name: "quote",
      title: "Citation",
      type: "string",
      description: "Une citation marquante du président (optionnel)",
    }),
  ],
  orderings: [
    {
      title: "Mandat (récent en premier)",
      name: "mandateDesc",
      by: [{ field: "mandateEnd", direction: "desc" }],
    },
    {
      title: "Mandat (ancien en premier)",
      name: "mandateAsc",
      by: [{ field: "mandateStart", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      mandateStart: "mandateStart",
      mandateEnd: "mandateEnd",
      media: "photo",
    },
    prepare({ title, mandateStart, mandateEnd, media }) {
      return {
        title,
        subtitle: mandateStart && mandateEnd ? `${mandateStart}–${mandateEnd}` : "",
        media,
      };
    },
  },
});
