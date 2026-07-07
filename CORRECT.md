# CORRECT.md — Journal des erreurs et corrections
# JCI Tabarre Excelsior — Site Web Officiel

> Consigner ici toute erreur rencontrée : symptôme, cause, correction, prévention.
> Consulter ce fichier avant de commencer une tâche similaire.

---

## Format d'entrée

```
### [PHASE] Titre court de l'erreur
**Date :** YYYY-MM-DD
**Fichier(s) :** chemin/vers/fichier.ts
**Symptôme :** Ce qui s'est manifesté (message d'erreur, comportement inattendu...)
**Cause :** Pourquoi c'est arrivé
**Correction :** Ce qui a été fait pour corriger
**Prévention :** Comment éviter cette erreur à l'avenir
```

---

## Erreurs courantes à anticiper (pré-remplies)

---

### [Phase 0] Mauvaise version de Node
**Symptôme :** Erreurs de build incompréhensibles ou fonctionnalités Next.js manquantes
**Cause :** Node < 20 utilisé avec Next.js 14+
**Correction :** Installer Node 20 LTS via nvm ou le site officiel
**Prévention :** Ajouter un fichier `.nvmrc` contenant `20` à la racine

---

### [Phase 0] Variables d'environnement manquantes au build
**Symptôme :** `process.env.NEXT_PUBLIC_SANITY_PROJECT_ID` est `undefined` en runtime
**Cause :** `.env.local` non créé ou clé manquante
**Correction :** Vérifier `.env.local` contre `.env.example`, relancer `npm run dev`
**Prévention :** Valider les env vars au démarrage dans `lib/sanity/client.ts` avec une assertion explicite

---

### [Phase 1] Schéma Sanity non pris en compte
**Symptôme :** Champ absent dans le Studio après modification du schéma
**Cause :** Schéma non importé dans `sanity/schemas/index.ts`
**Correction :** Ajouter l'import et relancer `npx sanity dev`
**Prévention :** Toujours vérifier `index.ts` après création d'un nouveau schéma

---

### [Phase 1] Erreur CORS Sanity en production
**Symptôme :** Requêtes Sanity bloquées (erreur CORS dans la console navigateur)
**Cause :** Domaine de production non ajouté dans les origines CORS du projet Sanity
**Correction :** Ajouter le domaine dans sanity.io > API > CORS Origins
**Prévention :** Checklist déploiement — toujours configurer CORS avant mise en prod

---

### [Phase 2] Balise `<img>` brute utilisée par erreur
**Symptôme :** Warning Next.js "Using `<img>` could result in slower LCP..."
**Cause :** Import d'un composant tiers ou oubli d'utiliser `SanityImage` / `next/image`
**Correction :** Remplacer par `<SanityImage>` ou `<Image>` de `next/image`
**Prévention :** `grep -r "<img" app/ components/` avant chaque commit

---

### [Phase 2] Police Google non chargée (FOUT)
**Symptôme :** Flash de police système au premier chargement
**Cause :** Police importée via `<link>` HTML au lieu de `next/font/google`
**Correction :** Utiliser `next/font/google` dans `app/layout.tsx` avec `display: 'swap'`
**Prévention :** Toujours passer par `next/font` — jamais de `<link>` Google Fonts manuel

---

### [Phase 3] Animations non respectueuses de `prefers-reduced-motion`
**Symptôme :** Animations qui tournent même pour les utilisateurs ayant désactivé les animations
**Cause :** Oubli de la media query `@media (prefers-reduced-motion: reduce)`
**Correction :** Envelopper les animations CSS dans `@media (prefers-reduced-motion: no-preference)` ou utiliser le hook `useReducedMotion` de Framer
**Prévention :** Checklist composant — vérifier reduced-motion à chaque nouvelle animation

---

