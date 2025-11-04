import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {/* Toggle button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 z-[10003] h-10 w-10 rounded-full bg-gray-800 hover:bg-gray-700 shadow-lg"
          size="icon"
          title="Animation Debug Panel"
        >
          <Settings className="h-4 w-4 text-white" />
        </Button>
      )}

      {/* Debug panel */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 z-[10003] bg-gray-900 text-white rounded-lg shadow-2xl p-4 w-72 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Animation Debug
            </h3>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Current status */}
            <div className="bg-gray-800 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400">Reduced Motion:</span>
                <span className={cn(
                  "font-semibold",
                  prefersReducedMotion ? "text-orange-400" : "text-green-400"
                )}>
                  {prefersReducedMotion ? "ON" : "OFF"}
                </span>
              </div>
              {isOverridden && (
                <div className="text-yellow-400 text-[10px] mt-1">
                  ⚠️ Manual override active
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <Button
                onClick={onToggleMotion}
                className={cn(
                  "w-full text-xs h-8",
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
                  className="w-full text-xs h-8 border-gray-600 hover:bg-gray-800"
                >
                  Reset to System Setting
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="text-[10px] text-gray-500 pt-2 border-t border-gray-700">
              <p>Toggle animations without changing OS settings.</p>
              <p className="mt-1">Setting persists in localStorage.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
