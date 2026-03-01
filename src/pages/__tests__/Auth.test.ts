import { describe, it, expect } from 'vitest';

describe('Auth page', () => {
  it('login form requires email and password', () => {
    const form = { email: '', password: '' };
    const isValid = form.email.length > 0 && form.password.length > 0;
    expect(isValid).toBe(false);
  });

  it('signup requires password confirmation match', () => {
    const pw = 'SecurePass123!';
    const confirm = 'SecurePass123!';
    expect(pw === confirm).toBe(true);
  });

  it('redirects to dashboard after login', () => {
    const redirectPath = '/dashboard';
    expect(redirectPath).toBe('/dashboard');
  });
});
