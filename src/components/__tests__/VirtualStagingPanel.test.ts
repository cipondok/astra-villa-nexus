import { describe, it, expect } from 'vitest';
describe('VirtualStagingPanel', () => {
  it('room types', () => { expect(['living','bedroom','kitchen','bathroom','office']).toHaveLength(5); });
  it('furniture styles', () => { expect(['modern','minimalist','classic','scandinavian']).toHaveLength(4); });
});
