# IMPLEMENTATION.md — Plan de développement complet
# JCI Tabarre Excelsior — Plateforme intégrée

> Cases à cocher au fil du développement. Consulter CLAUDE.md avant chaque session.
> Erreurs et corrections → CORRECT.md

---

## Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SITE PUBLIC                              │
│  Accueil · Actualités · Activités · Formations             │
│  Initiatives · À propos · Contact · Nous rejoindre         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 PORTAIL MEMBRE  /espace-membre              │
│  Profil · Présences · Formations · Score d'engagement       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│           PANEL ADMIN  /ops-jci-htx  (URL cachée)          │
│  Dashboard · Membres · Activités · Formations · Contenu     │
│  Rapports · Audit log                                       │
└─────────────────────────────────────────────────────────────┘

Stack :
  Contenu public   → Sanity CMS (étendu)
  Données opérat.  → Supabase (PostgreSQL + Auth + Storage)
  Import Form      → Google Sheets API (service account)
  Emails           → Resend
  Hébergement      → Vercel
  Rate limiting    → Upstash Redis
```

---

## Rôles et permissions

| Rôle                  | Dashboard | Membres | Cotisations | Activités | Formations | Contenu | Rapports |
|-----------------------|-----------|---------|-------------|-----------|------------|---------|----------|
| `president`           | ✅ tout   | ✅ tout | ✅          | ✅        | ✅         | ✅      | ✅ export|
| `secretaire`          | ✅ partiel| ✅ tout | ✅          | 👁 lecture| 👁 lecture | ❌      | ✅       |
| `charge_formation`    | ✅ partiel| 👁       | ❌          | ✅        | ✅         | ❌      | ✅ partiel|
| `charge_communication`| ✅ partiel| 👁       | ❌          | 👁        | 👁         | ✅      | ❌       |

---

## Score d'engagement membre

Calcul automatique sur 100 points :

| Critère                                    | Poids |
|--------------------------------------------|-------|
| Présence aux activités (nb présences / nb total) | 40 pts |
| Formations suivies (nb complétées)         | 25 pts |
| Cotisation à jour (année en cours)         | 20 pts |
| Rôle actif (commission ou projet en cours) | 15 pts |

Niveaux :
- 0–30  → **Inactif** (badge gris)
- 31–60 → **Actif** (badge bleu)
- 61–85 → **Très actif** (badge cyan)
- 86–100 → **Champion** (badge or)

Visible par : le membre (dans son espace) + les admins (dans le panel)

---

## Phase 0 — Setup initial ✅ TERMINÉ

- [x] Next.js 16 + TypeScript + Tailwind v4
- [x] Dépendances de base installées
- [x] Structure des dossiers créée
- [x] Tokens JCI dans globals.css
- [x] Root layout (Montserrat + Inter, lang="fr", skip-link)
- [x] .env.example

---

## Phase 1 — CMS Sanity — Contenu public ✅ PARTIELLEMENT TERMINÉ

### 1.1 Schémas existants ✅
- [x] `siteSettings` (singleton)
- [x] `initiative`
- [x] `teamMember`
- [x] `blockContent`

### 1.2 Nouveaux schémas Sanity à créer
- [ ] `news` — articles (title, slug, excerpt, body blockContent, coverImage, gallery[], category: article|communique, publishedAt, status: draft|published)
- [ ] `announcement` — annonces courtes (title, content texte court, link optionnel, expiresAt, priority: normal|urgent)
- [ ] `president` — galerie historique (name, photo, mandateStart, mandateEnd, bio courte, order)
- [ ] `commissionMember` — bureau actuel (name, role, commission: bureau|formation|communication|financement, photo, order, term: année)
- [ ] `formation` — formations (title, slug, description blockContent, coverImage, startDate, endDate, registrationLink URL, registrationDeadline, capacity, location, status: upcoming|ongoing|completed, googleSheetId optionnel)
- [ ] `event` — activités publiques (title, slug, description, coverImage, gallery[], date, location, registrationLink, registrationDeadline, capacity, category, status, googleSheetId optionnel)

### 1.3 Client Sanity ✅
- [x] client.ts avec `isSanityConfigured`
- [x] image.ts (urlFor)
- [x] queries/initiatives.ts, settings.ts, team.ts

### 1.4 Nouvelles queries Sanity
- [ ] `lib/sanity/queries/news.ts` — getAllNews, getNewsBySlug, getLatestNews(3), getAnnouncements
- [ ] `lib/sanity/queries/presidents.ts` — getPresidents (ordonné par mandat)
- [ ] `lib/sanity/queries/commission.ts` — getCommissionByTerm
- [ ] `lib/sanity/queries/formations.ts` — getFormations, getFormationBySlug
- [ ] `lib/sanity/queries/events.ts` — getEvents, getEventBySlug, getUpcomingEvents

### 1.5 Sanity Studio
- [ ] Créer le projet Sanity sur sanity.io
- [ ] Configurer `sanity.config.ts` à la racine
- [ ] Déployer le Studio (`npx sanity deploy`)
- [ ] Configurer CORS (localhost + domaine prod)
- [ ] Saisir les données initiales

---

## Phase 2 — Composants UI et Layout ✅ PARTIELLEMENT TERMINÉ

### 2.1 Composants existants ✅
- [x] Button, Card, Badge, SectionHeader, SanityImage, Spinner, cn
- [x] Header, Footer, MobileDrawer

### 2.2 Nouveaux composants UI
- [ ] `components/ui/Avatar.tsx` — photo circulaire avec fallback initiales
- [ ] `components/ui/StatusBadge.tsx` — badge statut (Actif/Inactif/En attente)
- [ ] `components/ui/EngagementScore.tsx` — barre de progression + niveau + badge couleur
- [ ] `components/ui/DataTable.tsx` — tableau avec tri, pagination, recherche (admin)
- [ ] `components/ui/Modal.tsx` — modale accessible (focus trap, Escape)
- [ ] `components/ui/Tabs.tsx` — onglets accessibles (aria-tabpanel)
- [ ] `components/ui/Alert.tsx` — messages d'alerte (success, error, warning, info)
- [ ] `components/ui/EmptyState.tsx` — état vide illustré
- [ ] `components/ui/Skeleton.tsx` — squelette de chargement

### 2.3 Nouveaux composants de sections
- [ ] `components/sections/NewsCard.tsx` — carte article
- [ ] `components/sections/EventCard.tsx` — carte activité/formation avec CTA inscription
- [ ] `components/sections/PresidentCard.tsx` — carte président historique
- [ ] `components/sections/AnnouncementBanner.tsx` — bandeau annonce urgente en haut de page
- [ ] `components/sections/TeamGrid.tsx` — grille commission par catégorie

### 2.4 Composants admin
- [ ] `components/admin/Sidebar.tsx` — navigation admin avec rôles
- [ ] `components/admin/AdminLayout.tsx` — layout admin (sidebar + header)
- [ ] `components/admin/StatCard.tsx` — carte KPI pour dashboard
- [ ] `components/admin/MemberRow.tsx` — ligne tableau membre
- [ ] `components/admin/ActivityRow.tsx` — ligne tableau activité
- [ ] `components/admin/ImportStatus.tsx` — état import Google Sheets

---

## Phase 3 — Pages publiques enrichies

### 3.1 Pages existantes à enrichir ✅ créées, à compléter
- [x] Accueil — ajouter section Actualités récentes + annonce urgente
- [x] À propos — ajouter galerie présidents + membres commission
- [x] Initiatives — conserver
- [x] Contact — OK
- [x] Nous rejoindre — OK

### 3.2 Nouvelles pages publiques
- [ ] `app/(public)/actualites/page.tsx` — liste articles + annonces courtes en sidebar
- [ ] `app/(public)/actualites/[slug]/page.tsx` — article détaillé + galerie photos
- [ ] `app/(public)/activites/page.tsx` — liste activités à venir + passées
- [ ] `app/(public)/activites/[slug]/page.tsx` — détail activité + bouton inscription
- [ ] `app/(public)/formations/page.tsx` — liste formations
- [ ] `app/(public)/formations/[slug]/page.tsx` — détail formation + bouton inscription
- [ ] `app/(public)/a-propos/presidents/page.tsx` — galerie présidents historiques

### 3.3 Mise à jour Header
- [ ] Ajouter liens "Actualités" et "Activités" dans la nav
- [ ] Ajouter bouton "Mon espace" (si membre connecté) → `/espace-membre`
- [ ] Menu déroulant "À propos" → (À propos | Présidents | Commission)

---

## Phase 4 — Supabase Setup

### 4.1 Projet Supabase
- [ ] Créer projet sur supabase.com
- [ ] Récupérer URL + clés (anon key + service role key)
- [ ] Renseigner dans `.env.local`
- [ ] Installer `npm install @supabase/supabase-js @supabase/ssr`

### 4.2 Schéma SQL (Supabase)

```sql
-- Membres
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  profession TEXT,
  bio TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','inactive','alumni')),
  jci_level TEXT DEFAULT 'member' CHECK (jci_level IN ('member','senator','alumnus')),
  community_role TEXT,       -- rôle déclaré dans la communauté
  join_date DATE,
  invited_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('president','secretaire','charge_formation','charge_communication')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cotisations
