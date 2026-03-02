# 🚀 Go-Live Plan: Force Update Feature

## ⚠️ CRITICAL: Before You Go Live

Your current configuration has **force update ENABLED** with `minimumVersion: 2.3.0`. This will **BLOCK ALL USERS** since your current app version is `2.2.0`.

---

## 📋 Pre-Launch Checklist

### Phase 1: Prepare Configuration (DO THIS FIRST)

#### 1.1 Update ForceUpdateContext.tsx for Production

**File:** `context/ForceUpdateContext.tsx`

```typescript
const FORCE_UPDATE_CONFIG = {
  // Set to your CURRENT store version (what users already have)
  minimumVersion: '2.2.0',  // ← CHANGE from 2.3.0 to 2.2.0
  
  // DISABLE for initial deployment
  enabled: false,  // ← CHANGE from true to false
  
  updateMessage: 'We\'ve rebranded! Please update to the latest version to continue using the app.',
  
  appStoreUrl: 'https://apps.apple.com/app/id6758462281',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.femtech.femtechmobileapp',
};
```

**Why?**
- `enabled: false` = No users are blocked initially
- `minimumVersion: 2.2.0` = Matches current store version

#### 1.2 Test Locally

```bash
# Run the app
pnpm dev

# Verify:
# ✅ App loads normally (no force update screen)
# ✅ All features work
# ✅ No blocking behavior
```

#### 1.3 Commit Changes

```bash
git add context/ForceUpdateContext.tsx
git commit -m "chore: disable force update for production deployment"
git push
```

---

### Phase 2: Deploy OTA Update (Safe Baseline)

#### 2.1 Create Production OTA Update

```bash
# Create update for production channel
eas update --branch production --message "Baseline update with force update infrastructure"
```

#### 2.2 Verify Update Propagation

1. Wait 15-30 minutes for Expo CDN propagation
2. Test on a real device:
   - Close app completely
   - Reopen app
   - Should load normally with no force update screen

---

### Phase 3: Submit Native Build to Stores

#### 3.1 Increment Version Numbers

**Update these files:**

**`app.json`:**
```json
{
  "expo": {
    "version": "2.3.0",           // ← Increment
    "ios": {
      "buildNumber": "2.3.0"      // ← Increment
    },
    "android": {
      "versionCode": 230          // ← Increment (2.3.0 = 230)
    },
    "runtimeVersion": "2.3.0"     // ← Increment
  }
}
```

**`package.json`:**
```json
{
  "version": "2.3.0"  // ← Increment
}
```

#### 3.2 Build Production Binaries

```bash
# iOS Build
eas build --platform ios --profile production

# Android Build
eas build --platform android --profile production
```

#### 3.3 Submit to App Stores

```bash
# Submit to Apple App Store
eas submit --platform ios --latest

# Submit to Google Play Store
eas submit --platform android --latest
```

#### 3.4 Store Submission Checklist

**Apple App Store:**
- [ ] Upload build via EAS submit
- [ ] Fill in "What's New": "We've rebranded! New name, same great app."
- [ ] Submit for review
- [ ] Wait for approval (typically 24-48 hours)

**Google Play Store:**
- [ ] Upload build via EAS submit
- [ ] Roll out to production track
- [ ] Fill in release notes: "We've rebranded! New name, same great app."
- [ ] Submit for review
- [ ] Wait for approval (typically 2-24 hours)

---

### Phase 4: Enable Force Update (AFTER Store Approval)

#### ⚠️ WAIT FOR STORE APPROVAL

**DO NOT enable force update until:**
- ✅ iOS app is approved AND live on App Store
- ✅ Android app is approved AND live on Play Store
- ✅ You can download version 2.3.0 from both stores

#### 4.1 Enable Force Update

**File:** `context/ForceUpdateContext.tsx`

```typescript
const FORCE_UPDATE_CONFIG = {
  // Now set to NEW store version (2.3.0)
  minimumVersion: '2.3.0',  // ← CHANGE to 2.3.0
  
  // ENABLE force update
  enabled: true,  // ← CHANGE to true
  
  updateMessage: 'We\'ve rebranded! Please update to the latest version to continue using the app.',
  
  appStoreUrl: 'https://apps.apple.com/app/id6758462281',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.femtech.femtechmobileapp',
};
```

#### 4.2 Deploy Force Update OTA

```bash
# Deploy the force update trigger
eas update --branch production --message "Enable force update for rebrand migration"
```

---

## 🎯 What Happens After Go-Live

### User Experience Timeline

