export type JciRegion =
  | "ouest_metropolitaine"
  | "grand_nord"
  | "grand_sud"
  | "centre_artibonite";

export interface LocalOrganization {
  id: string;
  name: string;
  slug: string;
  region: JciRegion;
  regionLabel: string;
  city: string;
  founded_year: number;
  status: "affiliated" | "provisional";
  president_name: string;
  contact_email: string;
  contact_phone: string;
  members_count: number;
  efficiency_score: number;
  efficiency_breakdown: {
    administration: number; // /25
    growth: number;         // /25
    impact_rise: number;    // /30
    participation: number;  // /20
  };
  capitation_paid: boolean;
  flagship_project: string;
  description: string;
}

export const JCI_REGIONS: { value: JciRegion; label: string }[] = [
  { value: "ouest_metropolitaine", label: "Région Ouest & Aire Métropolitaine" },
  { value: "grand_nord",           label: "Région Grand Nord" },
  { value: "grand_sud",            label: "Région Grand Sud" },
  { value: "centre_artibonite",    label: "Région Centre & Artibonite" },
];

export const DEFAULT_LOCAL_ORGANIZATIONS: LocalOrganization[] = [
  {
    id: "olm-tabarre-excelsior",
    name: "JCI Tabarre Excelsior",
    slug: "tabarre-excelsior",
    region: "ouest_metropolitaine",
    regionLabel: "Région Ouest & Aire Métropolitaine",
    city: "Tabarre",
    founded_year: 2018,
    status: "affiliated",
    president_name: "Keen Bialy Christ Sayther CELESTIN",
    contact_email: "contact@jcitabarre.org",
    contact_phone: "+509 3700-0000",
    members_count: 42,
    efficiency_score: 96,
    efficiency_breakdown: {
      administration: 25,
      growth: 23,
      impact_rise: 29,
      participation: 19,
    },
    capitation_paid: true,
    flagship_project: "Quinzaine de la Citoyenneté Active Numérique (QCAN) & Clinique Mobile de Santé",
    description:
      "Organisation Locale Membre dynamique basée à Tabarre, reconnue pour ses programmes d'innovation citoyenne, d'entrepreneuriat des jeunes et d'action sanitaire communautaire.",
  },
  {
    id: "olm-delmas",
    name: "JCI Delmas",
    slug: "delmas",
    region: "ouest_metropolitaine",
    regionLabel: "Région Ouest & Aire Métropolitaine",
    city: "Delmas",
    founded_year: 2011,
    status: "affiliated",
    president_name: "Marc-Antoine Pierre",
    contact_email: "jci.delmas@jcihaiti.org",
    contact_phone: "+509 3812-4400",
    members_count: 54,
    efficiency_score: 92,
    efficiency_breakdown: {
      administration: 24,
      growth: 22,
      impact_rise: 28,
      participation: 18,
    },
    capitation_paid: true,
    flagship_project: " Académie du Leadership Urbain & Forum de l'Emploi Jeunesse",
    description:
      "Pilier de l'aire métropolitaine, JCI Delmas accompagne des centaines de jeunes professionnels dans la prise de parole en public, le débat citoyen et la création d'entreprises.",
  },
  {
    id: "olm-petion-ville",
    name: "JCI Pétion-Ville",
    slug: "petion-ville",
    region: "ouest_metropolitaine",
    regionLabel: "Région Ouest & Aire Métropolitaine",
    city: "Pétion-Ville",
    founded_year: 2009,
    status: "affiliated",
    president_name: "Stéphanie Laurent",
    contact_email: "jci.petionville@jcihaiti.org",
    contact_phone: "+509 3455-8899",
    members_count: 48,
    efficiency_score: 89,
    efficiency_breakdown: {
      administration: 23,
      growth: 20,
      impact_rise: 27,
      participation: 19,
    },
    capitation_paid: true,
    flagship_project: "Incubateur JCI RISE & Femmes Leaders en Action",
    description:
      "Engagée dans le mentorat entrepreneurial et la diplomatie d'affaires, JCI Pétion-Ville connecte les jeunes leaders aux réseaux économiques nationaux et internationaux.",
  },
  {
    id: "olm-port-au-prince",
    name: "JCI Port-au-Prince",
    slug: "port-au-prince",
    region: "ouest_metropolitaine",
    regionLabel: "Région Ouest & Aire Métropolitaine",
    city: "Port-au-Prince",
    founded_year: 2006,
    status: "affiliated",
    president_name: "Jean-Robert Chevalier",
    contact_email: "jci.pap@jcihaiti.org",
    contact_phone: "+509 3670-1122",
    members_count: 51,
    efficiency_score: 86,
    efficiency_breakdown: {
      administration: 22,
      growth: 20,
      impact_rise: 26,
      participation: 18,
    },
    capitation_paid: true,
    flagship_project: "Concours National d'Art Oratoire & Citoyenneté Active",
    description:
      "Doyenne des organisations locales de la capitale, elle forme depuis près de deux décennies des cadres, sénateurs JCI et décideurs engagés pour la communauté.",
  },
  {
    id: "olm-cap-haitien",
    name: "JCI Cap-Haïtien",
    slug: "cap-haitien",
    region: "grand_nord",
    regionLabel: "Région Grand Nord",
    city: "Cap-Haïtien",
    founded_year: 2012,
    status: "affiliated",
    president_name: "Daphnée Toussaint",
    contact_email: "jci.caphaitien@jcihaiti.org",
    contact_phone: "+509 3788-3344",
    members_count: 46,
    efficiency_score: 94,
    efficiency_breakdown: {
      administration: 24,
      growth: 23,
      impact_rise: 28,
      participation: 19,
    },
    capitation_paid: true,
    flagship_project: "Tourisme Durable & Patrimoine Vert du Grand Nord",
    description:
      "Phare du Grand Nord, JCI Cap-Haïtien mobilise la jeunesse universitaire et entrepreneuriale autour de la valorisation du patrimoine, de l'environnement et de l'économie locale.",
  },
  {
    id: "olm-cayes",
    name: "JCI Les Cayes",
    slug: "les-cayes",
    region: "grand_sud",
    regionLabel: "Région Grand Sud",
    city: "Les Cayes",
    founded_year: 2015,
    status: "affiliated",
    president_name: "Richardson Bélizaire",
    contact_email: "jci.cayes@jcihaiti.org",
    contact_phone: "+509 3901-5566",
    members_count: 35,
    efficiency_score: 84,
    efficiency_breakdown: {
      administration: 21,
      growth: 19,
      impact_rise: 27,
      participation: 17,
    },
    capitation_paid: true,
    flagship_project: "Agri-Jeunesse & Résilience Climatique du Grand Sud",
    description:
      "Forte d'un ancrage communautaire exemplaire dans le département du Sud, JCI Les Cayes développe des projets d'agro-entrepreneuriat et de préparation aux risques naturels.",
  },
  {
    id: "olm-jacmel",
    name: "JCI Jacmel",
    slug: "jacmel",
    region: "grand_sud",
    regionLabel: "Région Grand Sud",
    city: "Jacmel",
    founded_year: 2017,
    status: "affiliated",
    president_name: "Valérie Domond",
    contact_email: "jci.jacmel@jcihaiti.org",
    contact_phone: "+509 3744-7788",
    members_count: 31,
    efficiency_score: 81,
    efficiency_breakdown: {
      administration: 20,
      growth: 19,
      impact_rise: 26,
      participation: 16,
    },
    capitation_paid: false,
    flagship_project: "Industries Créatives & Économie Culturelle de la Jeunesse",
    description:
      "Au cœur de la ville créative de l'UNESCO, JCI Jacmel soutient les jeunes artisans, créateurs numériques et porteurs de projets touristiques et culturels.",
  },
  {
    id: "olm-gonaives",
    name: "JCI Gonaïves",
    slug: "gonaives",
    region: "centre_artibonite",
    regionLabel: "Région Centre & Artibonite",
    city: "Gonaïves",
    founded_year: 2016,
    status: "provisional",
    president_name: "Peterson Joseph",
    contact_email: "jci.gonaives@jcihaiti.org",
    contact_phone: "+509 3890-2211",
    members_count: 28,
    efficiency_score: 76,
    efficiency_breakdown: {
      administration: 19,
      growth: 18,
      impact_rise: 24,
      participation: 15,
    },
    capitation_paid: false,
    flagship_project: "Reboisement Citoyen & Leadership Scolaire dans l'Artibonite",
    description:
      "Portée par la jeunesse de la Cité de l'Indépendance, JCI Gonaïves multiplie les campagnes d'éducation civique et de protection de l'environnement.",
  },
];

