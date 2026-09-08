# Fantazi-Land Mobile — Deployment & Post-Launch Guide

**Version:** 1.0.0  
**Platform:** Android via Google Play Store  
**Date Submitted:** 2026-09-02  
**Status:** 🟡 **In Review** (awaiting Google approval)

---

## 📱 Build Summary

| Aspect | Details |
|--------|---------|
| SDK | Expo 57.0.18 + React Native 0.86.3 |
| Signing | Android keystore (EAS managed) |
| Build Profile | `production` (via `eas.json`) |
| APK Size | ~TBD (typical Expo app: 80-120MB) |
| Min SDK | API 24 (Android 7.0) |
| Target SDK | API 35 (Android 15) |
| Architecture | arm64-v8a + armeabi-v7a |

### Pre-Release Checks ✅

- [x] TypeScript strict mode: `tsc --noEmit` ✓
- [x] ESLint: `npx expo lint` ✓
- [x] Expo health: `npx expo-doctor` ✓
- [x] Dependencies synced: `npm install --legacy-peer-deps` ✓
- [x] app.json fixed (removed `newArchEnabled`, `splash`) ✓
- [x] Peer deps installed (`expo-font`, `expo-linking`, `react-native-worklets`) ✓
- [x] Version bumped: `version: "1.0.0"`, `android.versionCode: 1` ✓
- [x] Tested on physical Android device ✓
- [x] Critical flows validated (auth, profiles, booking, camera, notifications) ✓

---

## 📊 Google Play Store Status

