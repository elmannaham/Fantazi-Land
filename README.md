# 🌟 Fantazi-Land — Plateforme & Agence de Booking pour Hôtesses d'Exception
### 🚀 Version Officielle 1.0.2 (Main Deployment)

[![Version](https://img.shields.io/badge/version-1.0.2-gold?style=for-the-badge)](https://github.com/elmannaham/Fantazi-Land)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Storage-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Base44](https://img.shields.io/badge/Base44-Workflow_%26_CRM-FF5722?style=for-the-badge)](https://app.base44.com/apps/6a8ea8ad929a72d7ec63fc9d)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.3-black?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

**Fantazi-Land** est une plateforme web moderne et haut de gamme (site vitrine marketing + application SaaS complète) conçue pour une agence de booking d'hôtesses d'exception et d'égéries. Elle automatise l'indexation, la synchronisation et la gestion des profils à partir du bucket **Supabase Storage (`HOTESS`)** et connecte les flux utilisateurs au CRM **Base44**.

🔗 **Application Base44 liée :** [Base44 Booking App (ID: `6a8ea8ad929a72d7ec63fc9d`)](https://app.base44.com/apps/6a8ea8ad929a72d7ec63fc9d)

---

## 🎯 Fonctionnalités Principales

### 🌐 1. Expérience Visuelle & Design System 21st.dev
* **Hero Section Haute Couture** : Arrière-plan radial sombre, lueur diffuse (*ambient glow*), typographie Poppins et dégradés multicolores (*#ffffff ➔ #e65c9f ➔ #fddc6d*).
* **Sélection Prestige Bento Grid** : Mise en valeur du profil star avec badges temps réel, tarifs et cartes secondaires aux avatars 1:1.
* **Grille de Profils Rectangulaire & Avatars 1:1** : Présentation au ratio carré strict (`aspect-square`), avec badges flottants de disponibilité, note moyenne et actions rapides de réservation.
* **Barre de Filtres par Catégorie** : Filtres interactifs (*Photographie, Vidéographie, Contenu Mode, Beauté, Lifestyle, Gaming*) animés avec `layoutId="activeFilterPill"` sous Framer Motion.
* **Modal de Réservation Interactif** : Calculateur de devis instantané avec sélecteur de date, curseur de durée, formulaire client et confirmation immédiate.

### 📸 2. Galerie Photos Exclusive du Bucket `HOTESS`
* **Synchronisation Directe du Stockage** : Affichage des photos et books réels des hôtesses (*Alisha, Euphoria, SHANEL, Sunday, Sushi*).
* **Mélange Aléatoire (Shuffle)** : Bouton interactif pour réorganiser dynamiquement l'ordre des clichés.
* **Double Mode d'Affichage** :
  * **Grille HD** : Cartes photos avec effet de zoom au survol et favoris.
  * **Carrousel 3D Cylindrique** : Rotation interactive à 360° pour une immersion totale.
* **Visionneuse Lightbox Plein Écran** : Navigation fluide avec flèches précédentes/suivantes et raccourcis clavier (Flèches & Échap).

### ⚡ 3. Moteur de Synchronisation Optimisé
* **Scan Asynchrone Parallèle** : Analyse simultanée de tous les dossiers du bucket Supabase Storage.
* **Extraction Automatique des Métadonnées** : Téléchargement et parsing résilient des fichiers `descrip.json` / `descrip.txt` (tarifs, bios, devises, contacts Telegram/Instagram).
* **Cache Mémoire à Ultra-Haute Vitesse (TTL 30s)** : Réponses instantanées (0 ms) sans surcharger l'API Supabase.
* **Route Admin Dédiée** : `GET /api/admin/sync` pour le monitoring et `POST /api/admin/sync` pour déclencher une réindexation en 1 clic.

---

## 🛠️ Stack Technologique

| Couche | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend API** | Next.js 14 API Routes, [Zod](https://zod.dev/) (Validation runtime), Architecture en couches (Repositories & Services) |
| **Base de Données** | [PostgreSQL (Supabase)](https://supabase.com/) avec RLS et triggers de mise à jour |
| **Stockage & Fichiers** | Supabase Storage (Bucket `HOTESS`) |
| **Intégration Externe** | [Base44 API](https://app.base44.com/apps/6a8ea8ad929a72d7ec63fc9d) (CRM & Workflows) |
| **Qualité & Tests** | [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) (E2E), TypeScript strict |
| **Déploiements** | Vercel, Base44, Cloudflare, Render, Wasmer |

---

## 🚀 Démarrage Rapide

### 1. Installation
```bash
# Cloner le dépôt
git clone https://github.com/elmannaham/Fantazi-Land.git
cd Fantazi-Land

# Installer les dépendances
npm install
```

### 2. Variables d'Environnement (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://uytihmscyjpwpdhqvnbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

BASE44_API_URL=https://agence-de-booking-crud-ec63fc9d.base44.app/api
BASE44_API_KEY=5f77c7690c884054ba1d3f2c75961284

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Lancer l'Application & la Synchronisation
```bash
# Lancer le serveur de développement
npm run dev

# Exécuter la synchronisation complète du bucket
node scripts/sync-all-storage-profiles.cjs

# Vérification des types TypeScript
npm run type-check
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🚢 Options de Déploiement Multi-Plateforme

Fantazi-Land intègre les configurations prêtes à l'emploi pour tous les grands environnements de déploiement cloud :

### 1. 🔺 Vercel (Recommandé)
* **Configuration** : [`vercel.json`](./vercel.json)
* **Déploiement** :
  ```bash
  vercel deploy --prod
  ```
* Support natif de l'App Router Next.js 14, fonctions serverless et région Paris (`cdg1`).

### 2. ⚡ Base44 App Engine & Conteneur
* **Configuration** : [`Dockerfile`](./Dockerfile) & [`.dockerignore`](./.dockerignore)
* **Build Docker** :
  ```bash
  docker build -t fantazi-land:latest .
  docker run -p 3000:3000 fantazi-land:latest
  ```

### 3. ☁️ Cloudflare (Pages / Workers)
* **Configuration** : [`wrangler.toml`](./wrangler.toml)
* **Déploiement** :
  ```bash
  npx @cloudflare/next-on-pages
  npx wrangler pages deploy .vercel/output/static --project-name=fantazi-land
  ```

### 4. 🟣 Render.com (Web Service)
* **Configuration** : [`render.yaml`](./render.yaml)
* **Déploiement** : 1-clic via **New > Blueprint** sur [dashboard.render.com](https://dashboard.render.com). Build et health check automatiques (`/api/admin/sync`).

### 5. 🌐 Wasmer (Edge & WebAssembly)
* **Configuration** : [`wasmer.toml`](./wasmer.toml)
* **Déploiement** :
  ```bash
  wasmer deploy
  ```

---

## 📄 Licence
© **Fantazi-Land** — Tous droits réservés.