export interface ToypCategory {
  code: string;
  title: string;
  description: string;
}

export const TOYP_CATEGORIES: ToypCategory[] = [
  {
    code: "affaires_economie",
    title: "1. Réalisations commerciales, économiques ou entrepreneuriales",
    description: "Jeunes entrepreneurs ou dirigeants ayant créé un impact économique mesurable et des emplois.",
  },
  {
    code: "affaires_politiques_juridiques",
    title: "2. Affaires politiques, juridiques ou gouvernementales",
    description: "Jeunes engagés dans le service public, la défense de l'État de droit et la gouvernance.",
  },
  {
    code: "leadership_academique",
    title: "3. Leadership ou accomplissement académique",
    description: "Enseignants, chercheurs et étudiants d'exception faisant rayonner l'éducation en Haïti.",
  },
  {
    code: "accomplissement_culturel",
    title: "4. Accomplissement culturel et artistique",
    description: "Artistes, écrivains, musiciens et acteurs culturels valorisant le patrimoine haïtien.",
  },
  {
    code: "leadership_environnemental",
    title: "5. Leadership moral ou environnemental",
    description: "Défenseurs de l'écologie, du reboisement, de l'énergie propre et de l'éthique citoyenne.",
  },
  {
    code: "droits_enfants_paix",
    title: "6. Contribution aux droits des enfants, à la paix mondiale ou aux droits humains",
    description: "Militants et responsables associatifs œuvrant pour la protection des plus vulnérables.",
  },
  {
    code: "service_humanitaire",
    title: "7. Leadership humanitaire ou bénévole",
    description: "Citoyens ayant consacré leur énergie au secours communautaire et à l'action sociale.",
  },
  {
    code: "developpement_scientifique",
    title: "8. Développement scientifique et technologique",
    description: "Ingénieurs, développeurs et innovateurs créant des solutions numériques ou scientifiques.",
  },
  {
    code: "depassement_personnel",
    title: "9. Dépassement personnel et résilience",
    description: "Parcours inspirants de jeunes ayant surmonté des obstacles majeurs pour réussir et inspirer.",
  },
  {
    code: "innovation_medicale",
    title: "10. Innovation médicale et santé communautaire",
    description: "Médecins, infirmiers et chercheurs améliorant l'accès aux soins et la prévention sanitaire.",
  },
];

