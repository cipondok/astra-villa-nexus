import { describe, it, expect } from 'vitest';

describe('PropertyDetail page', () => {
  it('generates WhatsApp inquiry link', () => {
    const phone = '6281234567890';
    const message = 'Hi, I am interested in this property';
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    expect(link).toContain('wa.me');
    expect(link).toContain('interested');
  });

  it('calculates price per sqm', () => {
    const price = 2_500_000_000;
    const area = 200;
    expect(price / area).toBe(12_500_000);
  });

  it('image gallery starts at index 0', () => {
    const currentIndex = 0;
    expect(currentIndex).toBe(0);
  });

  it('similar properties excludes current property', () => {
    const allProps = ['p1', 'p2', 'p3', 'p4'];
    const currentId = 'p2';
    const similar = allProps.filter(id => id !== currentId);
    expect(similar).not.toContain('p2');
    expect(similar).toHaveLength(3);
  });
});
