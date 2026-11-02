# Journal des Erreurs, Correctifs & Règles Anti-Régression (`correct.md`)

Ce fichier documente de manière transparente toutes les erreurs rencontrées lors du développement et de la mise en production sur Netlify/Supabase, leurs causes racines exactes, les solutions apportées et les **règles strictes à respecter** pour ne plus jamais les reproduire.

---

## 1. Erreur : Secret Supabase exposé dans un commit Git (GitHub Push Protection `GH013`)

- **Symptôme :** `git push` refusé par GitHub avec l'erreur `GH013: Repository rule violations found - Supabase Secret Key`.
- **Cause racine :** Pour contourner rapidement l'absence de variable d'environnement sur Netlify, la clé secrète `SUPABASE_SERVICE_ROLE_KEY` (`sb_secret_...`) avait été placée en valeur par défaut dans le code serveur (`lib/supabase/server.ts`).
- **Correction appliquée :**
  - Annulation du commit via `git reset --soft HEAD~1`.
  - Suppression immédiate et définitive de toute clé secrète (`sb_secret_...`) dans le code source.
  - Utilisation exclusive de `process.env.SUPABASE_SERVICE_ROLE_KEY` validée par `HAS_VALID_SERVICE_KEY` et repli sécurisé sur la clé publique `SUPABASE_ANON_KEY` ou le client de session authentifié.
- **Règle absolue (Ne plus jamais répéter) :**
  > **RÈGLE #1 :** Ne **JAMAIS** écrire une clé privée (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `SANITY_WEBHOOK_SECRET`) en dur dans un fichier suivi par Git, même temporairement. Seules les clés publiques (`NEXT_PUBLIC_*`) peuvent avoir un fallback dans le code.

---

## 2. Erreur : Conflit entre `middleware.ts` et `proxy.ts` sous Next.js 16

- **Symptôme :** Erreur fatale au démarrage et au build Next.js 16 :
  `Error: Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected. Please use "./proxy.ts" only.`
- **Cause racine :** Création d'un fichier `middleware.ts` par habitude des versions Next.js 13–15, alors que **Next.js 16.2+** utilise nativement `proxy.ts` avec `export async function proxy(request: NextRequest)`.
- **Correction appliquée :**
  - Suppression de `middleware.ts` et conservation unique de `proxy.ts`.
- **Règle absolue (Ne plus jamais répéter) :**
  > **RÈGLE #2 :** Dans ce projet Next.js 16, le middleware s'appelle exclusivement **`proxy.ts`** à la racine et exporte la fonction `proxy()`. Ne jamais créer de fichier `middleware.ts`.

---

## 3. Erreur : Échec du build de production (`next build`) à cause de `app/studio/[[...tool]]/page.tsx`

- **Symptôme :** Le site fonctionnait en mode `next dev --webpack`, mais échouait lors du `next build` (587 erreurs Turbopack/Webpack sur `@sanity/schema`, `mux-player`, `media-chrome` et module `@/sanity.config` introuvable). Résultat : Netlify refusait le déploiement et continuait de servir une ancienne version du site.
- **Cause racine :**
  1. Le fichier `app/studio/[[...tool]]/page.tsx` importait `@/sanity.config` qui n'existait pas dans le dépôt et chargeait le lourd client `Studio` de `sanity`.
  2. Le build complet `next build` n'avait pas été exécuté localement avant le `git push`.
- **Correction appliquée :**
  - Remplacement de `app/studio/[[...tool]]/page.tsx` par une redirection propre vers `/ops-jci-htx/dashboard`.
- **Règle absolue (Ne plus jamais répéter) :**
  > **RÈGLE #3 :** Toujours vérifier que `next build` (ou la vérification complète des routes statiques et du typage TypeScript) passe sans erreur avant d'annoncer qu'un déploiement est prêt.

---

## 4. Erreur : Utilisation de `useSearchParams()` sans `<Suspense>` dans Next.js App Router

- **Symptôme :** Échec de l'étape `Generating static pages` lors du build de production sur `/auth/mot-de-passe-oublie` et `/auth/reinitialiser-mot-de-passe` (`Missing Suspense boundary with CSR bailout`).
- **Cause racine :** Dans Next.js 15/16, toute page `"use client"` qui appelle `useSearchParams()` directement dans le composant principal bloque le pré-rendu statique si elle n'est pas enveloppée dans `<Suspense>`.
- **Correction appliquée :**
  - Séparation du formulaire interne (`MotDePasseOublieForm`, `ReinitialiserMotDePasseForm`) et encapsulation dans `<Suspense fallback={...}>` au niveau du composant de page exporté par défaut.
- **Règle absolue (Ne plus jamais répéter) :**
  > **RÈGLE #4 :** Tout composant utilisant `useSearchParams()` doit **obligatoirement** être enveloppé dans un `<Suspense>` dans la page parente.

---

## 5. Erreur : Blocage du déploiement par le Scanner de Secrets de Netlify (`SECRETS_SCAN`)

