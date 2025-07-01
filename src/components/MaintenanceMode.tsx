
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Wrench } from 'lucide-react';

interface MaintenanceModeProps {
  feature: string;
  message?: string;
  showIcon?: boolean;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ 
  feature, 
  message = "This feature is currently under maintenance. Please try again later.",
  showIcon = true 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[200px] p-6">
      <Alert className="max-w-md">
        {showIcon && <AlertTriangle className="h-4 w-4" />}
        <AlertDescription className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          <div>
            <div className="font-medium mb-1">{feature} - Under Construction</div>
            <div className="text-sm">{message}</div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MaintenanceMode;
