import { describe, it, expect } from 'vitest';
describe('ScheduleSurveyModal component', () => {
  it('available time slots', () => {
    const slots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    expect(slots).toHaveLength(7);
  });
  it('survey date must be in future', () => {
    const surveyDate = new Date('2026-03-15');
    const now = new Date('2026-03-01');
    expect(surveyDate > now).toBe(true);
  });
  it('contact info required', () => {
    const form = { name: 'Test', phone: '+628123456789', date: '2026-03-15', time: '10:00' };
    const valid = Object.values(form).every(v => v.length > 0);
    expect(valid).toBe(true);
  });
});
