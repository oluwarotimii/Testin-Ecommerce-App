import Constants from 'expo-constants';

// Access environment variables from app.json extra section
const { expoPublicWordpressUrl, expoPublicApiServiceType, expoPublicDashboardUrl } = Constants.expoConfig?.extra || {};

export const API_SERVICE_TYPE = expoPublicApiServiceType || 'wordpress'; // 'dummy' or 'wordpress'
export const WORDPRESS_URL = expoPublicWordpressUrl || 'https://femtech.ng/';
export const DASHBOARD_URL = expoPublicDashboardUrl || 'https://femapp.vercel.app'; // Dashboard API URL for banners and carousels
export const API_BASE_URL = WORDPRESS_URL; // Use the WordPress URL as the base API URL for products, etc.

// Separate base URL for dashboard services (banners, carousels, etc.)
export const DASHBOARD_API_BASE_URL = DASHBOARD_URL; // Use the dashboard URL for banner/carousel API
