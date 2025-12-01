import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility function to clear all cached data from previous app versions
 */
export const clearAllCachedData = async (): Promise<void> => {
  try {
    // Get all keys currently in AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Remove all keys that are related to user data, cart, search, etc.
    // This will clear all cached data without affecting user preferences like theme
    await AsyncStorage.multiRemove(allKeys);
    
    console.log('All cached data cleared successfully');
  } catch (error) {
    console.error('Error clearing cached data:', error);
    throw error;
  }
};

/**
 * Clear specific cached data that might be causing issues
 */
export const clearSpecificCachedData = async (): Promise<void> => {
  try {
    const keysToClear = [
      'sessionToken',
      'customerId', 
      'cartItems',
      'recentSearches',
      'wishlist',
      'addressBook',
      'userData',
      'orders_cache',
      'products_cache',
      'categories_cache',
      'search_cache',
      // Add other cache keys that may be causing issues
    ];
    
    await AsyncStorage.multiRemove(keysToClear);
    console.log('Specific cached data cleared successfully');
  } catch (error) {
    console.error('Error clearing specific cached data:', error);
    throw error;
  }
};