
import { supabase } from '@/integrations/supabase/client';
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
  metadata?: any;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ASTRATokenAPI {
  private baseURL = 'https://cerdnikfqijyqugguryx.supabase.co/functions/v1/astra-api';
  private requestCount = 0;
  private requestResetTime = Date.now() + 3600000; // 1 hour from now

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get session: ' + sessionError.message);
      }

      if (!session) {
        throw new Error('No active session found. Please login first.');
      }

      if (!session.access_token) {
        throw new Error('No valid access token found. Please login again.');
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        console.log('Token expired, refreshing...');
        
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          throw new Error('Session expired and refresh failed. Please login again.');
        }
        
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshData.session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcmRuaWtmcWlqeXF1Z2d1cnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjEyMjcsImV4cCI6MjA1MDE5NzIyN30.IwqZ0TUwgFKnhMR5gJwPhHUXPRjGkfbA7vUi7XJBrMU',
        };
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcmRuaWtmcWlqeXF1Z2d1cnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjEyMjcsImV4cCI6MjA1MDE5NzIyN30.IwqZ0TUwgFKnhMR5gJwPhHUXPRjGkfbA7vUi7XJBrMU',
      };
    } catch (error) {
      console.error('Auth headers error:', error);
      throw error;
    }
  }

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
      const headers = await this.getAuthHeaders();
      
      console.log('Making ASTRA API request to:', `${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      this.requestCount++;

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        // Handle specific JWT errors
        if (response.status === 401 || errorText.includes('Invalid JWT') || errorText.includes('JWT')) {
          throw new Error('Authentication failed. Please login again.');
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);
      return { success: true, data };
    } catch (error) {
      console.error('API Request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Show user-friendly error messages for auth issues
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('login')) {
        toast.error('Please login to continue');
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // User management
  async getUserBalance(userId: string): Promise<APIResponse<{ balance: number }>> {
    return this.makeRequest<{ balance: number }>(`/users?userId=${userId}`);
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

  async getProperties(limit?: number, filters?: any): Promise<APIResponse<Property[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }
    const queryString = params.toString() ? `?${params}` : '';
    return this.makeRequest<Property[]>(`/properties${queryString}`);
  }

  async getProperty(propertyId: string): Promise<APIResponse<Property>> {
    return this.makeRequest<Property>(`/properties?propertyId=${propertyId}`);
  }

  async createProperty(propertyData: Omit<Property, 'id' | 'status'>): Promise<APIResponse<Property>> {
    return this.makeRequest<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async purchaseProperty(
    propertyId: string, 
    buyerId: string, 
    amount: number,
    metadata?: any
  ): Promise<APIResponse<Transaction>> {
    return this.makeRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        buyerId,
        amount,
        metadata,
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
