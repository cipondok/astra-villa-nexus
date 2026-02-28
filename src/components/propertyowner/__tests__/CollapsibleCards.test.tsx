import { describe, it, expect, vi, beforeEach } from 'vitest';
// @ts-ignore - testing library types
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock dependencies before importing component
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@test.com', created_at: '2024-01-01' },
    profile: { full_name: 'Test Owner', avatar_url: null },
  }),
}));

vi.mock('@/hooks/usePropertyOwnerData', () => ({
  usePropertyOwnerData: () => ({
    properties: [
      { id: '1', title: 'Test Property', price: 500000000, property_type: 'house', listing_type: 'sale', status: 'active', approval_status: 'approved', city: 'Jakarta', state: 'DKI', images: [], thumbnail_url: '', created_at: '2024-01-01' },
    ],
    stats: { totalProperties: 5, activeListings: 3, totalViews: 124, totalInquiries: 4, pendingApprovals: 1, savedCount: 12 },
    recentActivity: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/hooks/useAstraToken', () => ({
  useAstraToken: () => ({
    balance: { available_tokens: 100, lifetime_earned: 500 },
    checkinStatus: { hasCheckedInToday: false },
    performCheckin: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useAstraWalletStats', () => ({
  useAstraWalletStats: () => ({
    walletStats: { todayRewards: 5, weekRewards: 35, monthRewards: 150 },
    isLoading: false,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock child components to keep test focused
vi.mock('../OwnerAstraTokenCard', () => ({ default: () => <div data-testid="astra-card">ASTRA</div> }));
vi.mock('../OwnerRentalManagement', () => ({ default: () => <div>Rentals</div> }));
vi.mock('../OwnerMaintenanceManagement', () => ({ default: () => <div>Maintenance</div> }));
vi.mock('../OwnerRentalAnalytics', () => ({ default: () => <div>Analytics</div> }));
vi.mock('../OwnerLeaseRenewal', () => ({ default: () => <div>Renewal</div> }));
vi.mock('../OwnerVerificationReview', () => ({ default: () => <div>Verification</div> }));
vi.mock('../OwnerInvoiceManagement', () => ({ default: () => <div>Invoices</div> }));
vi.mock('../OwnerInspectionManagement', () => ({ default: () => <div>Inspection</div> }));
vi.mock('../OwnerTenantScreening', () => ({ default: () => <div>Screening</div> }));
vi.mock('../OwnerDepositManagement', () => ({ default: () => <div>Deposits</div> }));
vi.mock('../OwnerLeaseContracts', () => ({ default: () => <div>Contracts</div> }));
vi.mock('../OwnerPaymentAutomation', () => ({ default: () => <div>PaymentAuto</div> }));
vi.mock('../OwnerAnnouncementHub', () => ({ default: () => <div>Announcements</div> }));
vi.mock('../OwnerExpenseTracking', () => ({ default: () => <div>Expenses</div> }));
vi.mock('../OwnerPayoutManagement', () => ({ default: () => <div>Payouts</div> }));
vi.mock('../OwnerSmartPricing', () => ({ default: () => <div>Pricing</div> }));
vi.mock('../OwnerBookingCancellation', () => ({ default: () => <div>Cancellation</div> }));
vi.mock('../OwnerPropertyAnalytics', () => ({ default: () => <div>PropAnalytics</div> }));
vi.mock('../OwnerConversionTracking', () => ({ default: () => <div>Conversion</div> }));
vi.mock('../OwnerCheckInOut', () => ({ default: () => <div>CheckInOut</div> }));
vi.mock('../OwnerVisitorTracking', () => ({ default: () => <div>Visitors</div> }));
vi.mock('../OwnerFinancialAnalytics', () => ({ default: () => <div>Financial</div> }));
vi.mock('../OwnerCalendarView', () => ({ default: () => <div>Calendar</div> }));
vi.mock('../OwnerReviewsDashboard', () => ({ default: () => <div>Reviews</div> }));
vi.mock('../OwnerReminderDashboard', () => ({ default: () => <div>Reminders</div> }));
vi.mock('../OwnerOccupancyForecast', () => ({ default: () => <div>Occupancy</div> }));
vi.mock('../OwnerTenantDocuments', () => ({ default: () => <div>Documents</div> }));
vi.mock('@/components/rental/RentalNotificationCenter', () => ({ default: () => <div>Notifications</div> }));
vi.mock('@/components/agent-analytics/LeadScoringPanel', () => ({ default: () => <div>Leads</div> }));
vi.mock('@/components/agent-analytics/ListingTipsPanel', () => ({ default: () => <div>Tips</div> }));

import PropertyOwnerOverview from '../PropertyOwnerOverview';

describe('Collapsible Cards on Property Owner Dashboard', () => {
  it('renders Performa Ringkas header with inline badges', () => {
    render(<PropertyOwnerOverview />);
    expect(screen.getByText('Performa Ringkas')).toBeInTheDocument();
  });

  it('Performa Ringkas is collapsed by default — detail grid not visible', () => {
    render(<PropertyOwnerOverview />);
    // The header badges should show stats inline
    expect(screen.getByText('Performa Ringkas')).toBeInTheDocument();
    // "Tingkat Aktif" label is only in expanded view
    expect(screen.queryByText('Tingkat Aktif')).not.toBeInTheDocument();
  });

  it('expands Performa Ringkas on click, showing detail grid', async () => {
    render(<PropertyOwnerOverview />);
    const header = screen.getByText('Performa Ringkas').closest('div[class*="cursor-pointer"]');
    expect(header).toBeTruthy();
    fireEvent.click(header!);
    await waitFor(() => {
      expect(screen.getByText('Tingkat Aktif')).toBeInTheDocument();
      expect(screen.getByText('Konversi')).toBeInTheDocument();
      expect(screen.getByText('Views')).toBeInTheDocument();
      expect(screen.getByText('Disimpan')).toBeInTheDocument();
    });
  });

  it('collapses Performa Ringkas on second click', async () => {
    render(<PropertyOwnerOverview />);
    const header = screen.getByText('Performa Ringkas').closest('div[class*="cursor-pointer"]');
    // Expand
    fireEvent.click(header!);
    await waitFor(() => expect(screen.getByText('Tingkat Aktif')).toBeInTheDocument());
    // Collapse
    fireEvent.click(header!);
    await waitFor(() => expect(screen.queryByText('Tingkat Aktif')).not.toBeInTheDocument());
  });

  it('Ringkasan Properti is collapsed by default', () => {
    render(<PropertyOwnerOverview />);
    expect(screen.getByText('Ringkasan Properti')).toBeInTheDocument();
    // Expanded content labels not visible
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
  });

  it('Ringkasan Properti expands on click', async () => {
    render(<PropertyOwnerOverview />);
    const header = screen.getByText('Ringkasan Properti').closest('div[class*="cursor-pointer"]');
    fireEvent.click(header!);
    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Aktif')).toBeInTheDocument();
    });
  });

  it('Aksi Cepat is collapsed by default', () => {
    render(<PropertyOwnerOverview />);
    expect(screen.getByText('Aksi Cepat')).toBeInTheDocument();
    expect(screen.queryByText('Tambah Properti')).not.toBeInTheDocument();
  });

  it('Aksi Cepat expands on click showing quick action links', async () => {
    render(<PropertyOwnerOverview />);
    const header = screen.getByText('Aksi Cepat').closest('div[class*="cursor-pointer"]');
    fireEvent.click(header!);
    await waitFor(() => {
      expect(screen.getByText('Tambah Properti')).toBeInTheDocument();
      expect(screen.getByText('Properti Saya')).toBeInTheDocument();
      expect(screen.getByText('Pengaturan')).toBeInTheDocument();
    });
  });
});
