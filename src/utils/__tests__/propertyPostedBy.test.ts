import { describe, it, expect } from 'vitest';
import { attachPostedByFromOwnerJoin, toBaseProperty } from '../propertyPostedBy';

describe('attachPostedByFromOwnerJoin', () => {
  it('attaches posted_by from owner join data', () => {
    const properties = [{
      id: 'p1',
      title: 'Test',
      owner: { id: 'u1', full_name: 'John', avatar_url: 'pic.jpg', verification_status: 'verified', created_at: '2024-01-01' },
    }];
    const result = attachPostedByFromOwnerJoin(properties);
    expect(result[0].posted_by).toEqual({
      id: 'u1',
      name: 'John',
      avatar_url: 'pic.jpg',
      verification_status: 'verified',
      joining_date: '2024-01-01',
    });
  });

  it('handles owner as array', () => {
    const properties = [{
      id: 'p1',
      owner: [{ id: 'u1', full_name: 'Jane' }],
    }];
    const result = attachPostedByFromOwnerJoin(properties);
    expect(result[0].posted_by?.name).toBe('Jane');
  });

  it('defaults name to Anonymous when missing', () => {
    const properties = [{ id: 'p1', owner: { id: 'u1' } }];
    const result = attachPostedByFromOwnerJoin(properties);
    expect(result[0].posted_by?.name).toBe('Anonymous');
  });

  it('skips properties without owner', () => {
    const properties = [{ id: 'p1', owner: null }];
    const result = attachPostedByFromOwnerJoin(properties);
    expect(result[0].posted_by).toBeUndefined();
  });

  it('handles empty array', () => {
    expect(attachPostedByFromOwnerJoin([])).toEqual([]);
  });

  it('handles null/undefined input gracefully', () => {
    expect(attachPostedByFromOwnerJoin(null as any)).toEqual([]);
  });
});

describe('toBaseProperty', () => {
  it('maps images to image_urls', () => {
    const prop = { id: 'p1', images: ['a.jpg', 'b.jpg'], listing_type: 'sale' };
    const result = toBaseProperty(prop);
    expect(result.image_urls).toEqual(['a.jpg', 'b.jpg']);
  });

  it('defaults image_urls to empty array when no images', () => {
    const prop = { id: 'p1', listing_type: 'rent' };
    const result = toBaseProperty(prop);
    expect(result.image_urls).toEqual([]);
  });
});
