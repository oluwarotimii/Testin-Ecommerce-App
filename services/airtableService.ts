interface AirtableRecord {
  id: string;
  fields: {
    [key: string]: any;
  };
  createdTime: string;
}

interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkType: 'product' | 'category' | 'external' | 'none';
  linkValue: string;
  isActive: boolean;
  order: number;
  backgroundColor?: string;
}

interface PromoNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  startDate: string;
  endDate: string;
  targetAudience: 'all' | 'new' | 'returning' | 'vip';
  actionType: 'none' | 'navigate' | 'external';
  actionValue: string;
}

class AirtableService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // TODO: Replace with your actual Airtable credentials
    this.baseUrl = 'https://api.airtable.com/v0/YOUR_AIRTABLE_BASE_ID';
    this.apiKey = 'YOUR_AIRTABLE_API_KEY';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Airtable request failed:', error);
      throw error;
    }
  }

  async getCarouselItems(): Promise<CarouselItem[]> {
    try {
      const response = await this.makeRequest('/Carousel?filterByFormula=AND({Active}=TRUE())&sort[0][field]=Order&sort[0][direction]=asc');
      
      return response.records.map((record: AirtableRecord) => ({
        id: record.id,
        title: record.fields.Title || '',
        subtitle: record.fields.Subtitle || '',
        imageUrl: record.fields.Image?.[0]?.url || '',
        linkType: record.fields.LinkType || 'none',
        linkValue: record.fields.LinkValue || '',
        isActive: record.fields.Active || false,
        order: record.fields.Order || 0,
        backgroundColor: record.fields.BackgroundColor || '#007AFF',
      }));
    } catch (error) {
      console.error('Failed to fetch carousel items:', error);
      // Return fallback data
      return this.getFallbackCarouselItems();
    }
  }

  async getPromoNotifications(): Promise<PromoNotification[]> {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const filterFormula = `AND({Active}=TRUE(), {StartDate}<=DATETIME_PARSE('${currentDate}'), {EndDate}>=DATETIME_PARSE('${currentDate}'))`;
      
      const response = await this.makeRequest(`/Notifications?filterByFormula=${encodeURIComponent(filterFormula)}`);
      
      return response.records.map((record: AirtableRecord) => ({
        id: record.id,
        title: record.fields.Title || '',
        message: record.fields.Message || '',
        type: record.fields.Type || 'info',
        isActive: record.fields.Active || false,
        startDate: record.fields.StartDate || '',
        endDate: record.fields.EndDate || '',
        targetAudience: record.fields.TargetAudience || 'all',
        actionType: record.fields.ActionType || 'none',
        actionValue: record.fields.ActionValue || '',
      }));
    } catch (error) {
      console.error('Failed to fetch promo notifications:', error);
      return [];
    }
  }

  async createNotificationLog(notificationId: string, userId: string, action: 'sent' | 'opened' | 'dismissed') {
    try {
      await this.makeRequest('/NotificationLogs', {
        method: 'POST',
        body: JSON.stringify({
          fields: {
            NotificationId: notificationId,
            UserId: userId,
            Action: action,
            Timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log notification action:', error);
    }
  }

  private getFallbackCarouselItems(): CarouselItem[] {
    return [
      {
        id: 'fallback-1',
        title: 'Welcome to Techin',
        subtitle: 'Discover amazing tech products',
        imageUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800',
        linkType: 'none',
        linkValue: '',
        isActive: true,
        order: 1,
        backgroundColor: '#0B00C4',
      },
      {
        id: 'fallback-2',
        title: 'Special Offers',
        subtitle: 'Up to 50% off selected items',
        imageUrl: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=800',
        linkType: 'none',
        linkValue: '',
        isActive: true,
        order: 2,
        backgroundColor: '#0B00C4',
      },
      {
        id: 'fallback-3',
        title: 'Latest Tech',
        subtitle: 'Cutting-edge innovations',
        imageUrl: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800',
        linkType: 'none',
        linkValue: '',
        isActive: true,
        order: 3,
        backgroundColor: '#0B00C4',
      },
    ];
  }

  // Method to update Airtable credentials
  updateCredentials(baseId: string, apiKey: string) {
    this.baseUrl = `https://api.airtable.com/v0/${baseId}`;
    this.apiKey = apiKey;
  }
}

export default new AirtableService();