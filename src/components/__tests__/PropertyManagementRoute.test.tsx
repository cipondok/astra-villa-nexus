import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PropertyManagementRoute from '@/components/PropertyManagementRoute';

const toastError = vi.fn();
vi.mock('sonner', () => ({ toast: { error: (...a: unknown[]) => toastError(...a) } }));

const authState = { user: null as null | { id: string }, loading: false };
const rolesState = { data: [] as string[], isLoading: false };

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authState }));
vi.mock('@/hooks/useUserRoles', () => ({ useUserRoles: () => rolesState }));

const renderAt = (path = '/my-properties') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PropertyManagementRoute />}>
          <Route path="/my-properties" element={<div>Management area</div>} />
          <Route path="/my-properties/:id" element={<div>Management detail</div>} />
        </Route>
        <Route path="/" element={<div>Home with auth modal</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('PropertyManagementRoute guard', () => {
  beforeEach(() => {
    toastError.mockClear();
    authState.user = null;
    authState.loading = false;
    rolesState.data = [];
    rolesState.isLoading = false;
  });

  it('shows a loading state while auth or roles resolve (e.g. after refresh)', () => {
    authState.loading = true;
    renderAt();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(toastError).not.toHaveBeenCalled();
  });

  it('redirects guests to sign-in and explains why', () => {
    renderAt();
    expect(screen.getByText('Home with auth modal')).toBeInTheDocument();
    expect(toastError).toHaveBeenCalledWith('Sign in required', expect.anything());
  });

  it('shows the safe fallback with a toast for authenticated users without a listing role', () => {
    authState.user = { id: 'u1' };
    rolesState.data = ['general_user'];
    renderAt();
    expect(screen.getByText(/Property management unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Browse properties/i })).toBeInTheDocument();
    expect(toastError).toHaveBeenCalledWith('Access restricted', expect.anything());
  });

  it.each(['agent', 'property_owner', 'developer', 'admin', 'super_admin'])(
    'allows %s through to the management area',
    (role) => {
      authState.user = { id: 'u1' };
      rolesState.data = [role];
      renderAt();
      expect(screen.getByText('Management area')).toBeInTheDocument();
      expect(toastError).not.toHaveBeenCalled();
    }
  );

  it('allows sub-routes for permitted roles after a direct load/refresh', () => {
    authState.user = { id: 'u1' };
    rolesState.data = ['agent'];
    renderAt('/my-properties/abc');
    expect(screen.getByText('Management detail')).toBeInTheDocument();
  });

  it('only notifies once per mount', () => {
    authState.user = { id: 'u1' };
    rolesState.data = ['investor'];
    const { rerender } = renderAt();
    rerender(
      <MemoryRouter initialEntries={['/my-properties']}>
        <Routes>
          <Route element={<PropertyManagementRoute />}>
            <Route path="/my-properties" element={<div>Management area</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(toastError).toHaveBeenCalledTimes(1);
  });
});
