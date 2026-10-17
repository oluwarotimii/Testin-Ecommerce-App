import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CompassIcon } from 'phosphor-react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import { fontFamily } from '@/constants/designTokens';

export default function NotFoundScreen() {
  const colors = useThemeColors();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <CompassIcon size={64} color={colors.textSecondary} />
        <Text style={[styles.text, { color: colors.text }]}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={{ color: colors.primary, fontFamily: fontFamily.semiBold, fontSize: 16 }}>
            Go to home screen
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontFamily: fontFamily.semiBold,
    marginTop: 16,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
