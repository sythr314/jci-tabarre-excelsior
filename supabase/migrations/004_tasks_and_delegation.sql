-- ============================================================
-- JCI Tabarre Excelsior — Migration 004
-- Module de délégation et répartition des tâches par commission
-- À exécuter dans Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  activity_id   UUID REFERENCES activities(id) ON DELETE SET NULL,
  commission    TEXT,
  assigned_to   UUID REFERENCES members(id) ON DELETE SET NULL,
  assigned_by   UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  priority      TEXT NOT NULL DEFAULT 'normale'
                  CHECK (priority IN ('basse','normale','haute','urgente')),
  status        TEXT NOT NULL DEFAULT 'a_faire'
                  CHECK (status IN ('a_faire','en_cours','termine','valide')),
  due_date      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_activity_id ON tasks(activity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Les membres voient les tâches qui leur sont assignées
CREATE POLICY "tasks_member_read" ON tasks
  FOR SELECT USING (
    assigned_to IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Les membres peuvent mettre à jour le statut de leurs tâches assignées
CREATE POLICY "tasks_member_update" ON tasks
  FOR UPDATE USING (
    assigned_to IN (SELECT id FROM members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    assigned_to IN (SELECT id FROM members WHERE user_id = auth.uid())
  );
