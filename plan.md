# Plan de Transformation & Feuille de Route — Portail JCI National (JCI Haïti)

Ce document définit le plan architectural, fonctionnel et technique pour faire évoluer la plateforme actuelle (**JCI Tabarre Excelsior — OLM**) vers le portail national officiel de **JCI Haïti (ONM — Organisation Nationale Membre)** gérant l'ensemble des Organisations Locales Membres (OLM) du pays.

---

## 1. Vision & Objectifs du Portail National

La plateforme **JCI National** doit remplir **4 missions centrales** :
1. **Vitrine Nationale & Rayonnement Public** : Présenter la JCI Haïti, ses Régions, l'annuaire et la carte interactive de toutes les Organisations Locales Membres (OLM), les initiatives nationales (*JCI RISE*, ODD) et les grands programmes (*TOYP*, *CYEA*, *Conventions*).
2. **Gouvernance Multi-Niveaux (CDN ↔ CDL)** : Permettre au **Comité Directeur National (CDN)** de piloter toutes les OLM du pays tout en offrant à chaque **Comité Directeur Local (CDL)** son propre espace d'administration isolé et sécurisé.
3. **Pilotage de la Performance (« Programme 100 % Efficacité »)** : Automatiser le calcul des points d'efficacité de chaque OLM (croissance des effectifs, ponctualité des rapports, projets réalisés, formations, capitation nationale).
4. **Académie JCI & Parcours Membre Unifié** : Offrir à chaque jeune citoyen actif (18–40 ans), Alumnus et Sénateur JCI un passeport numérique unique (formations certifiées avec QR Code, historique de rôles locaux et nationaux, cotisations, tâches).

---

## 2. Phase 1 — Fondation Multi-Organisations Locales (Multi-OLM)

### 2.1. Évolution du Schéma de Base de Données (`005_national_multi_olm.sql`)

Ajout de la table `local_organizations` et rattachement de toutes les entités existantes à une OLM :

```sql
-- Régions administratives JCI Haïti
CREATE TYPE jci_region AS ENUM (
  'ouest_metropolitaine',
  'grand_nord',
  'grand_sud',
  'centre_artibonite',
  'diaspora'
);

-- Table des Organisations Locales Membres (OLM)
CREATE TABLE local_organizations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,          -- ex: "JCI Tabarre Excelsior"
  slug              TEXT NOT NULL UNIQUE,          -- ex: "tabarre-excelsior"
  region            jci_region NOT NULL,
  city              TEXT NOT NULL,                 -- ex: "Tabarre"
  founded_year      INT,
  status            TEXT NOT NULL DEFAULT 'affiliated'
                      CHECK (status IN ('provisional', 'affiliated', 'suspended')),
  president_name    TEXT,
  contact_email     TEXT,
  contact_phone     TEXT,
  logo_url          TEXT,
  social_links      JSONB DEFAULT '{}'::jsonb,
  efficiency_score  INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rattachement des tables existantes à l'OLM (NULL = niveau National / ONM)
ALTER TABLE members             ADD COLUMN local_org_id UUID REFERENCES local_organizations(id) ON DELETE SET NULL;
ALTER TABLE member_applications ADD COLUMN local_org_id UUID REFERENCES local_organizations(id) ON DELETE SET NULL;
ALTER TABLE activities          ADD COLUMN local_org_id UUID REFERENCES local_organizations(id) ON DELETE SET NULL;
ALTER TABLE activities          ADD COLUMN scope TEXT NOT NULL DEFAULT 'local' CHECK (scope IN ('local', 'regional', 'national', 'international'));
ALTER TABLE tasks               ADD COLUMN local_org_id UUID REFERENCES local_organizations(id) ON DELETE SET NULL;
ALTER TABLE admin_users         ADD COLUMN local_org_id UUID REFERENCES local_organizations(id) ON DELETE SET NULL;
ALTER TABLE admin_users         ADD COLUMN level TEXT NOT NULL DEFAULT 'local' CHECK (level IN ('national', 'regional', 'local'));
```

### 2.2. Hiérarchie des Rôles & Permissions (RBAC National vs Local)

| Niveau | Rôle (`role`) | Périmètre d'accès (`scope`) | Attributions principales |
| :--- | :--- | :--- | :--- |
| **National (CDN)** | `president_national` | Toutes les OLM + ONM | Supervision globale, validation des affiliations OLM, décrets, audit complet |
| **National (CDN)** | `secretaire_national` | Toutes les OLM + ONM | Gestion administrative nationale, validation du programme 100 % Efficacité, archives |
| **National (CDN)** | `tresorier_national` | Toutes les OLM + ONM | Suivi des capitations OLM → ONM, budget national, quitus financier des OLM |
| **Régional (CDN)** | `vpen` (VP Exécutif National) | OLM de sa Région | Supervision des OLM d'une région (ex. Grand Nord, Grand Sud, Ouest) |
| **National (CDN)** | `vpn` (VP National) | OLM assignées | Accompagnement et validation des rapports des OLM sous sa tutelle |
| **Local (CDL)** | `president` | Son OLM uniquement | Pilotage du CDL, validation candidatures/membres/tâches de son OLM |
| **Local (CDL)** | `secretaire` | Son OLM uniquement | Gestion des membres, candidatures, présences et procès-verbaux de son OLM |
| **Local (CDL)** | `tresorier` | Son OLM uniquement | Cotisations individuelles des membres de son OLM |
| **Local (CDL)** | `charge_formation` | Son OLM uniquement | Formations locales, suivi de l'académie pour les membres de son OLM |
| **Local (CDL)** | `charge_communication` | Son OLM uniquement | Publication des activités et initiatives de son OLM |

