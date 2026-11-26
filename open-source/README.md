# 🎬 VideoFlow Studio

**Studio de création vidéo assistée par IA** — planifiez, générez, *swappez* et assemblez vos vidéos au même endroit.

VideoFlow Studio centralise le script, les prompts visuels, les paramètres de *swap* et la structure de montage dans un seul espace de travail : un storyboard ordonné, un suivi d'avancement plan par plan, et un plan de production exportable que n'importe quel moteur externe peut consommer.

> Édition open source (licence MIT). Le studio fonctionne **sans aucune clé d'API** : le mode brouillon / planification est complet, les moteurs de génération, de swap et de montage se branchent ensuite via des webhooks.

---

## ✨ Fonctionnalités

- **Projets vidéo** — format vertical `9:16` ou horizontal `16:9`, cadence (24 / 25 / 30 / 50 / 60 fps), statut de production, brief, preset d'export.
- **Storyboard / plans** — ordre, durée, type de plan (génération, swap, clip existant, montage), accroche, voix off, action, prompt visuel, notes de cohérence.
- **Swap encadré** — type de swap (visage, personnage, élément/arrière-plan), références source et cible, zones à préserver, et **attestation de consentement obligatoire** avant enregistrement. Un point de contrôle « Conformité swap » signale tout plan non attesté.
- **Montage** — transitions, rythme, sous-titres, piste audio, durée totale calculée automatiquement, presets d'export (résolution, débit, conteneur, sous-titres incrustés).
- **Plan de production exportable** — JSON versionné (`videoflow.production_plan/v1`) avec checklist qualité, prêt à être envoyé à un moteur externe.
- **Suivi de rendu** — chaque plan porte un statut (`draft`, `queued`, `rendered`, `review`) alimenté par le webhook entrant.

## 🧱 Stack

| Couche | Technologie |
| :--- | :--- |
| Frontend | Next.js 16 (App Router), React 18, Tailwind CSS, lucide-react |
| API | Next.js Route Handlers |
| Base de données | PostgreSQL + Prisma (enum + 3 modèles) |
| Validation | Zod |

## 🚀 Démarrage rapide

### Option A — Docker Compose (recommandé)

```bash
docker compose up -d
# http://localhost:3000
```

Le service `app` installe les dépendances, applique le schéma Prisma, insère le jeu de démonstration (1 projet, 3 presets) puis lance `next dev`. Les données sont persistées dans le volume `videoflow_data`.

Pour changer le port hôte : `APP_PORT=3010 docker compose up -d`.

### Option B — En local

```bash
npm install
cp .env.example .env      # renseigne DATABASE_URL (PostgreSQL accessible)
npx prisma db push
npm run db:seed           # optionnel : projet + presets de démonstration
npm run dev               # http://localhost:3000
```

Production : `npm run build && npm start`.

> **Accès via un reverse proxy / tunnel** : Next.js 16 bloque par défaut les requêtes cross-origin vers les assets du serveur de développement. Renseignez `ALLOWED_DEV_ORIGINS` (hôtes séparés par des virgules) pour les autoriser, par exemple `ALLOWED_DEV_ORIGINS=studio.exemple.com docker compose up -d`.

## 🗂️ Structure

```
app/
  page.tsx                      # espace de travail (route /)
  api/studio/                   # projets, plans, réordonnancement, presets, export, webhook
components/studio/              # UI : workspace, liste des plans, éditeur, montage, export
lib/studio/
  constants.ts                  # libellés et couleurs des statuts
  plan.ts                       # durées, timecodes, checklist, plan de production
  service.ts                    # validation + accès Prisma
  types.ts                      # types partagés
prisma/
  schema.prisma                 # Project, SceneShot, ExportPreset
  seed.ts                       # jeu de démonstration idempotent
```

## 🔌 API

| Méthode | Route | Rôle |
| :--- | :--- | :--- |
| `GET` / `POST` | `/api/studio/projects` | Lister / créer un projet |
| `GET` / `PATCH` / `DELETE` | `/api/studio/projects/[id]` | Détail, mise à jour, suppression |
| `POST` | `/api/studio/projects/[id]/shots` | Ajouter un plan |
| `POST` | `/api/studio/projects/[id]/shots/reorder` | Réordonner les plans |
| `PATCH` / `DELETE` | `/api/studio/shots/[id]` | Mettre à jour / supprimer un plan |
| `GET` | `/api/studio/presets` | Presets d'export |
| `POST` | `/api/studio/projects/[id]/export` | Construire le plan de production (`{ dispatch: true }` pour l'envoyer au moteur) |
| `POST` | `/api/studio/webhooks/render-status` | Retour de statut d'un moteur externe |

### Brancher un moteur externe

1. Renseignez `engine_webhook_url` sur le projet (champ « Moteur externe »).
2. `POST /api/studio/projects/[id]/export` avec `{ "dispatch": true }` envoie le plan de production à cette URL.
3. Le moteur renvoie l'avancement :

```bash
curl -X POST http://localhost:3000/api/studio/webhooks/render-status \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $STUDIO_WEBHOOK_SECRET" \
  -d '{"shot_id":"<uuid>","status":"rendered","notes":"Plan rendu en 1080x1920"}'
```

`STUDIO_WEBHOOK_SECRET` est optionnel : s'il est défini, l'en-tête `x-webhook-secret` devient obligatoire.

## ⚖️ Swap : droits et consentement

Toute opération de swap sur une personne réelle exige des **droits** et un **consentement explicite** documentés. L'interface bloque l'enregistrement d'un plan de swap sans attestation, et la checklist du plan de production le vérifie. Vous restez responsable de l'obtention de ces autorisations.

## 📄 Licence

[MIT](./LICENSE)
