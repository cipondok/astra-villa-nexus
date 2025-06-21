
import { toast } from 'sonner';

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
}

export interface Property {
  id: string;
  title: string;
  price_astra: number;
  price_usd?: number;
  location: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: 'available' | 'sold';
  description?: string;
  images?: string[];
}

export interface Transaction {
  id: string;
  property_id: string;
  buyer_id: string;
  amount_astra: number;
  status: string;
  created_at: string;
  property_title?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ASTRATokenAPI {
  private baseURL = 'https://cerdnikfqijyqugguryx.supabase.co/functions/v1/astra-api';
  private apiKey = 'your-api-key-here'; // This should be moved to environment variable
  private requestCount = 0;
  private requestResetTime = Date.now() + 3600000; // 1 hour from now

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    // Rate limiting check
    if (Date.now() > this.requestResetTime) {
      this.requestCount = 0;
      this.requestResetTime = Date.now() + 3600000;
    }

    if (this.requestCount >= 1000) {
      throw new Error('Rate limit exceeded. Please try again in an hour.');
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          ...options.headers,
        },
      });

      this.requestCount++;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }

  // User management
  async getUserBalance(userId: string): Promise<APIResponse<{ balance: number }>> {
    return this.makeRequest<{ balance: number }>(`/balance?userId=${userId}`);
  }

  async getUser(userId: string): Promise<APIResponse<User>> {
    return this.makeRequest<User>(`/users?userId=${userId}`);
  }

  async createUser(
    email: string, 
    password: string, 
    username: string, 
    initialBalance?: number
  ): Promise<APIResponse<User>> {
    return this.makeRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, initialBalance }),
    });
  }

  // Property operations
  async getProperties(limit?: number): Promise<APIResponse<Property[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.makeRequest<Property[]>(`/properties${params}`);
  }

  async getProperty(propertyId: string): Promise<APIResponse<Property>> {
    return this.makeRequest<Property>(`/properties?propertyId=${propertyId}`);
  }

  async createProperty(propertyData: Omit<Property, 'id'>): Promise<APIResponse<Property>> {
    return this.makeRequest<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  // Transactions
  async purchaseProperty(
    propertyId: string, 
    buyerId: string, 
    amount: number
  ): Promise<APIResponse<Transaction>> {
    return this.makeRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        property_id: propertyId,
        buyer_id: buyerId,
        amount_astra: amount,
      }),
    });
  }

  async getTransactionHistory(
    userId: string, 
    limit?: number
  ): Promise<APIResponse<Transaction[]>> {
    const params = new URLSearchParams({ userId });
    if (limit) params.append('limit', limit.toString());
    return this.makeRequest<Transaction[]>(`/transactions?${params}`);
  }

  // Balance operations
  async addBalance(
    userId: string, 
    amount: number, 
    reason: string
  ): Promise<APIResponse<{ balance: number }>> {
    return this.makeRequest<{ balance: number }>('/balance', {
      method: 'POST',
      body: JSON.stringify({ userId, amount, reason }),
    });
  }
}

export const astraAPI = new ASTRATokenAPI();
