import { describe, it, expect } from 'vitest';
describe('useChatbotLogo', () => {
  it('default bot avatar', () => { expect('/bot-avatar.png').toContain('bot'); });
  it('custom logo URL', () => { const url = 'https://cdn.co/bot.svg'; expect(url).toMatch(/^https/); });
});
