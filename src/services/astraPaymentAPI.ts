
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet';
  provider: string;
  last_four?: string;
  is_default: boolean;
}

export interface PaymentTransaction {
  id: string;
  property_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_hash?: string;
  created_at: string;
  metadata?: any;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: 'available' | 'sold' | 'reserved';
  description?: string;
  images?: string[];
  payment_methods_accepted: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  payment_methods: PaymentMethod[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AstraPaymentAPI {
  private baseURL = 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/astra-payment-api';

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
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk',
        };
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk',
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
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('Making ASTRA Payment API request to:', `${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

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

  // Payment Methods
  async getPaymentMethods(userId: string): Promise<APIResponse<PaymentMethod[]>> {
    return this.makeRequest<PaymentMethod[]>(`/payment-methods?userId=${userId}`);
  }

  async addPaymentMethod(userId: string, paymentData: Partial<PaymentMethod>): Promise<APIResponse<PaymentMethod>> {
    return this.makeRequest<PaymentMethod>('/payment-methods', {
      method: 'POST',
      body: JSON.stringify({ userId, ...paymentData }),
    });
  }

  // Properties
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
    return this.makeRequest<Property>(`/properties/${propertyId}`);
  }

  // Payments
  async initiatePayment(
    propertyId: string,
    userId: string,
    paymentMethodId: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<APIResponse<{ paymentUrl: string; transactionId: string }>> {
    return this.makeRequest<{ paymentUrl: string; transactionId: string }>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        userId,
        paymentMethodId,
        amount,
        currency,
      }),
    });
  }

  async confirmPayment(transactionId: string): Promise<APIResponse<PaymentTransaction>> {
    return this.makeRequest<PaymentTransaction>(`/payments/confirm/${transactionId}`, {
      method: 'POST',
    });
  }

  async getTransactionHistory(userId: string, limit?: number): Promise<APIResponse<PaymentTransaction[]>> {
    const params = new URLSearchParams({ userId });
    if (limit) params.append('limit', limit.toString());
    return this.makeRequest<PaymentTransaction[]>(`/transactions?${params}`);
  }

  // User Management
  async getUser(userId: string): Promise<APIResponse<User>> {
    return this.makeRequest<User>(`/users/${userId}`);
  }
}

export const astraPaymentAPI = new AstraPaymentAPI();
