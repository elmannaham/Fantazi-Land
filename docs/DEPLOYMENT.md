# 🚀 Guide de Déploiement Multi-Plateforme — Fantazi-Land

Guide complet pour le déploiement continu, la conteneurisation et l'optimisation des performances de la plateforme **Fantazi-Land** sur **Vercel**, **Base44**, **Cloudflare**, **Render** et **Wasmer**.

---

## 🔑 Variables d'Environnement Globales

Quel que soit l'hébergeur sélectionné, configurez les variables suivantes dans l'interface de gestion de l'environnement :

| Variable | Visibilité | Rôle |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Public | URL de l'instance Supabase (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Public | Clé anonyme client pour l'auth et requêtes publiques |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Secret Serveur | Clé administrative Supabase (Storage, RLS bypass) |
| `BASE44_API_URL` | ❌ Secret Serveur | Endpoint API Base44 (`https://...base44.app/api`) |
| `BASE44_API_KEY` | ❌ Secret Serveur | Clé API secrète Base44 |
| `NEXT_PUBLIC_APP_URL` | ✅ Public | URL de production de l'application |
| `NODE_ENV` | ⚙️ Système | `production` |

---

## 📦 Option 1 : Déploiement sur Vercel (Recommandé)

Le projet intègre une configuration native [`vercel.json`](../vercel.json) avec fonctions serverless optimisées et en-têtes de sécurité HTTP.

### Via le Dashboard Vercel :
1. Poussez votre code sur GitHub : `git push origin master` (ou votre branche de release).
2. Rendez-vous sur [vercel.com/new](https://vercel.com/new) et sélectionnez le dépôt **`Fantazi-Land`**.
3. **Paramètres de build** :
   - Framework Preset : `Next.js`
   - Build Command : `npm run build`
   - Output Directory : `.next`
4. Ajoutez vos variables d'environnement dans **Settings > Environment Variables**.
5. Cliquez sur **Deploy**.

### Via Vercel CLI :
```bash
npm i -g vercel
vercel login
vercel link
vercel --prod
```

---

## ⚡ Option 2 : Déploiement sur Base44

Fantazi-Land est interconnecté à l'application **Base44 CRM & Booking** (App ID: `6a8ea8ad929a72d7ec63fc9d`).

### Déploiement conteneurisé Base44 App Engine :
1. Utilisez le [`Dockerfile`](../Dockerfile) multi-stage fourni pour créer l'image conteneur :
   ```bash
   docker build -t fantazi-land:latest .
   ```
2. Connectez l'image Docker à votre espace de travail Base44 :
   - Configurez le port d'écoute : `3000`
   - Spécifiez la variable d'URL publique `NEXT_PUBLIC_APP_URL`
3. Les webhooks et requêtes API transitent directement via `BASE44_API_URL` et `BASE44_API_KEY`.

---

## ☁️ Option 3 : Déploiement sur Cloudflare (Pages / Workers)

Le fichier [`wrangler.toml`](../wrangler.toml) est préconfiguré pour Cloudflare Pages avec le support `nodejs_compat`.

### Déploiement via Cloudflare Pages & Next-on-Pages :
1. Installez l'outil Cloudflare `@cloudflare/next-on-pages` :
   ```bash
   npm install -D @cloudflare/next-on-pages
   ```
2. Générez le build statique et Edge :
   ```bash
   npx @cloudflare/next-on-pages
   ```
3. Déployez avec Wrangler :
   ```bash
   npx wrangler pages deploy .vercel/output/static --project-name=fantazi-land
   ```
4. Dans le dashboard Cloudflare Pages, renseignez vos variables d'environnement sous **Settings > Environment variables**.

---

## 🟣 Option 4 : Déploiement sur Render.com

Le fichier de spécification [`render.yaml`](../render.yaml) permet un déploiement 1-clic de type **Blueprint Web Service**.

### Déploiement automatique :
1. Créez un nouveau **Blueprint** sur [dashboard.render.com](https://dashboard.render.com/blueprints).
2. Sélectionnez votre dépôt GitHub **`Fantazi-Land`**.
3. Render détecte automatiquement `render.yaml` :
   - **Type** : Web Service (Node.js)
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Health Check** : `/api/admin/sync`
4. Renseignez les variables d'environnement secrètes puis validez le déploiement.

---

## 🌐 Option 5 : Déploiement sur Wasmer (Edge & WebAssembly)

Le fichier [`wasmer.toml`](../wasmer.toml) permet de déployer l'application sur le cloud distribué Wasmer Edge.

### Déploiement Wasmer :
1. Installez la CLI Wasmer :
   ```bash
   # Windows (PowerShell)
   iwr -useb https://wasmer.io/install.ps1 | iex
   # Linux / macOS
   curl https://get.wasmer.io -sSfL | sh
   ```
2. Connectez-vous à votre compte Wasmer :
   ```bash
   wasmer login
   ```
3. Publiez et déployez l'application :
   ```bash
   wasmer deploy
   ```

---

## 🔍 Vérification Post-Déploiement

Après déploiement, vérifiez l'intégrité de la plateforme :

1. **Page d'accueil** : `GET https://votre-domaine.com/` (HTTP 200)
2. **Galerie Photos du Bucket** : `GET https://votre-domaine.com/portfolio` (HTTP 200)
3. **Statut de Synchronisation** : `GET https://votre-domaine.com/api/admin/sync` (Vérifier que les 5 profils sont détectés)
4. **API Profils & Médias** : `GET https://votre-domaine.com/api/profiles?include=media_assets`
