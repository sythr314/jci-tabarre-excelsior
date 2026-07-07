@AGENTS.md

# JCI Tabarre Excelsior — Documentation complète du projet

## Présentation générale
Site web institutionnel et plateforme de gestion membrale pour **JCI Tabarre Excelsior**, une locale de la Junior Chamber International (JCI) implantée à Tabarre, Haïti. Le site remplit trois fonctions :
1. **Vitrine publique** — présentation de l'organisation, des initiatives, formulaire d'adhésion, contact
2. **Portail membres** — tableau de bord personnel, score d'engagement, suivi des cotisations et activités
3. **Panel d'administration** — gestion des membres, invitations, activités, import Google Sheets

## À propos de la JCI
La Junior Chamber International est une ONG mondiale regroupant des jeunes adultes de **18 à 40 ans** engagés dans le développement du leadership et de l'impact communautaire. JCI Tabarre Excelsior opère selon 5 axes : **Communauté · Entrepreneuriat · Formation/Leadership · Santé · Environnement**.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styles | Tailwind CSS 4 + PostCSS |
| CMS | Sanity 6 |
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Email | Resend |
| Rate limiting | Upstash Redis |
| Analytics | Vercel Analytics |
| Formulaires | React Hook Form 7 + Zod 4 |
| Internationalisation | next-intl |
| Import présences | googleapis (Google Sheets) |
| Hébergement | Vercel |

---

## Architecture des routes

### Pages publiques (`app/(public)/`)
| Route | Description |
|-------|-------------|
| `/` | Accueil : Hero, Statistiques, Mission, Initiatives récentes, CTA |
| `/about` | Histoire, bureau actuel, **galerie des présidents passés** |
| `/initiatives` | Toutes les initiatives (filtrable par catégorie) |
| `/initiatives/[slug]` | Détail d'une initiative avec galerie d'images |
| `/join` | Formulaire d'adhésion complet (11 champs, validation âge 18–40) |
| `/contact` | Formulaire de contact |

### Portail membres (`app/espace-membre/`)
| Route | Description |
|-------|-------------|
| `/espace-membre/connexion` | Connexion avec email/mot de passe (Supabase Auth) |
| `/espace-membre/tableau-de-bord` | Score d'engagement, cotisations, activités à venir |
| `/espace-membre/invitation/[token]` | Activation du compte via token (valide 48 h) |

### Panel admin (`app/ops-jci-htx/`)
| Route | Description |
|-------|-------------|
| `/ops-jci-htx/login` | Connexion administrateur |
| `/ops-jci-htx/dashboard` | KPIs, alertes (candidatures en attente), activités |
| `/ops-jci-htx/membres` | Liste membres avec filtres (statut, recherche) |
| `/ops-jci-htx/membres/[id]` | Profil : engagement, cotisations, présences, rôles |

### API (`app/api/`)
| Endpoint | Description |
|----------|-------------|
| `POST /api/join` | Candidature → emails Resend (admin + confirmation candidat) |
| `POST /api/contact` | Contact → email Resend (admin) |
| `POST /api/revalidate` | Webhook Sanity pour revalidation ISR |
| `POST /api/admin/members/invite` | Invitation membre → email + token unique |
| `POST /api/admin/members/[id]/dues` | Confirmation paiement cotisation |
| `POST /api/admin/activities/[id]/import` | Import présences depuis Google Sheets |
| `/api/auth/accept-invitation` | Activation compte via token |

---

## Proxy / Middleware (`proxy.ts`)
Protège les routes privées via Supabase Auth. **L'export doit s'appeler `proxy` (Next.js 16 — anciennement `middleware`).**
- `/ops-jci-htx/*` → accès réservé aux `admin_users` actifs ; injecte `x-admin-role` dans les headers
- `/espace-membre/*` → accès réservé aux membres actifs ; injecte `x-member-id` dans les headers
- Les assets `/_next/*`, `/api/*` et les fichiers statiques sont ignorés

---

## CMS Sanity — Schémas de contenu (`sanity/schemas/`)

### `siteSettings`
Paramètres globaux : titre hero, sous-titre, email de contact, adresse, réseaux sociaux (Facebook, Instagram, LinkedIn, Twitter).

### `initiative`
Projet communautaire.
- Champs principaux : title, slug, category, summary, description (blockContent riche), coverImage, gallery (max 15 images), startDate, endDate
- status : `ongoing` | `completed` | `planned`
- Données d'impact : results (texte), beneficiaries (nombre)
- Catégories : communaute · entrepreneuriat · formation · sante · environnement

### `teamMember`
Membre du bureau actuel.
- Champs : name, role, photo (hotspot), bio, order (tri)

### `pastPresident`
**Galerie historique des présidents.** Affiché sur `/about` trié par mandat décroissant.
- Champs : name, photo (hotspot), mandateStart (année), mandateEnd (année), bio, achievements (liste de réalisations), quote (citation)

