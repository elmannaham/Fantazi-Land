# Prompt de Génération des Écrans - Fantazi-Land

## Contexte du Projet

**Nom:** Fantazi-Land - Plateforme de Booking pour Créatrices de Contenu  
**Stack:** Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion  
**Architecture:** Design atomique (Atoms → Molecules → Organisms → Pages)  
**Thème:** Moderne, épuré avec micro-interactions fluides

---

## Directives de Design

### Palette de Couleurs
- **Primaire:** Bleu moderne (`#3B82F6` - blue-500)
- **Accent:** Rose/Magenta (`#EC4899` - pink-500)
- **Neutre:** Gris progressif (`#F3F4F6` - light, `#1F2937` - dark)
- **Succès:** Vert (`#10B981`)
- **Alerte:** Orange (`#F97316`)
- **Erreur:** Rouge (`#EF4444`)

### Typographie
- **Headings:** Font-size: `clamp(2rem, 3vw, 3.5rem)` (responsive)
- **Body:** `1rem` (16px), `line-height: 1.6`
- **Font family:** System stack avec fallback à -apple-system, BlinkMacSystemFont, "Segoe UI"

### Espacement
- **Section gap:** `clamp(2rem, 5vw, 6rem)` (responsive vertical)
- **Component padding:** `1rem` (mobile) → `1.5rem` (desktop)
- **Grid columns:** 1 (mobile) → 2 (tablet) → 3+ (desktop)

### Animations
- **Duration:** `300ms` (normal), `150ms` (fast)
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out)
- **Transforms:** Scale 0.98 (click), translate -2px (hover)

---

## Écrans à Générer

### 1. Page d'Accueil (Public)
**URL:** `/`  
**État:** Non authentifié

**Contenu:**
- Hero section avec search/filter profiles
- Grille de cartes créatrices (image, nom, catégorie, note)
- Filtres dynamiques (catégorie, localisation, prix)
- Pagination ou infinite scroll
- Call-to-action "Bookez maintenant" par profil

**Comportement:**
- Hero image full-width avec gradient overlay
- Cards avec hover effect (scale + shadow)
- Smooth transition lors du changement de filtre
- Skeleton loaders pendant le chargement

**Données affichées:**
- `name`, `category`, `base_rate`, `avatar_url`, `instagram_url`, `avg_rating`

---

### 2. Page Détail Profil (Public)
**URL:** `/profiles/[id]`  
**État:** Non authentifié

**Contenu:**
- En-tête avec avatar large, nom, catégorie, note ⭐
- Bio/description
- Tarification
- Portfolio/galerie media
- Calendrier de disponibilité
- Bouton "Réserver une session" prominent
- Avis clients
- Liens réseaux (Instagram, TikTok, Twitter, Website)

**Comportement:**
- Avatar avec effet de parallax au scroll
- Lightbox pour galerie media
- Sticky "Réserver" button au scroll
- Compteur de vues (optionnel)

**Données affichées:**
- Profil complet + media_assets + reviews + performance_stats

---

### 3. Dashboard Créatrice (Protégé)
**URL:** `/dashboard`  
**État:** Authentifié (role: creator)

**Sections:**
- **Statistiques rapides:**
  - Réservations ce mois
  - Revenue totale
  - Note moyenne
  - Profil views
  
- **Réservations récentes** (tableau/list)
  - Client, date, tarif, statut
  - Actions: Valider, Refuser, Reprogrammer

- **Avis récents** (cards)
  - Note, texte, client, date

- **Quick actions:**
  - Éditer profil
  - Ajouter disponibilité
  - Consulter factures

---

### 4. Gestion Profil (Protégé)
**URL:** `/dashboard/profile/[id]/edit`  
**État:** Authentifié (creator ou admin)

**Champs éditables:**
- Avatar (upload avec preview)
- Nom, bio, catégorie
- Tarif de base, devise
- Calendrier de disponibilité (date picker + slots)
- Galerie (drag-drop images)
- Liens réseaux

**Validations:**
- Bio: 50-500 caractères
- Tarif: nombre positif
- Avatar: image < 5MB, format JPEG/PNG
- Dates: pas dans le passé

**Actions:**
- Sauvegarder (POST/PUT)
- Annuler
- Supprimer profil (confirmation)

---

### 5. Gestion des Réservations (Protégé)
**URL:** `/dashboard/bookings`  
**État:** Authentifié (creator)

