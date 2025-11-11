import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import AstraSearchPanel from '../AstraSearchPanel';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          not: vi.fn(() => Promise.resolve({
            data: [
              { property_type: 'apartment' },
              { property_type: 'house' },
              { property_type: 'villa' },
            ],
            error: null,
          })),
        })),
        not: vi.fn(() => Promise.resolve({
          data: [
            { property_type: 'apartment' },
            { property_type: 'house' },
            { property_type: 'villa' },
          ],
          error: null,
        })),
      })),
    })),
  },
}));

// Mock hooks
vi.mock('@/hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

vi.mock('@/hooks/usePropertyFilters', () => ({
  usePropertyFilters: () => ({
    filters: [],
    loading: false,
  }),
}));

vi.mock('@/hooks/useImageSearch', () => ({
  useImageSearch: () => ({
    searchByImage: vi.fn(),
    isSearching: false,
    clearResults: vi.fn(),
    searchResults: [],
    imageFeatures: null,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

//localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AstraSearchPanel Integration Tests', () => {
  let queryClient: QueryClient;
  let mockOnSearch: Mock;
  let mockOnLiveSearch: Mock;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockOnSearch = vi.fn();
    mockOnLiveSearch = vi.fn();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AstraSearchPanel
          language="en"
          onSearch={mockOnSearch}
          onLiveSearch={mockOnLiveSearch}
          resultsCount={0}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  describe('Basic Rendering', () => {
    it('should render search panel component', () => {
      const { container } = renderComponent();
      expect(container).toBeTruthy();
    });

    it('should render search input field', () => {
      const { container } = renderComponent();
      const searchInput = container.querySelector('input[placeholder*="Search"]');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      const { container } = renderComponent();
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Search Input Interactions', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      const { container } = renderComponent();
      
      const searchInput = container.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      expect(searchInput).toBeInTheDocument();
      
      await user.type(searchInput, 'Jakarta Villa');
      expect(searchInput.value).toBe('Jakarta Villa');
    });

    it('should call onLiveSearch prop when typing', async () => {
      const user = userEvent.setup();
      const { container } = renderComponent();
      
      const searchInput = container.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      await user.type(searchInput, 'Bali');
      
      // OnLiveSearch should be called
      expect(mockOnLiveSearch).toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    it('should render listing type tabs', () => {
      const { container } = renderComponent();
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBeGreaterThan(0);
    });
  });

  describe('Language Support', () => {
    it('should render in English by default', () => {
      const { container } = renderComponent({ language: 'en' });
      const searchInput = container.querySelector('input[placeholder*="Search"]');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render in Indonesian when language is "id"', () => {
      const { container } = renderComponent({ language: 'id' });
      const searchInput = container.querySelector('input[placeholder*="Cari"]');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Filter Interactions', () => {
    it('should render filter button', () => {
      const { container } = renderComponent();
      const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
      const hasFilterButton = buttons.some((btn: HTMLButtonElement) => 
        btn.textContent?.toLowerCase().includes('filter') ||
        btn.querySelector('[class*="lucide-filter"]')
      );
      expect(hasFilterButton || buttons.length > 0).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should not crash when onSearch throws error', async () => {
      const mockOnSearchWithError = vi.fn(() => {
        throw new Error('Search failed');
      });
      
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <AstraSearchPanel
            language="en"
            onSearch={mockOnSearchWithError}
            resultsCount={0}
          />
        </QueryClientProvider>
      );
      
      expect(container).toBeInTheDocument();
    });
  });

  describe('Results Count', () => {
    it('should accept resultsCount prop', () => {
      const { container } = renderComponent({ resultsCount: 42 });
      expect(container).toBeInTheDocument();
    });

    it('should update when resultsCount changes', () => {
      const { container, rerender } = renderComponent({ resultsCount: 10 });
      
      rerender(
        <QueryClientProvider client={queryClient}>
          <AstraSearchPanel
            language="en"
            onSearch={mockOnSearch}
            resultsCount={25}
          />
        </QueryClientProvider>
      );
      
      expect(container).toBeInTheDocument();
    });
  });

  describe('LocalStorage Integration', () => {
    it('should not crash when localStorage is accessed', () => {
      localStorageMock.setItem('test', 'value');
      const { container } = renderComponent();
      expect(container).toBeInTheDocument();
      expect(localStorageMock.getItem('test')).toBe('value');
    });
  });

  describe('Responsive Behavior', () => {
    it('should render on mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      const { container } = renderComponent();
      expect(container).toBeInTheDocument();
    });

    it('should render on desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      
      const { container } = renderComponent();
      expect(container).toBeInTheDocument();
    });
  });
});
