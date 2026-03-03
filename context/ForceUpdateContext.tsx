import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Linking } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

interface ForceUpdateContextType {
  isUpdateRequired: boolean;
  updateInfo: UpdateInfo | null;
  checkForcedUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

interface UpdateInfo {
  currentVersion: string;
  storeVersion: string;
  minimumVersion: string;
  updateMessage: string;
  updateUrl: string;
}

const ForceUpdateContext = createContext<ForceUpdateContextType | undefined>(undefined);

/**
 * Configuration for forced updates
 *
 * STRATEGY: This is the "Logic Injection" for your rebrand migration.
 *
 * How it works:
 * 1. Set minimumVersion to the NEW native version you're submitting to stores
 * 2. Users on old versions will be blocked with a mandatory update screen
 * 3. Once they update via the store, they get the new branding/name/icon
 *
 * TIMING:
 * - Deploy this OTA update FIRST (with enabled: false)
 * - Wait for native build approval from app stores
 * - THEN enable force update via another OTA update
 *
 * ⚠️ PRODUCTION SETTINGS (as of Feb 27, 2026):
 * - enabled: false (disabled until store approval)
 * - minimumVersion: 2.2.0 (current store version, no blocking)
 *
 * TO ENABLE FORCE UPDATE:
 * 1. Wait until iOS & Android 2.3.0 are LIVE in stores
 * 2. Change enabled to true
 * 3. Change minimumVersion to '2.3.0'
 * 4. Deploy OTA: eas update --branch production --message "Enable force update"
 */
const FORCE_UPDATE_CONFIG = {
  /**
   * The minimum version required to use the app
   * Users below this version will be forced to update
   *
   * ⚠️ PRODUCTION: Set to current store version to avoid blocking
   * ✅ CURRENT: 2.2.0 (matches app.json version)
   *
   * TO ENABLE: Change to '2.3.0' after native build is live
   */
  minimumVersion: '2.5.0', // Production: matches current store version

  /**
   * Enable/disable the forced update check
   * Set to false to disable the gatekeeper temporarily
   *
   * ⚠️ PRODUCTION: false (disabled until store approval)
   * ✅ CURRENT: false (DISABLED FOR TESTING)
   *
   * TO ENABLE: Change to true after native build is live
   */
  enabled: false, // Production: disabled by default

  /**
   * Custom message shown to users
   */
  updateMessage: 'Please update to the latest version to continue using the app.',

  /**
   * App Store URLs for your app
   */
  appStoreUrl: 'https://apps.apple.com/app/id6758462281',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.femtech.femtechmobileapp',
};

export function ForceUpdateProvider({ children }: { children: ReactNode }) {
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  /**
   * Get the current app version from expo-updates or constants
   */
  const getCurrentVersion = (): string => {
    // Try to get from Updates first (works for OTA builds)
    if (Updates.updateId) {
      // For OTA builds, we need to get the base app version
      return Constants.expoConfig?.version || '0.0.0';
    }
    // Fallback to expo config version
    return Constants.expoConfig?.version || '0.0.0';
  };

  /**
   * Compare two version strings
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 < num2) return -1;
      if (num1 > num2) return 1;
    }

    return 0;
  };

  /**
   * Check if forced update is required
   * This should be called on app start
   */
  const checkForcedUpdate = async () => {
    // Always clear state first
    setIsUpdateRequired(false);
    setUpdateInfo(null);

    if (!FORCE_UPDATE_CONFIG.enabled) {
      console.log('Force update check disabled');
      return;
    }

    const version = getCurrentVersion();
    setCurrentVersion(version);

    const comparison = compareVersions(version, FORCE_UPDATE_CONFIG.minimumVersion);

    console.log(`Version check: Current=${version}, Minimum=${FORCE_UPDATE_CONFIG.minimumVersion}, Result=${comparison}`);

    if (comparison < 0) {
      // Current version is below minimum - force update
      setIsUpdateRequired(true);
      setUpdateInfo({
        currentVersion: version,
        storeVersion: FORCE_UPDATE_CONFIG.minimumVersion,
        minimumVersion: FORCE_UPDATE_CONFIG.minimumVersion,
        updateMessage: FORCE_UPDATE_CONFIG.updateMessage,
        updateUrl: Platform.OS === 'ios'
          ? FORCE_UPDATE_CONFIG.appStoreUrl
          : FORCE_UPDATE_CONFIG.playStoreUrl,
      });
      console.log('FORCED UPDATE REQUIRED: User must update to continue');
    } else {
      console.log('Version OK: No forced update required');
    }
  };

  /**
   * Dismiss the update requirement (only for debugging/testing)
   * In production, this should NOT allow bypassing the update
   */
  const dismissUpdate = () => {
    if (__DEV__) {
      setIsUpdateRequired(false);
      setUpdateInfo(null);
      console.log('Update dismissed (DEV mode only)');
    }
  };

  /**
   * Open the app store to the update page
   */
  const openAppStore = async () => {
    if (updateInfo?.updateUrl) {
      const supported = await Linking.canOpenURL(updateInfo.updateUrl);
      if (supported) {
        await Linking.openURL(updateInfo.updateUrl);
      } else {
        // Fallback to generic store URL
        const storeUrl = Platform.OS === 'ios'
          ? 'https://apps.apple.com'
          : 'https://play.google.com/store';
        await Linking.openURL(storeUrl);
      }
    }
  };

  // Auto-check on mount and when enabled state changes
  useEffect(() => {
    if (FORCE_UPDATE_CONFIG.enabled) {
      checkForcedUpdate();
    } else {
      // When disabled, ensure state is cleared
      setIsUpdateRequired(false);
      setUpdateInfo(null);
      console.log('Force update disabled - clearing state');
    }
  }, []);

  return (
    <ForceUpdateContext.Provider value={{ 
      isUpdateRequired, 
      updateInfo, 
      checkForcedUpdate,
      dismissUpdate,
    }}>
      {children}
    </ForceUpdateContext.Provider>
  );
}

export function useForceUpdate() {
  const context = useContext(ForceUpdateContext);
  if (context === undefined) {
    throw new Error('useForceUpdate must be used within a ForceUpdateProvider');
  }
  return context;
}

/**
 * Open the app store to the update page
 * This is a standalone function that can be called outside the component
 */
export async function openAppStore(url?: string): Promise<void> {
  const storeUrl = url || (Platform.OS === 'ios'
    ? FORCE_UPDATE_CONFIG.appStoreUrl
    : FORCE_UPDATE_CONFIG.playStoreUrl);

  if (storeUrl) {
    const supported = await Linking.canOpenURL(storeUrl);
    if (supported) {
      await Linking.openURL(storeUrl);
    } else {
      // Fallback to generic store URL
      const fallbackUrl = Platform.OS === 'ios'
        ? 'https://apps.apple.com'
        : 'https://play.google.com/store';
      await Linking.openURL(fallbackUrl);
    }
  }
}

// Export config for external access (e.g., from updateService)
export { FORCE_UPDATE_CONFIG };