export interface JciCertificateRecord {
  certificate_code: string;
  recipient_name: string;
  course_title: string;
  course_category: "official" | "academy" | "leadership" | "award";
  local_org_name: string;
  trainer_name: string;
  issued_date: string;
  is_valid: boolean;
}

export const DEFAULT_CERTIFICATES: JciCertificateRecord[] = [
  {
    certificate_code: "JCI-HT-2026-0001",
    recipient_name: "Keen Bialy Christ Sayther CELESTIN",
    course_title: "JCI Impact & Gouvernance des Organisations Locales",
    course_category: "official",
    local_org_name: "JCI Tabarre Excelsior",
    trainer_name: "Sénateur JCI #74210 — Formateur Certifié CNT",
    issued_date: "2026-02-15",
    is_valid: true,
  },
  {
    certificate_code: "JCI-HT-2026-0002",
    recipient_name: "Marie-Louise Jean",
    course_title: "JCI Effective Communication & Art Oratoire",
    course_category: "official",
    local_org_name: "JCI Tabarre Excelsior",
    trainer_name: "Sénateur JCI #78512 — Formateur Certifié CLT",
    issued_date: "2026-03-22",
    is_valid: true,
  },
  {
    certificate_code: "JCI-HT-2026-0003",
    recipient_name: "Marc-Antoine Pierre",
    course_title: "Académie Nationale de Leadership JCI Haïti 2026",
    course_category: "academy",
    local_org_name: "JCI Delmas",
    trainer_name: "Institut de Formation JCI Haïti",
    issued_date: "2026-04-10",
    is_valid: true,
  },
];

export interface JciTrainer {
  id: string;
  name: string;
  grade: "IG" | "NGT" | "CNT" | "CLT";
  gradeLabel: string;
  senatorNumber?: string;
  homeOlm: string;
  specialties: string[];
  email: string;
}

export const DEFAULT_TRAINERS: JciTrainer[] = [
  {
    id: "tr-1",
    name: "Sén. Jean-Claude Désir",
    grade: "IG",
    gradeLabel: "International Graduate (IG)",
    senatorNumber: "Sénateur JCI #68412",
    homeOlm: "JCI Port-au-Prince",
    specialties: ["JCI Trainer", "Planification Stratégique", "Protocole Parlementaire"],
    email: "jc.desir@jcihaiti.org",
  },
  {
    id: "tr-2",
    name: "Sén. Nadège Augustin",
    grade: "CNT",
    gradeLabel: "Certified National Trainer (CNT)",
    senatorNumber: "Sénateur JCI #74210",
    homeOlm: "JCI Pétion-Ville",
    specialties: ["JCI Impact", "JCI Presenter", "Leadership Féminin"],
    email: "n.augustin@jcihaiti.org",
  },
  {
    id: "tr-3",
    name: "Sén. Frantzdy Salomon",
    grade: "CNT",
    gradeLabel: "Certified National Trainer (CNT)",
    senatorNumber: "Sénateur JCI #78512",
    homeOlm: "JCI Cap-Haïtien",
    specialties: ["JCI Effective Communication", "Débat & Art Oratoire", "Gestion de Projet"],
    email: "f.salomon@jcihaiti.org",
  },
  {
    id: "tr-4",
    name: "Christelle Moïse",
    grade: "CLT",
    gradeLabel: "Certified Local Trainer (CLT)",
    homeOlm: "JCI Tabarre Excelsior",
    specialties: ["JCI Admin", "Citoyenneté Active Numérique", "Entrepreneuriat Jeunesse"],
    email: "c.moise@jcitabarre.org",
  },
];
