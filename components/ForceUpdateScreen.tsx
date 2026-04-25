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
import { useThemeColors } from '@/hooks/useColorScheme';

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
  const colors = useThemeColors();
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';

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
            <View style={[styles.iconBackground, { backgroundColor: isDarkMode ? colors.surface : '#E8F0FE' }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.card }]}>
                <Download size={56} color={colors.primary} strokeWidth={2} />
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>Update Required</Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>{updateInfo.updateMessage}</Text>

          {/* Version Badge */}
            <View style={[styles.versionBadge, { backgroundColor: colors.card }]}>
            <View style={styles.versionRow}>
              <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>Current Version</Text>
              <Text style={[styles.versionValue, { color: colors.text }]}>{updateInfo.currentVersion}</Text>
            </View>
            <View style={[styles.versionDivider, { backgroundColor: colors.border }]} />
            <View style={styles.versionRow}>
              <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>Required Version</Text>
              <Text style={[styles.versionValueHighlight, { color: colors.text }]}>{updateInfo.storeVersion}</Text>
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
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  versionBadge: {
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
    fontWeight: '500',
  },
  versionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionDivider: {
    height: 1,
    marginVertical: 8,
  },
  versionValueHighlight: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '700',
  },
  updateButton: {
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
    textAlign: 'center',
    lineHeight: 22,
  },
});
