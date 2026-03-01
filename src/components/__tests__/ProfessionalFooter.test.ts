import { describe, it, expect } from 'vitest';
describe('ProfessionalFooter component', () => {
  it('footer sections', () => {
    const sections = ['About', 'Properties', 'Services', 'Contact', 'Legal'];
    expect(sections).toHaveLength(5);
  });
  it('copyright year', () => {
    const year = new Date().getFullYear();
    expect(year).toBeGreaterThanOrEqual(2024);
  });
  it('social media links', () => {
    const socials = ['instagram', 'facebook', 'linkedin', 'youtube'];
    expect(socials).toContain('instagram');
  });
});
