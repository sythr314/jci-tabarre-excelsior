import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères"),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
  _honeypot: z.string().max(0, "Champ invalide"),
});

export const INTERESTS_OPTIONS = [
  { value: "communaute", label: "Communauté" },
  { value: "entrepreneuriat", label: "Entrepreneuriat" },
  { value: "formation", label: "Formation & Leadership" },
  { value: "sante", label: "Santé" },
  { value: "environnement", label: "Environnement" },
  { value: "international", label: "Relations internationales" },
] as const;

export const HOW_HEARD_OPTIONS = [
  { value: "reseaux_sociaux", label: "Réseaux sociaux" },
  { value: "bouche_a_oreille", label: "Bouche à oreille" },
  { value: "membre_jci", label: "Un membre JCI" },
  { value: "evenement", label: "Événement public" },
  { value: "site_web", label: "Site web" },
  { value: "autre", label: "Autre" },
] as const;

export const EDUCATION_OPTIONS = [
  { value: "secondaire", label: "Secondaire / Terminal" },
  { value: "bac", label: "Baccalauréat" },
  { value: "licence", label: "Licence (Bac+3)" },
  { value: "master", label: "Master / DEA (Bac+5)" },
  { value: "doctorat", label: "Doctorat" },
  { value: "autre", label: "Autre" },
] as const;

export const joinSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  birthDate: z
    .string()
    .min(1, "La date de naissance est requise")
    .refine((val) => {
      const birth = new Date(val);
      if (isNaN(birth.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age >= 18 && age <= 40;
    }, "Vous devez avoir entre 18 et 40 ans pour rejoindre JCI"),
  commune: z.string().min(2, "La commune de résidence est requise"),
  profession: z.string().optional(),
  educationLevel: z.string().optional(),
  interests: z
    .array(z.string())
    .min(1, "Sélectionnez au moins un domaine d'intérêt"),
  howHeard: z.string().min(1, "Veuillez indiquer comment vous avez connu JCI"),
  motivation: z
    .string()
    .min(20, "La motivation doit contenir au moins 20 caractères")
    .max(1000, "La motivation ne peut pas dépasser 1000 caractères"),
  _honeypot: z.string().max(0, "Champ invalide"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type JoinFormData = z.infer<typeof joinSchema>;