### `blockContent`
Contenu rich text réutilisable (Portable Text Sanity).

**ISR :** Tout le contenu Sanity est revalidé automatiquement toutes les **3 600 secondes**.
**Revalidation manuelle :** via webhook Sanity → `POST /api/revalidate`

---

## Base de données Supabase (`lib/supabase/types.ts`)

### `members`
```
user_id, first_name, last_name, email, phone, profession, bio
status: pending | active | inactive | alumni
jci_level, community_role, join_date
```

### `admin_users`
```
user_id, name, email, is_active
role: president | secretaire | charge_formation | charge_communication
```

### `activities`
```
title, slug, description, type, activity_date, location
registration_link, google_sheet_id, capacity, status
```

### `attendances`
```
activity_id, member_id, attended (bool)
source: google_form | manual | site
imported_at
```

### `dues`
```
member_id, year, amount, paid_at, confirmed_by
```

### `member_roles`
```
member_id, role_title, commission, start_date, end_date, is_current
```

### `member_invitations`
```
token (unique), email, expires_at (48 h), used_at
```

### `project_members`
```
member_id, project_id
```

---

## Score d'engagement (`lib/supabase/engagement.ts`)
Score calculé sur **100 points**, 4 critères pondérés :

| Critère | Points |
|---------|--------|
| Présence aux activités | 40 |
| Formations complétées | 25 |
| Cotisation payée (année en cours) | 20 |
| Rôle actif (commission ou projet) | 15 |

**Niveaux :** Inactif (0–30) · Actif (31–60) · Très actif (61–85) · Champion (86–100)

---

## Formulaire d'adhésion (`/join`) — Champs complets

| Champ | Requis | Validation |
|-------|--------|-----------|
| Prénom | Oui | min 2 chars |
| Nom | Oui | min 2 chars |
| Date de naissance | Oui | âge 18–40 ans (validé côté client et serveur) |
| Commune de résidence | Oui | min 2 chars |
| Adresse email | Oui | format email valide |
| Téléphone | Non | libre |
| Profession / Secteur | Non | libre |
| Niveau d'études | Non | enum : secondaire / bac / licence / master / doctorat / autre |
| Domaines d'intérêt | Oui | checkboxes, min 1 sélectionné |
| Comment avez-vous connu JCI ? | Oui | enum : réseaux sociaux / bouche à oreille / membre JCI / événement / site web / autre |
| Motivation | Oui | 20–1 000 chars |

**Protections :** honeypot invisible + rate limiting Upstash Redis.
**Emails :** notification admin (avec tous les champs) + email de confirmation au candidat (Resend).

---

## Variables d'environnement (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=JCI Tabarre <noreply@jci-tabarre.ht>
EMAIL_TO=admin@jci-tabarre.ht

# Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Google Sheets (import présences activités)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

---

## Commandes

```bash
npm run dev      # Développement — http://localhost:3000
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # ESLint
```

---

## Composants UI (`components/`)

### `components/ui/`
| Composant | Usage |
|-----------|-------|
| `Button` | Bouton primaire/secondaire/ghost/danger |
| `Card` | Carte avec ombre et bordure |
| `Badge` | Label coloré (statut, catégorie) |
| `SectionHeader` | Titre + sous-titre de section, variante light (fond sombre) |
| `Spinner` | Indicateur de chargement |
| `SanityImage` | Wrapper Next.js Image pour assets Sanity (avec hotspot) |

### `components/sections/`
| Composant | Page |
|-----------|------|
| `HeroSection` | Accueil |
| `StatsSection` | Accueil |
| `MissionSection` | Accueil + À propos |
| `CallToAction` | Accueil + À propos |
| `InitiativeCard` | Liste des initiatives |
| `JoinForm` | `/join` |
| `ContactForm` | `/contact` |

### `components/layout/`
`Header`, `Footer`, `MobileDrawer`

### `components/admin/`
`Sidebar` (panel admin)

---

## Charte graphique
- **Couleur principale :** Navy `#1e3a8a`
- **Couleur accent :** Cyan `#06b6d4`
- **Succès / Erreur / Avertissement :** vert / rouge / ambre
- **Polices :** Montserrat (titres `font-heading`), Inter (corps)
- **Coins arrondis :** `rounded-lg` (éléments), `rounded-2xl` (cartes)

---

## Flux utilisateur clés

```
Candidat → /join → JoinForm → POST /api/join → email admin + email confirmation
Admin → approuve → POST /api/admin/members/invite → email invitation avec token
Nouveau membre → /espace-membre/invitation/[token] → ActivationForm → dashboard
Membre connecté → /espace-membre/tableau-de-bord → score engagement, activités, cotisations
Admin → /ops-jci-htx/dashboard → KPIs, membres en attente, import présences
```
