# Prompts Individuels de Génération d'Écrans

Chaque prompt ci-dessous peut être utilisé directement avec Claude ou un outil de génération UI pour créer les écrans spécifiques.

---

## 1️⃣ Page d'Accueil (Home)

```
Générer la page d'accueil de Fantazi-Land - plateforme de booking pour créatrices de contenu.

## Spécifications Techniques
- Framework: Next.js 14 App Router
- Styling: Tailwind CSS v3+
- Animation: Framer Motion
- Format: Composant React TypeScript
- URL: /

## Contenu et Layout

### 1. Hero Section (Full width)
- Image background avec gradient overlay (noir 30% opacity)
- Titre principal "Découvrez nos créatrices"
- Sous-titre "Les meilleures créatrices pour vos projets"
- Search box centré avec placeholder "Rechercher par nom ou catégorie..."
- 3 filtres rapides: Catégorie, Prix, Localisation
- CTA buttons en bas: "Explorer" + "En savoir plus"

### 2. Grid de Profils
- Responsive: 1 colonne (mobile) → 2 (tablet) → 3+ (desktop)
- Chaque carte affiche:
  - Avatar circulaire (top)
  - Nom (font-semibold)
  - Catégorie (badge avec couleur)
  - Note ⭐ (ex: 4.8/5 - 24 avis)
  - Bio courte (max 80 char, text-sm)
  - Tarif de base "À partir de XXX€"
  - Bouton "Voir profil" prominent
- Hover effect: Scale 1.02 + Shadow augmentée
- Skeleton loaders pendant le chargement

### 3. Filtres Dynamiques (Sidebar ou Collapsible mobile)
- Catégorie (checkbox multi-select)
- Fourchette de prix (range slider)
- Note minimum (rating selector)
- Localisation (search + dropdown)
- Bouton "Réinitialiser filtres"
- Bouton "Appliquer" (mobile only)

### 4. Pagination / Infinite Scroll
- Bottom du grid avec pagination numérotée
- Ou: Intersection Observer pour infinite scroll avec "Charger plus"

### 5. Footer
- Logo + tagline
- Liens rapides (Accueil, À propos, Contact)
- Newsletter signup
- Réseaux sociaux

## Données à Afficher
```typescript
interface Profile {
  id: string
  name: string
  category: ProfileCategory
  avatar_url?: string
  base_rate?: Decimal
  bio?: string
  avg_rating?: Decimal
  review_count: number
  instagram_url?: string
}
```

## Validations et Erreurs
- Loader state pendant le fetch
- Error state avec message et bouton retry
- Empty state si aucun résultat (illustration + message)

## Comportements et Interactions
- Debounce de 300ms sur la search
- Smooth transition lors du changement de filtre
- Page URL params pour shareable filters (ex: ?category=photo&price=100-500)
- Meta tags SEO (dynamiques selon filtres)

## Accessibilité
- Labels explicites sur tous les inputs
- Keyboard navigation complète
- ARIA labels sur les cartes
- Focus visible sur tous les éléments interactifs
- Alt text sur les images

Retour: Composant React TypeScript + Types + Tests Playwright pour les filtres
```

---

## 2️⃣ Détail Profil (Profile Detail)

