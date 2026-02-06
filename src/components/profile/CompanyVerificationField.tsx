import React, { useEffect, useState } from 'react';
import { ExternalLink, Building2, CheckCircle, AlertCircle, HelpCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanyVerificationFieldProps {
  companyName: string;
  registrationNumber: string;
  isVerified?: boolean;
  onRegistrationChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

interface VerificationState {
  status: VerificationStatus;
  verifiedAt: string | null;
  loading: boolean;
  submitting: boolean;
}

const CompanyVerificationField: React.FC<CompanyVerificationFieldProps> = ({
  companyName,
  registrationNumber,
  isVerified = false,
  onRegistrationChange,
  disabled = false,
  className,
}) => {
  const [verification, setVerification] = useState<VerificationState>({
    status: isVerified ? 'verified' : 'unverified',
    verifiedAt: null,
    loading: true,
    submitting: false,
  });

  // Fetch current verification status from database
  const fetchVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('company_verified, company_verified_at, company_registration_number')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching verification status:', error);
        return;
      }

      // Determine status based on database values
      let status: VerificationStatus = 'unverified';
      
      if (data?.company_verified === true) {
        status = 'verified';
      } else if (data?.company_registration_number && data?.company_registration_number.trim() !== '') {
        // Has registration number but not verified = pending
        status = 'pending';
      }

      setVerification(prev => ({
        ...prev,
        status,
        verifiedAt: data?.company_verified_at || null,
        loading: false,
      }));
    } catch (error) {
      console.error('Error checking verification:', error);
      setVerification(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  // Update status when isVerified prop changes
  useEffect(() => {
    if (isVerified) {
      setVerification(prev => ({ ...prev, status: 'verified' }));
    }
  }, [isVerified]);

  // Submit for verification
  const handleSubmitForVerification = async () => {
    if (!registrationNumber.trim()) {
      toast.error('Please enter your NIB/Registration Number first');
      return;
    }

    setVerification(prev => ({ ...prev, submitting: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit for verification');
        return;
      }

      // Update the registration number in profile
      const { error } = await supabase
        .from('profiles')
        .update({
          company_registration_number: registrationNumber.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error submitting for verification:', error);
        toast.error('Failed to submit for verification');
        return;
      }

      // Create admin alert for verification request
      await supabase.from('admin_alerts').insert({
        type: 'verification_request',
        title: 'Company Verification Request',
        message: `User ${user.email} submitted company "${companyName}" with NIB: ${registrationNumber} for verification`,
        priority: 'medium',
        action_required: true,
        metadata: {
          user_id: user.id,
          company_name: companyName,
          registration_number: registrationNumber,
        }
      });

      setVerification(prev => ({ ...prev, status: 'pending', submitting: false }));
      toast.success('Submitted for verification! Admin will review shortly.');
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('An error occurred');
      setVerification(prev => ({ ...prev, submitting: false }));
    }
  };

  // Refresh status
  const handleRefreshStatus = async () => {
    setVerification(prev => ({ ...prev, loading: true }));
    await fetchVerificationStatus();
    toast.success('Status refreshed');
  };

  // Build AHU lookup URL
  const getAHULookupUrl = () => {
    return 'https://ahu.go.id/pencarian/profil-pt';
  };

  const handleOpenAHU = () => {
    window.open(getAHULookupUrl(), '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = () => {
    if (verification.loading) {
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground gap-1">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          Checking...
        </Badge>
      );
    }

    switch (verification.status) {
      case 'verified':
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary gap-1">
            <CheckCircle className="h-2.5 w-2.5" />
            AHU Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-warning/30 text-warning-foreground gap-1">
            <Clock className="h-2.5 w-2.5" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-destructive/30 text-destructive gap-1">
            <AlertCircle className="h-2.5 w-2.5" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground gap-1">
            Not Verified
          </Badge>
        );
    }
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
          
          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={handleRefreshStatus}
                    disabled={verification.loading}
                  >
                    <RefreshCw className={cn("h-3 w-3", verification.loading && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Refresh status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Input
            id="company_registration"
            placeholder="e.g., AHU-0000000.AH.01.01.TAHUN 2024"
            value={registrationNumber}
            onChange={(e) => onRegistrationChange(e.target.value)}
            disabled={disabled || verification.status === 'verified'}
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

      {/* Dynamic Status Section */}
      {verification.status === 'unverified' && registrationNumber && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/30">
          <div className="flex items-center gap-2 text-xs text-warning-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Ready to submit for admin verification</span>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs"
            onClick={handleSubmitForVerification}
            disabled={verification.submitting}
          >
            {verification.submitting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit for Verification'
            )}
          </Button>
        </div>
      )}

      {verification.status === 'pending' && (
        <div className="flex items-center gap-2 text-xs text-warning-foreground p-2.5 rounded-lg bg-warning/10 border border-warning/30">
          <Clock className="h-3.5 w-3.5" />
          <span>Your NIB is pending verification by admin. This usually takes 1-2 business days.</span>
        </div>
      )}

      {verification.status === 'verified' && (
        <div className="flex items-center gap-2 text-xs text-primary p-2.5 rounded-lg bg-primary/10 border border-primary/30">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>
            Your company is verified on AHU
            {verification.verifiedAt && (
              <span className="text-muted-foreground ml-1">
                (since {new Date(verification.verifiedAt).toLocaleDateString()})
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default CompanyVerificationField;
