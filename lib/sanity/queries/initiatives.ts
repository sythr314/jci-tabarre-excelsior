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

const defaultInitiatives: Initiative[] = [
  {
    _id: "init-qcan-2026",
    title: "Quinzaine de la Citoyenneté Active et Numérique (QCAN)",
    slug: { current: "quinzaine-citoyennete-active-numerique-qcan" },
    category: "formation",
    summary:
      "Campagne d'envergure mobilisant la jeunesse autour de la citoyenneté numérique, de la lutte contre la désinformation, de l'usage éthique de l'intelligence artificielle et de la cybersécurité en Haïti.",
    description: [
      {
        _type: "block",
        children: [
          {
            text: "Portée par la JCI Tabarre Excelsior en consortium avec l'Internet Society Haiti Chapter, JCI Haïti et des partenaires médiatiques, la Quinzaine de la Citoyenneté Active et Numérique (QCAN) répond aux défis urgents posés par la transformation digitale et l'essor de l'intelligence artificielle.",
          },
        ],
      },
      {
        _type: "block",
        children: [
          {
            text: "Sous le thème « Citoyens connectés, citoyens responsables : bâtir ensemble la démocratie numérique de demain en Haïti », le programme déploie des webinaires interactifs, des sessions de fact-checking pratique, des ateliers de cybersécurité pour les jeunes et les créateurs de contenu, et se clôture par un grand forum citoyen.",
          },
        ],
      },
      {
        _type: "block",
        children: [
          {
            text: "Cette initiative incarne l'engagement de la Jeune Chambre Internationale à former des leaders éclairés, capables d'exploiter les technologies numériques au bénéfice direct du développement communautaire et de la cohésion sociale.",
          },
        ],
      },
    ],
    startDate: "2026-08-10",
    endDate: "2026-08-25",
    status: "ongoing",
    results: "+1 500 jeunes formés et sensibilisés, 8 webinaires spécialisés et un plaidoyer pour la sécurité numérique en Haïti.",
    beneficiaries: 1500,
  },
  {
    _id: "init-sante-tabarre",
    title: "Clinique Mobile & Prévention Santé Communautaire",
    slug: { current: "clinique-mobile-prevention-sante-tabarre" },
    category: "sante",
    summary:
      "Journée de solidarité médicale offrant consultations générales gratuites, dépistages, éducation sanitaire et distribution de kits d'hygiène aux familles vulnérables de Tabarre.",
    description: [
      {
        _type: "block",
        children: [
          {
            text: "Dans les quartiers à accès limité aux soins de santé de base dans la commune de Tabarre, la JCI Tabarre Excelsior a mobilisé un corps de médecins bénévoles, d'infirmiers et de pharmaciens partenaires pour offrir des soins primaires d'urgence.",
          },
        ],
      },
      {
        _type: "block",
        children: [
          {
            text: "Au-delà des consultations médicales, des ateliers de prévention sur les maladies hydriques, l'hygiène infantile et la santé maternelle ont permis de sensibiliser durablement les mères de famille et les jeunes du quartier.",
          },
        ],
      },
    ],
    startDate: "2026-04-12",
    endDate: "2026-04-14",
    status: "completed",
    results: "850 consultations gratuites dispensées, 300 kits de premiers secours et d'hygiène distribués.",
    beneficiaries: 850,
  },
  {
    _id: "init-entrepreneuriat-jeunesse",
    title: "Carrefour Jeunesse & Entrepreneuriat : Financer sa Startup",
    slug: { current: "carrefour-jeunesse-entrepreneuriat-financer-startup" },
    category: "entrepreneuriat",
    summary:
      "Forum d'incubation, de formation au pitch d'affaires et de mise en relation directe entre jeunes porteurs de projets locaux et institutions de micro-finance.",
    description: [
      {
        _type: "block",
        children: [
          {
            text: "Pour lutter contre le chômage des jeunes et stimuler le dynamisme économique de Tabarre, la JCI Tabarre Excelsior a réuni entrepreneurs chevronnés, experts-comptables et représentants d'institutions financières.",
          },
        ],
      },
      {
        _type: "block",
        children: [
          {
            text: "Les participants ont bénéficié de masterclasses sur le montage de business plan rigoureux, la structuration juridique de leur entreprise et l'art de convaincre des investisseurs lors d'une compétition de pitch d'impact.",
          },
        ],
      },
    ],
    startDate: "2026-02-20",
    endDate: "2026-02-22",
    status: "completed",
    results: "25 projets d'entreprises analysés, 5 startups lauréates primées et accompagnées vers le financement.",
    beneficiaries: 300,
  },
  {
    _id: "init-eco-tabarre",
    title: "Projet Éco-Tabarre : Salubrité Urbaine & Reboisement",
    slug: { current: "projet-eco-tabarre-salubrite-reboisement" },
    category: "environnement",
    summary:
      "Action citoyenne combinant nettoyage communautaire des artères principales, collecte et tri des déchets plastiques, et plantation d'arbres d'ombrage à Tabarre.",
    description: [
      {
        _type: "block",
        children: [
          {
            text: "Face aux défis de gestion des déchets et aux conséquences du déboisement urbain, les membres de la JCI Tabarre Excelsior se sont mobilisés aux côtés des riverains et des écoliers pour une vaste opération de salubrité publique.",
          },
        ],
      },
      {
        _type: "block",
        children: [
          {
            text: "Des points de collecte écologiques ont été installés et les déchets plastiques ont été acheminés vers des filières de valorisation locale, renforçant la conscience écologique de la communauté.",
          },
        ],
      },
    ],
    startDate: "2025-11-05",
    endDate: "2025-11-08",
    status: "completed",
    results: "4 tonnes de déchets plastiques évacuées et 500 jeunes arbres plantés sur les espaces publics de la commune.",
    beneficiaries: 2000,
  },
  {
    _id: "init-academie-art-oratoire",
    title: "Académie des Orateurs & Leaders d'Impact JCI",
    slug: { current: "academie-orateurs-leaders-impact-jci" },
    category: "formation",
    summary:
      "Programme d'excellence annuel formant les jeunes leaders aux techniques de persuasion, au débat parlementaire contradictoire et à la négociation stratégique.",
    description: [
      {
        _type: "block",
        children: [
          {
            text: "L'art oratoire est l'une des disciplines emblématiques de la Jeune Chambre Internationale. Cette académie offre un cadre bienveillant et exigeant pour vaincre le trac, structurer une argumentation percutante et inspirer un auditoire.",
          },
        ],
      },
      {
        _type: "block",
        children: [
          {
            text: "Les lauréats du concours interne représentent fièrement la locale Tabarre Excelsior lors des compétitions nationales d'art oratoire et de débat de la JCI Haïti.",
          },
        ],
      },
    ],
    startDate: "2026-06-01",
    endDate: "2026-07-15",
    status: "ongoing",
    results: "50 orateurs formés chaque année, reconnus pour leur éloquence et leur sens du leadership civique.",
    beneficiaries: 250,
  },
];

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
  if (isSanityConfigured) {
    try {
      const data = await sanityClient.fetch(
        `*[_type == "initiative"] | order(startDate desc) { ${initiativeFields} }`,
        {},
        { next: { revalidate: 3600 } }
      );
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback
    }
  }
  return defaultInitiatives;
}

