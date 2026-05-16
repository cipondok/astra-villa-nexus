import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase before importing
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@test.com' } } })
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null })
    })
  }
}));

vi.mock('@/utils/uuid-validation', () => ({
  safeUUID: vi.fn((id) => id)
}));

import { logError, logSearchError, logAPIError, logComponentError } from '../errorLogger';
import { supabase } from '@/integrations/supabase/client';

describe('errorLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logError calls supabase insert with correct data', async () => {
    await logError({
      error_type: 'test_error',
      error_message: 'Something went wrong',
      severity: 'high'
    });

    expect(supabase.from).toHaveBeenCalledWith('error_logs');
  });

  it('logSearchError sets error_type to search_error with high severity', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert: insertMock });

    await logSearchError(new Error('Search failed'), { query: 'test' });

    const inserted = insertMock.mock.calls[0][0][0];
    expect(inserted.error_type).toBe('search_error');
    expect(inserted.severity).toBe('high');
    expect(inserted.error_message).toBe('Search failed');
  });

  it('logAPIError sets severity to critical', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert: insertMock });

    await logAPIError('/api/test', new Error('API down'));

    const inserted = insertMock.mock.calls[0][0][0];
    expect(inserted.error_type).toBe('api_error');
    expect(inserted.severity).toBe('critical');
  });

  it('logComponentError handles string errors', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert: insertMock });

    await logComponentError('MyComponent', 'string error');

    const inserted = insertMock.mock.calls[0][0][0];
    expect(inserted.error_message).toBe('string error');
    expect(inserted.component_name).toBe('MyComponent');
  });

  it('logError does not throw when supabase fails', async () => {
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: { message: 'db error' } })
    });

    await expect(logError({
      error_type: 'test',
      error_message: 'test'
    })).resolves.not.toThrow();
  });
});
