-- ============================================================
-- JCI Tabarre Excelsior — Schéma initial
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── MEMBRES ─────────────────────────────────────────────────
CREATE TABLE members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  profession    TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','active','inactive','alumni')),
  jci_level     TEXT NOT NULL DEFAULT 'member'
                  CHECK (jci_level IN ('member','senator','alumnus')),
  community_role TEXT,
  join_date     DATE,
  invited_by    UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ADMINS ──────────────────────────────────────────────────
CREATE TABLE admin_users (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  email     TEXT NOT NULL,
  role      TEXT NOT NULL
              CHECK (role IN ('president','secretaire','charge_formation','charge_communication')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── COTISATIONS ─────────────────────────────────────────────
CREATE TABLE dues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  year         INT NOT NULL,
  amount       DECIMAL(10,2),
  paid_at      TIMESTAMPTZ,
  confirmed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  notes        TEXT,
  UNIQUE(member_id, year)
);

-- ─── RÔLES / COMMISSIONS ─────────────────────────────────────
CREATE TABLE member_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  role_title  TEXT NOT NULL,
  commission  TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE,
  is_current  BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── ACTIVITÉS ───────────────────────────────────────────────
CREATE TABLE activities (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  description           TEXT,
  type                  TEXT NOT NULL
                          CHECK (type IN ('formation','activite','reunion','initiative','autre')),
  activity_date         TIMESTAMPTZ NOT NULL,
  location              TEXT,
  registration_link     TEXT,
  google_sheet_id       TEXT,
  sheet_email_column    TEXT NOT NULL DEFAULT 'Email',
  registration_deadline TIMESTAMPTZ,
  capacity              INT,
  status                TEXT NOT NULL DEFAULT 'upcoming'
                          CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  cover_image_url       TEXT,
  sanity_ref            TEXT,
  created_by            UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRÉSENCES ───────────────────────────────────────────────
CREATE TABLE attendances (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id    UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  member_id      UUID REFERENCES members(id) ON DELETE SET NULL,
  external_email TEXT,
  external_name  TEXT,
  registered_at  TIMESTAMPTZ,
  attended       BOOLEAN NOT NULL DEFAULT FALSE,
  source         TEXT NOT NULL DEFAULT 'google_form'
                   CHECK (source IN ('google_form','manual','site')),
  imported_at    TIMESTAMPTZ,
  notes          TEXT,
  UNIQUE(activity_id, member_id)
);

-- ─── PROJETS ─────────────────────────────────────────────────
CREATE TABLE projects (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  description        TEXT,
  start_date         DATE,
  end_date           DATE,
  status             TEXT NOT NULL DEFAULT 'active'
                       CHECK (status IN ('planned','active','completed')),
  impact_summary     TEXT,
  beneficiaries_count INT,
  initiative_ref     TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE project_members (
  project_id          UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  member_id           UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  role                TEXT,
  contribution_notes  TEXT,
  joined_at           DATE,
  PRIMARY KEY (project_id, member_id)
);

-- ─── INVITATIONS ─────────────────────────────────────────────
CREATE TABLE member_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  token       UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  invited_by  UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  used_at     TIMESTAMPTZ,
  member_id   UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AUDIT LOG ───────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  details     JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_members_status      ON members(status);
CREATE INDEX idx_members_email       ON members(email);
CREATE INDEX idx_attendances_member  ON attendances(member_id);
CREATE INDEX idx_attendances_activity ON attendances(activity_id);
CREATE INDEX idx_activities_date     ON activities(activity_date);
CREATE INDEX idx_activities_status   ON activities(status);
CREATE INDEX idx_dues_member_year    ON dues(member_id, year);
CREATE INDEX idx_audit_admin         ON audit_logs(admin_id);
CREATE INDEX idx_audit_created       ON audit_logs(created_at DESC);

-- ─── TRIGGER updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at   BEFORE UPDATE ON members   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE members             ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE dues                ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_roles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances         ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_invitations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- Membres : chaque membre ne voit que son propre profil
CREATE POLICY "member_self_read" ON members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "member_self_update" ON members
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Présences : le membre voit ses propres présences
CREATE POLICY "attendance_self_read" ON attendances
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Cotisations : le membre voit les siennes
CREATE POLICY "dues_self_read" ON dues
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Rôles : le membre voit les siens
CREATE POLICY "roles_self_read" ON member_roles
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Activités : lecture publique (statut completed ou upcoming)
CREATE POLICY "activities_public_read" ON activities
  FOR SELECT USING (status IN ('upcoming', 'completed'));

-- Note : toutes les écritures admin passent par le service role (pas de policy nécessaire)
-- Le service role bypasse RLS automatiquement

-- ─── DONNÉES INITIALES ───────────────────────────────────────
-- À exécuter APRÈS avoir créé le premier user dans Supabase Auth
-- INSERT INTO admin_users (user_id, name, email, role)
-- VALUES ('[UUID_DU_USER]', 'Nom Prénom', 'email@domaine.com', 'president');
