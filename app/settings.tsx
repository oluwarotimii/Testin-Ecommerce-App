import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import updateService from '@/services/updateService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { colorScheme, toggleColorScheme, setColorScheme } = useTheme();
  const { signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  const settingsItems = [
    {
      id: 'appearance',
      title: 'Appearance',
      icon: 'moon',
      onPress: () => {
        const newScheme = darkMode ? 'light' : 'dark';
        setColorScheme(newScheme);
        setDarkMode(!darkMode);
      },
      type: 'switch',
      value: darkMode,
    },
    // {
    //   id: 'notifications',
    //   title: 'Push Notifications',
    //   icon: 'notifications',
    //   type: 'switch',
    //   value: notifications,
    //   onToggle: setNotifications,
    // },
    // {
  //     id: 'email-notifications',
  //     title: 'Email Notifications',
  //     icon: 'mail',
  //     type: 'switch',
  //     value: emailNotifications,
  //     onToggle: setEmailNotifications,
  //   },
  //   {
  //     id: 'newsletter',
  //     title: 'Subscribe to Newsletter',
  //     icon: 'newspaper',
  //     type: 'switch',
  //     value: newsletter,
  //     onToggle: setNewsletter,
  //   },
  ];

  const appSettingsItems = [
    // {
    //   id: 'language',
    //   title: 'Language',
    //   icon: 'globe',
    //   onPress: () => console.log('Language setting pressed'),
    // },
    // {
    //   id: 'currency',
    //   title: 'Currency',
    //   icon: 'cash',
    //   onPress: () => console.log('Currency setting pressed'),
    // },
    // {
    //   id: 'updates',
    //   title: 'Check for Updates',
    //   icon: 'download',
    //   onPress: () => updateService.forceCheckForUpdates(),
    // },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-checkmark',
      onPress: () => console.log('Privacy Policy pressed'),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'document-text',
      onPress: () => console.log('Terms of Service pressed'),
    },
  ];

  const accountItems = [
    // {
    //   id: 'delete-account',
    //   title: 'Delete Account',
    //   icon: 'trash',
    //   onPress: () => console.log('Delete Account pressed'),
    // },
  ];

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <View style={{ width: 24 }} /> {/* Spacer for alignment */}
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            {settingsItems.map((item) => (
              <View key={item.id} style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
                </View>
                {item.type === 'switch' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle || (() => {
                      const newScheme = darkMode ? 'light' : 'dark';
                      setColorScheme(newScheme);
                      setDarkMode(!darkMode);
                    })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                ) : (
                  <TouchableOpacity onPress={item.onPress}>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            {appSettingsItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            {accountItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.surface }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Techin Mobile v1.0.0</Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuContainer: {
    marginHorizontal: 20,
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
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 100,
  },
  versionText: {
    fontSize: 12,
  },
});