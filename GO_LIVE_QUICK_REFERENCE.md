# 🚀 Go-Live Quick Reference Card

## ⚡ CURRENT STATUS (Feb 27, 2026)

```typescript
// context/ForceUpdateContext.tsx
minimumVersion: '2.2.0'  // ✅ Safe - matches current store version
enabled: false           // ✅ Safe - force update DISABLED
```

**Result:** Users can use the app normally. No blocking.

---

## 📋 GO-LIVE STEPS (IN ORDER)

### Step 1: Deploy Safe Baseline (TODAY) ✅ READY

```bash
# 1. Verify config is safe
# context/ForceUpdateContext.tsx should have:
#   minimumVersion: '2.2.0'
#   enabled: false

# 2. Deploy OTA update
eas update --branch production --message "Force update infrastructure - disabled"

# 3. Wait 30 minutes for propagation
```

**User Impact:** NONE - users see no changes

---

### Step 2: Build & Submit Native 2.3.0 (AFTER Step 1)

```bash
# 1. Update version numbers
# app.json:
#   "version": "2.3.0"
#   "ios.buildNumber": "2.3.0"
#   "android.versionCode": 230
#   "runtimeVersion": "2.3.0"
# package.json:
#   "version": "2.3.0"

# 2. Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# 3. Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

**User Impact:** NONE - builds are in review, not yet live

---

### Step 3: Wait for Store Approval ⏳

**Monitor:**
- Apple App Store: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console

**Typical Wait Times:**
- iOS: 24-48 hours
- Android: 2-24 hours

**User Impact:** NONE - current version 2.2.0 still live

---

### Step 4: Enable Force Update (CRITICAL STEP) ⚠️

**ONLY DO THIS WHEN:**
- ✅ iOS 2.3.0 is LIVE on App Store
- ✅ Android 2.3.0 is LIVE on Play Store
- ✅ You can download 2.3.0 from both stores

```bash
# 1. Update context/ForceUpdateContext.tsx:
#   minimumVersion: '2.3.0'  ← CHANGE from 2.2.0
#   enabled: true            ← CHANGE from false

# 2. Deploy force update trigger
eas update --branch production --message "Enable force update for rebrand"

# 3. Wait 24-48 hours for propagation
```

**User Impact:** 
- Users on 2.2.0: See force update screen (blocked)
- Users on 2.3.0: Use app normally (no blocking)

---

## 🎯 What Users See

### BEFORE Force Update Enabled (Steps 1-3)

```
All users (2.2.0 and 2.3.0):
✅ App loads normally
✅ No update screen
✅ Full access to features
```

### AFTER Force Update Enabled (Step 4)

```
Users on 2.2.0 (old version):
❌ See full-screen "Update Required" modal
❌ Cannot use app
❌ Must tap store button to update

Users on 2.3.0 (new version):
✅ App loads normally
✅ No update screen
✅ Full access to features
```

---

## 🔄 Emergency Rollback (IF SOMETHING GOES WRONG)

```bash
# 1. Update context/ForceUpdateContext.tsx:
enabled: false  # ← Disable immediately

# 2. Deploy emergency OTA
eas update --branch production --message "Emergency disable force update"

# 3. Users receive update within 24 hours
```

**No app store review needed!** This is instant via OTA.

---

## 📊 Version Configuration Matrix

| Scenario | minimumVersion | enabled | User Experience |
|----------|---------------|---------|-----------------|
| **Current (Safe)** | `2.2.0` | `false` | ✅ Everyone uses app normally |
| **Build Submitted** | `2.2.0` | `false` | ✅ Everyone uses app normally |
| **Ready to Force** | `2.3.0` | `true` | ⚠️ 2.2.0 blocked, 2.3.0 OK |
| **Emergency Rollback** | `2.3.0` | `false` | ✅ Everyone uses app normally |

---

## ✅ Pre-Flight Checklist

Before deploying anything:

- [ ] `context/ForceUpdateContext.tsx` has `enabled: false`
- [ ] `context/ForceUpdateContext.tsx` has `minimumVersion: '2.2.0'`
- [ ] Tested app locally - loads normally
- [ ] No force update screen appears
- [ ] Committed changes to git
- [ ] Pushed to main branch

---

## 🎬 Showtime Checklist

When ready to enable force update (Step 4):

- [ ] iOS 2.3.0 shows "Live" in App Store Connect
- [ ] Android 2.3.0 shows "Live" in Play Console
- [ ] Downloaded 2.3.0 from App Store (iOS test device)
- [ ] Downloaded 2.3.0 from Play Store (Android test device)
- [ ] Updated `minimumVersion: '2.3.0'`
- [ ] Updated `enabled: true`
- [ ] Deployed OTA: `eas update --branch production --message "Enable force update"`
- [ ] Monitored for 1 hour - no critical errors

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Users report app won't open | Check `enabled: false` in config, deploy emergency OTA |
| Force update not showing | Verify `minimumVersion > user version` and `enabled: true` |
| Wrong store link | Check device platform (iOS vs Android) |
| OTA not propagating | Run `eas update:list --branch production` to verify |

---

## 🔗 Useful Commands

```bash
# Check current OTA updates
eas update:list --branch production --limit 5

# Check build status
eas build:list --limit 5

# Check app store submissions
eas submit:list

# Deploy OTA update
eas update --branch production --message "Your message here"
```

---

**📅 Last Updated:** February 27, 2026  
**🎯 Current Status:** READY FOR STEP 1 (Safe baseline deployment)