export async function getInitiativeSlugs(): Promise<{ slug: string }[]> {
  if (isSanityConfigured) {
    try {
      const data = await sanityClient.fetch(
        `*[_type == "initiative" && defined(slug.current)]{ "slug": slug.current }`,
        {},
        { next: { revalidate: 3600 } }
      );
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback
    }
  }
  return defaultInitiatives.map((i) => ({ slug: i.slug.current }));
}

export async function getInitiativeBySlug(slug: string): Promise<Initiative | null> {
  if (isSanityConfigured) {
    try {
      const data = await sanityClient.fetch(
        `*[_type == "initiative" && slug.current == $slug][0] {
          ${initiativeFields},
          description,
          gallery
        }`,
        { slug },
        { next: { revalidate: 3600 } }
      );
      if (data) return data;
    } catch {
      // Fallback
    }
  }
  return defaultInitiatives.find((i) => i.slug.current === slug) ?? null;
}

export async function getRecentInitiatives(limit = 3): Promise<Initiative[]> {
  if (isSanityConfigured) {
    try {
      const data = await sanityClient.fetch(
        `*[_type == "initiative"] | order(startDate desc)[0...$limit] { ${initiativeFields} }`,
        { limit },
        { next: { revalidate: 3600 } }
      );
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback
    }
  }
  return defaultInitiatives.slice(0, limit);
}

export async function getInitiativesByCategory(
  category: Initiative["category"]
): Promise<Initiative[]> {
  if (isSanityConfigured) {
    try {
      const data = await sanityClient.fetch(
        `*[_type == "initiative" && category == $category] | order(startDate desc) { ${initiativeFields} }`,
        { category },
        { next: { revalidate: 3600 } }
      );
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Fallback
    }
  }
  return defaultInitiatives.filter((i) => i.category === category);
}
