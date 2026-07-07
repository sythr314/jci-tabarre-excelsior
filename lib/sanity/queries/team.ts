import { sanityClient, isSanityConfigured } from "../client";

export type TeamMember = {
  _id: string;
  name: string;
  role: string;
  photo?: object;
  order: number;
  bio?: string;
};

export type PastPresident = {
  _id: string;
  name: string;
  photo?: object;
  mandateStart: number;
  mandateEnd: number;
  bio?: string;
  achievements?: string[];
  quote?: string;
};

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (!isSanityConfigured) return [];
  return sanityClient.fetch(
    `*[_type == "teamMember"] | order(order asc)`,
    {},
    { next: { revalidate: 3600 } }
  );
}

export async function getPastPresidents(): Promise<PastPresident[]> {
  if (!isSanityConfigured) return [];
  return sanityClient.fetch(
    `*[_type == "pastPresident"] | order(mandateEnd desc)`,
    {},
    { next: { revalidate: 3600 } }
  );
}
