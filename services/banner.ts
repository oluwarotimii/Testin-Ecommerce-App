import { DASHBOARD_API_BASE_URL } from './config';

export interface BannerItem {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    linkType: string;
    linkValue: string;
    createdAt: string;
    updatedAt: string;
}

export async function fetchBanner(): Promise<BannerItem | null> {
    try {
        const response = await fetch(`${DASHBOARD_API_BASE_URL}/api/banner/public`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch banner');
        }

        // Returns null if no active banner
        return data.data || null;
    } catch (error) {
        console.error('Error fetching banner:', error);
        throw error;
    }
}
