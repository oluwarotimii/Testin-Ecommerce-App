import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import notificationService from '@/services/notificationService';

export default function TestNotificationsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [customProductSlug, setCustomProductSlug] = useState('');
  const [customCategorySlug, setCustomCategorySlug] = useState('');
  const [cartReminderSeconds, setCartReminderSeconds] = useState('30');
  const [cartReminderCount, setCartReminderCount] = useState('2');
  const [cartReminderSource, setCartReminderSource] = useState('Awoof cart');

  const sendTestNotification = async (linkType: string, linkValue: string, title: string, body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            linkType,
            linkValue,
          },
        },
        trigger: null, // Send immediately
      });
      Alert.alert(
        'Notification Sent!',
        `A test notification has been sent.\n\nType: ${linkType}\nValue: ${linkValue}\n\nNow minimize the app and tap the notification to test navigation.`
      );
    } catch (error: any) {
      Alert.alert('Error', `Failed to send notification: ${error.message}`);
    }
  };

  const handleCustomProductTest = () => {
    if (!customProductSlug.trim()) {
      Alert.alert('Error', 'Please enter a product slug or ID');
      return;
    }
    sendTestNotification(
      'product',
      customProductSlug.trim(),
      'Product Test',
      `Testing navigation to product: ${customProductSlug.trim()}`
    );
  };

  const handleCustomCategoryTest = () => {
    if (!customCategorySlug.trim()) {
      Alert.alert('Error', 'Please enter a category slug or ID');
      return;
    }
    sendTestNotification(
      'category',
      customCategorySlug.trim(),
      'Category Test',
      `Testing navigation to category: ${customCategorySlug.trim()}`
    );
  };

  const scheduleCartReminderTest = async () => {
    const seconds = Number.parseInt(cartReminderSeconds, 10);
    const cartCount = Number.parseInt(cartReminderCount, 10);

    if (!Number.isFinite(seconds) || seconds <= 0) {
      Alert.alert('Invalid time', 'Enter a positive number of seconds.');
      return;
    }

    try {
      await notificationService.scheduleCartAbandonmentReminder({
        cartCount: Number.isFinite(cartCount) && cartCount > 0 ? cartCount : 1,
        source: cartReminderSource.trim() || 'shopping cart',
        delaySeconds: seconds,
      });
      Alert.alert(
        'Scheduled',
        `Cart reminder scheduled to repeat every ${seconds}s.\n\nBackground the app and wait for it, then tap it to verify it opens the cart.`
      );
    } catch (error: any) {
      Alert.alert('Error', `Failed to schedule reminder: ${error?.message || 'Unknown error'}`);
    }
  };

  const cancelCartReminderTest = async () => {
    try {
      await notificationService.clearCartAbandonmentReminder();
      Alert.alert('Cancelled', 'Cart reminder cancelled.');
    } catch (error: any) {
      Alert.alert('Error', `Failed to cancel reminder: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Test Push Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="information-circle" size={48} color={colors.primary} />
          <Text style={[styles.infoTitle, { color: colors.text }]}>How to Test</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            1. Enter a product/category slug or ID above (or use preset tests below)
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            2. Tap a test button to send a local notification
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            3. Minimize the app (send to background)
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            4. Tap the notification from the notification center
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            5. Verify the app navigates to the correct screen
          </Text>
        </View>

        {/* Custom Input Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Custom Test</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Enter a real product or category slug/ID from your store
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Product Slug or ID:</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., my-product or 123"
                placeholderTextColor={colors.textSecondary}
                value={customProductSlug}
                onChangeText={setCustomProductSlug}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: colors.primary }]}
                onPress={handleCustomProductTest}
              >
                <Text style={styles.testButtonText}>Test</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Category Slug or ID:</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., electronics or 5"
                placeholderTextColor={colors.textSecondary}
                value={customCategorySlug}
                onChangeText={setCustomCategorySlug}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: colors.success }]}
                onPress={handleCustomCategoryTest}
              >
                <Text style={styles.testButtonText}>Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Cart Abandonment Reminder Test */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cart Abandonment Reminder Test</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            This schedules a repeating local reminder. Set seconds low for testing (e.g. 30).
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Repeat Every (seconds):</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., 30"
                placeholderTextColor={colors.textSecondary}
                value={cartReminderSeconds}
                onChangeText={setCartReminderSeconds}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Cart Count (for message):</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., 2"
                placeholderTextColor={colors.textSecondary}
                value={cartReminderCount}
                onChangeText={setCartReminderCount}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Source Label:</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Awoof cart"
                placeholderTextColor={colors.textSecondary}
                value={cartReminderSource}
                onChangeText={setCartReminderSource}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={scheduleCartReminderTest}
            >
              <Text style={styles.actionButtonText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={cancelCartReminderTest}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Card */}
        <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.info }]}>
          <Ionicons name="lightbulb" size={24} color={colors.info} />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Testing Tips</Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • Test from background/killed state (not when app is open)
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • Use real slugs/IDs from your WooCommerce store
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • Check console logs for debugging if navigation fails
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • ✅ Fixed: Products now work with both slugs and IDs
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • ✅ Fixed: Categories now work with both slugs and IDs
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  section: {
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  testButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  tipCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});
