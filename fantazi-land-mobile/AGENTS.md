# AGENTS.md — Fantazi-Land Mobile

**Expo Version:** 57.0.18 (latest compatible)  
**React Native:** 0.86.3  
**Node.js:** 18+

---

## ⚠️ Critical: Expo SDK 57

**Expo HAS CHANGED** — Always read the exact versioned docs before writing code:

→ **https://docs.expo.dev/versions/v57.0.0/**

### Key Changes in SDK 57

- **New Architecture Mandatory** — Fabric + TurboModules (no opt-out from SDK 55+)
- **Hermes Enabled by Default** — Faster startup, lower memory
- **Expo Router is the Default** — File-based routing (`app/` directory)
- **`splash` config deprecated** — Use `expo-splash-screen` instead
- **`newArchEnabled` removed** — Not a valid field anymore

### What This Means for Development

❌ **Do NOT:**
- Use old `splash` config in app.json
- Set `newArchEnabled: false` (SDK 55+ always uses New Architecture)
- Assume deprecated APIs still exist (check version docs)

✅ **Always:**
- Reference https://docs.expo.dev/versions/v57.0.0/
- Check CHANGELOG before upgrading dependencies
- Run `npx expo-doctor` to verify health
- Test on physical devices (simulator behavior differs)

---

## 🏗️ Stack

| Component | Package | Version |
|-----------|---------|---------|
| **Framework** | Expo | ~57.0.18 |
| **Runtime** | React | 19.2.3 |
| **Native** | React Native | 0.86.3 |
| **Router** | Expo Router | ~57.0.17 |
| **State** | Zustand | ^5.0.15 |
| **Storage (Secure)** | expo-secure-store | ~57.0.2 |
| **Storage (Local)** | react-native-mmkv | ^4.3.2 |
| **Animations** | react-native-reanimated | ^4.6.0 |
| **Backend** | Supabase JS | ^2.112.4 |
| **Validation** | Zod | ^4.5.4 |
| **Language** | TypeScript | ~6.0.3 |
| **Icons** | @expo/vector-icons | ^15.1.1 |

---

## 🚀 Before Writing Code

### 1. Read the Versioned Docs

Start here for ANY implementation:

- **Expo Docs (v57):** https://docs.expo.dev/versions/v57.0.0/
- **React Native Docs:** https://reactnative.dev/docs/intro-react
- **Supabase Docs:** https://supabase.com/docs/reference/javascript

### 2. Check Project-Specific Guidance

- **CLAUDE.md** — Development workflow, architecture, code standards
- **README.md** — Project overview and setup
- **docs/DEPLOYMENT.md** — Build & release process
- **docs/LAUNCH_MONITORING.md** — Post-launch monitoring

### 3. Verify Compatibility

New dependencies? Check:

```bash
# Run after adding packages
npx expo install --check

# Full health check
npx expo-doctor
```

---

## 🔧 Common Tasks

### Add a New Screen

1. Create file in `app/` directory (e.g., `app/my-feature/index.tsx`)
2. Export a component as default
3. Use `Link` or `router.push()` to navigate

**Reference:** https://docs.expo.dev/routing/introduction/

### Add a Native Module / Permission

1. Install with `npm install <package>`
2. Run `npx expo install` to sync native deps
3. Add permission to `app.json` → `plugins` array
4. Request permission at runtime if needed

**Reference:** https://docs.expo.dev/modules/overview/

### Use Device APIs (Camera, Location, etc.)

1. Import from `expo-<feature>`
2. Request permission at runtime
3. Handle permission denial gracefully

**Reference:** https://docs.expo.dev/build-reference/permissions/

### Deploy to Google Play Store

```bash
# Build for production
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --latest

# See docs/DEPLOYMENT.md for full workflow
```

**Reference:** https://docs.expo.dev/submit/android/

---

## ❌ What NOT to Do

| ❌ Don't | ✅ Do Instead |
|---------|-------------|
| Use deprecated APIs without checking SDK 57 docs | Reference https://docs.expo.dev/versions/v57.0.0/ |
| Assume iOS/Android behave the same | Test on both platforms (use physical devices) |
| Hardcode secrets in code | Use EAS Secrets for production values |
| Store auth tokens in AsyncStorage | Use `expo-secure-store` |
| Skip `npx expo-doctor` after changes | Run it regularly to catch issues early |
| Build locally without testing on device | Always test on physical devices before release |
| Commit `.env.local` with secrets | Use `.env.example`, secrets via EAS |
| Ignore type errors (TypeScript strict mode) | Fix ALL type errors before commit |

---

## 🚨 Before Every Commit

```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint
npx expo lint

# 3. Expo health
npx expo-doctor

# 4. Tests (if applicable)
npm test

# Only then: git add + commit
```

---

## 📱 Testing on Device

### Android

```bash
# Build & install
eas build --platform android --profile preview
# Download APK, then:
adb install app-preview.apk

# Or run directly (requires device connected)
npm run android
```

### iOS

```bash
# Build & install
eas build --platform ios --profile preview

# Or run directly on simulator
npm run ios
```

### Web (Local Testing)

```bash
npm run web
```

---

## 🐛 Debugging

### Enable Expo Dev Menu

- **iOS Simulator:** Cmd+D
- **Android Emulator:** Cmd+M (or Ctrl+M on Linux/Windows)

### Check Logs

```bash
# Expo dev server logs (in terminal running npm start)
# Shows console.log, errors, warnings
```

### Use React Native Debugger

```bash
# Install
brew install react-native-debugger

# Open and connect in Expo menu
```

---

## 📚 Key Documentation Links

| Topic | Link |
|-------|------|
| **Expo SDK 57** | https://docs.expo.dev/versions/v57.0.0/ |
| **Expo Router** | https://expo.github.io/router/introduction |
| **Supabase** | https://supabase.com/docs |
| **EAS Build** | https://docs.expo.dev/build/introduction/ |
| **EAS Submit** | https://docs.expo.dev/submit/android/ |
| **TypeScript** | https://www.typescriptlang.org/docs/ |

---

## 🎯 Workflow Reminder

**Every time you code:**

1. 📖 **Read the versioned docs** (Expo 57)
2. 🔧 **Follow project standards** (CLAUDE.md)
3. 🧪 **Test on physical device**
4. ✅ **Verify quality** (type-check, lint, tests)
5. 💾 **Commit** with clear message

---

## 💬 Questions?

- **Project structure?** → See `CLAUDE.md` Architecture section
- **Setup & development?** → See `README.md`
- **Build/deployment?** → See `docs/DEPLOYMENT.md`
- **Monitoring?** → See `docs/LAUNCH_MONITORING.md`
- **Expo question?** → https://docs.expo.dev/versions/v57.0.0/
- **API question?** → https://supabase.com/docs/reference/javascript

---

**Last Updated:** 2026-09-02  
**Status:** v1.0.0 (Production - Google Play Store submission)
