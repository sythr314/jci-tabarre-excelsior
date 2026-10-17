# JCI Tabarre Excelsior 🇭🇹

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-3ecf8e?logo=supabase)](https://supabase.com/)
[![Sanity CMS](https://img.shields.io/badge/Sanity-v6-f03e2f?logo=sanity)](https://www.sanity.io/)
[![Security Hardened](https://img.shields.io/badge/Security-Audited%20%26%20Hardened-green?logo=shield)](https://github.com/sythr314/jci-tabarre-excelsior)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

Plateforme web institutionnelle et système de gestion membrale pour **JCI Tabarre Excelsior**, organisation locale membre de la Junior Chamber International (JCI) basée à Tabarre, Haïti.

La JCI réunit des jeunes leaders et entrepreneurs de **18 à 40 ans** dédiés à créer des changements positifs durables à travers 5 axes d'impact :
**Communauté · Entrepreneuriat · Formation & Leadership · Santé · Environnement**.

---

## 📑 Sommaire

- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Stack Technique](#-stack-technique)
- [Architecture & Routes](#-architecture--routes)
- [Sécurité & Durcissement (Security Hardening)](#-sécurité--durcissement)
- [Score d'Engagement Membre](#-score-dengagement-membre)
- [Installation & Lancement Local](#-installation--lancement-local)
- [Variables d'Environnement](#-variables-denvironnement)
- [Déploiement sur Vercel](#-déploiement-sur-vercel)
- [Base de données (Supabase)](#-base-de-données-supabase)
- [Structure du Projet](#-structure-du-projet)

---

## 🌟 Fonctionnalités principales

### 1. Vitrine Institutionnelle Publique
- Présentation de la mission, de la vision et des valeurs de l'organisation.
- Galerie des initiatives et projets communautaires avec données d'impact et métriques.
- Histoire de l'organisation et galerie des **Présidents Passés** (Past Presidents).
- Formulaire d'adhésion interactif (`/join`) avec validation stricte (critères d'âge 18–40 ans, honeypot anti-spam, rate limiting).
- Formulaire de contact direct (`/contact`).

### 2. Espace Membre (`/espace-membre/`)
- Authentification sécurisée par session et cookies HttpOnly.
- Tableau de bord individuel avec **Score d'engagement** personnalisé sur 100 points.
- Suivi en temps réel de l'état des cotisations annuelles.
- Calendrier et historique des participations aux activités et formations.
- Flux d'invitation et d'activation de compte sécurisé par token cryptographique à usage unique (validité 48 h).

### 3. Panel d'Administration Ops (`/ops-jci-htx/`)
- Tableau de bord décisionnel avec KPIs (candidatures en attente, adhésions, cotisations).
- Revue et validation des candidatures (Approbation avec envoi automatique d'email d'activation, ou Rejet motivé).
- Gestion complète de l'annuaire des membres avec filtres avancés (statut, recherche, rôle).
- Gestion des activités et import automatisé des feuilles d'émargement via l'API Google Sheets.
- Confirmation et suivi des paiements de cotisations.

### 4. CMS Sanity Embarqué (`/studio`)
- Studio de gestion de contenu directement accessible dans Next.js.
- Gestion fluide des articles, initiatives, galeries d'images et données institutionnelles.
- Revalidation à la demande (ISR) via webhook sécurisé.

---

## 🛠 Stack Technique

| Domaine | Technologie | Description |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) | App Router, React Server Components, Server Actions |
| **Langage** | [TypeScript 5](https://www.typescriptlang.org/) | Typage statique strict de bout en bout |
| **Styles** | [Tailwind CSS 4](https://tailwindcss.com/) | Design system moderne, responsive et fluide |
| **Base de données** | [Supabase](https://supabase.com/) | PostgreSQL managé, Row Level Security (RLS) |
| **Authentification** | Supabase Auth + `@supabase/ssr` | Sessions sécurisées par cookies HttpOnly |
| **CMS Headless** | [Sanity v6](https://www.sanity.io/) | Modélisation et gestion de contenu temps réel |
| **Envoi d'Emails** | [Resend](https://resend.com/) | Notifications transactionnelles et invitations |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) | Protection anti-brute force et anti-abus par IP |
| **Formulaires** | React Hook Form + [Zod 4](https://zod.dev/) | Validation déclarative stricte côté client et serveur |
| **Intégrations** | Google APIs (`googleapis`) | Synchronisation des présences depuis Google Sheets |
| **Hébergement** | [Vercel](https://vercel.com/) | Edge Network, CI/CD automatique et monitoring |

---

## 🛡 Sécurité & Durcissement

Le projet a fait l'objet d'un **audit de cybersécurité approfondi** et intègre les meilleures pratiques de défense en profondeur :

- **Headers HTTP Sécurisés** : Configuration stricte de Content Security Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), et Referrer-Policy.
- **Protection contre le Header Spoofing** : Résolution sécurisée des adresses IP des clients (`x-forwarded-for`) pour empêcher le contournement du rate limiting.
- **Prévention des Injections PostgREST** : Nettoyage et assainissement systématique des filtres de recherche dans Supabase.
- **Échappement HTML dans les Emails** : Tous les champs utilisateur injectés dans les modèles d'emails HTML (invitations, candidatures, contact) sont neutralisés pour bloquer toute injection XSS de courriel.
- **Timing-Safe Comparison** : Utilisation de comparaisons cryptographiques à temps constant (`timingSafeCompare`) pour la validation des secrets de webhooks, neutralisant les attaques par canal auxiliaire (Timing Attacks).
- **Vérification Active d'Autorisation** : Contrôle systématique en base de données du statut actif des comptes administrateurs (`is_active: true`) sur chaque route d'API sensible et dans le middleware.
- **Résilience et Mode Démo** : Fallback sécurisé en l'absence de variables d'environnement externes pour permettre les présentations vitrines sans crash applicatif.

---

## 🎯 Score d'Engagement Membre

Le score d'engagement est calculé dynamiquement sur **100 points** :

| Critère | Pondération | Description |
|---|:---:|---|
| **Présence aux activités** | **40 pts** | Participation régulière aux assemblées et projets |
| **Formations complétées** | **25 pts** | Participation aux sessions de formation et ateliers |
| **Cotisation annuelle** | **20 pts** | Cotisation de l'exercice en cours à jour |
| **Rôle actif / Comité** | **15 pts** | Implication au sein du conseil d'administration ou d'un comité |

### Paliers d'implication :
- ⚪ **Inactif** : 0 à 30 points
- 🟡 **Actif** : 31 à 60 points
- 🟢 **Très actif** : 61 à 85 points
- 🔵 **Champion** : 86 à 100 points

---

## 🚀 Installation & Lancement Local

### Prérequis
- [Node.js](https://nodejs.org/) (version 20 LTS ou supérieure recommandée)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

### Étapes

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/sythr314/jci-tabarre-excelsior.git
   cd jci-tabarre-excelsior
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement :**
   ```bash
   cp .env.example .env.local
   ```
   *(Renseignez vos clés dans `.env.local` — voir tableau ci-dessous).*

4. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   Accédez à l'application sur [http://localhost:3000](http://localhost:3000).

5. **Compiler pour la production :**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔑 Variables d'Environnement

Consultez le fichier [`.env.example`](./.env.example) pour la configuration complète.

| Variable | Obligatoire | Description |
|---|:---:|---|
| `NEXT_PUBLIC_SITE_URL` | Oui | URL de base (ex: `http://localhost:3000` ou votre domaine de prod) |
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé publique anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui (backend) | Clé privée d'administration Supabase (ne jamais exposer côté client) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Oui | ID de projet Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | Oui | Dataset Sanity (défaut: `production`) |
| `SANITY_WEBHOOK_SECRET` | Recommandé | Secret pour la revalidation ISR |
| `RESEND_API_KEY` | Production | Clé API pour l'envoi d'e-mails de notification |
| `EMAIL_FROM` | Production | Adresse d'expédition des courriels |
| `EMAIL_TO` | Production | Adresse de réception des formulaires de contact |
| `UPSTASH_REDIS_REST_URL` | Production | URL de l'instance Upstash Redis (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Production | Token de l'instance Upstash Redis |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Optionnel | Compte de service Google pour l'import Sheets |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Optionnel | Clé privée du compte de service Google |

---

## ☁️ Déploiement sur Vercel

1. Importez le projet depuis votre compte GitHub sur **[Vercel](https://vercel.com)**.
2. Next.js sera automatiquement détecté avec les commandes de build par défaut :
   - **Build Command** : `next build`
   - **Output Directory** : `.next`
   - **Install Command** : `npm install`
3. Dans **Settings > Environment Variables**, ajoutez les variables listées ci-dessus.
4. Cliquez sur **Deploy** pour générer votre URL de production.

---

## 🗄 Base de données (Supabase)

Le schéma relationnel et les politiques de sécurité (RLS) se trouvent dans le répertoire [`supabase/migrations/`](./supabase/migrations/) :

- `members` : Profils des membres, statut, coordonnées, date d'adhésion.
- `admin_users` : Comptes administrateurs autorisés avec statut `is_active`.
- `activities` : Événements, assemblées générales, projets et formations.
- `attendances` : Présences enregistrées des membres aux activités.
- `dues` : Suivi des paiements des cotisations annuelles.
- `member_invitations` : Tokens d'invitation avec date d'expiration pour activation.
- `member_roles` : Rôles officiels et comités assignés aux membres.

---

## 📁 Structure du Projet

```text
jci-tabarre-excelsior/
├── app/
│   ├── (public)/                 # Pages publiques (Accueil, About, Initiatives, Contact, Join)
│   ├── espace-membre/            # Portail réservé aux membres (Dashboard, Login, Invitation)
│   ├── ops-jci-htx/              # Console d'administration sécurisée (Gestion membres, Activités)
│   ├── api/                      # Routes d'API serveur (Auth, Admin, Contact, Join, Revalidate)
│   ├── studio/                   # Sanity Studio intégré
│   ├── layout.tsx                # Layout racine et typographies
│   └── globals.css               # Styles globaux Tailwind CSS
├── components/
│   ├── admin/                    # Composants dédiés au panel d'administration (Sidebar, Modales)
│   ├── layout/                   # Header, Footer, Navigation responsive
│   ├── sections/                 # Sections réutilisables (Hero, Mission, Stats, CTA, Formulaires)
│   └── ui/                       # Composants graphiques atomiques
├── lib/
│   ├── google/                   # Client Google Sheets pour import de présences
│   ├── sanity/                   # Client Sanity et requêtes GROQ
│   ├── supabase/                 # Clients Supabase (Client, Serveur, Auth, Engagement Score)
│   └── utils/                    # Utilitaires de sécurité, rate limiting, validation Zod
├── public/                       # Assets statiques (Logos, images, favicons)
├── supabase/                     # Migrations SQL et schémas de base de données
├── middleware.ts                 # Middleware Next.js de routage et de protection
├── next.config.ts                # Configuration Next.js et headers de sécurité HTTP
└── package.json                  # Dépendances et scripts du projet
```

---

## 🤝 Contribution & Charte

Ce projet respecte la charte graphique officielle de la **Junior Chamber International** :
- **Couleur Primaire** : Navy Blue (`#1e3a8a`)
- **Couleur d'Accent** : Cyan (`#06b6d4`)
- **Typographies** : Montserrat (Titres & Identité) · Inter (Corps de texte)

---

## 📄 Licence

Ce projet est la propriété de la **JCI Tabarre Excelsior**. Tous droits réservés.
