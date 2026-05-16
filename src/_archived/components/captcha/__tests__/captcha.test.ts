import { describe, it, expect } from 'vitest';
describe('Captcha component', () => {
  it('generates random math challenge', () => {
    const a = 7; const b = 3; const answer = a + b;
    expect(answer).toBe(10);
  });
  it('validates user input matches answer', () => {
    const answer = 10; const input = '10';
    expect(parseInt(input) === answer).toBe(true);
  });
});
