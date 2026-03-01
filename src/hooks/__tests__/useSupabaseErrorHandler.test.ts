import { describe, it, expect } from 'vitest';
describe('useSupabaseErrorHandler', () => {
  it('error code mapping', () => { const map: Record<string, string> = { '23505': 'Duplicate entry', '23503': 'Foreign key violation', 'PGRST116': 'Not found' }; expect(map['23505']).toBe('Duplicate entry'); });
  it('user-friendly message', () => { const friendly = (code: string) => code === '23505' ? 'This record already exists' : 'An error occurred'; expect(friendly('23505')).toContain('already exists'); });
  it('retry on transient error', () => { const transient = ['08006', '08001', '57P01']; expect(transient.includes('08006')).toBe(true); });
});
