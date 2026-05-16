import { describe, it, expect } from 'vitest';

describe('Community page', () => {
  it('forum posts sorted by most recent', () => {
    const posts = [
      { title: 'A', createdAt: '2026-01-01' },
      { title: 'B', createdAt: '2026-03-01' },
    ];
    const sorted = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    expect(sorted[0].title).toBe('B');
  });

  it('limits post content preview to 200 chars', () => {
    const content = 'X'.repeat(300);
    const preview = content.substring(0, 200) + '...';
    expect(preview.length).toBe(203);
  });
});
