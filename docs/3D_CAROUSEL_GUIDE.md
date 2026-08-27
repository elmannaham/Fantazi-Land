# 3D Photo Carousel - Guide d'Utilisation

## 📦 Installation

Le composant 3D Carousel est déjà intégré! Aucune installation supplémentaire requise.

### Dépendances
- ✅ `framer-motion` (v11.3.0) - Déjà installée
- ✅ TypeScript - Déjà configuré
- ✅ Tailwind CSS - Déjà configuré

## 🎯 Utilisation

### Import du Composant

```tsx
import { ThreeDPhotoCarousel } from "@/components/ui/3d-carousel"
```

### Utilisation Simple

```tsx
<ThreeDPhotoCarousel
  cards={[
    "https://images.unsplash.com/photo-1...",
    "https://images.unsplash.com/photo-2...",
    "https://images.unsplash.com/photo-3...",
  ]}
/>
```

### Avec Callback

```tsx
<ThreeDPhotoCarousel
  cards={images}
  onImageClick={(imgUrl, index) => {
    console.log(`Image ${index} clicked:`, imgUrl)
    // Votre logique personnalisée ici
  }}
  autoRotate={false}
/>
```

### Props Disponibles

| Prop | Type | Description | Défaut |
|------|------|-------------|--------|
| `cards` | `string[]` | Tableau des URLs des images | - |
| `onImageClick` | `(imgUrl: string, index: number) => void` | Callback au clic sur une image | - |
| `autoRotate` | `boolean` | Rotation automatique (à implémenter) | `false` |

## ✨ Fonctionnalités

### Interactivité
- 🖱️ **Drag & Drop** - Glissez pour faire tourner le carrousel
- 🖱️ **Click to Expand** - Cliquez sur une image pour l'agrandir
- 📱 **Responsive** - S'adapte aux petits écrans (mobile)
- ⚡ **Smooth Animations** - Animations fluides avec Framer Motion

### Effets Visuels
- 🎬 **3D Transform** - Rotation 3D réaliste
- 🎨 **Blur Effect** - Effets de flou au chargement
- 🌟 **Smooth Transitions** - Transitions d'overlay élégantes
- 📐 **Cylindrical Layout** - Disposition cylindrique en 3D

## 📍 Pages Utilisant le Composant

### 1. Portfolio Page (`/portfolio`)
- **URL**: `http://localhost:3000/portfolio`
- **Fonctionnalités**:
  - Sélection des créateurs dans la sidebar
  - Affichage du 3D carousel pour chaque créateur
  - Statistiques des créateurs (projets, rating, tarif)

### 2. Demo Component
- **Path**: `components/ui/3d-carousel-demo.tsx`
- **Usage**: Vous pouvez l'importer et l'utiliser partout

## 🎨 Personnalisation

### Modifier les Couleurs

Dans `components/ui/3d-carousel.tsx`, ligne 70-74:

```tsx
// Changer bg-slate-900 par votre couleur
className="flex h-full items-center justify-center bg-slate-900"
```

Options Tailwind:
- `bg-purple-900`
- `bg-slate-900` (défaut)
- `bg-gray-900`
- `bg-black`

### Modifier la Taille du Carrousel

Ajustez `cylinderWidth` dans le composant:

```tsx
const cylinderWidth = isScreenSizeSm ? 1100 : 1800
```

### Modifier les Animations

Changez `duration` et `transition` (lignes 56-57):

```tsx
const duration = 0.15 // Vitesse en secondes
const transition = { 
  duration, 
  ease: [0.32, 0.72, 0, 1], 
  filter: "blur(4px)" 
}
```

## 🚀 Cas d'Usage

### 1. Portfolio de Créateurs
```tsx
<ThreeDPhotoCarousel
  cards={creatorPortfolioImages}
  onImageClick={(img, idx) => trackPortfolioView(creatorId, idx)}
/>
```

### 2. Galerie de Produits
```tsx
<ThreeDPhotoCarousel
  cards={productImages}
  onImageClick={(img) => goToProductDetail(img)}
/>
```

### 3. Showcase de Projets
```tsx
<ThreeDPhotoCarousel
  cards={projectShowcaseImages}
  onImageClick={(img, idx) => openProjectModal(idx)}
/>
```

## 🔧 Dépannage

### Les images ne chargent pas
- Vérifiez que les URLs sont valides
- Vérifiez CORS sur votre serveur d'images
- Utilisez HTTPS si possible

### Performance lente
- Optimisez la taille des images (compression)
- Limitez le nombre de cartes (max 10-15 recommandé)
- Utilisez un CDN pour les images

### Rotation bizarre sur mobile
- C'est normal sur petits écrans
- Le cylindre se réajuste automatiquement

## 📱 Responsive Design

Le composant s'adapte automatiquement:
- **Mobile** (< 640px): Cylindre plus petit
- **Tablet** (640px - 1024px): Taille moyenne
- **Desktop** (> 1024px): Taille maximale

## 🎯 Accessibility

- ✅ Clavier navigable (déjà implémenté avec Framer Motion)
- ✅ Images avec alt text
- ✅ Semantic HTML
- ⚠️ À ajouter: ARIA labels pour l'overlay

## 📚 Ressources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [3D CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotate3d)
- [Tailwind CSS](https://tailwindcss.com/)

## 🐛 Bug Report

Si vous trouvez un bug:
1. Décrivez l'étape pour le reproduire
2. Regardez la console du navigateur
3. Vérifiez que framer-motion est à jour

## ✅ Checklist d'Intégration

- [x] Composant créé et typé
- [x] Page Portfolio implémentée
- [x] Lien navbar ajouté
- [x] TypeScript compilation OK
- [x] Responsive design testé
- [ ] Tests unitaires (à faire)
- [ ] E2E tests (à faire)
- [ ] Optimisation images (à faire)

---

**Version**: 1.0  
**Last Updated**: 2026-08-26  
**Maintained by**: Development Team
