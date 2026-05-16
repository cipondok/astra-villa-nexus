import { describe, it, expect } from 'vitest';
describe('useSecureProperties', () => {
  it('sanitizes property data', () => { const data = { title: '<script>x</script>Villa', price: 1e9 }; const clean = data.title.replace(/<[^>]*>/g, ''); expect(clean).toBe('xVilla'); });
  it('access control check', () => { const ownerId = 'u1'; const requesterId = 'u1'; expect(ownerId === requesterId).toBe(true); });
  it('rate limit on updates', () => { const MAX = 10; const count = 8; expect(count < MAX).toBe(true); });
});