```
Générer la page détail profil pour Fantazi-Land.

## Spécifications
- Framework: Next.js 14
- URL: /profiles/[id]
- State: Non authentifié (public)
- Format: Page Server Component + Client Components

## Layout et Contenu

### 1. Header Section (Parallax on scroll)
- Image de couverture (16:9 ratio) avec parallax effect au scroll
- Avatar circulaire large (~120px) au-dessus de l'image avec border blanc 4px
- Overlay gradient (bottom) avec infos rapides:
  - Nom (h1, bold)
  - Catégorie (badge color)
  - Note ⭐ (5.0 ⭐ • 42 avis)
  - Location badge (optionnel)

### 2. Sticky Header (au scroll)
- Collapsé: Avatar small (40px) + Nom + Bouton "Réserver" floating
- Reste collé au scroll, background blur semi-transparent

### 3. Contenu principal (2 colonnes sur desktop, 1 sur mobile)

#### Column 1 (Gauche - Main)
- **Présentation:**
  - Bio complète (formatée, avec line breaks)
  - Spécialités (tags/badges list)
  - Années d'expérience (if available)

- **Tarification:**
  - Table avec types de prestations:
    | Prestation | Durée | Prix |
    | --- | --- | --- |
    | Session photoshoot | 2h | €450 |
  - Note légale: "À partir de..." + devise
  - Bouton "Demander un devis"

- **Portfolio/Galerie:**
  - Grid 3 colonnes d'images (6-12 images)
  - Hover: Darken + Play icon (si vidéo)
  - Click: Ouvrir lightbox/modal
  - Lazy loading images

- **Calendrier Disponibilité:**
  - Mini calendar (date picker)
  - Slots verts = disponible
  - Slots gris = indisponible
  - Afficher prochaines disponibilités (ex: "Disponible demain à 14h")

#### Column 2 (Droite - Sidebar)
- **Quick Info Card:**
  - Réponse time (ex: "Répond en 2h")
  - Taux d'annulation (ex: "0.5%")
  - Membre depuis (ex: "Depuis mars 2024")

- **Réseaux Sociaux:**
  - Icons cliquables vers Instagram/TikTok/Twitter/Website
  - Follower count si disponible

- **Réservation Quick CTA:**
  - Card sticky avec:
    - Tarif/jour ou per session
    - Bouton "Réserver une session" prominent (rose/pink)
    - Bouton "Contacter" secondary
  - Au scroll, devient sticky top

- **Reviews Summary:**
  - Distribution étoiles (graphique barres)
  - Score global gros
  - "X avis vérifiés"

### 4. Section Avis Récents
- Liste des 5 derniers avis:
  - Avatar client
  - Nom, Note ⭐⭐⭐⭐⭐
  - Texte (max 150 char, truncate avec "Lire plus")
  - Date relative ("Il y a 2 semaines")
  - "Voir tous les avis" link

### 5. Footer
- CTA buttons centré:
  - "Réserver maintenant" (primary)
  - "Contacter directement" (secondary)

## Données et Types
```typescript
interface ProfileDetail {
  id: string
  name: string
  category: ProfileCategory
  avatar_url?: string
  cover_image_url?: string
  bio?: string
  base_rate?: Decimal
  currency: string
  instagram_url?: string
  tiktok_url?: string
  twitter_url?: string
  website_url?: string
  member_since: DateTime
  avg_rating?: Decimal
  media_assets: MediaAsset[]
  reviews: Review[]
  availability_calendar?: Json
}
```

## Comportements
- Parallax au scroll sur header (translateY)
- Sticky header au scroll avec smooth transition
- Lightbox au click sur image (prev/next navigation)
- Loading state: skeleton pour toutes les sections
- Error state: message + retry button

## SEO
- Meta tags dynamiques (name, bio, image)
- Structured data (JSON-LD Schema.org)
- Open Graph pour sharing (image, description)

## Accessibilité
- Heading hierarchy correct (h1 nom, h2 sections)
- Image alt text
- Keyboard navigation complète
- Focus management lors de lightbox

Retour: Page React TypeScript + Server Component + Client Components + Types
```

---

## 3️⃣ Dashboard Créatrice

```
Générer le dashboard créatrice pour Fantazi-Land.

## Spécifications
- URL: /dashboard
- Role: creator
- Protected: Oui (authentification requise)
- Format: Server Component + Widgets

## Layout

### 1. Header
- Titre "Mon Dashboard"
- Date du jour + greeting personnalisé ("Bonjour, Marie")
- Avatar + dropdown menu (Profil, Paramètres, Logout)

### 2. KPI Cards (Grille 4 colonnes)
Chaque carte affiche:
- Icône
- Valeur grande et gras
- Label
- Trend indicator (↑ +12% vs. mois dernier)
- Hover: Subtle background change

**Cards à afficher:**
1. Réservations ce mois
   - Nombre (ex: 12)
   - Icône: Calendar
   - Trend: +3 vs mois dernier

2. Revenue ce mois
   - Montant (ex: €2,450)
   - Icône: Euro
   - Trend: +18%

3. Note moyenne
   - Nombre (ex: 4.8/5)
   - Icône: Star
   - Sous-titre: "24 avis"

4. Profile Views
   - Nombre (ex: 348)
   - Icône: Eye
   - Trend: +42 this week

### 3. Section Réservations Récentes
- Titre "Réservations à gérer"
- Mini tableau (5 dernières réservations):
  - Client name + avatar small
  - Date/Heure
  - Durée
  - Tarif (€)
  - Status badge (Pending=yellow, Confirmed=green, Completed=blue)
  - Actions: ⋯ menu (View, Accept, Decline, Reschedule)

- "Voir toutes les réservations" link en bas

### 4. Section Avis Récents
- Titre "Avis reçus"
- Cards avec:
  - Nom client + avatar
  - Note ⭐⭐⭐⭐⭐
  - Citation (max 100 char)
  - Date relative
  - Action: "Répondre" link

- "Voir tous les avis" link

### 5. Quick Actions (Buttons Grid)
- 4 boutons:
  1. "Éditer mon profil" → /dashboard/profile/[id]/edit
  2. "Ajouter disponibilité" → /dashboard/settings (modal)
  3. "Consulter factures" → /dashboard/invoices
  4. "Voir calendrier" → /dashboard/calendar

### 6. Footer Stats
- Graph: Revenue trend (7 derniers jours ou mois)
- Statistiques: Completion rate, Cancellation rate, Avg rating evolution

## Données à Afficher
```typescript
interface DashboardData {
  bookings_count: number
  revenue_month: Decimal
  avg_rating: Decimal
  review_count: number
  profile_views: number
  recent_bookings: Booking[]
  recent_reviews: Review[]
}
```

## Comportements
- Loader state: Skeleton cards pendant le fetch
- Auto-refresh des données (optional: polling toutes les 30s)
- Notifications toast pour actions (accept, decline booking)
- Click sur réservation: Ouvrir drawer avec détails complets

## Responsive
- Mobile (1 colonne pour KPIs)
- Tablet (2 colonnes KPIs)
- Desktop (4 colonnes KPIs)

Retour: Composant React TypeScript + Types + API integration
```