CREATE TABLE dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members NOT NULL,
  year INT NOT NULL,
  amount DECIMAL(10,2),
  paid_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES admin_users(id),
  notes TEXT,
  UNIQUE(member_id, year)
);

-- Rôles dans commissions et projets
CREATE TABLE member_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members NOT NULL,
  role_title TEXT NOT NULL,          -- "Président", "Secrétaire", "Responsable formation"
  commission TEXT,                    -- "Bureau exécutif", "Commission formation", etc.
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT TRUE
);

-- Activités (événements + formations)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('formation','activite','reunion','initiative','autre')),
  activity_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  registration_link TEXT,             -- lien Google Form public
  google_sheet_id TEXT,               -- ID du Google Sheet des réponses
  sheet_email_column TEXT DEFAULT 'Email',  -- nom de la colonne email dans le sheet
  registration_deadline TIMESTAMPTZ,
  capacity INT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  cover_image_url TEXT,
  sanity_ref TEXT,                    -- référence à l'entrée Sanity correspondante
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Présences
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities NOT NULL,
  member_id UUID REFERENCES members,  -- NULL si participant externe
  external_email TEXT,                -- si non-membre
  external_name TEXT,
  registered_at TIMESTAMPTZ,
  attended BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'google_form' CHECK (source IN ('google_form','manual','site')),
  imported_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(activity_id, member_id)
);

