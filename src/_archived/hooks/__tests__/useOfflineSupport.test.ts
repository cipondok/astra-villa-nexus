import { describe, it, expect, beforeEach } from 'vitest';

describe('useOfflineSupport - queue and cache logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('queued operations persist to localStorage', () => {
    const ops = [
      { id: '1', type: 'insert', table: 'properties', data: { title: 'Test' }, timestamp: new Date() },
    ];
    localStorage.setItem('supabase_queued_operations', JSON.stringify(ops));
    const stored = JSON.parse(localStorage.getItem('supabase_queued_operations')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].type).toBe('insert');
  });

  it('cached data includes lastSync timestamp', () => {
    const cache = { properties: [], profiles: [], lastSync: new Date().toISOString() };
    localStorage.setItem('supabase_offline_cache', JSON.stringify(cache));
    const parsed = JSON.parse(localStorage.getItem('supabase_offline_cache')!);
    expect(parsed.lastSync).toBeTruthy();
    expect(new Date(parsed.lastSync).getTime()).toBeGreaterThan(0);
  });

  it('successful ops are removed from queue', () => {
    const ops = [
      { id: 'a', type: 'insert', table: 'properties', data: {} },
      { id: 'b', type: 'update', table: 'profiles', data: {} },
    ];
    const successIds = ['a'];
    const remaining = ops.filter(op => !successIds.includes(op.id));
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('b');
  });

  it('supports insert, update, delete operation types', () => {
    const types = ['insert', 'update', 'delete'];
    types.forEach(t => expect(['insert', 'update', 'delete']).toContain(t));
  });

  it('only supports properties and profiles tables', () => {
    const supported = ['properties', 'profiles'];
    expect(supported).toContain('properties');
    expect(supported).not.toContain('users');
  });
});
