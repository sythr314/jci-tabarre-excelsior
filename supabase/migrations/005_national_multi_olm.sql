-- ============================================================
-- JCI Haïti / JCI Tabarre Excelsior — Migration 005
-- Architecture Nationale Multi-OLM, Programme 100% Efficacité,
-- Nominations TOYP et Vérification des Certificats JCI
-- ============================================================

-- 1. Table des Organisations Locales Membres (OLM)
CREATE TABLE IF NOT EXISTS local_organizations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,
  slug              TEXT NOT NULL UNIQUE,
  region            TEXT NOT NULL
                      CHECK (region IN ('ouest_metropolitaine', 'grand_nord', 'grand_sud', 'centre_artibonite')),
  city              TEXT NOT NULL,
  founded_year      INT,
  status            TEXT NOT NULL DEFAULT 'affiliated'
                      CHECK (status IN ('provisional', 'affiliated', 'suspended')),
  president_name    TEXT,
  contact_email     TEXT,
  contact_phone     TEXT,
  members_count     INT NOT NULL DEFAULT 0,
  efficiency_score  INT NOT NULL DEFAULT 0,
  capitation_paid   BOOLEAN NOT NULL DEFAULT FALSE,
  flagship_project  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Rattachement optionnel des entités existantes à une OLM
ALTER TABLE members             ADD COLUMN IF NOT EXISTS local_org_slug TEXT DEFAULT 'tabarre-excelsior';
ALTER TABLE member_applications ADD COLUMN IF NOT EXISTS local_org_slug TEXT DEFAULT 'tabarre-excelsior';
ALTER TABLE activities          ADD COLUMN IF NOT EXISTS local_org_slug TEXT DEFAULT 'tabarre-excelsior';
ALTER TABLE activities          ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'local'
                                  CHECK (scope IN ('local', 'regional', 'national', 'international'));

-- 3. Table des Nominations au Programme JCI TOYP (10 Jeunes les plus Remarquables)
CREATE TABLE IF NOT EXISTS toyp_nominations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nominee_name      TEXT NOT NULL,
  nominee_email     TEXT NOT NULL,
  nominee_phone     TEXT,
  nominee_age       INT NOT NULL CHECK (nominee_age >= 18 AND nominee_age <= 40),
  city              TEXT NOT NULL,
  local_org_slug    TEXT,
  category          TEXT NOT NULL,
  headline          TEXT NOT NULL,
  achievements      TEXT NOT NULL,
  impact_summary    TEXT NOT NULL,
  nominator_name    TEXT NOT NULL,
  nominator_email   TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'submitted'
                      CHECK (status IN ('submitted', 'shortlisted', 'finalist', 'laureate', 'rejected')),
  jury_score        INT CHECK (jury_score >= 0 AND jury_score <= 100),
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table des Certificats Officiels JCI (Formations & Académies)
CREATE TABLE IF NOT EXISTS jci_certificates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code  TEXT NOT NULL UNIQUE, -- ex: JCI-HT-2026-0042
  recipient_name    TEXT NOT NULL,
  recipient_email   TEXT,
  course_title      TEXT NOT NULL,       -- ex: JCI Impact, JCI Presenter, JCI Effective Communication
  course_category   TEXT NOT NULL DEFAULT 'official'
                      CHECK (course_category IN ('official', 'academy', 'leadership', 'award')),
  local_org_slug    TEXT DEFAULT 'tabarre-excelsior',
  trainer_name      TEXT NOT NULL,
  issued_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  is_valid          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE local_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE toyp_nominations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE jci_certificates    ENABLE ROW LEVEL SECURITY;

-- Lecture publique des OLM et des certificats vérifiables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'local_organizations' AND policyname = 'olm_public_read'
  ) THEN
    CREATE POLICY "olm_public_read" ON local_organizations FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jci_certificates' AND policyname = 'certificates_public_read'
  ) THEN
    CREATE POLICY "certificates_public_read" ON jci_certificates FOR SELECT USING (is_valid = true);
  END IF;
END $$;
