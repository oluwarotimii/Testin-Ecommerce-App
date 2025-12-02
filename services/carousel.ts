import { DASHBOARD_API_BASE_URL } from './config';

export interface CarouselItem {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    linkType: string;
    linkValue: string;
    position: number;
    createdAt: string;
    updatedAt: string;
}

export async function fetchCarousels(limit: number = 10): Promise<CarouselItem[]> {
    try {
        const response = await fetch(`${DASHBOARD_API_BASE_URL}/api/carousel/public?limit=${limit}`);
        console.log('Carousel API Response Status:', response.status);
        const data = await response.json();
        console.log('Carousel API Data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch carousels');
        }

        return data.data;
    } catch (error: any) {
        console.error('Error fetching carousels:', error.message, error.stack);
        throw error;
    }
}
