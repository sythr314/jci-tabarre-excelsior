import { sanityClient, isSanityConfigured } from "../client";

export type Partner = {
  _id: string;
  name: string;
  logo?: object;
  website?: string;
  category?: "institutionnel" | "communautaire" | "financier" | "medias";
  description?: string;
  order: number;
};

export async function getPartners(): Promise<Partner[]> {
  if (!isSanityConfigured) return [];
  return sanityClient.fetch(
    `*[_type == "partner"] | order(order asc)`,
    {},
    { next: { revalidate: 3600 } }
  );
}