**Contenu:**
- Filtre: Pending, Confirmed, Completed, Cancelled
- Tableau avec colonnes:
  - Client
  - Date/Heure
  - Tarif
  - Statut
  - Actions (Accept, Decline, Reschedule, Message)

- Détail réservation (modal/drawer):
  - Infos client
  - Notes spéciales
  - Historique messages
  - Options: Accept, Decline, Reschedule

**Comportements:**
- Statuts avec couleurs (pending=yellow, confirmed=green, etc.)
- Notifications en temps réel (optionnel)

---

### 6. Avis et Notes (Protégé)
**URL:** `/dashboard/reviews`  
**État:** Authentifié (creator)

**Contenu:**
- Statistiques globales:
  - Note moyenne avec distribution étoiles (histogramme)
  - Nombre total d'avis
  - Taux de recommandation
  
- Liste des avis:
  - Nom client
  - Note (⭐⭐⭐⭐⭐)
  - Texte commentaire
  - Date
  - Options: Répondre, Signaler

- Réponses du créateur (thread view)

---

### 7. Dashboard Admin (Protégé)
**URL:** `/admin`  
**État:** Authentifié (role: admin)

**Sections:**
- **KPIs:**
  - Total profils
  - Profils actifs
  - Revenue total
  - Bookings ce mois
  - Taux de synchronisation

- **Actions rapides:**
  - Créer profil manuel
  - Importer CSV
  - Consulter Dead Letter Queue
  - Voir logs

---

### 8. Gestion Profils (Admin)
**URL:** `/admin/profiles`  
**État:** Authentifié (admin)

**Contenu:**
- Tableau tous les profils:
  - ID, Nom, Catégorie, Status (public/private), Actions
  
- Filtres: Catégorie, Status, Date création

- Actions par profil:
  - Voir détails
  - Éditer
  - Activer/Désactiver
  - Supprimer
  - Voir statistiques

---

### 9. Import CSV (Admin)
**URL:** `/admin/profiles/import-csv`  
**État:** Authentifié (admin)

**Contenu:**
- Zone de drop de fichier CSV
- Préview des données (première ligne)
- Mapping champs (sélection colonnes)
- Validation avant import
- Rapport d'import (succès/erreurs)

**Comportement:**
- Drag-drop enabled
- Validation temps réel (format, colonnes requises)
- Progress bar lors de l'import
- Afficher erreurs par ligne

---

### 10. Dead Letter Queue - Écrans Échoués (Admin)
**URL:** `/admin/failed-syncs`  
**État:** Authentifié (admin)

**Contenu:**
- Statistiques DLQ:
  - Pending, Retrying, Failed
  
- Tableau des écrans échoués:
  - Event Type, Erreur, Tentatives, Dernier essai, Actions
  
- Détail écran (modal):
  - Erreur complète
  - Payload source
  - Historique tentatives
  - Actions: Retry, Retry all, Delete, Delete all

- Filtres: Status, Date, Event type

**Comportement:**
- Auto-refresh (30 sec)
- Retry avec exponential backoff visible
- Confirmation avant supprimer

---

### 11. Logs et Monitoring (Admin)
**URL:** `/admin/logs`  
**État:** Authentifié (admin)

**Contenu:**
- Timeline des sync events:
  - Timestamp, Event, Status, Duration, Details
  
- Filtres: Type (storage→db, db→storage), Status, Date range

- Statistiques:
  - Success rate (%)
  - Avg sync duration
  - Erreurs par type

- Search par profile ID ou event ID

---

### 12. Page de Login
**URL:** `/login`  
**État:** Non authentifié

**Contenu:**
- Logo + titre
- Formulaire:
  - Email (validation email)
  - Mot de passe (validation min 8 car)
  - "Se souvenir de moi" (checkbox)
  - Bouton Login
  
- Liens:
  - Créer un compte
  - Mot de passe oublié

- OAuth (optionnel):
  - Login avec Google/GitHub

**Validations:**
- Email valide
- Mot de passe requis
- Messages d'erreur clairs

---

### 13. Page 404
**URL:** `/*` (non trouvé)

**Contenu:**
- Illustration 404
- Message "Page non trouvée"
- Navigation suggestions
- Bouton retour à l'accueil

---

## Spécifications Techniques par Écran

