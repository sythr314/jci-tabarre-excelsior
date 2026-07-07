import { defineType, defineField } from "sanity";

export const initiative = defineType({
  name: "initiative",
  title: "Initiative",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titre", type: "string", validation: (R) => R.required() }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "category",
      title: "Catégorie",
      type: "string",
      options: {
        list: [
          { title: "Communauté", value: "communaute" },
          { title: "Entrepreneuriat", value: "entrepreneuriat" },
          { title: "Formation", value: "formation" },
          { title: "Santé", value: "sante" },
          { title: "Environnement", value: "environnement" },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "summary",
      title: "Résumé (max 200 caractères)",
      type: "string",
      validation: (R) => R.required().max(200),
    }),
    defineField({ name: "description", title: "Description complète", type: "blockContent" }),
    defineField({ name: "coverImage", title: "Image principale", type: "image", options: { hotspot: true } }),
    defineField({
      name: "gallery",
      title: "Galerie photos (max 15)",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (R) => R.max(15),
    }),
    defineField({ name: "startDate", title: "Date de début", type: "date", validation: (R) => R.required() }),
    defineField({ name: "endDate", title: "Date de fin", type: "date" }),
    defineField({
      name: "status",
      title: "Statut",
      type: "string",
      options: {
        list: [
          { title: "En cours", value: "ongoing" },
          { title: "Terminé", value: "completed" },
          { title: "Planifié", value: "planned" },
        ],
      },
      initialValue: "planned",
      validation: (R) => R.required(),
    }),
    defineField({ name: "results", title: "Résultats clés", type: "string" }),
    defineField({ name: "beneficiaries", title: "Nombre de bénéficiaires", type: "number" }),
  ],
  preview: {
    select: { title: "title", media: "coverImage", status: "status" },
    prepare({ title, media, status }) {
      return { title, subtitle: status, media };
    },
  },
});
