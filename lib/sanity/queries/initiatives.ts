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
  try {
    return await sanityClient.fetch(
      `*[_type == "initiative"] | order(startDate desc) { ${initiativeFields} }`,
      {},
      { next: { revalidate: 3600 } }
    );
  } catch {
    return [];
  }
}

export async function getInitiativeSlugs(): Promise<{ slug: string }[]> {
  if (!isSanityConfigured) return [];
  try {
    return await sanityClient.fetch(
      `*[_type == "initiative" && defined(slug.current)]{ "slug": slug.current }`,
      {},
      { next: { revalidate: 3600 } }
    );
  } catch {
    return [];
  }
}

export async function getInitiativeBySlug(slug: string): Promise<Initiative | null> {
  if (!isSanityConfigured) return null;
  try {
    return await sanityClient.fetch(
      `*[_type == "initiative" && slug.current == $slug][0] {
        ${initiativeFields},
        description,
        gallery
      }`,
      { slug },
      { next: { revalidate: 3600 } }
    );
  } catch {
    return null;
  }
}

export async function getRecentInitiatives(limit = 3): Promise<Initiative[]> {
  if (!isSanityConfigured) return [];
  try {
    return await sanityClient.fetch(
      `*[_type == "initiative"] | order(startDate desc)[0...$limit] { ${initiativeFields} }`,
      { limit },
      { next: { revalidate: 3600 } }
    );
  } catch {
    return [];
  }
}

export async function getInitiativesByCategory(
  category: Initiative["category"]
): Promise<Initiative[]> {
  if (!isSanityConfigured) return [];
  try {
    return await sanityClient.fetch(
      `*[_type == "initiative" && category == $category] | order(startDate desc) { ${initiativeFields} }`,
      { category },
      { next: { revalidate: 3600 } }
    );
  } catch {
    return [];
  }
}
