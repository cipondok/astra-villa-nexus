import React, { useEffect, useState } from 'react';
import { ExternalLink, Building2, CheckCircle, AlertCircle, HelpCircle, Clock, Loader2, RefreshCw, Search, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
  message: string | null;
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
    message: null,
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [ahuWindowOpened, setAhuWindowOpened] = useState(false);

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

      let status: VerificationStatus = 'unverified';
      
      if (data?.company_verified === true) {
        status = 'verified';
      } else if (data?.company_registration_number && data?.company_registration_number.trim() !== '') {
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

  useEffect(() => {
    if (isVerified) {
      setVerification(prev => ({ ...prev, status: 'verified' }));
    }
  }, [isVerified]);

  // Open AHU in popup window and show confirmation dialog
  const handleOpenAHU = () => {
    if (!companyName.trim()) {
      toast.error('Please enter your company name first');
      return;
    }
    
    // Calculate popup window dimensions and position (centered)
    const width = 900;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Open AHU in popup window (not a full new tab)
    const popup = window.open(
      'https://ahu.go.id/pencarian/profil-pt',
      'AHU_Search',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
    );
    
    if (popup) {
      popup.focus();
      setAhuWindowOpened(true);
      
      // Show confirmation dialog after a short delay
      setTimeout(() => {
        setConfirmDialogOpen(true);
      }, 1000);
    } else {
      toast.error('Popup was blocked. Please allow popups for this site.');
    }
  };

  // Submit for verification
  const handleSubmitVerification = async (userFoundCompany: boolean) => {
    if (!companyName.trim()) {
      toast.error('Please enter your company name first');
      return;
    }

    setVerification(prev => ({ ...prev, submitting: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit for verification');
        setVerification(prev => ({ ...prev, submitting: false }));
        return;
      }

      // Update registration number if provided
      if (registrationNumber.trim()) {
        await supabase
          .from('profiles')
          .update({
            company_registration_number: registrationNumber.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }

      // Create admin alert with AHU verification link
      await supabase.from('admin_alerts').insert({
        type: 'verification_request',
        title: userFoundCompany 
          ? '✅ Company Verification - User Found in AHU' 
          : 'Company Verification Request',
        message: userFoundCompany
          ? `User ${user.email} confirmed finding "${companyName}" in AHU database. Please verify and approve.`
          : `User ${user.email} could not find "${companyName}" in AHU. Please investigate.`,
        priority: userFoundCompany ? 'high' : 'medium',
        action_required: true,
        reference_type: 'company_verification',
        reference_id: user.id,
        metadata: {
          user_id: user.id,
          company_name: companyName,
          registration_number: registrationNumber || 'Not provided',
          user_found_in_ahu: userFoundCompany,
          ahu_search_url: 'https://ahu.go.id/pencarian/profil-pt',
        }
      });

      setVerification(prev => ({ 
        ...prev, 
        status: 'pending', 
        submitting: false,
        message: userFoundCompany 
          ? 'Company confirmed! Admin will verify shortly.'
          : 'Request submitted. Admin will investigate.'
      }));
      
      setConfirmDialogOpen(false);
      setAhuWindowOpened(false);
      
      toast.success(userFoundCompany 
        ? 'Verification submitted! Admin will approve shortly.'
        : 'Request submitted for admin review.'
      );
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('An error occurred');
      setVerification(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleRefreshStatus = async () => {
    setVerification(prev => ({ ...prev, loading: true }));
    await fetchVerificationStatus();
    toast.success('Status refreshed');
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
    <>
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
              variant="default"
              size="sm"
              onClick={handleOpenAHU}
              className="h-9 gap-1.5 shrink-0"
              disabled={verification.status === 'verified'}
            >
              <Search className="h-3.5 w-3.5" />
              Check AHU
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0 text-xs text-muted-foreground">
            <p>
              Click <strong>Check AHU</strong> to open the official AHU website in a new tab. 
              Search for your PT name there, then confirm if you found it.
            </p>
          </div>
        </div>

        {/* Status Sections */}
        {verification.status === 'pending' && (
          <div className="flex items-center gap-2 text-xs text-warning-foreground p-2.5 rounded-lg bg-warning/10 border border-warning/30">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {verification.message || 'Your company is pending verification. Usually takes 1-2 business days.'}
            </span>
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

        {/* Show confirmation prompt if AHU was opened */}
        {ahuWindowOpened && !confirmDialogOpen && verification.status === 'unverified' && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/30">
            <span className="text-xs text-primary">
              Did you find your company on AHU?
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setConfirmDialogOpen(true)}
              >
                Confirm Result
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              AHU Verification Result
            </DialogTitle>
            <DialogDescription className="text-sm">
              Did you find <strong className="text-foreground">"{companyName}"</strong> on the AHU website?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Search for your company name at{' '}
              <a 
                href="https://ahu.go.id/pencarian/profil-pt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                ahu.go.id/pencarian/profil-pt
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>
          
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => handleSubmitVerification(false)}
              disabled={verification.submitting}
            >
              <ThumbsDown className="h-4 w-4" />
              Not Found
            </Button>
            <Button
              type="button"
              variant="default"
              className="flex-1 gap-1.5"
              onClick={() => handleSubmitVerification(true)}
              disabled={verification.submitting}
            >
              {verification.submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4" />
              )}
              Yes, I Found It!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyVerificationField;
