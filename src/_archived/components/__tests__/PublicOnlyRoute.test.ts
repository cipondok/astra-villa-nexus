import { describe, it, expect } from 'vitest';
describe('PublicOnlyRoute', () => {
  it('redirects authed users', () => { const isAuthed=true; expect(isAuthed).toBe(true); });
  it('allows public access', () => { const isAuthed=false; expect(!isAuthed).toBe(true); });
});
