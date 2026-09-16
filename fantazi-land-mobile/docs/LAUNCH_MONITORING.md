# Launch Monitoring Checklist — Fantazi-Land v1.0.0

**Submission Date:** 2026-09-02  
**Current Status:** 🟡 **In Review** (Google Play)  
**Expected Approval:** 2026-09-04 (24-48h)

---

## ⏳ While Waiting for Google Approval (24-48h)

### Daily Tracking

- [ ] Check Play Console status (Releases → [Track] → Status)
- [ ] Note any rejection/feedback emails from Google
- [ ] Prepare Play Store listing finalization (if not done)

### Checklist: Play Store Listing

Before launch, ensure these are complete in Play Console:

**Basic Info:**
- [ ] App name: "Fantazi-Land"
- [ ] Developer name: [Your company]
- [ ] Short description (80 chars max)
- [ ] Full description (with features, permissions rationale)
- [ ] Category: Social / Lifestyle / Business (pick one)
- [ ] Content rating: Completed Google Play rating questionnaire

**Visual Assets:**
- [ ] Icon (512×512px, PNG/JPG)
- [ ] Feature graphic (1024×500px)
- [ ] Screenshots (minimum 2, max 8, in portrait)
- [ ] Promo video (optional, but recommended)

**Permissions Explanation:**
- [ ] Camera: "To capture profile photos"
- [ ] Photos: "To upload photos from gallery"
- [ ] Notifications: "For booking updates and messages"

**Pricing:**
- [ ] Free (or select pricing if applicable)
- [ ] Distribution: Select countries (worldwide recommended for launch)

---

## 🚀 When Status = "Approved" (Next Steps)

### Immediate Actions (30 min)

1. [ ] **Verify Approval**
   - Play Console shows "Approved" status
   - Note exact approval time

2. [ ] **Prepare Staged Rollout**
   - DO NOT launch at 100%
   - Plan: 10% → 25% → 50% → 100%
   - Each phase: 2-4h monitoring gap

3. [ ] **Set Up Monitoring Dashboard**
   - Open Play Vitals in new tab
   - Open Sentry (if configured) in another tab
   - Have Play Console reviews page ready

### Phase 1: 10% Rollout (Safety Check)

**Duration:** 2-4 hours

**Start Rollout:**
- Play Console → Releases → Production
- Approved version → "Release" button
- Select "Staged rollout" → 10% → Confirm

**Monitor Metrics:**

| Metric | Check Every | Target |
|--------|------------|--------|
| Crash rate | 15 min | < 0.5% |
| ANR rate | 15 min | < 0.1% |
| Rating | 1h | No drop |
| Reviews | 1h | Read new ones |
| Sentry errors | 15 min | No new patterns |

**Decision After 2-4h:**
- ✅ All metrics green → Proceed to Phase 2
- 🚨 Crash rate > 1% or ANR > 0.5% → **ROLLBACK** (investigate)

---

### Phase 2: 25% Rollout (Growth)

**Duration:** 4-8 hours (or overnight if you can monitor)

**Increase Rollout:**
- Play Console → "Update release" → 25%

**Monitor Same Metrics:**
- Crash rate (target: < 0.1%)
- ANR rate (target: < 0.05%)
- Ratings (target: > 4.0 stars)
- Reviews (read any new critical feedback)

**Decision After 4-8h:**
- ✅ Stable → Proceed to Phase 3
- ⚠️ Minor issues, not critical → Proceed with caution
- 🚨 Critical issue → **ROLLBACK**

---

### Phase 3: 50% Rollout (Main Launch)

**Duration:** Full day (or overnight)

**Increase Rollout:**
- Play Console → "Update release" → 50%

**Monitoring Intensity:** Can reduce to hourly checks

**Key Milestones:**
- No crash spike
- Rating stable
- No repeated complaints in reviews
- Sentry clean (no error surge)

**Decision After 1 day:**
- ✅ All good → Full 100% rollout
- ⚠️ Watch one more day
- 🚨 Issue detected → Hotfix + revert

---

### Phase 4: 100% Rollout (Full Release)

**Increase Rollout:**
- Play Console → "Update release" → 100%

**Ongoing Monitoring (Post-Launch):**
- [See Post-Launch Monitoring below]

---

## 📊 Post-Launch Monitoring (Week 1)

### Daily Checks (First 7 Days)

**Morning (9am):**
- [ ] Play Vitals: crash rate, ANR rate
- [ ] Play Console: rating, review count
- [ ] Sentry: new errors, error spike?
- [ ] Install count: is it growing?

**Afternoon (3pm):**
- [ ] Same metrics (catch any new issues)
- [ ] Read new reviews (any patterns?)

**Evening (6pm):**
- [ ] Overall status: stable? Any issues to escalate?

### Weekly Metrics to Track

| Metric | Target | Alert If |
|--------|--------|----------|
| Crash Rate | < 0.1% | > 0.5% |
| ANR Rate | < 0.05% | > 0.1% |
| Rating | > 4.0 stars | Drops below 3.5 |
| Reviews/day | Read all | > 5 critical complaints |
| Installs/day | Growing steadily | Sudden drop |
| Session Length | Expected | Unexpectedly low |

---

## 🚨 Emergency Protocols

### If Crash Rate > 1%

**Immediate (< 5 min):**
1. [ ] Confirm in Play Vitals (not a false alarm)
2. [ ] Check Sentry for error pattern
3. [ ] Identify affected Android versions / devices

**Quick Response (5-15 min):**
1. [ ] **ROLLBACK** the release (stop at previous stable version)
2. [ ] Post-mortem: what caused the crash?
3. [ ] Is it local reproduction? Test on device

**Fix & Redeploy (1-2h):**
1. [ ] Create hotfix branch: `git checkout -b fix/critical-crash`
2. [ ] Write failing test (TDD)
3. [ ] Fix code to pass test
4. [ ] Bump version: v1.0.1, versionCode: 2
5. [ ] Build + submit: `eas build && eas submit`
6. [ ] Back to 10% rollout (wait for approval, repeat phases)

### If Rating Drops Below 3.5

**Investigate:**
1. [ ] Read the negative reviews — what's the complaint?
2. [ ] Is it a bug (→ hotfix) or UX issue (→ next release)?
3. [ ] Can we respond to reviews? (Google Play allows dev responses)

**Response:**
- Acknowledge the issue publicly in Play Store
- Promise a fix if applicable
- Collect feedback for v1.0.1 / v1.1

---

## ✅ Launch Success Checklist

By end of Week 1, verify:

- [ ] Approved by Google Play ✓
- [ ] Live on Play Store (100% users) ✓
- [ ] No critical crashes (< 0.1%) ✓
- [ ] Rating > 4.0 stars ✓
- [ ] Monitoring active (daily checks) ✓
- [ ] Hotfix plan ready (just in case) ✓

---

## 📱 Device Testing After Launch

If you discover a specific issue, reproduce on physical devices:

```bash
# Re-install app from Play Store (to test production version)
# Test the specific flow that's broken
# Document steps to reproduce

# If confirmed:
# 1. Create hotfix (see Emergency Protocols)
# 2. Test locally first
# 3. Build + submit
```

---

## 📞 Support Contacts

- **Google Play Support:** https://play.google.com/console/support
- **Expo Support:** https://expo.io/contact
- **Your Dev Team:** [Add contact info]

---

**Status:** 🟡 Awaiting Approval  
**Last Updated:** 2026-09-02  
**Next Update:** When status changes to "Approved"