### [Phase 5] Champ honeypot visible pour les utilisateurs
**Symptôme :** Un champ vide apparaît dans le formulaire
**Cause :** Oubli du style `display: none` ou `visibility: hidden` sur le champ honeypot
**Correction :** Ajouter `className="sr-only"` + `tabIndex={-1}` + `aria-hidden="true"`
**Prévention :** Template de formulaire avec honeypot déjà intégré dès le départ

---

### [Phase 5] Validation Zod non partagée entre front et API
**Symptôme :** Le front accepte un champ vide que l'API rejette (ou vice-versa)
**Cause :** Deux schémas séparés qui dérivent
**Correction :** Centraliser dans `lib/utils/schemas.ts` et importer des deux côtés
**Prévention :** Un seul fichier de schémas Zod — ne jamais dupliquer

---

### [Phase 6] Rate limiting non appliqué sur une route
**Symptôme :** Spam possible sur le formulaire de contact ou d'adhésion
**Cause :** Oubli d'appeler `rateLimit()` dans la route API
**Correction :** Ajouter le middleware rate limiting en début de handler
**Prévention :** Template de route API avec rate limiting déjà câblé

---

### [Phase 6] Email envoyé sans domaine vérifié dans Resend
**Symptôme :** Emails non reçus ou classés en spam
**Cause :** `EMAIL_FROM` utilise un domaine dont SPF/DKIM ne sont pas configurés dans Resend
**Correction :** Vérifier le domaine dans le dashboard Resend, attendre propagation DNS
**Prévention :** Tester l'envoi email dès la Phase 7, pas seulement au déploiement final

---

### [Phase 8] Revalidation ISR trop fréquente
**Symptôme :** Quota API Sanity (plan free) épuisé
**Cause :** `revalidate = 60` (1 minute) — trop court pour le plan free
**Correction :** Passer à `revalidate = 3600` (1 heure) + webhook Sanity pour forcer la revalidation à la publication
**Prévention :** Ne jamais descendre sous 3600 sur le plan free Sanity

---

### [Phase 9] OG image manquante sur les pages de détail initiative
**Symptôme :** Aperçu lien réseaux sociaux sans image
**Cause :** `openGraph.images` non défini dans `generateMetadata`
**Correction :** Utiliser `urlFor(initiative.coverImage).width(1200).height(630).url()` dans `generateMetadata`
**Prévention :** Checklist SEO — vérifier OG image sur chaque page dynamique

---

### [Phase 11] `NEXT_PUBLIC_SITE_URL` mal configuré
**Symptôme :** URLs canonical incorrectes, sitemap avec mauvais domaine
**Cause :** Variable laissée vide ou avec trailing slash (`https://example.com/`)
**Correction :** Renseigner sans trailing slash : `https://[domaine]`
**Prévention :** Valider la variable dans `app/sitemap.ts` au démarrage

---

---

### [Phase 4] Variables Supabase mal nommées
**Symptôme :** Client Supabase côté serveur retourne une erreur d'initialisation
**Cause :** Confusion entre `NEXT_PUBLIC_SUPABASE_URL` (browser) et `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement — ne jamais exposer au client)
**Correction :** `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` pour le client browser ; `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur (routes API, Server Components)
**Prévention :** Ne jamais importer le client service-role dans un composant client (`"use client"`)

---

### [Phase 4] RLS bloque toutes les lectures en dev
**Symptôme :** Les requêtes Supabase retournent `[]` ou `null` même avec des données dans la table
**Cause :** RLS activé sans policies définies = tout bloqué par défaut
**Correction :** Créer les policies appropriées OU utiliser le client service-role (côté serveur) qui bypasse le RLS
**Prévention :** Toujours tester avec le client anon ET le client service-role séparément

---

### [Phase 5] Cookies Supabase non transmis entre Server et Client Components
**Symptôme :** La session est perdue entre un Server Component et un Client Component
**Cause :** Utilisation de `createClient` (browser) dans un Server Component au lieu de `createServerClient` (@supabase/ssr)
**Correction :** Utiliser `lib/supabase/server.ts` dans les Server Components et routes API ; `lib/supabase/client.ts` uniquement dans les Client Components
**Prévention :** Créer deux fichiers distincts dès le départ et ne jamais les mélanger

