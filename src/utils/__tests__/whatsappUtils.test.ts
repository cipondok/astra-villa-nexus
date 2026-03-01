import { describe, it, expect } from 'vitest';
import { generateWhatsAppMessage, getWhatsAppLink, WHATSAPP_BUSINESS_NUMBER } from '../whatsappUtils';

describe('generateWhatsAppMessage', () => {
  it('generates general inquiry in English', () => {
    const msg = generateWhatsAppMessage({ type: 'general' });
    expect(msg).toContain('ASTRA Villa');
    expect(msg).toContain('services');
  });

  it('generates general inquiry in Indonesian', () => {
    const msg = generateWhatsAppMessage({ type: 'general', language: 'id' });
    expect(msg).toContain('layanan');
  });

  it('includes user name when provided', () => {
    const msg = generateWhatsAppMessage({ type: 'general', userName: 'John' });
    expect(msg).toContain('My name is John');
  });

  it('includes user name in Indonesian', () => {
    const msg = generateWhatsAppMessage({ type: 'general', userName: 'Budi', language: 'id' });
    expect(msg).toContain('Nama saya Budi');
  });

  it('includes property info for property inquiry', () => {
    const msg = generateWhatsAppMessage({
      type: 'property',
      propertyTitle: 'Villa Sunset',
      propertyId: 'prop-123',
    });
    expect(msg).toContain('Villa Sunset');
    expect(msg).toContain('prop-123');
  });

  it('includes custom message', () => {
    const msg = generateWhatsAppMessage({
      type: 'general',
      customMessage: 'I need help ASAP',
    });
    expect(msg).toContain('I need help ASAP');
    expect(msg).toContain('Additional Note');
  });

  it('handles all inquiry types without error', () => {
    const types = ['general', 'wna-investment', 'wni-investment', 'property', 'legal', 'visa', 'family-benefits', 'citizenship', 'taxation'] as const;
    types.forEach(type => {
      expect(() => generateWhatsAppMessage({ type })).not.toThrow();
    });
  });
});

describe('getWhatsAppLink', () => {
  it('returns valid WhatsApp URL', () => {
    const link = getWhatsAppLink({ type: 'general' });
    expect(link).toContain(`https://wa.me/${WHATSAPP_BUSINESS_NUMBER}`);
    expect(link).toContain('?text=');
  });

  it('encodes message in URL', () => {
    const link = getWhatsAppLink({ type: 'general' });
    expect(link).not.toContain(' '); // spaces should be encoded
  });
});
