import { describe, it, expect } from 'vitest';

describe('database-operations - db utility logic', () => {
  it('builds select query fields', () => {
    const fields = ['id', 'name', 'email', 'created_at'];
    const select = fields.join(', ');
    expect(select).toBe('id, name, email, created_at');
  });

  it('pagination params', () => {
    const page = 2;
    const size = 15;
    const from = (page - 1) * size;
    const to = from + size - 1;
    expect(from).toBe(15);
    expect(to).toBe(29);
  });

  it('handles null fields in upsert', () => {
    const data = { name: 'John', email: null, phone: undefined };
    const cleaned = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    expect(cleaned).toHaveProperty('name');
    expect(cleaned).toHaveProperty('email');
    expect(cleaned).not.toHaveProperty('phone');
  });

  it('retry logic with backoff', () => {
    const backoff = (attempt: number) => Math.min(1000 * 2 ** attempt, 30000);
    expect(backoff(0)).toBe(1000);
    expect(backoff(1)).toBe(2000);
    expect(backoff(2)).toBe(4000);
    expect(backoff(10)).toBe(30000);
  });

  it('batch insert chunking', () => {
    const items = Array.from({ length: 250 }, (_, i) => ({ id: i }));
    const CHUNK = 100;
    const chunks = [];
    for (let i = 0; i < items.length; i += CHUNK) chunks.push(items.slice(i, i + CHUNK));
    expect(chunks).toHaveLength(3);
    expect(chunks[2]).toHaveLength(50);
  });
});
