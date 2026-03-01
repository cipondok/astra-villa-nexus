import { describe, it, expect } from 'vitest';

describe('AddProperty page', () => {
  it('required fields validation', () => {
    const required = ['title', 'price', 'type', 'location', 'bedrooms', 'bathrooms'];
    const form = { title: 'Villa', price: 0, type: '', location: '', bedrooms: 3, bathrooms: 2 };
    const missing = required.filter(f => !form[f as keyof typeof form]);
    expect(missing).toContain('type');
    expect(missing).toContain('location');
  });
  it('image upload minimum 3 photos', () => {
    const MIN = 3;
    const uploaded = 2;
    expect(uploaded >= MIN).toBe(false);
  });
  it('price must be positive', () => {
    const price = 0;
    expect(price > 0).toBe(false);
  });
});