**Current Status:** 🟡 **In Review**  
**Submitted:** 2026-09-02  
**Expected Approval:** 2026-09-04 (24-48h)  
**Store Link:** [Play Store Console](https://play.google.com/console) → Releases → [Track]

### Tracking Progress

1. ✅ **Submitted** — EAS uploaded APK successfully
2. 🟡 **In Review** — Google examining for policy compliance
3. ⏳ **Approved** — Ready to launch (next step)
4. ⏳ **Released** — Live for end users

**Check Status Daily:** Play Console → Releases → [Your Track] → Status

---

## 🚀 Post-Approval Workflow (When Status = "Approved")

### Step 1: Launch with Staged Rollout

**DO NOT go 100% immediately.** Use staged rollout to catch regressions early:

```
Phase 1:  10% of users → Monitor 2-4h
Phase 2:  25% of users → Monitor 4-8h
Phase 3:  50% of users → Monitor 1 day
Phase 4: 100% of users → Full rollout
```

**In Google Play Console:**

1. Navigate → Releases → Production (or your track)
2. Approved version → "Release" button
3. Choose rollout % → "Confirm release"
4. Wait, monitor, increase % incrementally

### Step 2: Enable Monitoring

**Crash & Stability Monitoring** (Google Play built-in):
- Play Console → Vitals → Crashes
- Set up email alerts for critical crashes
- Target: <0.1% crash rate

**Optional: Sentry Integration** (if configured):
- Log in to Sentry dashboard
- Filter by: `fantazi-land-mobile` project
- Watch for: new errors, error trends, custom events
- Set Slack notifications for P0/P1 issues

**User Feedback:**
- Play Console → Ratings & Reviews
- Read comments daily first week
- Respond to critical feedback ASAP
- Flag common UX complaints for next iteration

### Step 3: Monitor Key Metrics (48h Post-Launch)

**Vitals to Watch:**

| Metric | Target | Where |
|--------|--------|-------|
| **Crash Rate** | < 0.1% | Play Vitals |
| **ANR Rate** | < 0.05% | Play Vitals |
| **Rating** | > 4.0 stars | Play Console |
| **Reviews** | Read daily | Play Console → Reviews |
| **Installs** | Track growth | Play Console → Analytics |

**Red Flags:**

- 🚨 Crash rate > 1% → **Rollback immediately**, investigate, patch
- 🚨 ANR (app freezes) > 0.5% → Performance issue, investigate
- 🚨 Rating drops below 3.5 → Major UX issue, read reviews
- 🚨 Repeated critical feedback → Hot-fix needed

---

## 🔧 Hotfix Workflow (If Issues Found)

If critical bug discovered post-launch:

### 1. Assess Severity

- **P0 (Critical):** App crashes, auth broken, data loss → **Rollback + hotfix**
- **P1 (High):** Major feature broken → **Hotfix in 2-4h**
- **P2 (Medium):** UI bug, performance → **Hotfix in 1-2 days**
- **P3 (Low):** Polish, minor issues → **Include in next release**

### 2. Create Hotfix Release

```bash
# Update version in app.json
# "version": "1.0.1"
# "android.versionCode": 2

git add app.json
git commit -m "fix: critical issue in v1.0.1

- [description of fix]
- [related Play Store issue #]

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Build & submit
eas build --platform android --profile production
eas submit --platform android --latest
```

### 3. Expedited Review

- Submit with note: "Critical bug fix, users affected"
- Google often prioritizes (2-6h vs. 24-48h)
- Once approved: **Start at 10% rollout again, monitor closely**

---

## 📋 Ongoing Maintenance Checklist

### Daily (First Week Post-Launch)

- [ ] Check Play Vitals for crashes
- [ ] Read new reviews/ratings
- [ ] Monitor Sentry for errors (if configured)
- [ ] Check app usage analytics

### Weekly (Ongoing)

- [ ] Review Play Console dashboard
- [ ] Triage bug reports from reviews
- [ ] Plan next release (v1.0.1, v1.1, etc.)
- [ ] Update app description/screenshots if needed

### Monthly (Ongoing)

- [ ] Security audit (check dependencies, secrets)
- [ ] Performance review (app size, load times)
- [ ] User feedback analysis
- [ ] Plan next feature release

---

## 📞 Support & Escalation

### If Rejected by Google

**Common rejection reasons:**
1. Policy violation (permissions, privacy, content)
2. Functionality issue (crashes on test device)
3. Store listing incomplete (missing screenshots, description)
4. Trademark/branding issue

**Resolution:**
1. Read rejection email carefully
2. Fix the specific issue
3. Bump `android.versionCode` by 1
4. Re-submit (no need to wait, can re-submit immediately)

### If Crash Discovered Post-Launch

1. **Assess severity** (see Hotfix Workflow above)
2. **Rollback if P0** (stop the release in Play Console)
3. **Fix locally** (TDD: write failing test, fix, test passes)
4. **Create hotfix release** (bump version, re-build, re-submit)
5. **Monitor fix** (verify in next rollout phase)

---

## 🎯 Success Criteria (v1.0.0 Release)

✅ **Launch Success** = All of:

- [x] Approved by Google Play
- [ ] 10% rollout stable (< 0.1% crash rate) — **waiting**
- [ ] User rating > 3.5 stars — **waiting**
- [ ] No critical bugs in reviews — **waiting**
- [ ] Monitoring active (Play Vitals + optional Sentry) — **waiting**

---

## 📚 References

- **Google Play Console:** https://play.google.com/console
- **Google Play Policies:** https://play.google.com/about/developer-content-policy/
- **Expo Submission Docs:** https://docs.expo.dev/submit/android/
- **Play Vitals:** https://play.google.com/console/vitals

---

## 🔗 Related Files

- **App Config:** `app.json` (version, permissions, signing)
- **Build Config:** `eas.json` (build profiles: dev, preview, production)
- **Development Guide:** `CLAUDE.md` (dev setup, architecture, testing)
- **Architecture:** `../fantazi-land/docs/ARCHITECTURE.md` (system design)

---

**Status:** 🟡 In Review  
**Next Action:** Wait for Google Play approval (24-48h), then proceed with staged rollout  
**Contact:** [Your team contact or support email]
