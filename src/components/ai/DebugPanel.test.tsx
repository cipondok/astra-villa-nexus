import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DebugPanel from './DebugPanel';

// Mock the KeyboardShortcutsModal component
vi.mock('./KeyboardShortcutsModal', () => ({
  default: () => <div data-testid="keyboard-shortcuts-modal">Keyboard Shortcuts Modal</div>,
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('DebugPanel', () => {
  const mockProps = {
    prefersReducedMotion: false,
    isOverridden: false,
    onToggleMotion: vi.fn(),
    onClearOverride: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set NODE_ENV to development for tests
    process.env.NODE_ENV = 'development';
  });

  it('should render settings button when panel is closed', () => {
    const { getByTitle } = render(<DebugPanel {...mockProps} />);
    const button = getByTitle('Animation Debug Panel');
    expect(button).toBeInTheDocument();
  });

  it('should open panel when settings button is clicked', async () => {
    const user = userEvent.setup();
    const { getByTitle, getByText } = render(<DebugPanel {...mockProps} />);
    const button = getByTitle('Animation Debug Panel');
    await user.click(button);
    
    expect(getByText('Animation Debug')).toBeInTheDocument();
  });

  it('should display correct status when reduced motion is OFF', async () => {
    const user = userEvent.setup();
    const { getByTitle, getByText } = render(<DebugPanel {...mockProps} prefersReducedMotion={false} />);
    
    // Open panel
    await user.click(getByTitle('Animation Debug Panel'));
    
    expect(getByText('OFF')).toBeInTheDocument();
    expect(getByText('Disable Animations')).toBeInTheDocument();
  });

  it('should display correct status when reduced motion is ON', async () => {
    const user = userEvent.setup();
    const { getByTitle, getByText } = render(<DebugPanel {...mockProps} prefersReducedMotion={true} />);
    
    // Open panel
    await user.click(getByTitle('Animation Debug Panel'));
    
    expect(getByText('ON')).toBeInTheDocument();
    expect(getByText('Enable Animations')).toBeInTheDocument();
  });

  it('should show override warning when manual override is active', async () => {
    const user = userEvent.setup();
    const { getByTitle, getByText } = render(<DebugPanel {...mockProps} isOverridden={true} />);
    
    // Open panel
    await user.click(getByTitle('Animation Debug Panel'));
    
    expect(getByText(/Manual override active/i)).toBeInTheDocument();
  });

  it('should show reset button only when override is active', async () => {
    const user = userEvent.setup();
    const { getByTitle, getByText, queryByText, rerender } = render(
      <DebugPanel {...mockProps} isOverridden={false} />
    );
    
    // Open panel
    await user.click(getByTitle('Animation Debug Panel'));
    
    expect(queryByText('Reset to System Setting')).not.toBeInTheDocument();
    
    // Rerender with override active
    rerender(<DebugPanel {...mockProps} isOverridden={true} />);
    
    expect(getByText('Reset to System Setting')).toBeInTheDocument();
  });

  it('should call onToggleMotion when toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleMotion = vi.fn();
    const { getByTitle, getByText } = render(<DebugPanel {...mockProps} onToggleMotion={onToggleMotion} />);
    
    // Open panel
    await user.click(getByTitle('Animation Debug Panel'));
    
    // Click toggle button
    const toggleButton = getByText('Disable Animations');
    await user.click(toggleButton);
    
    expect(onToggleMotion).toHaveBeenCalledTimes(1);
  });

  it('should call onClearOverride when reset button is clicked', async () => {
    const user = userEvent.setup();
    const onClearOverride = vi.fn();
    const { getByTitle, getByText } = render(
      <DebugPanel {...mockProps} isOverridden={true} onClearOverride={onClearOverride} />
    );
    
    // Open panel
    await user.click(getByTitle('Animation Debug Panel'));
    
    // Click reset button
    const resetButton = getByText('Reset to System Setting');
    await user.click(resetButton);
    
    expect(onClearOverride).toHaveBeenCalledTimes(1);
  });

  it('should not render in production mode', () => {
    process.env.NODE_ENV = 'production';
    const { container } = render(<DebugPanel {...mockProps} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render KeyboardShortcutsModal', () => {
    const { getByTestId } = render(<DebugPanel {...mockProps} />);
    
    expect(getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
  });

  it('should display keyboard shortcuts info', async () => {
    const user = userEvent.setup();
    const { getByTitle, getByText } = render(<DebugPanel {...mockProps} />);
    
    // Open panel
    await user.click(getByTitle('Animation Debug Panel'));
    
    expect(getByText('View all shortcuts')).toBeInTheDocument();
  });
});
