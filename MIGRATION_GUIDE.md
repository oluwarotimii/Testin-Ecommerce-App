# Force Migration & Rebrand Guide

## The "Force-Bridge" Strategy

This guide walks you through executing a coordinated rebrand and forced migration for your Expo mobile app without losing your existing user base.

---

## 🎯 Objective

Achieve **100% brand consistency** across your entire user base by forcing all users to update to a new native version with:
- New App Name
- New App Icon
- New Version Number
- Any other native metadata changes

---

## ⚠️ The Problem

**Expo OTA (Over-The-Air) updates cannot change native metadata:**
- ❌ App Name (text under icon)
- ❌ App Icon
- ❌ Version Number (shown in settings)
- ❌ Build Number
- ❌ Native permissions

If you simply upload a new version to the stores without forcing updates, users may stay on the old version for **months** (if they have auto-updates off), never seeing your new branding.

---

## ✅ The Solution: Three-Phase "Lock & Migrate"

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: Logic Injection (OTA Update)                          │
│  ─────────────────────────────────────                          │
│  Deploy the "Gatekeeper" code that can block old versions       │
│  Status: DISABLED (waiting for your signal)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: Native Rebrand (App Store Submission)                 │
│  ─────────────────────────────────────────────                  │
│  Submit new build with updated name/icon/version to stores      │
│  Status: In Review / Pending Release                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: The Migration Loop (Enable Force Update)              │
│  ─────────────────────────────────────────────────────────      │
│  Enable the gatekeeper → Users blocked → Directed to store      │
│  Result: 100% migration to new branding                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Pre-Flight Checklist

Before starting, ensure you have:

- [ ] New app icon designed and exported (`./assets/images/icon.png`)
- [ ] New app name decided
- [ ] App Store Connect account access (iOS)
- [ ] Google Play Console account access (Android)
- [ ] App Store IDs noted (for deep links)
- [ ] At least 48 hours for the full migration process

---

## 🚀 Step-by-Step Execution

### **PHASE 1: Deploy the Logic Injection (OTA)**

#### 1.1 Update Configuration Files

The following files have already been updated for version **2.2.0**:

- ✅ `package.json` → version: `2.2.0`
- ✅ `app.json` → version: `2.2.0`, runtimeVersion: `2.2.0`
- ✅ `app.json` → ios.buildNumber: `2.2.0`
- ✅ `app.json` → android.versionCode: `220`

#### 1.2 Configure Forced Update Settings

Edit these files with your specific values:

**File: `services/updateService.ts`** (Lines ~18-40)
```typescript
const FORCED_UPDATE_CONFIG = {
  enabled: false,  // ⚠️ KEEP THIS FALSE FOR NOW
  
  minimumVersion: '2.2.0',  // ✅ Already set
  
  message: 'We\'ve rebranded! Update to the latest version to continue using the app.',
  
  iosAppStoreUrl: 'https://apps.apple.com/app/idYOUR_APP_ID',  // 🔧 REPLACE THIS
  androidPlayStoreUrl: 'https://play.google.com/store/apps/details?id=com.femtech.femtechmobileapp',
};
```

**Action Required:**
1. Replace `YOUR_APP_ID` with your actual iOS App Store ID
2. Verify the Android package name is correct

**File: `context/ForceUpdateContext.tsx`** (Lines ~36-52)
```typescript
const FORCE_UPDATE_CONFIG = {
  minimumVersion: '2.1.0',  // Will be updated to 2.2.0
  enabled: false,  // ⚠️ KEEP FALSE
  updateMessage: 'We\'ve rebranded! Please update to the latest version to continue using the app.',
  appStoreUrl: 'https://apps.apple.com/app/idYOUR_APP_ID',  // 🔧 REPLACE
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.femtech.femtechmobileapp',
};
```

**Action Required:**
1. Change `minimumVersion` to `'2.2.0'`
2. Replace `YOUR_APP_ID` with your actual iOS App Store ID

#### 1.3 Test Locally (Development Mode)

```bash
# Start the development server
npm run dev

# On your test device:
# 1. The app should load normally (force update is disabled)
# 2. In DEV mode, you can test the ForceUpdateScreen by:
#    - Temporarily setting enabled: true in updateService.ts
#    - The update screen should appear with a "[DEV] Dismiss" button
```

#### 1.4 Publish OTA Update

