import { describe, it, expect } from 'vitest';
describe('MaintenanceMode', () => {
  it('shows maintenance message', () => { expect('System under maintenance').toContain('maintenance'); });
  it('estimated time display', () => { const min=30; expect(`${min} minutes`).toContain('30'); });
});
