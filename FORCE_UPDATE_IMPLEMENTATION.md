# Force Update Implementation - Quick Reference

## ✅ What Was Implemented

### New Files Created
1. **`context/ForceUpdateContext.tsx`** - Manages forced update state globally
2. **`components/ForceUpdateScreen.tsx`** - UI for blocking users with update required screen
3. **`MIGRATION_GUIDE.md`** - Complete step-by-step migration strategy guide

### Modified Files
1. **`services/updateService.ts`** - Added forced update checking logic
2. **`app/_layout.tsx`** - Integrated ForceUpdateProvider and ForceUpdateScreen
3. **`app.json`** - Version bumped to 2.2.0
4. **`package.json`** - Version bumped to 2.2.0

---

## 🎯 Configuration Required

### Before Deploying OTA Update

Edit these two files with your actual App Store ID:

**1. `services/updateService.ts`** (line ~38):
```typescript
iosAppStoreUrl: 'https://apps.apple.com/app/idYOUR_APP_ID',  // ← REPLACE THIS
```

**2. `context/ForceUpdateContext.tsx`** (line ~48):
```typescript
appStoreUrl: 'https://apps.apple.com/app/idYOUR_APP_ID',  // ← REPLACE THIS
```

---

## 🚀 Quick Start

### Current State
- ✅ Force update logic is **DISABLED** (`enabled: false`)
- ✅ Minimum version set to **2.2.0**
- ✅ Version numbers updated in app.json and package.json

### To Enable Forced Updates

**Step 1:** Change this in BOTH files:
```typescript
// services/updateService.ts (line 22)
enabled: false,  // ← Change to:
enabled: true,

// context/ForceUpdateContext.tsx (line 37)  
enabled: false,  // ← Change to:
enabled: true,
```

**Step 2:** Publish OTA update:
```bash
eas update --branch production --message "Enable forced update"
```

---

## 📊 How It Works

```
User on v2.1.0 → Opens app → OTA updates → Force check runs → 
2.1.0 < 2.2.0 → BLOCKED → Sees update screen → Clicks button → 
Goes to App Store → Downloads v2.2.0 → Opens app → 
2.2.0 >= 2.2.0 → ALLOWED → ✅ Migration complete!
```

---

## 🧪 Testing

### In Development Mode
- The ForceUpdateScreen has a **"[DEV] Dismiss for Testing"** button
- You can test the UI without being permanently blocked
- Set `enabled: true` temporarily to test

### Test Flow
1. Set `enabled: true` in both config files
2. Run `npm run dev`
3. You should see the Force Update screen
4. Click the update button to verify store link works
5. Use [DEV] dismiss button to continue testing

---

## 📝 Key Configuration

```typescript
const FORCE_UPDATE_CONFIG = {
  enabled: false,              // Master switch
  minimumVersion: '2.2.0',     // Minimum required version
  message: 'We\'ve rebranded!...',  // User message
  appStoreUrl: '...',          // iOS store link
  playStoreUrl: '...',         // Android store link
};
```

---

## ⚠️ Important Notes

1. **Keep `enabled: false`** until your native build (v2.2.0) is approved in stores
2. **Wait 24-48 hours** after publishing OTA for full propagation
3. **Test thoroughly** before enabling in production
4. **Monitor analytics** after enabling to track migration progress

---

## 📖 Full Documentation

See **`MIGRATION_GUIDE.md`** for the complete step-by-step migration strategy including:
- Pre-flight checklist
- Phase-by-phase execution plan
- App store submission instructions
- Troubleshooting guide

---

**Build Status:** ✅ Passing (verified with `expo export --platform web`)
