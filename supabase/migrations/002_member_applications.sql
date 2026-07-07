-- ============================================================
-- JCI Tabarre Excelsior — Migration 002
-- Candidatures membres et nouvelles colonnes profil
-- ============================================================

-- ─── NOUVELLES COLONNES MEMBRES ──────────────────────────────
-- Données collectées via le formulaire d'adhésion complet
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS birth_date       DATE,
  ADD COLUMN IF NOT EXISTS commune          TEXT,
  ADD COLUMN IF NOT EXISTS education_level  TEXT,
  ADD COLUMN IF NOT EXISTS interests        TEXT[],
  ADD COLUMN IF NOT EXISTS how_heard        TEXT;

-- ─── TABLE CANDIDATURES ──────────────────────────────────────
-- Stocke les soumissions du formulaire /join avant validation admin
CREATE TABLE IF NOT EXISTS member_applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identité
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  birth_date        DATE,

  -- Profil
  commune           TEXT NOT NULL,
  profession        TEXT,
  education_level   TEXT,
  interests         TEXT[] NOT NULL DEFAULT '{}',
  how_heard         TEXT NOT NULL,
  motivation        TEXT NOT NULL,

  -- Cycle de vie
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','rejected')),
  reviewed_by       UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  review_notes      TEXT,
  member_id         UUID REFERENCES members(id) ON DELETE SET NULL,

  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE member_applications ENABLE ROW LEVEL SECURITY;
-- Toutes les opérations passent par le service role (bypasse RLS)

-- ─── INDEX ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_applications_status    ON member_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email     ON member_applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_submitted ON member_applications(submitted_at DESC);