-- Projets
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('planned','active','completed')),
  impact_summary TEXT,
  beneficiaries_count INT,
  initiative_ref TEXT,               -- référence Sanity
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participation aux projets
CREATE TABLE project_members (
  project_id UUID REFERENCES projects NOT NULL,
  member_id UUID REFERENCES members NOT NULL,
  role TEXT,                         -- rôle dans ce projet
  contribution_notes TEXT,
  joined_at DATE,
  PRIMARY KEY (project_id, member_id)
);

-- Invitations membres
CREATE TABLE member_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,        -- token UUID à usage unique
  invited_by UUID REFERENCES admin_users(id),
  expires_at TIMESTAMPTZ NOT NULL,   -- 48h
  used_at TIMESTAMPTZ,
  member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,              -- 'member.create', 'dues.confirm', 'activity.import', etc.
  target_type TEXT,                  -- 'member', 'activity', 'dues'
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Row Level Security (RLS)
- [ ] Activer RLS sur toutes les tables
- [ ] Policy `members` : le membre ne voit que son propre profil
- [ ] Policy `attendances` : le membre voit ses propres présences
- [ ] Policy `dues` : le membre voit ses propres cotisations
- [ ] Policy `admin_users` : lecture uniquement pour les admins authentifiés
- [ ] Toutes les écritures passent par des fonctions Supabase (service role côté serveur)

### 4.4 Client Supabase Next.js
- [ ] `lib/supabase/client.ts` — client browser (anon key)
- [ ] `lib/supabase/server.ts` — client serveur (service role, cookies SSR)
- [ ] `lib/supabase/middleware.ts` — utilitaire rafraîchissement session

---

## Phase 5 — Authentification (Supabase Auth)

### 5.1 Middleware Next.js
- [ ] `middleware.ts` — protéger `/ops-jci-htx/*` et `/espace-membre/*`
  - Vérifier session Supabase dans les cookies
  - Redirect vers `/ops-jci-htx/login` ou `/espace-membre/connexion` si non authentifié
  - Vérifier le rôle pour `/ops-jci-htx/*` (admin uniquement)

### 5.2 Auth Admin
- [ ] `app/ops-jci-htx/login/page.tsx` — formulaire email + mot de passe, aucun lien public
- [ ] `app/api/auth/admin-login/route.ts` — Supabase signInWithPassword + vérifier table admin_users
- [ ] `app/api/auth/logout/route.ts` — signOut + clear cookies
- [ ] Rate limiting : 5 tentatives / 15 min par IP

### 5.3 Auth Membre
- [ ] `app/espace-membre/connexion/page.tsx` — email + mot de passe
- [ ] `app/espace-membre/invitation/[token]/page.tsx` — activation du compte via token
- [ ] `app/api/auth/member-login/route.ts`
- [ ] `app/api/auth/accept-invitation/route.ts` — valider token, créer user Supabase, activer membre
- [ ] Flux "mot de passe oublié" via Supabase (email magique)

### 5.4 Invitation membre (double flux)
**Flux A — Admin invite directement :**
- Admin saisit l'email → création `member_invitations` → email Resend avec lien token

