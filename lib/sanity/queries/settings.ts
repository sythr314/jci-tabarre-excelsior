import { sanityClient, isSanityConfigured } from "../client";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logo?: object;
  heroImage?: object;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!isSanityConfigured) return null;
  return sanityClient.fetch(
    `*[_type == "siteSettings"][0]`,
    {},
    { next: { revalidate: 3600 } }
  );
}
