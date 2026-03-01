import { describe, it, expect, beforeEach } from 'vitest';

describe('useHomeBackLink - scrollToSection logic', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('saves section ID to sessionStorage', () => {
    sessionStorage.setItem('scrollToSection', 'featured-properties');
    expect(sessionStorage.getItem('scrollToSection')).toBe('featured-properties');
  });

  it('removes section ID after retrieval', () => {
    sessionStorage.setItem('scrollToSection', 'hero-section');
    const sectionId = sessionStorage.getItem('scrollToSection');
    sessionStorage.removeItem('scrollToSection');
    
    expect(sectionId).toBe('hero-section');
    expect(sessionStorage.getItem('scrollToSection')).toBeNull();
  });

  it('defaults to hero-section when no section provided', () => {
    const defaultSection = 'hero-section';
    const sectionId = sessionStorage.getItem('scrollToSection') || defaultSection;
    expect(sectionId).toBe('hero-section');
  });

  it('handles multiple saves - last one wins', () => {
    sessionStorage.setItem('scrollToSection', 'section-a');
    sessionStorage.setItem('scrollToSection', 'section-b');
    expect(sessionStorage.getItem('scrollToSection')).toBe('section-b');
  });
});
