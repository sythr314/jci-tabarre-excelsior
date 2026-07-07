import { defineType, defineField } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Membre du bureau",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nom complet", type: "string", validation: (R) => R.required() }),
    defineField({ name: "role", title: "Rôle / Poste", type: "string", validation: (R) => R.required() }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Ordre d'affichage", type: "number", initialValue: 99 }),
    defineField({ name: "bio", title: "Biographie courte", type: "text", rows: 3 }),
  ],
  orderings: [{ title: "Ordre", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
