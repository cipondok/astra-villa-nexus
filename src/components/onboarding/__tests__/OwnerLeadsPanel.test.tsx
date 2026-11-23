import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import en from '@/i18n/locales/en';

const mutate = vi.fn();
let leadsState: { leads: unknown[]; isLoading: boolean; error: unknown } = { leads: [], isLoading: false, error: null };

vi.mock('@/hooks/usePropertyLeads', () => ({
  usePropertyLeads: () => ({ ...leadsState, updateLead: { mutate, isPending: false } }),
  useLeadHistory: () => ({ data: [], isLoading: false, isError: false }),
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => ({ select: () => ({ in: async () => ({ data: [{ id: 'p1', title: 'Villa Ubud', slug: 'villa-ubud' }] }) }) }) },
}));
vi.mock('@/i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    t: (key: string) => key.split('.').reduce<any>((o, k) => (o ? o[k] : undefined), en) ?? key,
  }),
}));

import OwnerLeadsPanel from '../OwnerLeadsPanel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const L = (en as any).leadInbox;

const lead = (over: Record<string, unknown>) => ({
  id: 'l1', property_id: 'p1', agent_id: 'me', lead_name: 'Budi', lead_email: 'budi@example.com', lead_phone: '0812 3456 7890',
  lead_source: 'website', status: 'new', lead_score: 60, notes: null, last_contacted_at: null, converted_at: null,
  enquiry_type: 'property_viewing', enquiry_message: 'Can I visit on Saturday?', next_action_at: null,
  created_at: '2026-11-20T08:00:00Z', updated_at: '2026-11-20T08:00:00Z', ...over,
});

const renderPanel = (url = '/my-properties') =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[url]}><OwnerLeadsPanel /></MemoryRouter>
    </QueryClientProvider>,
  );

beforeEach(() => { mutate.mockReset(); leadsState = { leads: [], isLoading: false, error: null }; });

describe('lead inbox', () => {
  it('shows an empty state with no invented leads', () => {
    renderPanel();
    expect(screen.getByText(L.empty)).toBeTruthy();
  });

  it('shows an error state', () => {
    leadsState = { leads: [], isLoading: false, error: new Error('x') };
    renderPanel();
    expect(screen.getByRole('alert').textContent).toBe(L.error);
  });

  it('filters by status', () => {
    leadsState.leads = [lead({}), lead({ id: 'l2', lead_name: 'Sari', status: 'won' })];
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: L.status.won }));
    expect(screen.queryByText('Budi')).toBeNull();
    expect(screen.getByText('Sari')).toBeTruthy();
  });

  it('opens the linked lead and shows message, contact actions and private-notes hint', () => {
    leadsState.leads = [lead({})];
    renderPanel('/my-properties?lead=l1');
    expect(screen.getByText('Can I visit on Saturday?')).toBeTruthy();
    expect(screen.getByRole('link', { name: /WhatsApp/ }).getAttribute('href')).toBe('https://wa.me/6281234567890');
    expect(screen.getByText(L.detail.notesPrivate)).toBeTruthy();
  });

  it('saves only status, notes and follow-up date', () => {
    leadsState.leads = [lead({})];
    renderPanel('/my-properties?lead=l1');
    fireEvent.change(screen.getByLabelText(L.detail.status), { target: { value: 'viewing_scheduled' } });
    fireEvent.change(screen.getByLabelText(L.detail.notes), { target: { value: 'Prefers Saturday morning' } });
    fireEvent.click(screen.getByRole('button', { name: L.actions.save }));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({ id: 'l1', status: 'viewing_scheduled', notes: 'Prefers Saturday morning' });
  });

  it('does not offer "New" once a lead has been worked', () => {
    leadsState.leads = [lead({ status: 'contacted' })];
    renderPanel('/my-properties?lead=l1');
    const options = Array.from((screen.getByLabelText(L.detail.status) as HTMLSelectElement).options).map((o) => o.value);
    expect(options).not.toContain('new');
  });
});
