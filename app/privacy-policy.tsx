import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicyScreen = () => {
  const router = useRouter();
  const colors = useThemeColors();

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWebsitePress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Effective Date: January 12, 2026
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Information We Collect
        </Text>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          We may collect the following types of information:
        </Text>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Personal Information: Name, email address, phone number, and other contact details you provide when registering or using our services.
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Usage Data: Information about how you interact with our app, including pages visited, time spent, and features used.
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Device Information: Device type, operating system, and unique device identifiers.
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Location Data: Precise or approximate location information when enabled by you.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          How We Use Your Information
        </Text>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          We use your information to:
        </Text>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Provide and maintain our services
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Process transactions and send related communications
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Send promotional materials and updates (with your consent)
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Improve user experience and app functionality
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Comply with legal obligations
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Data Sharing and Disclosure
        </Text>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          We may share your information with:
        </Text>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Service providers who assist in our operations
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Third-party partners for analytics and advertising
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Legal authorities when required by law
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Business transferees in case of mergers or acquisitions
          </Text>
        </View>
        <Text style={[styles.bodyText, { color: colors.text, marginTop: 10 }]}>
          All third-party partners are required to maintain strict confidentiality and comply with data protection laws.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Cookies and Tracking Technologies
        </Text>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          Femtech uses cookies and similar technologies to improve user experience and website performance. Cookies help us:
        </Text>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Remember your preferences
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Keep items in your cart
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Analyze website traffic and usage
          </Text>
        </View>
        <Text style={[styles.bodyText, { color: colors.text, marginTop: 10 }]}>
          You can control or delete cookies through your browser settings, but some website features may not function properly if cookies are disabled.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Your Rights and Choices
        </Text>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          As a user, you have the right to:
        </Text>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Request access to your personal data
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Correct or update your information
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Request deletion of your personal data (where applicable)
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>•</Text>
          <Text style={[styles.listText, { color: colors.text }]}>
            Opt-out of marketing emails at any time by clicking "unsubscribe"
          </Text>
        </View>
        <Text style={[styles.bodyText, { color: colors.text, marginTop: 10 }]}>
          To exercise any of these rights, please contact us at{' '}
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => handleEmailPress('info@femtechit.com')}>
            info@femtechit.com
          </Text>{' '}
          or{' '}
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => handlePhonePress('08051516565')}>
            08051516565
          </Text>.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Third-Party Links
        </Text>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          Our website may contain links to third-party websites (e.g., payment gateways, social media). Femtech is not responsible for the privacy practices or content of those external sites. We encourage users to review the privacy policies of any third-party sites they visit.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Updates to This Policy
        </Text>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          Femtech may update this Privacy Policy from time to time. All updates will be posted on this page with a new "Last Updated" date. We encourage you to check this page periodically for changes.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Contact Us
        </Text>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          If you have any questions or concerns about this Privacy Policy or your data, please contact us via:
        </Text>

        <View style={styles.contactItem}>
          <Text style={[styles.contactLabel, { color: colors.text }]}>📧 Email:</Text>
          <TouchableOpacity onPress={() => handleEmailPress('info@femtechit.com')}>
            <Text style={[styles.link, { color: colors.primary }]}>info@femtechit.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactItem}>
          <Text style={[styles.contactLabel, { color: colors.text }]}>📞 Phone:</Text>
          <TouchableOpacity onPress={() => handlePhonePress('08051516565')}>
            <Text style={[styles.link, { color: colors.primary }]}>08051516565</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePhonePress('08099996565')}>
            <Text style={[styles.link, { color: colors.primary }]}>08099996565</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactItem}>
          <Text style={[styles.contactLabel, { color: colors.text }]}>🌐 Website:</Text>
          <TouchableOpacity onPress={() => handleWebsitePress('https://www.femtechit.com')}>
            <Text style={[styles.link, { color: colors.primary }]}>www.femtechit.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactItem}>
          <Text style={[styles.contactLabel, { color: colors.text }]}>🏢 Head Office:</Text>
          <Text style={[styles.bodyText, { color: colors.text }]}>Ilorin, Kwara State, Nigeria</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    marginLeft: 16,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    width: 16,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  link: {
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  contactItem: {
    marginLeft: 16,
    marginBottom: 10,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
});

export default PrivacyPolicyScreen;