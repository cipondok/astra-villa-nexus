
import type { Database } from '@/integrations/supabase/types';

// Helper types for better type safety with Supabase operations
export type TableName = keyof Database['public']['Tables'];

export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Utility type for creating type-safe table operations
export interface TableOperation<T extends TableName> {
  table: T;
  type: 'insert' | 'update' | 'delete';
  data: TableInsert<T> | TableUpdate<T> | { id: string };
}

// Helper for creating type-safe queries
export type QueryBuilder<T extends TableName> = {
  select: (columns?: string) => Promise<{ data: TableRow<T>[] | null; error: any }>;
  insert: (data: TableInsert<T>) => Promise<{ data: TableRow<T>[] | null; error: any }>;
  update: (data: TableUpdate<T>) => Promise<{ data: TableRow<T>[] | null; error: any }>;
  delete: () => Promise<{ data: TableRow<T>[] | null; error: any }>;
};
