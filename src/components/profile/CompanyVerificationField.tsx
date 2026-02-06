import React from 'react';
import { ExternalLink, Building2, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CompanyVerificationFieldProps {
  companyName: string;
  registrationNumber: string;
  isVerified?: boolean;
  onRegistrationChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const CompanyVerificationField: React.FC<CompanyVerificationFieldProps> = ({
  companyName,
  registrationNumber,
  isVerified = false,
  onRegistrationChange,
  disabled = false,
  className,
}) => {
  // Build AHU lookup URL
  const getAHULookupUrl = () => {
    // AHU company search page
    return 'https://ahu.go.id/pencarian/profil-pt';
  };

  const handleOpenAHU = () => {
    window.open(getAHULookupUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Registration Number Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="company_registration" className="text-xs flex items-center gap-1.5">
            NIB / Company Registration Number
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px]">
                  <p className="text-xs">
                    Enter your company's NIB (Nomor Induk Berusaha) or SK number 
                    from AHU for verification purposes.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          
          {isVerified && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary gap-1">
              <CheckCircle className="h-2.5 w-2.5" />
              Verified
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            id="company_registration"
            placeholder="e.g., AHU-0000000.AH.01.01.TAHUN 2024"
            value={registrationNumber}
            onChange={(e) => onRegistrationChange(e.target.value)}
            disabled={disabled}
            className="h-9 flex-1 font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenAHU}
            className="h-9 gap-1.5 shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Verify on AHU
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0 text-xs text-muted-foreground">
          <p>
            Verify your company through{' '}
            <button
              type="button"
              onClick={handleOpenAHU}
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              AHU Indonesia
              <ExternalLink className="h-2.5 w-2.5" />
            </button>
            . This helps build trust with potential clients.
          </p>
        </div>
      </div>

      {/* Verification Status */}
      {registrationNumber && !isVerified && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
          <span>Pending verification by admin</span>
        </div>
      )}
    </div>
  );
};

export default CompanyVerificationField;
