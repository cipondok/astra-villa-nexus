import { describe, expect, it } from 'vitest';
import {
  buildLeadUpdate, canChangeStatus, filterLeads, followUpState, leadErrorKey, leadSourceKey,
  normalizeLeadStatus, statusOptions, summarizeLeads, validateLeadEdit, whatsappNumber,
} from '../leadPipeline';

const now = new Date('2026-11-23T10:00:00');
const at = (d: string) => new Date(`${d}T09:00:00`).toISOString();

describe('lead statuses', () => {
  it('offers exactly new, contacted, viewing scheduled, negotiation, won, lost', () => {
    expect(statusOptions('new')).toEqual(['new', 'contacted', 'viewing_scheduled', 'negotiation', 'won', 'lost']);
  });
  it('never lets a worked lead go back to new', () => {
    expect(canChangeStatus('contacted', 'new')).toBe(false);
    expect(statusOptions('won')).not.toContain('new');
    expect(validateLeadEdit({ status: 'lost' }, { status: 'new', notes: '', nextActionDate: '' })).toBe('cannotReturnToNew');
  });
  it('allows reopening a won or lost lead', () => {
    expect(canChangeStatus('won', 'negotiation')).toBe(true);
    expect(canChangeStatus('lost', 'contacted')).toBe(true);
  });
  it('rejects unknown statuses', () => {
    expect(canChangeStatus('new', 'hot')).toBe(false);
    expect(validateLeadEdit({ status: 'new' }, { status: 'hot', notes: '', nextActionDate: '' })).toBe('invalidStatus');
  });
  it('shows older qualified/converted values as negotiation/won', () => {
    expect(normalizeLeadStatus('qualified')).toBe('negotiation');
    expect(normalizeLeadStatus('converted')).toBe('won');
  });
});

describe('notes and follow-up', () => {
  it('limits private notes to 4000 characters', () => {
    expect(validateLeadEdit({ status: 'new' }, { status: 'new', notes: 'x'.repeat(4001), nextActionDate: '' })).toBe('notesTooLong');
    expect(validateLeadEdit({ status: 'new' }, { status: 'new', notes: 'x'.repeat(4000), nextActionDate: '' })).toBeNull();
  });
  it('rejects a malformed follow-up date', () => {
    expect(validateLeadEdit({ status: 'new' }, { status: 'new', notes: '', nextActionDate: '23/11/2026' })).toBe('invalidDate');
  });
  it('sends only status, notes and follow-up date, and only what changed', () => {
    const lead = { status: 'new', notes: null, next_action_at: null, lead_email: 'b@x.id', agent_id: 'a' };
    const u = buildLeadUpdate(lead, { status: 'contacted', notes: 'Call after 5pm', nextActionDate: '2026-11-25' });
    expect(Object.keys(u).sort()).toEqual(['next_action_at', 'notes', 'status']);
    expect(buildLeadUpdate({ status: 'contacted', notes: 'a', next_action_at: at('2026-11-25') },
      { status: 'contacted', notes: 'a', nextActionDate: '2026-11-25' })).toEqual({});
  });
  it('flags overdue and today follow-ups only on open leads', () => {
    expect(followUpState({ status: 'contacted', next_action_at: at('2026-11-22') }, now)).toBe('overdue');
    expect(followUpState({ status: 'negotiation', next_action_at: at('2026-11-23') }, now)).toBe('today');
    expect(followUpState({ status: 'contacted', next_action_at: at('2026-11-30') }, now)).toBe('upcoming');
    expect(followUpState({ status: 'won', next_action_at: at('2026-11-22') }, now)).toBeNull();
  });
});

describe('lead counts', () => {
  const leads = [
    { status: 'new' },
    { status: 'new', next_action_at: at('2026-11-23') },
    { status: 'contacted', next_action_at: at('2026-11-20') },
    { status: 'viewing_scheduled', next_action_at: at('2026-12-01') },
    { status: 'won' },
    { status: 'lost', next_action_at: at('2026-11-20') },
  ];
  it('counts only real rows', () => {
    expect(summarizeLeads(leads, now)).toEqual({ total: 6, new: 2, open: 4, followUpsDue: 2, won: 1, lost: 1 });
    expect(summarizeLeads([], now)).toEqual({ total: 0, new: 0, open: 0, followUpsDue: 0, won: 0, lost: 0 });
  });
  it('filters by status and by follow-up due', () => {
    expect(filterLeads(leads, 'new', now)).toHaveLength(2);
    expect(filterLeads(leads, 'due', now)).toHaveLength(2);
    expect(filterLeads(leads, 'all', now)).toHaveLength(6);
  });
});

describe('contact helpers', () => {
  it('turns Indonesian 08… numbers into WhatsApp 628…', () => {
    expect(whatsappNumber('0812-3456-7890')).toBe('6281234567890');
    expect(whatsappNumber('+62 812 3456 7890')).toBe('6281234567890');
    expect(whatsappNumber('123')).toBeNull();
  });
  it('labels where a lead came from', () => {
    expect(leadSourceKey({ enquiry_type: 'property_viewing' })).toBe('viewing');
    expect(leadSourceKey({ enquiry_type: 'property_inquiry' })).toBe('message');
    expect(leadSourceKey({ enquiry_type: null, lead_source: 'referral' })).toBe('manual');
  });
  it('maps database refusals to messages', () => {
    expect(leadErrorKey({ message: 'lead_cannot_return_to_new' })).toBe('cannotReturnToNew');
    expect(leadErrorKey({ message: 'boom' })).toBe('generic');
  });
});