---

## 4️⃣ Éditeur de Profil

```
Générer le formulaire d'édition de profil.

## Spécifications
- URL: /dashboard/profile/[id]/edit
- Method: GET (load) + PUT (save)
- Format: Client Component avec useForm + Zod validation
- Framework: React Hook Form + Zod

## Layout: Formulaire avec Tabs ou Sections

### Tab 1: Infos Basiques
- **Avatar Upload:**
  - Current image display (circular, 120px)
  - Drag-drop zone
  - File input (accepted: image/jpeg, image/png, max 5MB)
  - Preview avant upload
  - Button "Supprimer"

- **Nom (Input Text)**
  - Requis
  - Min 2, Max 50 caractères
  - Validation: erreur si vide ou trop long

- **Catégorie (Select Dropdown)**
  - Options: Photo, Vidéo, Influencer, Model, etc.
  - Requis
  - Multi-select optionnel

- **Bio (Textarea)**
  - Min 50, Max 500 caractères
  - Counter "150/500"
  - Markdown support (bold, italic, links)
  - Preview live en dessous

### Tab 2: Tarification
- **Tarif de base (Input Number)**
  - Requis
  - Min 0.01
  - Format: "€ 450.00"
  - Label "À partir de..."

- **Devise (Select)**
  - Options: EUR, USD, GBP, etc.
  - Default: EUR

- **Options de tarification (Optional):**
  - Table pour ajouter services avec durée + prix
  - Add row / Remove row buttons
  - Validation: tous champs requis par row

### Tab 3: Galerie & Media
- **Image Gallery:**
  - Drag-drop zone pour uploader images
  - Liste des images actuelles (grid 3 col)
  - Chaque image avec:
    - Thumbnail
    - Delete button
    - Drag handle (reorder)
  - Upload progress bar
  - Video URL support (optionnel)

### Tab 4: Disponibilité
- **Calendrier Interactive:**
  - Date picker avec calendar UI
  - Sélectionner plages horaires par jour
  - Time slots (ex: 09:00-12:00, 14:00-18:00)
  - Récurrence (tout les X jours, semaines, mois)
  - Save slots button

- **Vacation Mode (Toggle):**
  - Désactiver complètement la dispo
  - Message auto-reply optionnel

### Tab 5: Réseaux Sociaux
- **Social Links (Input Text):**
  - Instagram URL
  - TikTok URL
  - Twitter URL
  - Website URL
  - LinkedIn URL (optionnel)
  - Validation: format URL valide

### Tab 6: Paramètres
- **Notifications (Checkboxes):**
  - Recevoir alertes pour nouvelles réservations
  - Recevoir rappels avant réservations
  - Recevoir notifications avis

- **Visibilité (Radio):**
  - Public (visible dans recherche)
  - Private (URL only)

## Validation et Erreurs
- Real-time validation avec Zod
- Error messages clairs et constructifs
- Disabled state sur submit button pendant save
- Toast success "Profil sauvegardé" après submit

## Comportements
- Auto-save draft (localStorage) toutes les 30s
- Warning au unload si changements non sauvegardés
- Loading state: Spinner sur le bouton Save
- Confirmation avant supprimer le profil

## Layout Responsive
- Mobile: Tabs scrollables horizontalement
- Desktop: Tabs normaux

Retour: Composant React TypeScript + useForm hook + Zod schema
```