| Time | User Status | Experience |
|------|-------------|------------|
| **T+0** | OTA deployed | Users get update silently in background |
| **T+24h** | ~60% users updated | App loads normally (force update disabled) |
| **T+48h** | ~80% users updated | App loads normally (force update disabled) |
| **Store approval** | Native 2.3.0 live | New users get 2.3.0 from stores |
| **Force enable** | You enable force update | Users on 2.2.0 see update screen |

### Force Update Screen Behavior

**Users on version 2.2.0:**
```
✅ See full-screen update modal
✅ Blocked from using app
✅ Must tap "Update on App Store" or "Update on Google Play"
✅ Directed to correct store based on device
```

**Users on version 2.3.0:**
```
✅ App loads normally
✅ No update screen
✅ Full access to all features
```

---

## 🔧 Configuration Quick Reference

### Production Settings (BEFORE Force Update)

```typescript
// context/ForceUpdateContext.tsx
minimumVersion: '2.2.0',  // Current store version
enabled: false,           // Disabled initially
```

### Production Settings (AFTER Force Update Enable)

```typescript
// context/ForceUpdateContext.tsx
minimumVersion: '2.3.0',  // New store version
enabled: true,            // Enable after store approval
```

---

## 🚨 Emergency Rollback

If something goes wrong, you can **instantly disable** force update via OTA:

### Disable Force Update Emergency

```bash
# 1. Update context/ForceUpdateContext.tsx
enabled: false,  // Set to false

# 2. Deploy emergency OTA
eas update --branch production --message "Emergency disable force update"

# 3. Users receive update within 24 hours
```

**No app store review needed!** OTA updates propagate automatically.

---

## 📊 Monitoring Checklist

### After Each Phase

**Phase 1 (OTA Baseline):**
```bash
# Check update status
eas update:list --branch production

# Expected: Latest update shows "Baseline update with force update infrastructure"
```

**Phase 2 (Native Build):**
```bash
# Check build status
eas build:list --limit 2

# Expected: Shows iOS and Android builds for 2.3.0
```

**Phase 3 (Store Approval):**
- [ ] Check App Store: Search "Femtech" → Version shows 2.3.0
- [ ] Check Play Store: Search "Femtech" → Version shows 2.3.0

**Phase 4 (Force Update Enable):**
```bash
# Verify force update OTA deployed
eas update:list --branch production --limit 1

# Expected: Shows "Enable force update for rebrand migration"
```

---

## 📱 Testing Force Update (Before Go-Live)

### Test on Development Build

1. **Enable test mode locally:**
   ```typescript
   // context/ForceUpdateContext.tsx
   minimumVersion: '2.3.0',  // Higher than current 2.2.0
   enabled: true,
   ```

2. **Run development build:**
   ```bash
   pnpm dev
   ```

3. **Expected behavior:**
   - ✅ Force update screen appears
   - ✅ Shows correct store button (iOS/Android)
   - ✅ Tapping button opens correct store
   - ✅ [DEV] Dismiss button works (development only)

4. **Reset for production:**
   ```typescript
   // context/ForceUpdateContext.tsx
   minimumVersion: '2.2.0',
   enabled: false,
   ```

---

## ✅ Final Go-Live Checklist

### Before Deploying Anything

- [ ] Force update `enabled: false` in code
- [ ] Force update `minimumVersion: '2.2.0'` (current version)
- [ ] Tested app loads normally
- [ ] All existing features work
- [ ] No blocking behavior

### Before Enabling Force Update

- [ ] iOS version 2.3.0 **LIVE** on App Store
- [ ] Android version 2.3.0 **LIVE** on Play Store
- [ ] Can download 2.3.0 from both stores
- [ ] Tested 2.3.0 on real devices
- [ ] Force update `minimumVersion: '2.3.0'` ready
- [ ] Force update `enabled: true` ready

### After Enabling Force Update

- [ ] Monitor crash reports (Sentry/Crashlytics)
- [ ] Check app store reviews
- [ ] Monitor support tickets
- [ ] Track update adoption rate

---

## 📞 Support Contacts

If you encounter issues:

1. **Expo Updates Issues:** https://docs.expo.dev/eas-update/troubleshooting/
2. **Apple App Store:** https://appstoreconnect.apple.com
3. **Google Play Console:** https://play.google.com/console

---

## 🎉 Success Criteria

Your go-live is successful when:

1. ✅ Users on 2.2.0 see force update screen
2. ✅ Users on 2.3.0 use app normally
3. ✅ Store links work correctly (iOS → App Store, Android → Play Store)
4. ✅ No app crashes or errors
5. ✅ Support tickets remain manageable

---

**Good luck with your launch! 🚀**

*Last updated: February 27, 2026*
