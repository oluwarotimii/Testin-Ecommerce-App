import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const faqItems = [
    {
      id: '1',
      question: 'How do I place an order?',
      answer: 'To place an order, browse our products, select the items you want, add them to your cart, and proceed to checkout. Follow the steps to enter your shipping and payment information. All orders are placed directly in the app.'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept direct bank transfers and card payments. Choose your preferred payment method during checkout.'
    },
    {
      id: '3',
      question: 'How can I track my order?',
      answer: 'Once your order is placed, you can track its status in the app. The order status will be updated in real-time so you can monitor the progress. You can also call our support team to get updates on your order status.'
    },
    {
      id: '4',
      question: 'When will I receive updates about my order?',
      answer: 'Order status updates are displayed directly in the app. You will receive notifications and can check the status anytime in the Orders section. For additional support, you can call us to track the status of your order.'
    },
    {
      id: '5',
      question: 'Can I get feedback about my order?',
      answer: 'Yes! You can view order updates and feedback directly in the app. The order status will be updated as it progresses through processing, shipping, and delivery stages.'
    }
  ];

  const contactOptions = [
    {
      id: 'whatsapp',
      title: 'WhatsApp Support',
      icon: 'chatbubbles',
      subtitle: '+2348051516565',
      onPress: () => Linking.openURL('https://wa.me/+2348051516565')
    },
    {
      id: 'email',
      title: 'Email Support',
      icon: 'mail',
      subtitle: 'support@femtech.ng',
      onPress: () => Linking.openURL('mailto:support@femtech.ng')
    },
    {
      id: 'phone',
      title: 'Phone Support',
      icon: 'call',
      subtitle: '+2348051516565',
      onPress: () => Linking.openURL(`tel:${Platform.OS === 'ios' ? '+' : ''}+2348051516565`)
    },
   
   
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Help & Support</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <View style={styles.content}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            {contactOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
          <View style={[styles.faqContainer, { backgroundColor: colors.surface }]}>
            {faqItems.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={[styles.faqItem, { borderBottomColor: colors.border }]}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </View>
                <Text style={[styles.faqAnswer, { color: colors.text }]}>{faq.answer}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Resources
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Resources</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => console.log('Returns pressed')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                  <Ionicons name="return-down-back" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Returns & Exchanges</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => console.log('Shipping pressed')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                  <Ionicons name="boat" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Shipping Information</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => console.log('Warranty pressed')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Warranty Information</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View> */}
      </View>
    </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  faqContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});