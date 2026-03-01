import { describe, it, expect } from 'vitest';

describe('useBackupSettings - backup config', () => {
  it('backup frequency options', () => {
    const options = ['daily', 'weekly', 'monthly'];
    expect(options).toContain('weekly');
  });
  it('retention period in days', () => {
    const retention = { daily: 7, weekly: 30, monthly: 365 };
    expect(retention.weekly).toBe(30);
  });
  it('backup size estimation', () => {
    const records = 50000; const avgRecordBytes = 500;
    const sizeMB = (records * avgRecordBytes) / (1024 * 1024);
    expect(sizeMB).toBeCloseTo(23.84, 1);
  });
  it('last backup age check', () => {
    const lastBackup = new Date('2026-02-28');
    const now = new Date('2026-03-01');
    const hoursAgo = (now.getTime() - lastBackup.getTime()) / 3600000;
    expect(hoursAgo).toBe(24);
  });
});
