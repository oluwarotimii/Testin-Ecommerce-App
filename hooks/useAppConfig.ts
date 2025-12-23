import Constants from 'expo-constants';
import { useMemo } from 'react';

// Centralized configuration hook for easy OTA updates
export const useAppConfig = () => {
  // Extract configuration from app.json extra section
  const {
    expoPublicWordpressUrl,
    expoPublicApiServiceType,
    expoPublicDashboardUrl,
    expoPublicAppUrl,
    expoPublicWordpressConsumerKey,
    expoPublicWordpressConsumerSecret
  } = Constants.expoConfig?.extra || {};

  // Memoize the configuration to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // API configuration
    apiServiceType: expoPublicApiServiceType || process.env.EXPO_PUBLIC_API_SERVICE_TYPE || 'wordpress',
    
    // WordPress API configuration - single source of truth
    wordpressUrl: (expoPublicWordpressUrl && expoPublicWordpressUrl.trim() !== '')
      ? expoPublicWordpressUrl
      : (expoPublicAppUrl && expoPublicAppUrl.trim() !== '')
        ? expoPublicAppUrl
        : 'https://invalid-url-for-testing.com/',
    
    // Dashboard API configuration
    dashboardUrl: expoPublicDashboardUrl || 'https://femapp.vercel.app',
    
    // WordPress credentials
    consumerKey: expoPublicWordpressConsumerKey || process.env.EXPO_PUBLIC_WORDPRESS_CONSUMER_KEY || '',
    consumerSecret: expoPublicWordpressConsumerSecret || process.env.EXPO_PUBLIC_WORDPRESS_CONSUMER_SECRET || '',
    
    // Fallback URLs
    fallbackWordpressUrl: 'https://invalid-url-for-testing.com/',
    fallbackDashboardUrl: 'https://femapp.vercel.app'
  }), [
    expoPublicApiServiceType,
    expoPublicWordpressUrl,
    expoPublicDashboardUrl,
    expoPublicAppUrl,
    expoPublicWordpressConsumerKey,
    expoPublicWordpressConsumerSecret
  ]);

  return config;
};

// Standalone configuration object for use in non-component contexts
const appConfig = {
  // Extract configuration from app.json extra section
  get apiServiceType() {
    const { expoPublicApiServiceType } = Constants.expoConfig?.extra || {};
    return expoPublicApiServiceType || process.env.EXPO_PUBLIC_API_SERVICE_TYPE || 'wordpress';
  },
  
  get wordpressUrl() {
    const { expoPublicWordpressUrl, expoPublicAppUrl } = Constants.expoConfig?.extra || {};
    // Check if the values exist and are not empty strings
    const url = (expoPublicWordpressUrl && expoPublicWordpressUrl.trim() !== '')
      ? expoPublicWordpressUrl
      : (expoPublicAppUrl && expoPublicAppUrl.trim() !== '')
        ? expoPublicAppUrl
        : 'https://invalid-url-for-testing.com/';
    return url;
  },
  
  get dashboardUrl() {
    const { expoPublicDashboardUrl } = Constants.expoConfig?.extra || {};
    return expoPublicDashboardUrl || 'https://femapp.vercel.app';
  },
  
  get consumerKey() {
    const { expoPublicWordpressConsumerKey } = Constants.expoConfig?.extra || {};
    return expoPublicWordpressConsumerKey || process.env.EXPO_PUBLIC_WORDPRESS_CONSUMER_KEY || '';
  },
  
  get consumerSecret() {
    const { expoPublicWordpressConsumerSecret } = Constants.expoConfig?.extra || {};
    return expoPublicWordpressConsumerSecret || process.env.EXPO_PUBLIC_WORDPRESS_CONSUMER_SECRET || '';
  }
};

export default appConfig;