-- ============================================================
-- JCI Tabarre Excelsior — Création du premier administrateur
--
-- Prérequis : créer l'utilisateur dans Supabase
--   Authentication > Users > Add user > Create new user
--   (cocher "Auto Confirm User")
--
-- Puis remplacer l'email et le nom ci-dessous et exécuter
-- dans SQL Editor.
-- ============================================================

INSERT INTO admin_users (user_id, name, email, role)
SELECT id, 'Prénom Nom', email, 'president'
FROM auth.users
WHERE email = 'admin@exemple.com';

-- Vérification : doit renvoyer 1 ligne
SELECT name, email, role, is_active FROM admin_users;
