import appConfig from '@/hooks/useAppConfig';

// Centralized configuration - single source of truth from useAppConfig
export const API_SERVICE_TYPE = appConfig.apiServiceType; // 'dummy' or 'wordpress'
export const WORDPRESS_URL = appConfig.wordpressUrl;
export const DASHBOARD_URL = appConfig.dashboardUrl; // Dashboard API URL for banners and carousels
export const API_BASE_URL = WORDPRESS_URL; // Use the WordPress URL as the base API URL for products, etc.

// Separate base URL for dashboard services (banners, carousels, etc.)
export const DASHBOARD_API_BASE_URL = DASHBOARD_URL; // Use the dashboard URL for banner/carousel API
