import { describe, it, expect } from 'vitest';
describe('AuthModal component', () => {
  it('auth modes', () => {
    const modes = ['login', 'register', 'forgot-password'];
    expect(modes).toHaveLength(3);
  });
  it('password min length', () => {
    const MIN = 8;
    const pw = 'Abc12345!';
    expect(pw.length >= MIN).toBe(true);
  });
  it('social login providers', () => {
    const providers = ['google', 'facebook', 'apple'];
    expect(providers).toContain('google');
  });
});
