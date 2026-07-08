# JCI Tabarre Excelsior

Site institutionnel et plateforme de gestion membrale pour **JCI Tabarre Excelsior**, une locale de la Junior Chamber International (JCI) implantée à Tabarre, Haïti.

La JCI regroupe des jeunes adultes de **18 à 40 ans** engagés dans le développement du leadership et de l'impact communautaire, autour de 5 axes : **Communauté · Entrepreneuriat · Formation/Leadership · Santé · Environnement**.

## Le site remplit trois fonctions

1. **Vitrine publique** — présentation de l'organisation, des initiatives, formulaire d'adhésion, contact
2. **Portail membres** — tableau de bord personnel, score d'engagement, suivi des cotisations et activités
3. **Panel d'administration** — gestion des membres, invitations, activités, import de présences depuis Google Sheets

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Langage | TypeScript 5 |
| Styles | Tailwind CSS 4 |
| CMS | Sanity 6 |
| Base de données / Auth | Supabase (PostgreSQL + Auth) |
| Emails | Resend |
| Rate limiting | Upstash Redis |
| Formulaires | React Hook Form 7 + Zod 4 |
| i18n | next-intl |
| Import présences | googleapis (Google Sheets) |
| Analytics | Vercel Analytics |
| Hébergement | Vercel |

## Routes principales

- **Public** : `/`, `/about` (histoire + galerie des présidents passés), `/initiatives`, `/initiatives/[slug]`, `/join` (formulaire d'adhésion, 11 champs), `/contact`
- **Portail membres** (`/espace-membre/`) : `connexion`, `tableau-de-bord`, `invitation/[token]` (activation, token valide 48h)
- **Panel admin** (`/ops-jci-htx/`) : `login`, `dashboard`, `membres`, `membres/[id]`

## Score d'engagement

Calculé sur 100 points : présence aux activités (40), formations complétées (25), cotisation payée (20), rôle actif (15). Niveaux : Inactif (0–30) · Actif (31–60) · Très actif (61–85) · Champion (86–100).

## CMS Sanity

Schémas : `siteSettings`, `initiative` (projets communautaires avec galerie et données d'impact), `teamMember`, `pastPresident`, `blockContent`. ISR à 3600s, revalidation manuelle via webhook `POST /api/revalidate`.

## Base de données (Supabase)

Tables principales : `members`, `admin_users`, `activities`, `attendances`, `dues`, `member_roles`, `member_invitations`, `project_members`.

## Charte graphique

Navy `#1e3a8a` (principale), Cyan `#06b6d4` (accent). Polices : Montserrat (titres), Inter (corps).

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner les variables ci-dessous
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

RESEND_API_KEY=
EMAIL_FROM=
EMAIL_TO=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

## Notes importantes

- `proxy.ts` (Next.js 16) remplace `middleware.ts` — protège `/ops-jci-htx/*` (admins actifs) et `/espace-membre/*` (membres actifs)
- Le formulaire `/join` est protégé par honeypot invisible + rate limiting Upstash

## Documentation

Voir [CLAUDE.md](./CLAUDE.md) pour la référence complète (schémas de données détaillés, composants UI, flux utilisateurs).
