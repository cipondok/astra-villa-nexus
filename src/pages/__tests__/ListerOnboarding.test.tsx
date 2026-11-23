import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import en from '@/i18n/locales/en';

// Radix checkbox measures itself; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

const calls: { table: string; op: string; payload: unknown }[] = [];
let insertError: { message: string } | null = null;
let authState: { user: unknown; profile: unknown } = { user: null, profile: null };
let activation: { state: unknown; isLoading: boolean; counts: unknown } = { state: null, isLoading: false, counts: null };

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      update: (payload: unknown) => ({
        eq: async () => {
          calls.push({ table, op: 'update', payload });
          return { error: null };
        },
      }),
      insert: async (payload: unknown) => {
        calls.push({ table, op: 'insert', payload });
        return { error: insertError };
      },
    }),
  },
}));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ ...authState, refreshProfile: async () => {} }),
}));
vi.mock('@/hooks/useListerActivation', () => ({ useListerActivation: () => activation }));
vi.mock('@/components/SEOHead', () => ({ default: () => null }));
vi.mock('@/i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    t: (key: string) => key.split('.').reduce<any>((o, k) => (o ? o[k] : undefined), en) ?? key,
  }),
}));

import ListerOnboarding from '../ListerOnboarding';

const renderPage = (url = '/onboarding/listing') =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[url]}>
        <ListerOnboarding />
      </MemoryRouter>
    </QueryClientProvider>,
  );

const L = en.listerOnboarding as any;

beforeEach(() => {
  calls.length = 0;
  insertError = null;
  authState = { user: { id: 'u1', email: 'sari@example.com' }, profile: { id: 'u1', email: 'sari@example.com', full_name: 'Sari Dewi' } };
  activation = { state: { stage: 'not_started', intent: null }, isLoading: false, counts: null };
});

describe('owner & agent onboarding page', () => {
  it('signed-out visitors are asked to sign in and see no form', () => {
    authState = { user: null, profile: null };
    activation = { state: null, isLoading: false, counts: null };
    renderPage();
    expect(screen.getByRole('link', { name: L.actions.signIn })).toBeTruthy();
    expect(screen.queryByRole('button', { name: L.actions.submit })).toBeNull();
  });

  it('an incomplete application is not sent', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: L.actions.submit }));
    expect(await screen.findByText(L.errors.fixFields)).toBeTruthy();
    expect(calls).toHaveLength(0);
  });

  it('a complete agent application goes to agent_registration_requests without a status', async () => {
    renderPage('/onboarding/listing?role=agent');
    fireEvent.change(screen.getByLabelText(new RegExp(L.fields.phone)), { target: { value: '0811 2223 333' } });
    fireEvent.change(screen.getByLabelText(new RegExp(L.fields.province)), { target: { value: 'DKI Jakarta' } });
    fireEvent.change(screen.getByLabelText(new RegExp(L.fields.city)), { target: { value: 'Jakarta Selatan' } });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${L.fields.bio}`)), {
      target: { value: 'Agen properti residensial di Jakarta Selatan sejak 2015, fokus rumah keluarga.' },
    });
    fireEvent.click(screen.getByLabelText(L.fields.declaration));
    fireEvent.click(screen.getByRole('button', { name: L.actions.submit }));

    await screen.findByText(L.submitted.title);
    const profileUpdate = calls.find((c) => c.table === 'profiles');
    expect(profileUpdate?.payload).toMatchObject({ full_name: 'Sari Dewi', phone: '+628112223333' });
    const insert = calls.find((c) => c.op === 'insert');
    expect(insert?.table).toBe('agent_registration_requests');
    expect(insert?.payload).toMatchObject({ user_id: 'u1', business_type: 'individual_agent', service_area: 'Jakarta Selatan, DKI Jakarta' });
    expect(insert?.payload).not.toHaveProperty('status');
  });

  it('shows the database refusal of a second open application', async () => {
    insertError = { message: 'application_already_pending' };
    renderPage('/onboarding/listing?role=property_owner');
    fireEvent.change(screen.getByLabelText(new RegExp(L.fields.phone)), { target: { value: '081234567890' } });
    fireEvent.change(screen.getByLabelText(new RegExp(L.fields.province)), { target: { value: 'Bali' } });
    fireEvent.change(screen.getByLabelText(new RegExp(L.fields.city)), { target: { value: 'Badung' } });
    fireEvent.click(screen.getByRole('button', { name: L.propertyTypes.villa }));
    fireEvent.click(screen.getByLabelText(L.fields.declaration));
    fireEvent.click(screen.getByRole('button', { name: L.actions.submit }));
    expect(await screen.findByText(L.errors.alreadyPending)).toBeTruthy();
    expect(calls.find((c) => c.op === 'insert')?.table).toBe('property_owner_requests');
  });

  it('while an application is pending the form is hidden and the status is shown', () => {
    activation = { state: { stage: 'pending', role: 'agent', submittedAt: '2026-11-20T00:00:00Z' }, isLoading: false, counts: null };
    renderPage();
    expect(screen.getByText(L.status.pendingTitle)).toBeTruthy();
    expect(screen.queryByRole('button', { name: L.actions.submit })).toBeNull();
  });

  it('after a rejection the reviewer note and a re-apply form are shown', () => {
    activation = { state: { stage: 'rejected', role: 'agent', note: 'Lengkapi nomor izin', reviewedAt: null }, isLoading: false, counts: null };
    renderPage();
    expect(screen.getByText('Lengkapi nomor izin')).toBeTruthy();
    expect(screen.getByRole('button', { name: L.actions.submit })).toBeTruthy();
  });

  it('approved users are sent to post a listing and My Properties', () => {
    activation = { state: { stage: 'active', role: 'agent' }, isLoading: false, counts: { listings: 0, live: 0, inReview: 0, needsChanges: 0, newLeads: 0 } };
    renderPage();
    expect(screen.getByRole('link', { name: new RegExp(L.actions.postListing) }).getAttribute('href')).toBe('/post-property');
    expect(screen.getByRole('link', { name: L.actions.myProperties }).getAttribute('href')).toBe('/my-properties');
  });
});
