import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SCREEN_SEEN_KEY = '@welcome_screen_seen';

/**
 * Checks if the welcome screen has been seen before
 */
export const hasSeenWelcomeScreen = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(WELCOME_SCREEN_SEEN_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error getting welcome screen state:', error);
    return false; // Default to false if there's an error
  }
};

/**
 * Marks the welcome screen as seen
 */
export const markWelcomeScreenAsSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(WELCOME_SCREEN_SEEN_KEY, 'true');
  } catch (error) {
    console.error('Error setting welcome screen state:', error);
  }
};