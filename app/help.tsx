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
      answer: 'To place an order, browse our products, select the items you want, add them to your cart, and proceed to checkout. Follow the steps to enter your shipping and payment information.'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards including Visa, Mastercard, and American Express. We also support digital payment methods like PayPal and Apple Pay.'
    },
    {
      id: '3',
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email. You can use this number on our website or in the app to track your shipment in real-time.'
    },
    {
      id: '4',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all items. Items must be in original condition with tags attached. Contact our customer support for return instructions.'
    },
    {
      id: '5',
      question: 'How do I contact customer support?',
      answer: 'You can contact customer support via email at support@techin.com or call us at 1-800-TECHIN-1. Our support team is available 24/7.'
    }
  ];

  const contactOptions = [
    {
      id: 'email',
      title: 'Email Support',
      icon: 'mail',
      subtitle: 'support@techin.com',
      onPress: () => Linking.openURL('mailto:support@techin.com')
    },
    {
      id: 'phone',
      title: 'Phone Support',
      icon: 'call',
      subtitle: '1-800-TECHIN-1',
      onPress: () => Linking.openURL(`tel:${Platform.OS === 'ios' ? '+' : ''}1800TECHIN1`)
    },
    {
      id: 'livechat',
      title: 'Live Chat',
      icon: 'chatbubble',
      subtitle: 'Chat with an agent',
      onPress: () => console.log('Live chat pressed')
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: 'help-circle',
      subtitle: 'Frequently asked questions',
      onPress: () => console.log('FAQ pressed')
    }
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

        {/* Additional Resources */}
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
        </View>
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