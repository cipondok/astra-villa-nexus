import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Trigger animation when override state changes
  useEffect(() => {
    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [isOverridden]);

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                className={cn(
                  "fixed bottom-20 left-4 z-[99999] h-10 w-10 rounded-full shadow-lg hover-scale group relative overflow-hidden",
                  "transition-[background-color,box-shadow] duration-500 ease-in-out",
                  isOverridden 
                    ? "bg-yellow-800/80 hover:bg-yellow-700/80 hover:shadow-[0_0_30px_rgba(251,191,36,0.8)]" 
                    : "bg-gray-800 hover:bg-gray-700 hover:shadow-[0_0_20px_rgba(156,163,175,0.5)]",
                  shouldAnimate && "animate-toggle-scale"
                )}
                style={{ 
                  animation: 'slideUpFade 0.5s ease-out 500ms both'
                }}
                size="icon"
              >
                {isOverridden && (
                  <>
                    <span 
                      className="absolute inset-0 shimmer-effect" 
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent)',
                        animation: 'shimmer 3s infinite'
                      }}
                    />
                    <span 
                      className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-gray-900 z-10" 
                      style={{
                        background: 'rgb(251, 191, 36)',
                        boxShadow: '0 0 12px rgba(251, 191, 36, 0.8)',
                        animation: 'badgePulse 3s infinite'
                      }}
                    />
                  </>
                )}
                {!isOverridden && null}
                <style>{`
                  @keyframes slideUpFade {
                    from {
                      opacity: 0;
                      transform: translateY(20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                  @keyframes shimmer {
                    0% {
                      transform: translateX(-100%);
                    }
                    100% {
                      transform: translateX(200%);
                    }
                  }
                  @keyframes badgePulse {
                    0%, 100% {
                      background: rgb(251, 191, 36);
                      box-shadow: 0 0 12px rgba(251, 191, 36, 0.8);
                    }
                    50% {
                      background: rgb(252, 211, 77);
                      box-shadow: 0 0 20px rgba(251, 191, 36, 1);
                    }
                  }
                  @keyframes toggleScale {
                    0%, 100% {
                      transform: scale(1);
                    }
                    50% {
                      transform: scale(1.15);
                    }
                  }
                  .animate-toggle-scale {
                    animation: toggleScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                  }
                `}</style>
                <span className={cn(
                  "transition-transform duration-300 group-hover:rotate-90 inline-block animate-bounce",
                  isOverridden && "pulse"
                )} style={{ animationIterationCount: '3', animationDuration: '1s' }}>
                  <Settings className="h-4 w-4 text-white" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-2">
                <div>
                  <p className="font-semibold">
                    {isOverridden ? "⚠️ Manual Override Active" : "Animation Debug Panel"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Animations are currently <span className="font-semibold">{prefersReducedMotion ? "OFF" : "ON"}</span>
                  </p>
                </div>
                
                <div className="pt-1 border-t border-border space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Shortcuts:</p>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Toggle panel</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘/Ctrl + D</kbd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Toggle animations</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘/Ctrl + A</kbd>
                    </div>
                    {isOverridden && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Reset override</span>
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘/Ctrl + R</kbd>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Debug panel */}
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <div 
            className={cn(
              "fixed inset-0 z-[99998] bg-black/20 backdrop-blur-sm transition-opacity duration-300",
              isClosing ? "opacity-0" : "opacity-100"
            )}
            onClick={handleClose}
          />
          
          <div 
            className={cn(
              "fixed bottom-4 left-4 z-[99999] bg-gray-900 text-white rounded-lg shadow-2xl p-4 w-72 border border-gray-700 transition-all duration-300 hover:shadow-[0_0_30px_rgba(156,163,175,0.3)] hover:border-gray-600",
              isClosing ? "animate-exit" : ""
            )}
            style={!isClosing ? {
              animation: 'panelFadeIn 0.3s ease-out, panelScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            } : undefined}
          >
          <style>{`
            @keyframes panelScaleIn {
              from {
                transform: scale(0.85);
              }
              to {
                transform: scale(1);
              }
            }
            @keyframes panelFadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
          
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Settings 
                className="h-4 w-4" 
                style={{
                  animation: 'spinIn 0.6s ease-out',
                  transformOrigin: 'center'
                }}
              />
              <style>{`
                @keyframes spinIn {
                  from {
                    transform: rotate(-180deg);
                    opacity: 0;
                  }
                  to {
                    transform: rotate(0deg);
                    opacity: 1;
                  }
                }
              `}</style>
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
            <div 
              className="bg-gray-800 rounded p-2" 
              style={{ 
                animation: 'slideInLeft 0.4s ease-out 0ms, fadeIn 0.3s ease-out 0ms',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              <style>{`
                @keyframes slideInLeft {
                  from {
                    transform: translateX(-20px);
                    opacity: 0;
                  }
                  to {
                    transform: translateX(0);
                    opacity: 1;
                  }
                }
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }
              `}</style>
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
            <div 
              className="space-y-2" 
              style={{ 
                animation: 'slideInLeft 0.4s ease-out 100ms, fadeIn 0.3s ease-out 100ms',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
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
                  className="w-full text-xs h-8 border-gray-600 hover:bg-gray-800 hover-scale animate-fade-in"
                >
                  Reset to System Setting
                </Button>
              )}
            </div>

            {/* Info */}
            <div 
              className="text-[10px] text-gray-500 pt-2 border-t border-gray-700 space-y-2" 
              style={{ 
                animation: 'slideInLeft 0.4s ease-out 200ms, fadeIn 0.3s ease-out 200ms',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
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
        </>
      )}
    </>
  );
};

export default DebugPanel;
