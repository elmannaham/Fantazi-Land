# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📋 Projet: Fantazi-Land Mobile

**Description:** React Native mobile companion app to Fantazi-Land booking platform. Profiles, booking management, camera integration, and secure authentication.

**Status:** v1.0.0 — Development  
**Stack:** Expo 57.0.18, React Native 0.86.3, React 19, TypeScript 6.0.3  
**Last Updated:** 2026-09-01

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm start              # Start Expo dev server
npm run android        # Launch on Android
npm run ios            # Launch on iOS
npm run web            # Launch on web
```

### Type Checking & Validation
```bash
tsc --noEmit           # Type check (strict mode enabled)
npx expo lint          # ESLint check
npx prettier --check   # Format check
npx expo-doctor        # Verify Expo + native deps health
```

### Building
```bash
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

### Testing
```bash
npm test               # Run unit tests (Jest)
npm run test:coverage  # With coverage report (80% minimum)
```

---

## 🏗️ Architecture

### Directory Structure
```
fantazi-land-mobile/
├── app/                    # Expo Router routes (file-based navigation)
│   ├── (tabs)/            # Tab-based navigation layout
│   ├── profiles/[id]/     # Dynamic profile detail route
│   ├── booking/[profileId]/ # Dynamic booking modal
│   └── _layout.tsx        # Root layout (splash, permissions, nav)
│
├── components/            # React components (UI-only, no business logic)
│   ├── ProfileCard.tsx
│   └── [other presentational components]
│
├── lib/                   # Business logic, utilities, types
│   ├── types.ts          # Type definitions (Profile, Booking, Review, etc.)
│   ├── schemas.ts        # Zod validation schemas (if used)
│   ├── constants.ts      # App-wide constants
│   ├── camera.ts         # Camera utilities
│   ├── notifications.ts  # Push notification setup
│   └── [other utilities]
│
├── assets/               # Images, icons (splash, icon)
├── android/              # Android native config (gradle, manifest)
├── app.json              # Expo config
├── eas.json              # EAS Build profiles (dev, preview, prod)
├── package.json
└── tsconfig.json
```

### Key Types (lib/types.ts)
- **Profile** — Creator profile with category, rates, social links, availability
- **Booking** — Booking request with status, dates, budget
- **Review** — Client review/rating
- **MediaAsset** — Profile images/videos from Supabase Storage
- **PerformanceStats** — Creator metrics (rating, completion rate, etc.)

### Navigation (Expo Router)
- `/app/(tabs)/` — Tab-based main screens
- `/app/profiles/[id]/` — Individual profile detail
- `/app/booking/[profileId]/` — Booking request modal

Route parameters are **typed and validated** using Zod before use to prevent crashes from invalid deep links.

### State Management
- **Local State:** `useState` for single-screen concerns (form inputs, UI toggles)
- **Global State:** Zustand store for cross-screen state (auth, user profile, cache)
- **Server Data:** Supabase queries (fetch via API, not stored in client state)

---

## 📋 Code Quality Standards

### Pre-Commit Checklist
Before committing:
- [ ] `tsc --noEmit` passes (0 errors in strict mode)
- [ ] `npx expo lint` passes
- [ ] `npx prettier --check` passes (auto-fix with `npx prettier --write`)
- [ ] `npm test:coverage` ≥ 80% coverage
- [ ] No `console.log` in production code
- [ ] No hardcoded secrets (API keys, tokens)
- [ ] No `any` or `unknown` types without narrowing

### Immutability (CRITICAL)
Use **spread operator** for state updates — never mutate objects in-place:

```typescript
// WRONG: mutation
const user = profile;
user.name = 'New Name';
setProfile(user);

// CORRECT: immutability
setProfile({ ...profile, name: 'New Name' });
```

### Error Handling
Handle errors explicitly; never silently swallow:

```typescript
try {
  const result = await fetchProfile(id);
  setProfile(result);
} catch (error) {
  hilog.error('Error loading profile: %{public}s', String(error));
  setError('Failed to load profile. Please try again.');
}
```

### Input Validation
Validate all external input (API responses, deep-link params) with Zod:

