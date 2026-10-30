-- ============================================================
-- JCI Tabarre Excelsior — Migration 003
-- Permet à un administrateur de lire SA PROPRE ligne admin_users.
--
-- Pourquoi : proxy.ts, app/ops-jci-htx/layout.tsx et AdminLoginForm.tsx
-- vérifient le statut admin avec la clé anon (session de l'utilisateur).
-- Sans cette policy, RLS renvoie 0 ligne et l'admin est renvoyé
-- en boucle vers /ops-jci-htx/login.
-- ============================================================

CREATE POLICY "admin_self_read" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);
