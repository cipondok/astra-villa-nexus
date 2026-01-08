/**
 * Request Batcher - Combines multiple requests into efficient batches
 * Reduces database load under heavy traffic
 */

type BatchedRequest<T> = {
  key: string;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
};

type BatchProcessor<T> = (keys: string[]) => Promise<Map<string, T>>;

class RequestBatcher<T> {
  private queue: BatchedRequest<T>[] = [];
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private readonly batchSize: number;
  private readonly batchDelay: number;
  private readonly processor: BatchProcessor<T>;

  constructor(
    processor: BatchProcessor<T>,
    options: { batchSize?: number; batchDelay?: number } = {}
  ) {
    this.processor = processor;
    this.batchSize = options.batchSize || 50;
    this.batchDelay = options.batchDelay || 10; // 10ms default
  }

  async load(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    const keys = [...new Set(batch.map((req) => req.key))];

    try {
      const results = await this.processor(keys);

      batch.forEach((request) => {
        const result = results.get(request.key);
        if (result !== undefined) {
          request.resolve(result);
        } else {
          request.reject(new Error(`No result for key: ${request.key}`));
        }
      });
    } catch (error) {
      batch.forEach((request) => {
        request.reject(error instanceof Error ? error : new Error(String(error)));
      });
    }

    // Process remaining items
    if (this.queue.length > 0) {
      this.flush();
    }
  }
}

// Pre-configured batchers for common queries
import { supabase } from '@/integrations/supabase/client';

// Batch property fetches by ID
export const propertyBatcher = new RequestBatcher<any>(
  async (ids: string[]) => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', ids);

    if (error) throw error;

    const resultMap = new Map<string, any>();
    data?.forEach((property) => {
      resultMap.set(property.id, property);
    });
    return resultMap;
  },
  { batchSize: 100, batchDelay: 15 }
);

// Batch profile fetches by user ID
export const profileBatcher = new RequestBatcher<any>(
  async (ids: string[]) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', ids);

    if (error) throw error;

    const resultMap = new Map<string, any>();
    data?.forEach((profile) => {
      resultMap.set(profile.id, profile);
    });
    return resultMap;
  },
  { batchSize: 50, batchDelay: 10 }
);

// Batch vendor fetches by ID
export const vendorBatcher = new RequestBatcher<any>(
  async (ids: string[]) => {
    const { data, error } = await supabase
      .from('vendor_business_profiles')
      .select('*')
      .in('id', ids);

    if (error) throw error;

    const resultMap = new Map<string, any>();
    data?.forEach((vendor) => {
      resultMap.set(vendor.id, vendor);
    });
    return resultMap;
  },
  { batchSize: 50, batchDelay: 10 }
);

// Helper to use batchers
export const batchedFetch = {
  property: (id: string) => propertyBatcher.load(id),
  profile: (id: string) => profileBatcher.load(id),
  vendor: (id: string) => vendorBatcher.load(id),
};

export { RequestBatcher };