### Composants à Réutiliser (Atoms)
```
- Button (variants: primary, secondary, outline, danger)
- Input (text, email, password, textarea)
- Select / Dropdown
- Checkbox / Radio
- Badge (pour statuts)
- Avatar (avec fallback)
- Rating (étoiles)
- Card (container)
- Modal / Dialog
- Drawer / Sidebar
- Table / DataGrid
- Pagination
- Spinner / Skeleton
- Toast / Alert
- Progress Bar
```

### Hooks Personnalisés
```
- useAuth() → user, role, logout
- useProfiles(filters) → profiles, loading, error
- useBookings(status) → bookings, loading
- useReviews(profileId) → reviews, stats
- useForm(schema) → formState, validation, submit
- useDebounce(value, delay)
- useFetch(url) → data, loading, error
```

### État Global (Zustand)
```
- authStore (user, token, role)
- filtersStore (categoryFilter, priceRange, etc.)
- notificationsStore (toasts, alerts)
```

---

## Critères d'Acceptation

### Tous les écrans doivent avoir:
- ✅ Responsive design (mobile-first)
- ✅ Accessibilité WCAG AA (contraste, labels, keyboard nav)
- ✅ Micro-interactions (hover, focus, click states)
- ✅ Loading states (skeleton, spinner)
- ✅ Error states avec messages clairs
- ✅ Validation formulaire temps réel
- ✅ Gestion des cas vides (no data)
- ✅ Performance (lazy loading images, memoization)

### TypeScript strictness
- ✅ Tous les props typés explicitement
- ✅ Pas de `any` type
- ✅ Union types pour états
- ✅ Zod schema pour données

### Tailwind CSS only
- ✅ Pas de CSS inline
- ✅ Classes réutilisables
- ✅ CSS custom properties pour tokens
- ✅ Dark mode support

---

## Priorité d'Implémentation

**Phase 1 (MVP):**
1. Page d'accueil + Détail profil
2. Dashboard créatrice basique
3. Gestion profil éditeur

**Phase 2:**
4. Dashboard admin + Gestion profils
5. Import CSV
6. Dead Letter Queue

**Phase 3:**
7. Booking management
8. Reviews system
9. Logs & monitoring

---

## Exemple de Prompt pour Claude/Générateur UI

```
Générer l'écran "Détail Profil" pour l'application Fantazi-Land.

Spécifications:
- Framework: Next.js 14 avec App Router
- Styling: Tailwind CSS
- Animation: Framer Motion pour les micro-interactions
- Design system: Voir palette et typographie ci-dessus
- Responsive: Mobile-first (320px+)
- Accessibilité: WCAG AA

Contenu obligatoire:
- Avatar large 9:16 avec parallax au scroll
- Nom, catégorie, note ⭐, bio
- Tarification affichée clairement
- Galerie media (3-6 images) avec lightbox
- Calendrier disponibilité
- Avis clients (3+ derniers)
- Liens réseaux (cliquables)
- Bouton "Réserver" sticky au scroll

Comportements:
- Chargement avec skeleton loaders
- Transition fluide entre sections
- Lightbox pour agrandir images
- Sticky header au scroll
- SEO-friendly (meta tags, structured data)

Retour attendu:
- Composant React avec TypeScript
- Types/interfaces pour les données
- Tailwind classes
- Framer Motion animations
- Accessibilité complète
```

---

## Notes pour Développeurs

1. **Réutilisabilité:** Extraire les composants atomiques réutilisables dans `components/atoms/` et `components/molecules/`

2. **État:** Préférer `useState` local, puis Zustand si partagé entre pages

3. **Données:** Utiliser React Query/SWR pour les appels API (déjà configuré)

4. **Tests:** Chaque écran doit avoir:
   - Tests unitaires des composants (Vitest)
   - Tests d'intégration API (Playwright)
   - Tests d'accessibilité (axe-core)

5. **Performance:**
   - Code splitting par page
   - Image optimization avec Next Image
   - Memoization des composants complexes

6. **Versioning:** Les écrans générés doivent être versionnés avec Git pour tracking des changements de design

---

## Ressources Utiles

- **Design System:** Voir `/docs/DESIGN_SYSTEM.md`
- **API Docs:** Voir `/docs/API.md`
- **Database Schema:** Voir `/docs/DATABASE.md`
- **Components Existing:** Vérifier `/components/` pour composants déjà créés

