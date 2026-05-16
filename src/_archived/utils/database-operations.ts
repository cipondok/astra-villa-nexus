/**
 * Database Operations Utilities
 * Provides safe database operation wrappers to prevent duplicate key violations
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Safe insert with automatic duplicate handling
 * Uses upsert if conflict columns are provided, otherwise tries insert first
 */
export async function safeInsert(
  tableName: string,
  data: any,
  options?: {
    conflictColumns?: string | string[];
    onConflictUpdate?: boolean;
  }
) {
  try {
    if (options?.conflictColumns) {
      // Use upsert when conflict columns are known
      const { data: result, error } = await (supabase
        .from(tableName as any) as any)
        .upsert(data, {
          onConflict: options.conflictColumns as string,
          ignoreDuplicates: !options.onConflictUpdate
        });
      
      return { data: result, error };
    } else {
      // Try regular insert first
      const { data: result, error } = await (supabase
        .from(tableName as any) as any)
        .insert(data);
      
      return { data: result, error };
    }
  } catch (error: any) {
    // Check if it's a duplicate key error
    if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
      console.warn(`Duplicate key detected for ${tableName}, attempting upsert`);
      
      // Fallback to upsert if we detect duplicate
      const { data: result, error: upsertError } = await (supabase
        .from(tableName as any) as any)
        .upsert(data);
      
      return { data: result, error: upsertError };
    }
    
    return { data: null, error };
  }
}

/**
 * Safe upsert operation with validation
 */
export async function safeUpsert(
  tableName: string,
  data: any,
  conflictColumns: string | string[]
) {
  const { data: result, error } = await (supabase
    .from(tableName as any) as any)
    .upsert(data, {
      onConflict: conflictColumns as string,
      ignoreDuplicates: false
    });
  
  return { data: result, error };
}

/**
 * Safe update with existence check
 */
export async function safeUpdate(
  tableName: string,
  id: string,
  data: any
) {
  // First check if record exists
  const { data: existing, error: checkError } = await (supabase
    .from(tableName as any) as any)
    .select('id')
    .eq('id', id)
    .maybeSingle();
  
  if (checkError || !existing) {
    return {
      data: null,
      error: checkError || new Error(`Record not found in ${tableName}`)
    };
  }
  
  // Proceed with update
  const { data: result, error } = await (supabase
    .from(tableName as any) as any)
    .update(data)
    .eq('id', id);
  
  return { data: result, error };
}

/**
 * Insert or update based on existence check
 */
export async function insertOrUpdate(
  tableName: string,
  id: string,
  data: any
) {
  // Check if record exists
  const { data: existing } = await (supabase
    .from(tableName as any) as any)
    .select('id')
    .eq('id', id)
    .maybeSingle();
  
  if (existing) {
    // Update existing record
    return await (supabase
      .from(tableName as any) as any)
      .update(data)
      .eq('id', id);
  } else {
    // Insert new record
    return await (supabase
      .from(tableName as any) as any)
      .insert(data);
  }
}

/**
 * Batch insert with duplicate handling
 */
export async function safeBatchInsert(
  tableName: string,
  dataArray: any[],
  conflictColumns?: string | string[]
) {
  if (conflictColumns) {
    // Use upsert for batch operations when conflict columns are known
    return await (supabase
      .from(tableName as any) as any)
      .upsert(dataArray, {
        onConflict: conflictColumns as string,
        ignoreDuplicates: false
      });
  } else {
    // Try regular insert
    return await (supabase
      .from(tableName as any) as any)
      .insert(dataArray);
  }
}
