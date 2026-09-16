# Fantazi-Land Mobile 📱

**React Native companion app** for Fantazi-Land booking platform. Browse creator profiles, request bookings, manage reservations, and connect with professional influencers and creators.

**Current Status:** v1.0.0 — Production (submitted to Google Play Store)

---

## 🎯 What It Does

- 👤 **Browse Profiles** — Discover creators by category (Photography, Videography, Beauty, Lifestyle, etc.)
- 📅 **Request Bookings** — Select dates, duration, and budget; submit booking requests
- 💬 **Manage Reservations** — Track booking status, communicate with creators
- 📸 **Camera Integration** — Capture or upload profile photos
- 🔔 **Push Notifications** — Real-time updates on bookings and messages
- 🔐 **Secure Auth** — Supabase authentication with secure token storage

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Expo CLI** (install with `npm install -g expo-cli`)
- **Android SDK** / Xcode (for native builds)
- **Google Play account** (for publishing)

### Installation

```bash
# Clone & install
git clone <repo-url>
cd fantazi-land-mobile
npm install

# Start development
npm start                # Expo dev server
npm run android          # Launch on Android emulator/device
npm run ios              # Launch on iOS simulator/device
npm run web              # Launch on web
```

### Environment Setup

Create `.env.local` at the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uytihmscyjpwpdhqvnbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Development only (do NOT commit)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=postgresql://<user>:<pass>@...
```

**⚠️ Never commit `.env.local`** — use EAS Secrets for production.

---

## 📋 Development Commands

### Running

```bash
npm start              # Start Expo dev server (interactive menu)
npm run android        # Build & run on Android device
npm run ios            # Build & run on iOS simulator
npm run web            # Run web version
```

### Quality Checks

```bash
npx tsc --noEmit       # Type check (strict mode)
npx expo lint          # ESLint check
npx expo-doctor        # Check Expo SDK health
npm audit              # Security audit
```

### Testing

```bash
npm test               # Run tests (jest/vitest)
npm run test:coverage  # Test coverage report (80% minimum)
```

### Building

```bash
# Development/Preview build
eas build --platform android --profile preview

# Production build (for Play Store)
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --latest
```

---

## 📁 Project Structure

```
fantazi-land-mobile/
├── app/                    # Expo Router (file-based navigation)
│   ├── (tabs)/            # Tab layout (home, profile, bookings)
│   ├── profiles/[id]/     # Creator detail screen
│   ├── booking/[id]/      # Booking modal
│   └── _layout.tsx        # Root layout & init
│
├── components/            # React components (UI only)
│   ├── ProfileCard.tsx
│   └── [other UI components]
│
├── lib/                   # Utilities & business logic
│   ├── types.ts          # TypeScript interfaces (Profile, Booking, etc.)
│   ├── camera.ts         # Camera utilities
│   ├── notifications.ts  # Push notification setup
│   └── [other utilities]
│
├── assets/               # Images, icons, splash
├── app.json              # Expo configuration
├── eas.json              # EAS Build profiles (dev/preview/production)
├── CLAUDE.md             # Developer guide for Claude Code
├── AGENTS.md             # Expo version & setup notes
└── docs/
    ├── DEPLOYMENT.md     # Build & deployment guide
    └── LAUNCH_MONITORING.md # Post-launch monitoring
```

---

## 🏗️ Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Native 0.86.3 |
| **Runtime** | Expo 57.0.18, Hermes engine |
| **Navigation** | Expo Router (file-based, type-safe) |
| **State** | Zustand (global) + useState (local) |
| **Backend** | Supabase PostgreSQL |
| **Storage** | Supabase Storage (profile photos) |
| **Auth** | Supabase Auth + expo-secure-store |
| **Validation** | Zod schemas |
| **Animations** | React Native Reanimated |
| **Icons** | @expo/vector-icons |

### Key Types

- **Profile** — Creator profile with category, rates, availability
- **Booking** — Booking request with status & timeline
- **Review** — Client rating & feedback
- **MediaAsset** — Profile images from Supabase Storage

### State Flow

```
API (Supabase)
    ↓
Service Layer (validation, business logic)
    ↓
Zustand Store (global state) + React Hooks (local)
    ↓