**Flux B — Validation de la demande publique :**
- Formulaire "Nous rejoindre" → `members` (status: 'pending') → notif admin
- Admin valide → génère token → email invitation envoyé

- [ ] `app/api/members/invite/route.ts` — POST, admin seulement
- [ ] `app/api/members/approve/route.ts` — POST, admin seulement (depuis demande publique)

---

## Phase 6 — Panel Admin (/ops-jci-htx)

### 6.1 Layout admin
- [ ] `app/ops-jci-htx/layout.tsx` — vérification session + rôle, rendu AdminLayout
- [ ] `components/admin/AdminLayout.tsx` — sidebar + topbar + zone contenu
- [ ] `components/admin/Sidebar.tsx` — liens selon rôle (masquer les sections non autorisées)

### 6.2 Dashboard
- [ ] `app/ops-jci-htx/dashboard/page.tsx`
  - KPIs : membres actifs, cotisations à jour (%), taux de présence moyen, activités ce mois
  - Graphique présences des 6 derniers mois (simple bar chart)
  - Liste des 5 prochaines activités
  - Alertes : membres en attente, cotisations impayées

### 6.3 Gestion membres
- [ ] `app/ops-jci-htx/membres/page.tsx` — tableau paginé, filtres (statut, cotisation, score)
  - Recherche par nom/email
  - Filtre : Actif | Inactif | En attente | Alumni
  - Export CSV (président seulement)
  - Bouton "Inviter un membre"
- [ ] `app/ops-jci-htx/membres/[id]/page.tsx` — profil détaillé
  - Informations personnelles (éditable)
  - Score d'engagement (barre + niveau + détail par critère)
  - Historique présences (tableau activité par activité)
  - Formations suivies
  - Cotisations par année (marquer comme payée)
  - Rôles et commissions
  - Projets participés
  - Bouton "Envoyer invitation" / "Désactiver"
- [ ] `app/ops-jci-htx/membres/nouveau/page.tsx` — formulaire ajout manuel (secrétaire+)

### 6.4 Gestion activités
- [ ] `app/ops-jci-htx/activites/page.tsx` — liste avec statut + bouton "Importer présences"
- [ ] `app/ops-jci-htx/activites/nouveau/page.tsx` — créer activité (formulaire complet)
- [ ] `app/ops-jci-htx/activites/[id]/page.tsx` — détail + liste présences + bouton import
  - Si `google_sheet_id` renseigné → bouton "Importer depuis Google Sheets"
  - Tableau des inscrits (avec correspondance membre ou externe)
  - Marquer "présent" manuellement si besoin
  - Statistiques : inscrits / présents / membres / externes

### 6.5 Gestion formations
- [ ] `app/ops-jci-htx/formations/page.tsx` — liste formations
- [ ] `app/ops-jci-htx/formations/nouveau/page.tsx` — créer formation
- [ ] `app/ops-jci-htx/formations/[id]/page.tsx` — participants + présences

### 6.6 Gestion contenu (wraper Sanity)
- [ ] `app/ops-jci-htx/contenu/page.tsx` — liens vers Sanity Studio + aperçu du contenu publié
  - Actualités publiées vs brouillons
  - Annonces actives
  - Commission actuelle
  - Lien direct vers Sanity Studio pour éditer

### 6.7 Rapports
- [ ] `app/ops-jci-htx/rapports/page.tsx`
  - Rapport d'engagement : classement membres par score
  - Rapport présences par activité
  - Rapport cotisations par année
  - Rapport activité par type
  - Export PDF/CSV (président + secrétaire)

### 6.8 Audit log
- [ ] Chaque action admin écrit dans `audit_logs`
- [ ] `app/ops-jci-htx/audit/page.tsx` — visible par président uniquement

---

## Phase 7 — Portail Membre (/espace-membre)

### 7.1 Pages portail
- [ ] `app/espace-membre/page.tsx` → redirect vers `/espace-membre/tableau-de-bord`
- [ ] `app/espace-membre/tableau-de-bord/page.tsx`
  - Bonjour [Prénom] !
  - Score d'engagement (barre + niveau + conseil d'amélioration)
  - Prochaines activités inscrites
  - Cotisation à jour ou non (alerte si impayée)
  - Dernière activité assistée
- [ ] `app/espace-membre/profil/page.tsx` — voir + modifier son profil (bio, photo, téléphone, profession)
- [ ] `app/espace-membre/activites/page.tsx` — historique de toutes les présences
- [ ] `app/espace-membre/formations/page.tsx` — formations suivies + à venir

