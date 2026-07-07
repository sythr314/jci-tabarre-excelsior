import { sanityClient, isSanityConfigured } from "../client";

export type Initiative = {
  _id: string;
  title: string;
  slug: { current: string };
  category: "communaute" | "entrepreneuriat" | "formation" | "sante" | "environnement";
  summary: string;
  description: object[];
  coverImage?: object;
  gallery?: object[];
  startDate: string;
  endDate?: string;
  status: "ongoing" | "completed" | "planned";
  results?: string;
  beneficiaries?: number;
};

const initiativeFields = `
  _id,
  title,
  slug,
  category,
  summary,
  coverImage,
  startDate,
  endDate,
  status,
  results,
  beneficiaries
`;

export async function getAllInitiatives(): Promise<Initiative[]> {
  if (!isSanityConfigured) return [];
  return sanityClient.fetch(
    `*[_type == "initiative"] | order(startDate desc) { ${initiativeFields} }`,
    {},
    { next: { revalidate: 3600 } }
  );
}

export async function getInitiativeBySlug(slug: string): Promise<Initiative | null> {
  if (!isSanityConfigured) return null;
  return sanityClient.fetch(
    `*[_type == "initiative" && slug.current == $slug][0] {
      ${initiativeFields},
      description,
      gallery
    }`,
    { slug },
    { next: { revalidate: 3600 } }
  );
}

export async function getInitiativeSlugs(): Promise<{ slug: string }[]> {
  if (!isSanityConfigured) return [];
  const result = await sanityClient.fetch<{ slug: { current: string } }[]>(
    `*[_type == "initiative"]{ slug }`,
    {},
    { next: { revalidate: 3600 } }
  );
  return result.map((r) => ({ slug: r.slug.current }));
}

export async function getRecentInitiatives(limit = 3): Promise<Initiative[]> {
  if (!isSanityConfigured) return [];
  return sanityClient.fetch(
    `*[_type == "initiative"] | order(startDate desc)[0...$limit] { ${initiativeFields} }`,
    { limit },
    { next: { revalidate: 3600 } }
  );
}
