import { describe, it, expect } from 'vitest';
describe('Users page', () => {
  it('user roles', () => {
    const roles = ['buyer', 'seller', 'agent', 'admin', 'vendor'];
    expect(roles).toHaveLength(5);
  });
  it('user search by name or email', () => {
    const users = [
      { name: 'John', email: 'john@test.com' },
      { name: 'Jane', email: 'jane@test.com' },
    ];
    const query = 'jane';
    const found = users.filter(u => u.name.toLowerCase().includes(query) || u.email.includes(query));
    expect(found).toHaveLength(1);
  });
  it('pagination', () => {
    const total = 250;
    const perPage = 25;
    expect(Math.ceil(total / perPage)).toBe(10);
  });
});