---

## 5️⃣ Gestion Réservations (Admin/Creator)

```
Générer la page de gestion des réservations.

## Spécifications
- URL: /dashboard/bookings
- Role: creator ou admin
- Format: Data table + Filters + Detail drawer

## Layout

### 1. Header
- Titre "Mes réservations"
- Filter chips: Pending, Confirmed, Completed, Cancelled (toggle)
- Search box: "Rechercher par nom client..."
- Date range picker: "De ... à ..."

### 2. Tableau des Réservations
**Colonnes:**
- Client name + avatar
- Date et Heure (formaté: "Lun 15 Sept à 14:30")
- Durée (ex: "2 heures")
- Tarif (€450.00)
- Status badge (colors: yellow/green/blue/gray)
- Actions: Voir détails (→ drawer)

**Rows interactives:**
- Hover: Background subtle
- Click row: Ouvrir drawer avec détails complets
- Swipe (mobile): Voir actions

### 3. Drawer Détails Réservation
- En-tête: Status badge + Date
- Sections:
  - **Infos Client:**
    - Nom, email, téléphone
    - Avatar
    - Lien vers profil client (si applicable)
  
  - **Détails Réservation:**
    - Date/Heure
    - Durée
    - Tarif
    - Lieu ou plateforme (ex: "Zoom meeting")
  
  - **Notes Spéciales:**
    - Message client (if any)
    - Vos notes internes
  
  - **Actions** (selon status):
    - Si Pending: "Accepter" (green) + "Refuser" (red)
    - Si Confirmed: "Reprogrammer" + "Annuler"
    - Si Completed: "Marquer comme complété"
  
  - **Messages/Thread:**
    - Chat minimal pour communiquer avec client
    - "Envoyer message" input

### 4. Empty States
- "Aucune réservation" si liste vide
- "Aucun résultat" après filtrer
- Illustration + CTA ("Retour aux réservations")

## Données
```typescript
interface Booking {
  id: string
  client_id: string
  profile_id: string
  date: DateTime
  duration_minutes: number
  price: Decimal
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  created_at: DateTime
}
```

## Comportements
- Status colors: pending=yellow, confirmed=green, completed=blue, cancelled=gray
- Auto-refresh (polling ou WebSocket)
- Confirmation modal avant accepter/refuser/annuler
- Toast notification après action réussie
- Undo option (15s) pour actions

## Responsive
- Tableau complet sur desktop
- Card list view sur mobile

Retour: Composant React TypeScript + DataTable + Detail drawer
```

---

## 6️⃣ Dead Letter Queue (Admin)

```
Générer le dashboard Dead Letter Queue pour admin.

## Spécifications
- URL: /admin/failed-syncs
- Role: admin only
- Format: Stats cards + Data table + Detail modal

## Layout

### 1. KPI Cards (3 colonnes)
- **Pending:** Nombre en attente (ex: 5)
- **Retrying:** En cours de retry (ex: 2)
- **Failed:** Définitivement échoués (ex: 1)

### 2. Tableau Failed Syncs
**Colonnes:**
- Timestamp (formaté, ex: "15 Sept 14:30")
- Event Type (ex: "storage_to_db", "db_to_storage")
- Profile ID (ex: "uuid")
- Error Message (truncated, max 100 char)
- Retry Count (ex: "2/3")
- Last Attempted (relative time, ex: "Il y a 5 min")
- Status badge (pending=yellow, retrying=blue, failed=red)
- Actions: Retry, View details, Delete

### 3. Detail Modal (au click sur row)
- Title: Event type + Timestamp
- **Erreur complète:**
  - Message complet
  - Stack trace (code block)
  - Error code si applicable

- **Source Data:**
  - JSON payload (expandable, syntax highlight)
  - Copy to clipboard button

- **Historique Tentatives:**
  - Table avec:
    - Attempt # (1, 2, 3...)
    - Timestamp
    - Résultat (Success/Error)
    - Durée (ms)

- **Actions:**
  - "Retry maintenant" button (primary)
  - "Supprimer" button (danger)
  - "Télécharger logs" link (optionnel)

### 4. Filtres (Sidebar ou Collapsible)
- Status (checkbox: Pending, Retrying, Failed)
- Event Type (multi-select)
- Date range (date picker)
- Search profile ID

### 5. Bulk Actions (au select multiple rows)
- "Retry all" button
- "Delete all" button
- Confirmation modals

## Données
```typescript
interface FailedSync {
  id: string
  event_type: string
  error_message: string
  retry_count: number
  max_retries: number
  status: "pending" | "retrying" | "failed" | "resolved"
  source_data: Record<string, any>
  created_at: DateTime
  last_attempted_at?: DateTime
}
```

## Comportements
- Auto-refresh toutes les 30s
- Toast notifications:
  - "Retry en cours..." (ongoing)
  - "Retry réussi" (success)
  - "Retry échoué" (error)
- Exponential backoff indication visuelle
- Confirmation avant supprimer (irreversible)

## Responsive
- Full table on desktop
- Card/stack view on mobile

Retour: Admin component React TypeScript + Modal detail + Auto-refresh logic
```

