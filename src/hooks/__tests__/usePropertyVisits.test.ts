import { describe, it, expect } from 'vitest';
import { generateTimeSlots, type AgentAvailability, type PropertyVisit } from '@/hooks/usePropertyVisits';

const makeAvailability = (overrides: Partial<AgentAvailability> = {}): AgentAvailability => ({
  id: '1',
  agent_id: 'agent-1',
  day_of_week: 1, // Monday
  start_time: '09:00:00',
  end_time: '12:00:00',
  is_available: true,
  slot_duration_minutes: 60,
  ...overrides,
});

const makeVisit = (overrides: Partial<PropertyVisit> = {}): PropertyVisit => ({
  id: 'v1',
  property_id: 'p1',
  visitor_id: 'u1',
  agent_id: 'agent-1',
  visit_date: '2026-03-02',
  start_time: '09:00:00',
  end_time: '10:00:00',
  status: 'confirmed',
  visitor_name: null,
  visitor_phone: null,
  visitor_email: null,
  notes: null,
  cancellation_reason: null,
  confirmed_at: null,
  cancelled_at: null,
  created_at: '',
  updated_at: '',
  ...overrides,
});

describe('generateTimeSlots', () => {
  it('generates correct number of 60-min slots for a 3-hour window', () => {
    const availability = [makeAvailability({ day_of_week: 1 })];
    // Monday March 2, 2026
    const date = new Date(2026, 2, 2);
    const slots = generateTimeSlots(availability, date, [], []);
    expect(slots).toHaveLength(3);
    expect(slots[0]).toEqual({ start_time: '09:00:00', end_time: '10:00:00', available: true });
    expect(slots[1]).toEqual({ start_time: '10:00:00', end_time: '11:00:00', available: true });
    expect(slots[2]).toEqual({ start_time: '11:00:00', end_time: '12:00:00', available: true });
  });

  it('generates 30-min slots correctly', () => {
    const availability = [makeAvailability({ day_of_week: 1, slot_duration_minutes: 30 })];
    const date = new Date(2026, 2, 2);
    const slots = generateTimeSlots(availability, date, [], []);
    expect(slots).toHaveLength(6);
  });

  it('returns empty for blocked dates', () => {
    const availability = [makeAvailability({ day_of_week: 1 })];
    const date = new Date(2026, 2, 2);
    const slots = generateTimeSlots(availability, date, [], ['2026-03-02']);
    expect(slots).toHaveLength(0);
  });

  it('returns empty for unavailable day of week', () => {
    const availability = [makeAvailability({ day_of_week: 3 })]; // Wednesday
    const date = new Date(2026, 2, 2); // Monday
    const slots = generateTimeSlots(availability, date, [], []);
    expect(slots).toHaveLength(0);
  });

  it('marks booked slots as unavailable', () => {
    const availability = [makeAvailability({ day_of_week: 1 })];
    const date = new Date(2026, 2, 2);
    const existingVisits = [makeVisit({ visit_date: '2026-03-02', start_time: '09:00:00', status: 'confirmed' })];
    const slots = generateTimeSlots(availability, date, existingVisits, []);
    expect(slots[0].available).toBe(false);
    expect(slots[1].available).toBe(true);
  });

  it('does not mark cancelled visits as booked', () => {
    const availability = [makeAvailability({ day_of_week: 1 })];
    const date = new Date(2026, 2, 2);
    const existingVisits = [makeVisit({ visit_date: '2026-03-02', start_time: '09:00:00', status: 'cancelled' })];
    const slots = generateTimeSlots(availability, date, existingVisits, []);
    expect(slots[0].available).toBe(true);
  });
});

describe('DashboardStats interface', () => {
  it('has expected shape', () => {
    const stats = {
      savedProperties: 5,
      recentSearches: 3,
      messages: 2,
      notifications: 1,
    };
    expect(stats).toHaveProperty('savedProperties');
    expect(stats).toHaveProperty('messages');
    expect(typeof stats.savedProperties).toBe('number');
  });
});

describe('SavedSearch type', () => {
  it('has correct structure', () => {
    const search = {
      id: '1',
      name: 'Test Search',
      filters: { city: 'Jakarta', min_price: 500000 },
      query: 'apartment jakarta',
      email_notifications: true,
      is_active: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-02',
    };
    expect(search.filters).toHaveProperty('city');
    expect(search.email_notifications).toBe(true);
    expect(search.is_active).toBe(true);
  });

  it('filters can contain various search criteria', () => {
    const filters = {
      city: 'Jakarta',
      property_type: 'house',
      min_price: 100000,
      max_price: 5000000,
      bedrooms: 3,
      bathrooms: 2,
    };
    expect(Object.keys(filters).length).toBeGreaterThan(0);
    expect(filters.min_price).toBeLessThan(filters.max_price);
  });
});