- **Symptôme :** Le build Next.js réussissait en 20,6 secondes sur Netlify, mais l'étape finale échouait avec `Exit code 2: Secrets scanning found secrets in build` à cause de `NEXT_PUBLIC_SANITY_DATASET=production` et de `EMAIL_FROM` dans `.env.example`.
- **Cause racine :**
  1. `.env.example` contenait de vraies adresses (`contact@jcitabarre.org`) et le mot `production` qui avaient été copiés dans l'interface Netlify.
  2. Le scanner de secrets de Netlify cherche toutes les valeurs des variables d'environnement dans le dossier `.next` généré ; comme `production` apparaît dans des centaines de fichiers JS de React/Next.js, le scanner bloquait le build.
- **Correction appliquée :**
  - Remplacement des valeurs de `.env.example` par des placeholders génériques (`your-email@example.com`, `your-dataset-name`).
  - Ajout de `SECRETS_SCAN_OMIT_KEYS` et `SECRETS_SCAN_OMIT_PATHS` dans `netlify.toml`.
- **Règle absolue (Ne plus jamais répéter) :**
  > **RÈGLE #5 :** Dans `.env.example`, n'utiliser que des valeurs manifestement fictives (`your-xxx-here`). Toute nouvelle variable publique `NEXT_PUBLIC_*` doit être déclarée dans `SECRETS_SCAN_OMIT_KEYS` dans `netlify.toml`.

---

## 6. Erreur : Demandes d'adhésion (`/join`) invisibles au Tableau de Bord à cause du « Mode Démo »

- **Symptôme :** L'utilisateur remplissait le formulaire d'adhésion sur `/join`, recevait le message de succès à l'écran, mais aucune candidature n'apparaissait dans `/ops-jci-htx/dashboard` ni dans `/ops-jci-htx/candidatures`.
- **Cause racine :**
  1. Dans `app/api/join/route.ts`, la condition `isDemo` vérifiait `!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("placeholder")` **avant** d'insérer la candidature dans Supabase (`member_applications`). Comme Resend était en mode démo (`re_placeholder_demo_key`), la route faisait un `return NextResponse.json({ success: true, demo: true })` prématuré sans rien enregistrer en base !
  2. Le tableau de bord `/ops-jci-htx/dashboard` n'affichait qu'un compteur sans lister directement les dernières demandes d'adhésion et n'avait pas `export const dynamic = "force-dynamic"`.
- **Correction appliquée :**
  - Séparation stricte entre la **persistance en base de données (Supabase)** et **l'envoi d'e-mail (Resend)** dans `/api/join`, `/api/admin/applications/[id]/approve`, `/api/admin/applications/[id]/reject` et `/api/admin/members/invite`.
  - L'insertion en base et `revalidatePath("/ops-jci-htx/dashboard")` s'exécutent désormais **toujours en premier**.
  - Ajout de `export const dynamic = "force-dynamic"` et d'un tableau **« Demandes d'adhésion récentes »** directement sur `/ops-jci-htx/dashboard`.
- **Règle absolue (Ne plus jamais répéter) :**
  > **RÈGLE #6 :** Ne **JAMAIS** conditionner un enregistrement en base de données (Supabase) à la disponibilité d'un service tiers d'envoi d'e-mail (Resend). Toujours sauvegarder en base d'abord, invalider le cache (`revalidatePath`), puis tenter l'envoi d'e-mail en second lieu dans un bloc tolérant aux pannes (`try/catch` ou `Promise.allSettled`).

---

## 7. Erreur : Boucle de redirection sur l'Espace Membre en l'absence de `SUPABASE_SERVICE_ROLE_KEY`

- **Symptôme :** En production, un membre qui se connectait était redirigé en boucle vers `/espace-membre/connexion` ou recevait une erreur si `SUPABASE_SERVICE_ROLE_KEY` contenait un placeholder (`your-service-role-key-here`).
- **Cause racine :**
  1. Les pages de `/espace-membre/*` utilisaient `createServiceClient()` (qui n'envoie pas les cookies de session de l'utilisateur) au lieu du client de session `await createClient()`.
  2. Si `SUPABASE_SERVICE_ROLE_KEY` contenait une valeur copiée depuis `.env.example` (`your-service-role-key-here`), `Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)` était `true` mais la clé était rejetée par Supabase.
- **Correction appliquée :**
  - Création de la constante `HAS_VALID_SERVICE_KEY` dans `lib/supabase/server.ts` qui vérifie que la clé commence réellement par `sb_secret_` ou `eyJ`.
  - Dans l'espace membre, repli automatique sur le client de session authentifié `supabase` (qui satisfait les politiques RLS `auth.uid() = user_id`).
- **Règle absolue (Ne plus jamais répéter) :**
  > **RÈGLE #7 :** Toujours valider le format d'une variable d'environnement critique (`HAS_VALID_SERVICE_KEY`, exclusion de `placeholder` et `your-project`) avant de l'utiliser, et privilégier le client de session authentifié (`createClient()`) pour toutes les lectures liées à l'utilisateur connecté.

---

## 8. Erreur : Fichiers temporaires `scratch/` ajoutés par erreur dans Git

- **Symptôme :** Des scripts de diagnostic temporaires dans `scratch/` ont été suivis par Git lors d'un `git add -A`.
- **Correction appliquée :**
  - Ajout de `/scratch` dans `.gitignore` et nettoyage de l'index Git (`git rm -r --cached scratch`).
- **Règle absolue (Ne plus jamais répéter) :**
  > **RÈGLE #8 :** Toujours garder `/scratch` dans `.gitignore` et vérifier la liste des fichiers modifiés avant chaque commit.
