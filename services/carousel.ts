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
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${DASHBOARD_API_BASE_URL}/api/carousel/public?limit=${limit}`, {
            signal: controller.signal,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            }
        });

        clearTimeout(timeoutId);

        console.log('Carousel API Response Status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Carousel API Data:', JSON.stringify(data, null, 2));

        return data.data || [];
    } catch (error: any) {
        console.error('Error fetching carousels:', error.message, error.stack);

        // Check if it's a network error specifically
        if (error.name === 'AbortError') {
            console.log('Carousel request timed out');
        } else if (error.message?.includes('Network request failed')) {
            console.log('Network error occurred while fetching carousels');
        }

        // Return fallback carousel items if API fails
        console.log('Returning fallback carousel items');
        return [
            {
                id: 1,
                title: 'Welcome to FemTech Store',
                subtitle: 'Discover amazing tech products',
                imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
                linkType: 'category',
                linkValue: '1',
                position: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Special Offers',
                subtitle: 'Check out our latest deals',
                imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
                linkType: 'category',
                linkValue: '2',
                position: 2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'New Arrivals',
                subtitle: 'Latest products in stock',
                imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
                linkType: 'category',
                linkValue: '3',
                position: 3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }
}