```typescript
import { z } from 'zod';

const ProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: z.enum(['Photography', 'Videography', 'Contenu Mode', 'Beauté', 'Lifestyle', 'Gaming']),
});

const data = ProfileSchema.parse(apiResponse);
```

### Component Layout
- One component per file (unless a small private subcomponent)
- Type component props explicitly with `interface Props`
- No business logic in components — delegate to hooks or services

```typescript
interface ProfileCardProps {
  profile: Profile;
  onPress: (id: string) => void;
}

export function ProfileCard({ profile, onPress }: ProfileCardProps) {
  return (
    <Pressable onPress={() => onPress(profile.id)}>
      {/* UI only */}
    </Pressable>
  );
}
```

### Naming Conventions
- Components: `PascalCase` file & export (`ProfileCard.tsx`)
- Utilities/hooks: `camelCase` file (`useProfile.ts`)
- Types/interfaces: `PascalCase` (`Profile`, `BookingStatus`)
- Constants: `UPPER_SNAKE_CASE` (`MAX_BOOKING_DAYS`)

---

## 🔄 Key Libraries & Patterns

### Expo Router (Navigation)
- File-based routing: `app/` directory structure becomes routes
- Type-safe params with Zod validation
- Deep linking support (validate params before use)

```typescript
// app/profiles/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

const Params = z.object({ id: z.string().uuid() });

export default function ProfileScreen() {
  const parsed = Params.safeParse(useLocalSearchParams());
  if (!parsed.success) return <NotFound />;
  // ... fetch and render profile
}
```

### Supabase Integration
- Use `@supabase/supabase-js` for queries
- Store auth tokens in `expo-secure-store` (not AsyncStorage)
- Validate server responses with Zod

### expo-secure-store
Safe persistent storage for auth tokens:
```typescript
import * as SecureStore from 'expo-secure-store';

// Save token
await SecureStore.setItemAsync('auth_token', token);

// Read token
const token = await SecureStore.getItemAsync('auth_token');
```

### React Native Reanimated
Performant animations (runs on UI thread, not JS thread):
```typescript
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withSpring 
} from 'react-native-reanimated';

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

### Zustand (State Management)
Lightweight global state when needed:
```typescript
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

---

## 📱 Platform-Specific Notes

### Permissions (iOS & Android)
- Declared in `app.json` under `plugins` (camera, photo library, notifications)
- Runtime requests happen in `app/_layout.tsx` via `registerForPushNotifications()`
- Respect user denials gracefully

### Camera & Image Picker
- `expo-camera` for camera access
- `expo-image-picker` for photo library access
- Prompts user with permission request (messages in `app.json`)

### Push Notifications
- `expo-notifications` for handling notifications
- Registered during app init in `_layout.tsx`
- Token stored securely for backend push delivery

### Safe Area
- Use `react-native-safe-area-context` to respect notches/home indicators
- Do NOT hardcode safe area offsets

---

## 🧪 Testing

### File Structure
```
tests/
├── unit/              # Isolated utility/hook tests
│   ├── lib/
│   └── hooks/
├── integration/       # API calls, Supabase queries
└── e2e/              # Critical user flows (Maestro/Detox)
```

### Unit Test Example
```typescript
import { renderHook } from '@testing-library/react-native';
import { useProfile } from '@/lib/hooks';

test('useProfile fetches and caches profile', async () => {
  const { result } = renderHook(() => useProfile('123'));
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

### Coverage Target: 80%
- All utilities in `lib/`
- All custom hooks
- Component logic (state, conditionals)
- Critical user flows (booking, auth, profile fetch)

---

## 🚢 Deployment (EAS)

### Profiles (eas.json)
- **development** — Internal debug build with dev client
- **preview** — Beta testing (APK on Android, AD-HOC on iOS)
- **production** — App Store / Play Store release (app-bundle on Android)

### Build Commands
```bash
# Preview build
eas build --platform android --profile preview

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

