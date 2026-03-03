import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Download, Apple, Play, HelpCircle } from 'lucide-react-native';
import { useForceUpdate } from '@/context/ForceUpdateContext';

/**
 * ForceUpdateScreen
 *
 * A full-screen component that blocks app access until the user updates.
 * This is the "Gatekeeper" UI for your rebrand migration.
 *
 * Features:
 * - Blocks all interaction with the app
 * - Clear messaging about the rebrand
 * - Direct link to App Store / Google Play (auto-detected by platform)
 * - Professional, non-dismissible design
 */
export default function ForceUpdateScreen() {
  const { updateInfo, dismissUpdate } = useForceUpdate();

  const handleUpdatePress = async () => {
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

  if (!updateInfo) {
    return null;
  }

  const isIOS = Platform.OS === 'ios';

  return (
    <View style={styles.overlay}>
      <StatusBar hidden />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Content */}
        <View style={styles.content}>
          {/* Icon/Logo */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <View style={styles.iconCircle}>
                <Download size={56} color="#4A90E2" strokeWidth={2} />
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Update Required</Text>

          {/* Message */}
          <Text style={styles.message}>{updateInfo.updateMessage}</Text>

          {/* Version Badge */}
          <View style={styles.versionBadge}>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Current Version</Text>
              <Text style={styles.versionValue}>{updateInfo.currentVersion}</Text>
            </View>
            <View style={styles.versionDivider} />
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Required Version</Text>
              <Text style={styles.versionValueHighlight}>{updateInfo.storeVersion}</Text>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdatePress}
            activeOpacity={0.85}
          >
            <View style={styles.buttonContent}>
              {isIOS ? (
                <Apple size={24} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Play size={24} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
              )}
              <Text style={styles.updateButtonText}>
                {isIOS ? 'Update on App Store' : 'Update on Google Play'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Help Link */}
          {/* <TouchableOpacity
            style={styles.helpButton}
            onPress={async () => {
              await Linking.openURL('https://femtechit.com/support');
            }}
          >
            <View style={styles.helpButtonContent}>
              <HelpCircle size={18} color="#4A90E2" strokeWidth={2} />
              <Text style={styles.helpButtonText}>Need Help?</Text>
            </View>
          </TouchableOpacity> */}

          {/* DEV ONLY: Dismiss button for testing
          {__DEV__ && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={dismissUpdate}
            >
              <Text style={styles.dismissButtonText}>[DEV] Dismiss for Testing</Text>
            </TouchableOpacity>
          )} */}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This update includes important improvements{'\n'}and new features.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F9FE',
    zIndex: 9999,
    elevation: 9999,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    color: '#5A5A7A',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  versionBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 280,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  versionLabel: {
    fontSize: 14,
    color: '#8A8AA0',
    fontWeight: '500',
  },
  versionValue: {
    fontSize: 16,
    color: '#5A5A7A',
    fontWeight: '600',
  },
  versionDivider: {
    height: 1,
    backgroundColor: '#E8E8F0',
    marginVertical: 8,
  },
  versionValueHighlight: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '700',
  },
  updateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 280,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  helpButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 4,
  },
  helpButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpButtonText: {
    color: '#4A90E2',
    fontSize: 15,
    fontWeight: '600',
  },
  dismissButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#FF9500',
    borderRadius: 10,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
  },
  dismissButtonText: {
    color: '#FF9500',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    paddingTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8A8AA0',
    textAlign: 'center',
    lineHeight: 22,
  },
});