---

## 7️⃣ Admin - Import CSV

```
Générer la page d'import CSV pour les profils.

## Spécifications
- URL: /admin/profiles/import-csv
- Role: admin only
- Format: Multi-step form

## Layout

### Step 1: Upload CSV
- Titre "Importer des profils en masse"
- Drag-drop zone (large, prominent)
  - Icon upload
  - Text: "Déposez votre fichier CSV ici ou cliquez pour sélectionner"
  - Sous-texte: "Format accepté: .csv | Taille max: 10MB"
- File input (hidden, activé par click zone ou drag)
- Exemple template downloadable (.csv)

### Step 2: Field Mapping (conditionnelle)
**Après upload valide:**
- Titre "Mappage des colonnes"
- Tableau avec colonnes du CSV en haut
- Afficher première ligne comme preview
- Dropdown select pour chaque colonne:
  - Mapping vers champs Profile (name, category, bio, base_rate, instagram_url, etc.)
  - Option "Ignorer cette colonne"
- Validation: colonnes requises mappées (name, category, bio)

### Step 3: Preview & Validation
- Titre "Aperçu et validation"
- Tableau des données parsées (5 premières lignes)
- Afficher erreurs détaillées:
  - Par ligne: "Ligne 3: 'category' invalide (options: Photo, Vidéo, ...)"
  - Summary: "X erreurs trouvées, Y profils prêts"
- Option: "Continuer malgré les erreurs" (skip invalid rows)

### Step 4: Confirmation & Import
- Titre "Prêt à importer"
- Résumé:
  - "Vous allez créer X profils"
  - "Y colonnes seront ignorées"
  - "Z profils ont des erreurs (seront ignorés)"
- Buttons: "Importer" (primary) + "Retour" (secondary)

### Step 5: Results (après import)
- Titre "Import terminé"
- Stats:
  - ✓ X profils créés avec succès
  - ⚠ Y profils avec avertissements (partiellement créés)
  - ✗ Z profils échoués
- Tableau des résultats (scroll):
  - Name, Status (Success/Warning/Error), Message
- Download logs button (.csv ou .json)
- Button "Voir les profils créés" → /admin/profiles

## Validations
```typescript
const CSVSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['Photo', 'Vidéo', 'Influencer', ...]),
  bio: z.string().optional(),
  base_rate: z.number().positive().optional(),
  instagram_url: z.string().url().optional(),
  // ... autres champs
})
```

## Comportements
- Real-time parsing au upload
- Progress bar lors de l'import
- Cancel option pendant l'import
- Résultats détaillés avec erreurs spécifiques
- Undo import (dans les 5 minutes? optionnel)

## Accessibility
- Step indicators (1/5, 2/5, etc.)
- Keyboard navigation complète
- Error messages clairs

Retour: Multi-step form React TypeScript + CSV parser + Zod validation
```

---

## 📝 Comment Utiliser Ces Prompts

1. **Sélectionner le prompt** correspondant à l'écran à générer
2. **Copier le contenu du prompt** (entre les triple backticks)
3. **Envoyer à Claude** via Claude.ai ou API
4. **Ajuster les détails** selon besoins spécifiques du projet

Exemple:
```
@Claude, utilise le prompt ci-dessous pour générer le composant React:

[Coller le prompt]
```

---

## 🔗 Intégration avec le Codebase

Après génération, placer les fichiers:
- **Pages:** `app/[route]/page.tsx`
- **Client Components:** `components/[section]/[Component].tsx`
- **Types:** `lib/types.ts` (ajouter aux types existants)
- **Hooks:** `lib/hooks/[useHook].ts`
- **Tests:** `tests/[component].spec.tsx`

