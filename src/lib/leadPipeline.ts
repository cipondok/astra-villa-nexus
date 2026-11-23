/**
 * Lead inbox rules for buyer enquiries (rows in `property_leads`).
 * The database repeats the rules that matter for safety in
 * `private.guard_property_lead` (valid statuses, no return to "new",
 * buyer details and listing link fixed, notes ≤ 4000 chars); this file keeps
 * the UI, counts and tests in agreement with it.
 */

export const LEAD_STATUSES = ['new', 'contacted', 'viewing_scheduled', 'negotiation', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Statuses still being worked; follow-up reminders only apply to these. */
export const OPEN_LEAD_STATUSES: readonly LeadStatus[] = ['new', 'contacted', 'viewing_scheduled', 'negotiation'];

/** Older values written by earlier tools stay valid in the database. */
const LEGACY_STATUS: Record<string, LeadStatus> = { qualified: 'negotiation', converted: 'won' };

export const LEAD_NOTES_MAX = 4000;

export function normalizeLeadStatus(status: string | null | undefined): LeadStatus {
  if (status && (LEAD_STATUSES as readonly string[]).includes(status)) return status as LeadStatus;
  if (status && LEGACY_STATUS[status]) return LEGACY_STATUS[status];
  return 'new';
}

export const isOpenLead = (status: string | null | undefined) => OPEN_LEAD_STATUSES.includes(normalizeLeadStatus(status));

/** Any status may follow any other, except that a lead never goes back to "new". */
export function canChangeStatus(from: string, to: string): boolean {
  if (!(LEAD_STATUSES as readonly string[]).includes(to)) return false;
  if (to === 'new' && normalizeLeadStatus(from) !== 'new') return false;
  return true;
}

export function statusOptions(current: string): LeadStatus[] {
  const cur = normalizeLeadStatus(current);
  return LEAD_STATUSES.filter((s) => s === cur || canChangeStatus(cur, s));
}

export interface LeadLike {
  status: string;
  notes?: string | null;
  next_action_at?: string | null;
}

export interface LeadEdit {
  status: string;
  notes: string;
  /** yyyy-mm-dd from a date input, or '' for none */
  nextActionDate: string;
}

export type LeadEditProblem = 'invalidStatus' | 'cannotReturnToNew' | 'notesTooLong' | 'invalidDate';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateLeadEdit(current: LeadLike, edit: LeadEdit): LeadEditProblem | null {
  if (!(LEAD_STATUSES as readonly string[]).includes(edit.status)) return 'invalidStatus';
  if (edit.status !== normalizeLeadStatus(current.status) && !canChangeStatus(current.status, edit.status)) return 'cannotReturnToNew';
  if (edit.notes.length > LEAD_NOTES_MAX) return 'notesTooLong';
  if (edit.nextActionDate && (!DATE_RE.test(edit.nextActionDate) || Number.isNaN(new Date(`${edit.nextActionDate}T09:00:00`).getTime())))
    return 'invalidDate';
  return null;
}

/** Local 09:00 on the chosen day, so the date never shifts across time zones. */
export const dateInputToIso = (value: string): string | null => (value ? new Date(`${value}T09:00:00`).toISOString() : null);

export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Only the fields a lister may change. Buyer contact details, the linked
 * listing and the lead's owner are never sent (and the database ignores them).
 */
export function buildLeadUpdate(current: LeadLike, edit: LeadEdit) {
  const update: { status?: string; notes?: string | null; next_action_at?: string | null } = {};
  if (edit.status !== current.status && edit.status !== normalizeLeadStatus(current.status)) update.status = edit.status;
  const notes = edit.notes.trim() ? edit.notes : null;
  if ((notes ?? null) !== (current.notes ?? null)) update.notes = notes;
  const next = dateInputToIso(edit.nextActionDate);
  if (isoToDateInput(next) !== isoToDateInput(current.next_action_at)) update.next_action_at = next;
  return update;
}

export type FollowUpState = 'overdue' | 'today' | 'upcoming' | null;

export function followUpState(lead: LeadLike, now: Date = new Date()): FollowUpState {
  if (!lead.next_action_at || !isOpenLead(lead.status)) return null;
  const due = isoToDateInput(lead.next_action_at);
  const today = isoToDateInput(now.toISOString());
  if (due < today) return 'overdue';
  if (due === today) return 'today';
  return 'upcoming';
}

export interface LeadSummary {
  total: number;
  new: number;
  open: number;
  followUpsDue: number;
  won: number;
  lost: number;
}

export function summarizeLeads(leads: LeadLike[], now: Date = new Date()): LeadSummary {
  const s: LeadSummary = { total: leads.length, new: 0, open: 0, followUpsDue: 0, won: 0, lost: 0 };
  for (const lead of leads) {
    const st = normalizeLeadStatus(lead.status);
    if (st === 'new') s.new += 1;
    if (isOpenLead(st)) s.open += 1;
    if (st === 'won') s.won += 1;
    if (st === 'lost') s.lost += 1;
    const f = followUpState(lead, now);
    if (f === 'overdue' || f === 'today') s.followUpsDue += 1;
  }
  return s;
}

export type LeadFilter = 'all' | 'due' | LeadStatus;

export function filterLeads<T extends LeadLike>(leads: T[], filter: LeadFilter, now: Date = new Date()): T[] {
  if (filter === 'all') return leads;
  if (filter === 'due') return leads.filter((l) => {
    const f = followUpState(l, now);
    return f === 'overdue' || f === 'today';
  });
  return leads.filter((l) => normalizeLeadStatus(l.status) === filter);
}

/** Where the lead came from, as a translation key under leadInbox.source. */
export function leadSourceKey(lead: { enquiry_type?: string | null; lead_source?: string | null }): string {
  if (lead.enquiry_type === 'property_viewing') return 'viewing';
  if (lead.enquiry_type === 'property_inquiry') return 'message';
  return 'manual';
}

const digits = (v: string) => v.replace(/\D/g, '');

/** wa.me number for Indonesian phones (08… → 628…); null when not usable. */
export function whatsappNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let d = digits(phone);
  if (d.startsWith('0')) d = `62${d.slice(1)}`;
  if (d.length < 9 || d.length > 15) return null;
  return d;
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export function leadErrorKey(error: { message?: string } | null | undefined): LeadEditProblem | 'generic' {
  const m = error?.message || '';
  if (m.includes('lead_cannot_return_to_new')) return 'cannotReturnToNew';
  if (m.includes('lead_invalid_status')) return 'invalidStatus';
  if (m.includes('lead_notes_too_long')) return 'notesTooLong';
  return 'generic';
}