### Pre-Release Checklist
- [ ] `tsc --noEmit` clean
- [ ] `npx expo lint` clean
- [ ] `npm test:coverage` ≥ 80%
- [ ] `npx expo-doctor` healthy (no deprecated APIs or mismatched versions)
- [ ] Critical flows tested on physical devices (iOS + Android)
- [ ] No secrets in bundle (check `.env` usage)
- [ ] Version bumped in `app.json` (for App Store review)

---

## 🔐 Security

### Secrets
- **NEVER** hardcode API keys or tokens in source code
- Use EAS Secrets for build-time secrets (database URLs, API endpoints)
- Reference via `process.env.EXPO_PUBLIC_*` (public, visible to client) or build-only vars
- Store auth tokens in `expo-secure-store`, not `AsyncStorage`

### Data Validation
Every external input is validated:
- API responses → Zod schema
- Deep-link params → Zod schema
- User form input → Zod schema before submit

### Network Security
- HTTPS only (enforced by default)
- Validate SSL certificates
- Implement request timeout + retry logic

---

## 🏛️ Troubleshooting

### Build/Runtime Errors

#### "Cannot find module" or type errors after pulling
```bash
npm install              # Reinstall deps
npx expo install         # Sync Expo SDK with native deps
tsc --noEmit             # Re-check types
```

#### Expo cached state issues
```bash
expo start -c            # Clear cache
npx expo-doctor          # Verify Expo + native deps
```

#### Port 8081 already in use (Expo)
```bash
npm start -- -p 8082     # Use different port
```

#### "New Architecture not compatible" errors
- Verify all native dependencies are New Architecture compatible (SDK 55+)
- Check Expo SDK changelog for breaking changes
- Run `npx expo-doctor` to identify conflicts

#### Android/iOS build fails
1. Clean: `eas build --platform android --clear-cache`
2. Check native deps: `npx expo install --check`
3. Verify signing credentials in Xcode (iOS) or Google Play Console (Android)

### Performance

#### App starts slowly
- Profile with Hermes profiler (enabled by default on Expo SDK 53+)
- Defer non-critical work with `InteractionManager.runAfterInteractions()`
- Lazy-load heavy screens

#### FlatList renders slowly
- Provide `keyExtractor` that returns stable keys
- Memoize `renderItem` callback
- Use `removeClippedSubviews` for long lists
- Consider `FlashList` (Shopify) for very large lists

---

## 📚 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `app.json` | Expo config (name, version, permissions, plugins, icon/splash) |
| `eas.json` | EAS Build profiles (dev, preview, production) |
| `tsconfig.json` | TypeScript config (strict mode, path aliases) |
| `app/_layout.tsx` | Root layout (splash, permissions, navigation setup) |
| `lib/types.ts` | Type definitions for Profile, Booking, Review, etc. |
| `lib/notifications.ts` | Push notification registration |
| `lib/camera.ts` | Camera utilities |
| `package.json` | Dependencies, scripts |

---

## 🎓 Learning Resources

- **Expo Docs (v57):** https://docs.expo.dev/versions/v57.0.0/
- **React Native:** https://reactnative.dev/docs/getting-started
- **Expo Router:** https://expo.github.io/router
- **Supabase:** https://supabase.com/docs
- **Zod Validation:** https://zod.dev/
- **React Native Reanimated:** https://docs.swmansion.com/react-native-reanimated/
- **Zustand:** https://github.com/pmndrs/zustand

---

## 🤔 Questions?

- **Navigation question?** Check Expo Router docs (link above) or `/app` directory structure
- **Type question?** Check `lib/types.ts` for domain models
- **API integration question?** Check Supabase docs + validation in `lib/schemas.ts`
- **Deployment question?** Check `eas.json` profiles and EAS docs

---

## Important Notes

⚠️ **Expo SDK Version:** This project uses Expo SDK 57.0.18. Before upgrading, read the changelog and test thoroughly on both platforms.

⚠️ **New Architecture:** Expo SDK 55+ runs on the New Architecture by default. All native dependencies must be compatible. Use `npx expo-doctor` to verify.

⚠️ **Hermes:** JavaScript engine (Hermes) is enabled by default. It provides faster startup and lower memory usage but has subtle behavioral differences from JSCore — test carefully.
