import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import OnboardingTooltip from './OnboardingTooltip';

interface DebugPanelProps {
  prefersReducedMotion: boolean;
  isOverridden: boolean;
  onToggleMotion: () => void;
  onClearOverride: () => void;
}

const DebugPanel = ({ 
  prefersReducedMotion, 
  isOverridden, 
  onToggleMotion, 
  onClearOverride 
}: DebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before unmounting
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + D: Toggle debug panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          setIsOpen(true);
        }
        console.log('🔧 Debug Panel: Toggled via keyboard shortcut (Cmd/Ctrl + D)');
        toast({
          title: isOpen ? "Debug Panel Closed" : "Debug Panel Opened",
          description: "Press Cmd/Ctrl + D to toggle",
          duration: 2000,
        });
      }
      
      // Cmd/Ctrl + A: Toggle animations directly
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        onToggleMotion();
        console.log('🔧 Animation Toggle: Triggered via keyboard shortcut (Cmd/Ctrl + A)');
        toast({
          title: prefersReducedMotion ? "Animations Enabled" : "Animations Disabled",
          description: "Press Cmd/Ctrl + A to toggle",
          duration: 2000,
        });
      }
      
      // Cmd/Ctrl + R: Reset to system settings
      if ((e.metaKey || e.ctrlKey) && e.key === 'r' && isOverridden) {
        e.preventDefault();
        onClearOverride();
        console.log('🔧 Reset Override: Triggered via keyboard shortcut (Cmd/Ctrl + R)');
        toast({
          title: "Reset to System Settings",
          description: "Manual override cleared",
          duration: 2000,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleMotion, onClearOverride, isOverridden, isOpen, prefersReducedMotion]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <KeyboardShortcutsModal />
      <OnboardingTooltip />
      
      {/* Toggle button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 z-[99999] h-10 w-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-lg hover-scale group hover:shadow-[0_0_20px_rgba(156,163,175,0.5)] transition-shadow duration-300"
          size="icon"
          title="Animation Debug Panel"
        >
          <span className="transition-transform duration-300 group-hover:rotate-90 inline-block">
            <Settings className="h-4 w-4 text-white" />
          </span>
        </Button>
      )}

      {/* Debug panel */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-4 left-4 z-[99999] bg-gray-900 text-white rounded-lg shadow-2xl p-4 w-72 border border-gray-700 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(156,163,175,0.3)]",
          isClosing ? "animate-exit" : "animate-enter"
        )}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Animation Debug
            </h3>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white group"
            >
              <span className="transition-transform duration-300 group-hover:rotate-90 inline-block">
                <X className="h-4 w-4" />
              </span>
            </Button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Current status */}
            <div className="bg-gray-800 rounded p-2 animate-fade-in" style={{ animationDelay: '0ms' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400">Reduced Motion:</span>
                <span className={cn(
                  "font-semibold transition-colors duration-300",
                  prefersReducedMotion ? "text-orange-400" : "text-green-400"
                )}>
                  {prefersReducedMotion ? "ON" : "OFF"}
                </span>
              </div>
              {isOverridden && (
                <div className="text-yellow-400 text-[10px] mt-1 pulse">
                  ⚠️ Manual override active
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Button
                onClick={onToggleMotion}
                className={cn(
                  "w-full text-xs h-8 hover-scale transition-colors duration-300",
                  prefersReducedMotion 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-orange-600 hover:bg-orange-700"
                )}
              >
                {prefersReducedMotion ? "Enable Animations" : "Disable Animations"}
              </Button>

              {isOverridden && (
                <Button
                  onClick={onClearOverride}
                  variant="outline"
                  className="w-full text-xs h-8 border-gray-600 hover:bg-gray-800 hover-scale"
                >
                  Reset to System Setting
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="text-[10px] text-gray-500 pt-2 border-t border-gray-700 space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <p>Toggle animations without changing OS settings.</p>
              <p>Setting persists in localStorage.</p>
              
              <button
                onClick={() => {
                  // Trigger the help modal by dispatching a keyboard event
                  const event = new KeyboardEvent('keydown', { key: '?' });
                  window.dispatchEvent(event);
                }}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors hover-scale"
              >
                <Keyboard className="h-3 w-3" />
                <span>View all shortcuts</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