### 2.3. Routage Intelligent des Candidatures (`/join`)
- Ajout du champ **« Organisation Locale souhaitée »** dans le formulaire `/join` (avec sélection automatique suggérée selon la commune de résidence).
- Notification simultanée au **Secrétaire Local de l'OLM choisie** et visibilité dans le tableau de bord du CDL concerné (ainsi que dans la vue consolidée du CDN).

---

## 3. Phase 2 — Programmes Nationaux & Efficacité des OLM

### 3.1. Module « Programme 100 % Efficacité » (Scoring des OLM)
Création de la table `olm_efficiency_submissions` permettant à chaque Président/Secrétaire Local de soumettre les preuves exigées par le Bureau National :
1. **Administration & Gouvernance (25 pts)** : Soumission du plan d'action annuel, budget prévisionnel, tenue des AG statutaires, paiement de la capitation nationale.
2. **Croissance & Rétention des Effectifs (25 pts)** : Nouveaux membres assermentés vs objectif annuel.
3. **Impact Communautaire & JCI RISE (30 pts)** : Projets alignés sur les 4 domaines d'opportunités et les ODD avec mesure d'impact vérifiée.
4. **Participation Nationale & Internationale (20 pts)** : Taille de la délégation aux Conseils Nationaux, Convention Nationale, Conférence de Zone des Amériques et Congrès Mondial.

- **Tableau de bord CDN** : Validation en un clic des soumissions OLM avec calcul automatique du **Classement National des OLM** (badges *Platine, Or, Argent, 100 % Efficace*).

### 3.2. Portail des Grands Programmes Nationaux
- **Programme JCI TOYP (*Ten Outstanding Young Persons*)** :
  - Page dédiée `/programmes/toyp` avec dépôt de dossier de candidature dans les 10 catégories officielles.
  - Interface d'évaluation par le jury et module de vote du public sécurisé.
- **Programme JCI CYEA (*Creative Young Entrepreneur Award*)** :
  - Dépôt des pitch decks et plans d'affaires des jeunes entrepreneurs haïtiens.
- **Convention Nationale & Conseils Nationaux (`/evenements-nationaux`)** :
  - Inscription des membres par délégation OLM.
  - Génération de billet individuel avec **QR Code** pour l'émargement rapide sur place (alimentant automatiquement la table `attendances`).

---

## 4. Phase 3 — Institut de Formation JCI, Sénat & Finances

### 4.1. Institut de Formation & Certificats Vérifiables
- **Catalogue des formations officielles JCI** (*JCI Impact, JCI Effective Communication, JCI Presenter, JCI Trainer, JCI Admin*).
- **Annuaire National des Formateurs (`/formateurs`)** : Liste des formateurs certifiés (CLT, CNT, NGT, IG) avec formulaire de sollicitation par les OLM.
- **Certificats PDF avec QR Code** :
  - À la validation d'une présence en formation, génération d'un certificat officiel numéroté (`JCI-HT-2026-XXXX`).
  - Page publique `/verifier/[code]` permettant de vérifier l'authenticité d'un certificat.

### 4.2. Gestion Financière à 2 Niveaux (Cotisations & Capitation)
- **Niveau 1 (Membre → OLM)** : Suivi des cotisations individuelles avec téléversement de preuve de paiement (*MonCash, Natcash, Virement*).
- **Niveau 2 (OLM → JCI National)** : Calcul automatique de la **Capitation Nationale** due par chaque OLM en fonction de son effectif actif et délivrance du **Quitus Financier National** (requis pour le droit de vote en Assemblée Générale Nationale).

### 4.3. Espace Sénat JCI & Alumni
- Profil enrichi avec `senator_number` (ex. `Sénateur JCI #XXXXX`).
- Annuaire national du Sénat JCI Haïti et programme de parrainage / mentorat pour les nouveaux membres et entrepreneurs.

---

## 5. Ordre d'Exécution Recommandé (Sprints)

| Sprint | Objectif | Livrables clés |
| :--- | :--- | :--- |
| **Sprint 1** | **Socle Multi-OLM & Gouvernance CDN/CDL** | Migration `005_national_multi_olm.sql`, sélecteur d'OLM dans `/join` et dans l'Admin, pages publiques `/organisations` et `/organisations/[slug]` |
| **Sprint 2** | **Programme 100 % Efficacité & Reporting OLM** | Espace de soumission des rapports OLM, validation par les VPN/SG National, classement national des OLM |
| **Sprint 3** | **Événements Nationaux, TOYP & QR Check-in** | Module `/programmes/toyp`, inscriptions Convention Nationale par délégation, scan QR de présence |
| **Sprint 4** | **Institut de Formation, Certificats & Capitation** | Annuaire des formateurs, certificats PDF vérifiables (`/verifier/[code]`), module de capitation OLM → ONM |
