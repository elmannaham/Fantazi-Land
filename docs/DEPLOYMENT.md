# Guide de Déploiement Vercel & Supabase — Fantazi-Land

Guide complet pour le déploiement continu, la sécurisation et l'optimisation des performances de la plateforme **Fantazi-Land** sur **Vercel**.

---

## 1. 🔑 Configuration des Variables d'Environnement

Configurez les variables suivantes sur votre projet Vercel dans **Settings > Environment Variables** :

| Variable | Environnements | Description & Rôle | Visibilité Client |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Dev | URL de votre instance Supabase (`https://xyz.supabase.co`) | ✅ Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Dev | Clé publique anonyme pour l'authentification et requêtes client | ✅ Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Dev | ⚠️ Clé secrète d'administration (bypasse RLS côté serveur) | ❌ Secret (Serveur uniquement) |
| `DATABASE_URL` | Production, Preview, Dev | Chaîne de connexion PostgreSQL directe pour scripts/migrations | ❌ Secret (Serveur uniquement) |
| `NEXT_PUBLIC_APP_URL` | Production / Preview | URL publique de l'application (`https://fantazi-land.vercel.app`) | ✅ Public |
| `NODE_ENV` | Géré par Vercel | `production` en prod, `development` en dev | ⚙️ Automatique |

> [!CAUTION]
> **Sécurité critique** : Ne préfixez **JAMAIS** `SUPABASE_SERVICE_ROLE_KEY` par `NEXT_PUBLIC_`. Cette clé donne un accès administrateur total à votre base de données et ne doit être exécutée que dans les API Routes Next.js (`app/api/`) ou les Edge Functions.

---

## 2. 🚀 Déploiement Étape par Étape

### Méthode A : Via le Dashboard Vercel (Recommandé)

1. **Pousser votre code sur GitHub / GitLab :**
   ```bash
   git add .
   git commit -m "feat: setup full-stack backend and vercel deployment"
   git push origin main
   ```
2. **Importer le projet sur Vercel :**
   * Rendez-vous sur [vercel.com/new](https://vercel.com/new).
   * Sélectionnez votre dépôt Git **`fantazi-land`**.
3. **Configurer le projet :**
   * **Framework Preset** : `Next.js` (détecté automatiquement).
   * **Root Directory** : `./` (racine).
   * **Build Command** : `npm run build` (ou `next build`).
   * **Output Directory** : `.next`.
   * **Install Command** : `npm install`.
4. **Ajouter les Variables d'Environnement :**
   * Collez vos valeurs de production et preview obtenues sur le dashboard Supabase (*Settings > API*).
5. **Cliquer sur "Deploy"** : Vercel compile le projet et déploie l'application sur son réseau Edge CDN mondial.

---

### Méthode B : Via la CLI Vercel

```bash
# 1. Installer la CLI Vercel
npm i -g vercel

# 2. Se connecter à son compte
vercel login

# 3. Lier le projet local au projet Vercel
vercel link

# 4. Télécharger ou synchroniser les variables d'environnement
vercel env pull .env.local

# 5. Déployer en Production
vercel --prod
```

---

## 3. ⚙️ Configuration Optimale (`vercel.json`)

Le fichier [`vercel.json`](file:///C:/Users/Di-vibez-ent/Lucky_dev/Agence%20de%20Booking/vercel.json) configure la région d'exécution serveur au plus proche de votre base de données Supabase (ex: Paris `cdg1` ou Francfort `fra1`) ainsi que les en-têtes de sécurité :

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0, must-revalidate" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## 4. 🌿 Gestion des Branches & Environnements de Preview

* **Branche `main` (Production)** : Tout commit ou fusion sur `main` déclenche un déploiement de production immédiat sur le domaine principal.
* **Branches de fonctionnalités & Pull Requests (Preview)** :
  * Chaque PR génère une URL de Preview isolée (`https://fantazi-land-git-feature-xxx.vercel.app`).
  * Permet de tester visuellement les changements avant de fusionner.
* **Environnement Supabase Preview (Optionnel)** : Vous pouvez connecter Supabase Branching pour avoir une base de données éphémère par Pull Request.

---

## 5. ⚡ Optimisation des Performances & Core Web Vitals

1. **Région Colocalisée** : Assurez-vous que la région Vercel (`cdg1` - Paris) et le projet Supabase sont hébergés dans la même zone géographique pour un temps de latence DB inférieur à 5ms.
2. **Next.js Image Optimization** : Les images d'avatars et portfolios servies depuis Supabase Storage bénéficient de la conversion WebP/AVIF automatique via le composant `<Image />` configuré dans [`next.config.js`](file:///C:/Users/Di-vibez-ent/Lucky_dev/Agence%20de%20Booking/next.config.js).
3. **Pagination & Anti-N+1** : L'API `/api/profiles` implémente une pagination avec sélection relationnelle unifiée pour des temps de réponse sous les 100ms.

---

## 6. 🛠️ Résolution des Erreurs Courantes (Troubleshooting)

### Erreur 1 : `Type error: Type '...' is not assignable to type '...'` au Build
* **Cause** : Erreur TypeScript bloquant le build Next.js strict.
* **Solution** : Lancez `npm run type-check` localement avant chaque push Git.

### Erreur 2 : `413 Payload Too Large` lors de l'upload de médias ou CSV
* **Cause** : Limite par défaut du body parser Next.js Server Actions / API Routes.
* **Solution** : La configuration `bodySizeLimit: "10mb"` est déjà activée dans [`next.config.js`](file:///C:/Users/Di-vibez-ent/Lucky_dev/Agence%20de%20Booking/next.config.js).

### Erreur 3 : `Function Invocation Timeout` sur les imports CSV volumineux
* **Cause** : Timeout par défaut des Serverless Functions Vercel (10s ou 15s).
* **Solution** : La directive `"maxDuration": 30` dans `vercel.json` alloue 30 secondes pour le traitement des gros volumes.

---

## 7. 📊 Monitoring, Logs & Sécurité

1. **Vercel Analytics & Speed Insights** :
   * Activez Vercel Speed Insights depuis le dashboard Vercel pour surveiller en temps réel le LCP, FID et CLS.
2. **Runtime Logs & Alerting** :
   * Consultez les logs des Serverless Functions en temps réel dans l'onglet **Logs** de votre déploiement.
   * Vous pouvez configurer des alertes Slack/Discord/Email en cas d'erreur 5xx.
3. **Dead Letter Queue Monitoring** :
   * L'endpoint [`/api/failed-syncs`](file:///C:/Users/Di-vibez-ent/Lucky_dev/Agence%20de%20Booking/app/api/failed-syncs/route.ts) permet de surveiller les échecs de synchronisation directement depuis l'interface d'administration.
