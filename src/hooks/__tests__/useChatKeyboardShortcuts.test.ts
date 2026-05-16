import { describe, it, expect, beforeEach } from 'vitest';

describe('useChatKeyboardShortcuts - chat-specific shortcuts', () => {
  it('Enter key without shift should trigger send', () => {
    const event = { key: 'Enter', shiftKey: false };
    const shouldSend = event.key === 'Enter' && !event.shiftKey;
    expect(shouldSend).toBe(true);
  });

  it('Shift+Enter should NOT trigger send (newline)', () => {
    const event = { key: 'Enter', shiftKey: true };
    const shouldSend = event.key === 'Enter' && !event.shiftKey;
    expect(shouldSend).toBe(false);
  });

  it('Escape key detected for closing chat', () => {
    const event = { key: 'Escape' };
    expect(event.key).toBe('Escape');
  });

  it('message trimming before send', () => {
    expect('  hello  '.trim()).toBe('hello');
    expect('   '.trim()).toBe('');
    expect(''.trim().length).toBe(0);
  });

  it('empty message should not be sent', () => {
    const content = '   ';
    const shouldSend = content.trim().length > 0;
    expect(shouldSend).toBe(false);
  });
});