Once tested, publish the OTA update:

```bash
# Create a new OTA update
eas update --branch production --message "Prepare for rebrand migration"
```

**Wait Time:** 24-48 hours for full propagation to existing users.

> **Note:** The forced update logic is now on all user devices, but it's **disabled** (`enabled: false`). Users won't see anything yet.

---

### **PHASE 2: Native Rebrand (App Store Submission)**

#### 2.1 Update App Icon (Optional)

If you're changing the app icon:

1. Replace `./assets/images/icon.png` with your new icon
2. For iOS, also update `./assets/images/icon.png` (adaptive icon uses the same file)

#### 2.2 Update App Name (If Changing)

**File: `app.json`**
```json
{
  "expo": {
    "name": "Your New App Name",  // ← Change this
    "slug": "femtech-mobile-app",
    ...
  }
}
```

> ⚠️ **Important:** Changing the app name may require App Store review justification. Ensure your new name complies with store guidelines.

#### 2.3 Build Native Binaries

```bash
# Build for both platforms
eas build --platform all --profile production
```

This creates:
- `.ipa` file for iOS
- `.apk` / `.aab` file for Android

#### 2.4 Submit to App Stores

**iOS (App Store Connect):**
1. Upload the `.ipa` via Transporter or Xcode
2. Update "What's New" text: "We've rebranded! New name, same great app."
3. Submit for review
4. **Important:** Set release to **Manual** (don't auto-release)

**Android (Google Play Console):**
1. Upload the `.aab` to Production track
2. Update release notes
3. Submit for review
4. **Important:** Roll out to **100%** but don't start rollout yet

#### 2.5 Wait for Approval

- iOS: Typically 24-48 hours
- Android: Typically 2-24 hours

**Do not proceed to Phase 3 until both apps are approved and ready to release.**

---

### **PHASE 3: The Migration Loop (Enable Force Update)**

#### 3.1 Release Native Apps to Stores

Once both apps are approved:

1. **iOS:** Click "Release this Version" in App Store Connect
2. **Android:** Start the 100% rollout in Google Play Console

**Wait 1-2 hours** for the apps to be fully available in stores.

#### 3.2 Enable the Force Update Gatekeeper

Now, enable the forced update via OTA:

**Option A: Quick OTA Toggle (Recommended)**

Create a simple OTA update that just enables the flag:

1. In `services/updateService.ts`, change:
   ```typescript
   enabled: false,  // ← Change to:
   enabled: true,   // ✅ ENABLED
   ```

2. In `context/ForceUpdateContext.tsx`, change:
   ```typescript
   enabled: false,  // ← Change to:
   enabled: true,   // ✅ ENABLED
   ```

3. Publish the OTA:
   ```bash
   eas update --branch production --message "Enable forced update for rebrand"
   ```

**Propagation Time:** 24-48 hours for all users to receive the OTA.

#### 3.3 The User Experience

Here's what happens for users:

```
┌──────────────────────────────────────────────────────────────┐
│  User opens app (still on version 2.1.0)                     │
│                                                              │
│  ↓                                                           │
│                                                              │
│  OTA update downloads in background (enabled: true)          │
│                                                              │
│  ↓                                                           │
│                                                              │
│  ForceUpdateContext checks: 2.1.0 < 2.2.0 → BLOCKED         │
│                                                              │
│  ↓                                                           │
│                                                              │
│  User sees "Update Required" screen                          │
│  - Clear message about rebrand                               │
│  - "Update on App Store" / "Update on Google Play" button    │
│  - App is completely blocked (can't dismiss)                 │
│                                                              │
│  ↓                                                           │
│                                                              │
│  User clicks button → Goes to App Store                      │
│                                                              │
│  ↓                                                           │
│                                                              │
│  User downloads version 2.2.0                                │
│  - New app name visible under icon                           │
│  - New app icon visible on home screen                       │
│  - Version 2.2.0 in Settings                                 │
│                                                              │
│  ↓                                                           │
│                                                              │
│  User opens app → Version check: 2.2.0 >= 2.2.0 → ALLOWED   │
│                                                              │
│  ✅ Migration complete!                                      │
└──────────────────────────────────────────────────────────────┘
```

#### 3.4 Monitor Migration Progress

You can monitor migration progress by:

1. **Expo Dashboard:** Check how many users are on which version
2. **App Store Analytics:** Track download spikes
3. **Your Backend:** Track API calls by app version (if you send version in headers)

Expected timeline:
- **Day 1:** 30-50% of users migrate
- **Day 3:** 70-85% of users migrate
- **Day 7:** 90-95% of users migrate
- **Day 14:** 95-99% of users migrate

---

## 🛠️ Configuration Reference

### Version Numbering Scheme

| Version | Meaning |
|---------|---------|
| `2.1.0` | Current version (before rebrand) |
| `2.2.0` | New version (with rebrand) |
| `2.2.1` | Future OTA-compatible updates |
| `2.3.0` | Future native updates |

### Forced Update Config Options

```typescript
const FORCED_UPDATE_CONFIG = {
  // Master switch - toggle via OTA
  enabled: false,
  
  // Minimum version required (semver format)
  minimumVersion: '2.2.0',
  
  // Message shown to users
  message: 'We\'ve rebranded! Update to continue.',
  
  // Store URLs (iOS needs your App Store ID)
  iosAppStoreUrl: 'https://apps.apple.com/app/id123456789',
  androidPlayStoreUrl: 'https://play.google.com/store/apps/details?id=com.your.app',
};
```

---

## 🧪 Testing the Flow

### Test as a User on Old Version

1. **Install version 2.1.0** on a test device:
   ```bash
   # Build the old version
   git checkout <commit-before-changes>
   eas build --platform ios --profile production
   ```

2. **Install on device** (don't run yet)

3. **Publish OTA with enabled: true**

4. **Open the app** on the test device
   - You should see the Force Update screen
   - Click the update button
   - Verify it opens the App Store

5. **Install version 2.2.0** from the store

6. **Open the app again**
   - Should load normally (no force update screen)

### DEV Mode Testing

In development mode (`__DEV__` is true), the ForceUpdateScreen includes a **"[DEV] Dismiss for Testing"** button. This allows you to:
- Test the UI without being permanently blocked
- Verify the screen renders correctly
- Test the store link functionality

---

## ⚠️ Troubleshooting

### Users Not Seeing the Force Update Screen

**Possible causes:**
1. OTA update hasn't propagated yet (wait 24-48 hours)
2. `enabled` is still `false`
3. User is on version >= 2.2.0 already

**Check:**
```bash
# Verify OTA update was published
eas update:list
```

### App Store Links Not Working

**iOS:**
- Ensure URL format is: `https://apps.apple.com/app/idYOUR_APP_ID`
- Find your App ID in App Store Connect

**Android:**
- Ensure package name matches exactly: `com.femtech.femtechmobileapp`
- URL format: `https://play.google.com/store/apps/details?id=com.femtech.femtechmobileapp`

### Users Stuck on Old Version After Update

**Cause:** App Store cache or slow rollout

**Solution:**
- Wait 24 hours for store propagation
- Ask user to force-close and reopen the app
- Check if OTA update is stuck (restart app)

---

## 📊 Files Modified

| File | Purpose |
|------|---------|
| `context/ForceUpdateContext.tsx` | New - Manages forced update state globally |
| `components/ForceUpdateScreen.tsx` | New - UI for blocking users |
| `services/updateService.ts` | Updated - Added forced update logic |
| `app/_layout.tsx` | Updated - Integrated ForceUpdateProvider |
| `app.json` | Updated - Version bumped to 2.2.0 |
| `package.json` | Updated - Version bumped to 2.2.0 |

---

## 🎯 Success Metrics

After completing the migration, you should see:

- ✅ **100% of active users** on version 2.2.0+
- ✅ **New app name** visible for all users
- ✅ **New app icon** visible for all users
- ✅ **No users stuck** on old branding
- ✅ **Minimal user complaints** (clear messaging helps)

---

## 🔄 Future Forced Updates

You can reuse this system for future mandatory updates:

```typescript
// Just update these values and publish OTA:
FORCED_UPDATE_CONFIG = {
  enabled: true,
  minimumVersion: '2.3.0',  // New minimum version
  message: 'Please update for important bug fixes.',
}
```

---

## 📞 Support

If you encounter issues during the migration:

1. Check Expo Dashboard for OTA update status
2. Check App Store Connect / Google Play Console for app status
3. Review logs in your analytics platform
4. Test on a clean device with old version installed

---

**Good luck with your rebrand! 🚀**