Components (UI rendering)
```

---

## 🔐 Security

### Secrets Management

- **Public keys** (anon key, URL) → Committed to `.env.example`
- **Private keys** (service role, DB password) → **EAS Secrets only**
- **Auth tokens** → Stored in `expo-secure-store` (not AsyncStorage)

### Input Validation

All external input validated with Zod:
- API responses
- Deep-link parameters
- User form input

---

## 📱 Platform-Specific

### Android
- Min SDK: API 24 (Android 7.0)
- Target SDK: API 35 (Android 15)
- Architectures: arm64-v8a, armeabi-v7a
- Permissions: Camera, Photos, Notifications

### iOS
- Min iOS: 13.0
- Permissions: Camera, Photo Library

### Permissions (User-Facing)

| Permission | Purpose | Prompt |
|-----------|---------|--------|
| Camera | Profile photo capture | "Autoriser l'accès à votre caméra" |
| Photos | Photo library upload | "Autoriser l'accès à vos photos" |
| Notifications | Booking updates | "Autoriser les notifications" |

---

## 🧪 Testing

### Running Tests

```bash
npm test                 # Run test suite
npm run test:coverage    # Coverage report (target: 80%+)
```

### Test Types

- **Unit:** Utilities, hooks, components logic
- **Integration:** Supabase queries, API calls
- **E2E:** Critical user flows (Maestro/Detox)

---

## 🚀 Deployment

### Building for Production

1. **Prepare:**
   ```bash
   npm run type-check     # Verify TypeScript
   npx expo lint          # Check code quality
   npm run test:coverage  # Ensure 80%+ coverage
   ```

2. **Build:**
   ```bash
   eas build --platform android --profile production
   ```

3. **Submit:**
   ```bash
   eas submit --platform android --latest
   ```

4. **Monitor:**
   - Google Play Console → Vitals (crash rate, ANR)
   - Play Store reviews & ratings
   - Sentry (if configured) for error tracking

### Version Management

- Bump `version` in `app.json` for each release
- Increment `android.versionCode` by 1 each build
- Follow semantic versioning: `MAJOR.MINOR.PATCH`

### Rollout Strategy

- **Phase 1:** 10% of users (2-4h monitoring)
- **Phase 2:** 25% of users (4-8h monitoring)
- **Phase 3:** 50% of users (full day)
- **Phase 4:** 100% of users (full release)

**Never launch at 100% immediately** — catch regressions early via staged rollout.

---

## 📖 Documentation

| File | Purpose |
|------|---------|
| **CLAUDE.md** | Developer guide for Claude Code (commands, architecture, standards) |
| **AGENTS.md** | Expo version info & setup notes |
| **docs/DEPLOYMENT.md** | Complete build & deployment workflow |
| **docs/LAUNCH_MONITORING.md** | Post-launch monitoring checklist |

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache & reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx expo install
```

### Type Errors

```bash
npx tsc --noEmit          # Full type check
npm run type-check        # Quick check (if script exists)
```

### Expo Doctor Issues

```bash
npx expo-doctor           # Health check
npx expo-doctor --verbose # Detailed report
```

### Port Already in Use

```bash
npm start -- -p 8082      # Use different port
```

---

## 🔗 Related Projects

- **Web:** `../fantazi-land/` — Next.js marketing site & admin panel
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **CRM:** Base44 App Engine integration

---

## 📚 Resources

- **Expo Docs:** https://docs.expo.dev/versions/v57.0.0/
- **React Native:** https://reactnative.dev/
- **Supabase:** https://supabase.com/docs
- **Zod:** https://zod.dev/
- **EAS Submit:** https://docs.expo.dev/submit/android/
- **Google Play Console:** https://play.google.com/console

---

## 👥 Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Follow ECC code standards (see `CLAUDE.md`)
3. Write tests (TDD: test-first)
4. Type check: `npx tsc --noEmit`
5. Lint: `npx expo lint`
6. Commit with conventional message: `feat: description`
7. Push & create PR

---

## 📄 License

[Your License Here]

---

## 📞 Support

- **Dev Questions?** See `CLAUDE.md`
- **Build Issues?** Check `docs/DEPLOYMENT.md`
- **Monitoring?** See `docs/LAUNCH_MONITORING.md`
- **Bugs?** Create an issue with reproduction steps

---

**Status:** v1.0.0 — Submitted to Google Play Store  
**Last Updated:** 2026-09-02  
**Maintainer:** Fantazi-Land Dev Team