### 7.2 API Membre
- [ ] `app/api/membre/profil/route.ts` — GET (profil) + PATCH (mise à jour)
- [ ] `app/api/membre/avatar/route.ts` — POST upload photo (Supabase Storage)
- [ ] `app/api/membre/score/route.ts` — GET calcul score en temps réel

---

## Phase 8 — Google Sheets API

### 8.1 Setup
- [ ] Créer un Service Account Google (Google Cloud Console)
- [ ] Activer Google Sheets API
- [ ] Télécharger credentials JSON
- [ ] Stocker les clés dans env vars (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`)
- [ ] `npm install googleapis`
- [ ] `lib/google/sheets.ts` — client Google Sheets

### 8.2 Import des réponses
- [ ] `lib/google/importAttendances.ts`
  - Lire le Google Sheet par ID
  - Identifier la colonne email (configurable)
  - Matcher avec les membres (par email)
  - Insérer dans `attendances` (upsert, évite les doublons)
  - Retourner un rapport : N inscrits, N membres matchés, N externes
- [ ] `app/api/admin/activities/[id]/import/route.ts` — POST, déclenche l'import + écrit audit log
- [ ] Gérer les erreurs : sheet inaccessible, colonne email introuvable, quota API

---

## Phase 9 — Emails Resend

### 9.1 Templates existants ✅
- [x] Contact admin
- [x] Candidature admin + confirmation membre

### 9.2 Nouveaux templates
- [ ] `emails/invitation-member.tsx` — invitation à créer son compte (avec lien token 48h)
- [ ] `emails/invitation-approved.tsx` — "votre demande a été acceptée"
- [ ] `emails/dues-reminder.tsx` — rappel cotisation impayée (envoyé par l'admin)
- [ ] `emails/activity-reminder.tsx` — rappel activité à venir (J-2)
- [ ] `emails/welcome-member.tsx` — bienvenue après activation du compte

---

## Phase 10 — SEO, Performance, Accessibilité

- [ ] Sitemap dynamique incluant actualités, activités, formations, initiatives
- [ ] Metadata complète sur toutes les nouvelles pages
- [ ] OG image dynamique pour articles et activités
- [ ] `robots.txt` — bloquer `/ops-jci-htx/*` et `/espace-membre/*`
- [ ] Performance : vérifier LCP < 2.5s sur mobile
- [ ] Audit Lighthouse ≥ 90 sur toutes les pages publiques
- [ ] Test accessibilité NVDA/clavier sur Header + formulaires

---

## Phase 11 — Déploiement complet

- [ ] Variables d'environnement Vercel (toutes les clés prod)
- [ ] Domaine configuré + HTTPS
- [ ] Webhook Sanity → `/api/revalidate`
- [ ] CORS Sanity : domaine prod + Studio
- [ ] Test end-to-end : invitation → activation → connexion membre
- [ ] Test import Google Sheets en production
- [ ] Test envoi emails (tous les templates)

---

## Phase 12 — Recette finale

- [ ] Audit sécurité : 0 route admin accessible sans token
- [ ] Test RLS Supabase : un membre ne peut pas voir les données d'un autre
- [ ] Vérifier audit log : chaque action admin tracée
- [ ] Test rate limiting auth (5 tentatives → blocage)
- [ ] Test tokens invitation expirés (> 48h → refus)
- [ ] Test score engagement : calcul cohérent
- [ ] 0 `<img>` brute, 0 `console.log`
- [ ] Test responsive admin (tablette minimum)

---

## Suivi des phases

| Phase | Statut | Priorité |
|---|---|---|
| 0 — Setup initial | ✅ Terminé | — |
| 1 — Sanity (base) | 🟡 Partiel | P1 |
| 2 — Composants UI | 🟡 Partiel | P1 |
| 3 — Pages publiques enrichies | 🟡 Partiel | P2 |
| 4 — Supabase setup | ⬜ À faire | P1 |
| 5 — Authentification | ⬜ À faire | P1 |
| 6 — Panel admin | ⬜ À faire | P1 |
| 7 — Portail membre | ⬜ À faire | P2 |
| 8 — Google Sheets API | ⬜ À faire | P2 |
| 9 — Emails | 🟡 Partiel | P2 |
| 10 — SEO / Perf | ⬜ À faire | P3 |
| 11 — Déploiement | ⬜ À faire | P3 |
| 12 — Recette | ⬜ À faire | P3 |

**Ordre recommandé :** 4 → 5 → 6 → 1 (nouveaux schémas) → 3 → 7 → 8 → 9 → 10 → 11 → 12

---

*Plan mis à jour : 2026-06-16 | Répondant aux décisions : rôles différents, portail membre complet, import Google Sheets auto, score visible membre+admin, invitation double flux*