---

### [Phase 5] Middleware Next.js boucle infinie de redirections
**Symptôme :** La page de login redirige vers elle-même en boucle (ERR_TOO_MANY_REDIRECTS)
**Cause :** Le middleware redirige `/ops-jci-htx/login` vers `/ops-jci-htx/login` car la route login est incluse dans le pattern protégé
**Correction :** Exclure explicitement `/ops-jci-htx/login` et `/espace-membre/connexion` du pattern de protection dans le middleware
**Prévention :** Pattern middleware : `matcher: ['/ops-jci-htx/((?!login).*)']`

---

### [Phase 5] Token d'invitation accepté deux fois
**Symptôme :** Un lien d'invitation utilisé fonctionne une deuxième fois
**Cause :** Oubli de marquer `used_at` dans `member_invitations` après la première utilisation
**Correction :** Dans `/api/auth/accept-invitation`, vérifier `used_at IS NULL` ET mettre à jour `used_at = NOW()` dans la même transaction
**Prévention :** Toujours faire un `UPDATE ... WHERE used_at IS NULL RETURNING *` — si 0 lignes retournées, le token est déjà utilisé

---

### [Phase 6] URL admin devinable par Google
**Symptôme :** Le panel admin est indexé par les moteurs de recherche
**Cause :** `robots.txt` ne bloque pas `/ops-jci-htx/*`
**Correction :** Ajouter `Disallow: /ops-jci-htx/` dans `robots.txt` + métadonnée `noindex` sur toutes les pages admin
**Prévention :** Checklist déploiement — vérifier robots.txt et headers `X-Robots-Tag: noindex` sur les routes admin

---

### [Phase 6] Score d'engagement incorrect après import de présences
**Symptôme :** Le score d'un membre reste à 0 même après import d'une présence
**Cause :** Le calcul du score ne relit pas la base après l'import — il utilise un cache ou une valeur calculée à l'ancienne
**Correction :** Le score doit toujours être calculé à la volée (requête SQL) et jamais mis en cache côté serveur plus de 5 min
**Prévention :** Fonction SQL `calculate_engagement_score(member_id)` appelée à chaque affichage du profil

---

### [Phase 8] Google Sheets API quota dépassé
**Symptôme :** Import qui retourne 429 ou erreur "RESOURCE_EXHAUSTED"
**Cause :** Trop d'imports déclenchés manuellement en peu de temps (quota 300 req/min pour les Sheets API)
**Correction :** Ajouter un debounce côté admin (désactiver le bouton 30s après un import) + retry avec exponential backoff
**Prévention :** Afficher la date du dernier import et n'autoriser qu'un import par heure par activité

---

### [Phase 8] Email non trouvé dans le Google Sheet
**Symptôme :** Import réussi mais 0 membres matchés
**Cause :** Le nom de la colonne email dans le Sheet ne correspond pas à `sheet_email_column` (ex : "Adresse email" vs "Email")
**Correction :** Dans l'interface admin, afficher les noms de colonnes détectés et laisser l'admin choisir la colonne email
**Prévention :** Log de l'import : afficher les colonnes trouvées + le nombre de valeurs matchées

---

### [Phase 9] Email d'invitation en spam
**Symptôme :** Les membres reçoivent l'email d'invitation dans leur dossier spam
**Cause :** Domaine expéditeur non vérifié dans Resend (SPF/DKIM manquants) ou contenu trop générique
**Correction :** Vérifier le domaine dans Resend, personnaliser l'objet et le corps, éviter les mots comme "gratuit" ou "cliquez ici"
**Prévention :** Tester avec Mail Tester (mail-tester.com) avant la mise en prod

---

## Erreurs rencontrées en développement

*(Ajouter ici au fil des sessions)*

---

*Journal créé : 2026-06-15 | Mis à jour : 2026-06-16*
