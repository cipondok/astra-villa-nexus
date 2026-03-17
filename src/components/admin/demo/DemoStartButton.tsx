import React from 'react';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoMode } from '@/contexts/DemoModeContext';

/**
 * Toggle button for starting/stopping demo mode.
 * Can be placed anywhere in the admin dashboard.
 */
const DemoStartButton: React.FC<{ className?: string }> = ({ className }) => {
  const { isActive, startDemo, stopDemo } = useDemoMode();

  return (
    <Button
      variant={isActive ? 'destructive' : 'outline'}
      size="sm"
      onClick={isActive ? stopDemo : startDemo}
      className={className}
    >
      {isActive ? (
        <>
          <Square className="h-3.5 w-3.5" />
          <span className="text-[10px]">Stop Demo</span>
        </>
      ) : (
        <>
          <Play className="h-3.5 w-3.5" />
          <span className="text-[10px]">Start Demo</span>
        </>
      )}
    </Button>
  );
};

export default React.memo(DemoStartButton);
