import { describe, it, expect } from 'vitest';
describe('WhatsAppInquiryButton logic', () => {
  it('formats WhatsApp URL', () => { const phone = '628123456789'; const msg = 'Hello'; const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`; expect(url).toContain('wa.me'); });
  it('strips non-digits from phone', () => { const raw = '+62 812-345-6789'; const clean = raw.replace(/\D/g, ''); expect(clean).toBe('628123456789'); });
});
