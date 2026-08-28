# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📋 Projet: Fantazi-Land — Plateforme & Agence de Booking pour Hôtesses d'Exception

**Description :** Application web full-stack de pointe pour une agence d'hôtesses et d'égéries de marque. Elle offre un site vitrine avec animations 21st.dev, une galerie photos interactive issue du bucket Supabase Storage (`HOTESS`), un système de réservation avec modal interactif et devis en temps réel, un moteur de synchronisation automatique et une intégration avec le CRM Base44.

**Statut :** Version 1.0.2 (Main Official Release) — Production-ready & Image Optimized  
**Mainteneur :** Lead Developer & Claude Code  
**Date de dernière mise à jour :** 2026-08-28  

---

## 🚦 Statut d'Implémentation & Architecture

| Composant | Status | Notes |
|---|---|---|
| **Design System & UI 21st.dev** | ✅ Complète | Hero gradient glow, Bento Grid, 1:1 Avatar Profile Grid, Category Filter Pills |
| **Galerie Photos Exclusive** | ✅ Complète | `/portfolio` : Photos réelles du bucket `HOTESS`, ordre aléatoire, vue 3D cylindrique, Lightbox HD |
| **Modal de Réservation** | ✅ Complète | `BookingModal.tsx` : Date picker, slider de durée, tarification live, soumission API |
| **Moteur de Synchronisation Storage** | ✅ Complète | `sync.service.ts` : Scan asynchrone parallèle, parsing `descrip.json`/`txt`, cache TTL 30s |
| **API Routes & Admin Monitoring** | ✅ Complète | `/api/profiles`, `/api/bookings`, `/api/reviews`, `/api/admin/sync`, `/admin` |
| **Multi-Plateforme Deployment** | ✅ Prêt | Configs prêtes : Vercel (`vercel.json`), Base44 (`Dockerfile`), Cloudflare (`wrangler.toml`), Render (`render.yaml`), Wasmer (`wasmer.toml`) |

---

## 🏗️ Stack Technique

- **Front-end** : Next.js 14.2 (App Router), React 18, Tailwind CSS v3.4, Framer Motion v11.3, Lucide Icons.
- **Back-end & API** : Next.js API Routes (Node.js runtime), Zod v3.23 (validation runtime).
- **Base de Données & Stockage** : PostgreSQL & Supabase Storage (Bucket `HOTESS`).
- **CRM & Workflows** : Base44 REST API (App ID: `6a8ea8ad929a72d7ec63fc9d`).
- **Qualité & Typage** : TypeScript 5.5 (mode strict), Vitest, Playwright.

---

## 📁 Structure des Dossiers

```
fantazi-land/
├── app/                            # Next.js 14 App Router
│   ├── (public)/                   # Pages publiques marketing
│   │   ├── layout.tsx              # Root public layout & Navbar
│   │   ├── page.tsx                # Accueil (Hero, Bento, Category Filters, 1:1 Profile Grid, Booking Modal)
│   │   ├── portfolio/page.tsx      # Galerie Photos exclusive du bucket (HD Grid, 3D Carousel, Lightbox)
│   │   ├── about/page.tsx          # Présentation agence & mission
│   │   ├── profiles/[id]/page.tsx  # Fiche détaillée hôtesse + portfolio dédié + réservation
│   │   └── profiles/create/page.tsx# Formulaire de création de profil hôtesse
│   ├── (dashboard)/                # Espace privé hôtesses (/dashboard)
│   ├── admin/                      # Espace administration & monitoring (/admin, /admin/profiles, /admin/activity)
│   └── api/                        # Routes API RESTful
│       ├── profiles/               # GET liste (support include=media_assets), POST création
│       ├── bookings/               # GET, POST réservations
│       ├── reviews/                # GET, POST avis clients
│       ├── admin/sync/             # GET statut, POST déclencheur de synchronisation du bucket
│       └── webhooks/storage-sync/  # Webhook reverse sync Storage
│
├── components/                     # Architecture Atomic Design & 21st.dev
│   ├── atoms/                      # Button, Badge, Card, Rating
│   ├── molecules/                  # CategoryFilterBar, KPICard
│   ├── organisms/                  # ProfileGrid (Avatars 1:1), BentoCreatorGrid, BookingModal, ProfileForm
│   ├── sections/                   # HeroSection, StatsSection, PortfolioTeaserSection
│   ├── navigation/                 # Navbar principale
│   └── ui/                         # 3D Cylinder Carousel (3d-carousel.tsx)
│
├── lib/                            # Logique métier & Services
│   ├── bucket-media.ts             # Registre dynamique des médias du bucket & utilitaires shuffle
│   ├── supabase.ts                 # Clients Supabase (Public & Service Role)
│   ├── types.ts                    # Interfaces TypeScript (Profile, MediaAsset, Booking, Review)
│   ├── schemas.ts                  # Schémas Zod de validation
│   ├── repositories/               # profiles, bookings, reviews, dlq repositories
│   └── services/                   # profiles, sync, bookings, reviews services
│
├── data/                           # Données locales synchronisées
│   └── creators-catalog.json       # Catalogue JSON synchronisé du bucket
│
├── scripts/                        # Scripts CLI
│   └── sync-all-storage-profiles.cjs # Synchronisation instantanée du bucket Supabase
│
├── docs/                           # Documentation technique
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md               # Guide complet Vercel, Base44, Cloudflare, Render, Wasmer
│
├── Dockerfile                      # Image multi-stage production standalone
├── render.yaml                     # Blueprint Render.com Web Service
├── wrangler.toml                   # Configuration Cloudflare Pages
├── wasmer.toml                     # Configuration Wasmer Edge
├── vercel.json                     # Configuration Vercel Edge & Serverless
└── package.json
```

---

## 🚀 Commandes Essentielles

```bash
# Lancer le serveur de développement
npm run dev

# Vérification stricte TypeScript (0 erreur)
npm run type-check

# Exécuter la synchronisation complète du bucket HOTESS
node scripts/sync-all-storage-profiles.cjs

# Lancer la suite de tests
npm run test

# Build de production
npm run build
```

---

## 🚢 Déploiement Multi-Plateforme

### 1. Vercel
- Fichier : [`vercel.json`](./vercel.json)
- Commande : `vercel deploy --prod`

### 2. Base44 App Engine
- Fichier : [`Dockerfile`](./Dockerfile) & [`.dockerignore`](./.dockerignore)
- Commande : `docker build -t fantazi-land:latest .`

### 3. Cloudflare Pages
- Fichier : [`wrangler.toml`](./wrangler.toml)
- Commande : `npx @cloudflare/next-on-pages && npx wrangler pages deploy .vercel/output/static`

### 4. Render.com
- Fichier : [`render.yaml`](./render.yaml)
- Déploiement automatique via Blueprint Git.

### 5. Wasmer
- Fichier : [`wasmer.toml`](./wasmer.toml)
- Commande : `wasmer deploy`
