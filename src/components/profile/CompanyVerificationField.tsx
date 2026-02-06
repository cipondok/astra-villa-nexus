import React, { useEffect, useState } from 'react';
import { ExternalLink, Building2, CheckCircle, AlertCircle, HelpCircle, Clock, Loader2, RefreshCw, Search, XCircle, X, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  const [ahuPopupOpen, setAhuPopupOpen] = useState(false);
  const [ahuLoading, setAhuLoading] = useState(true);
  const [foundInAhu, setFoundInAhu] = useState(false);

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

  // Submit for verification after user confirms they found company in AHU
  const handleSubmitVerification = async (userConfirmedInAhu: boolean) => {
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
        title: userConfirmedInAhu 
          ? 'Company Verification - User Confirmed in AHU' 
          : 'Company Verification Request',
        message: userConfirmedInAhu
          ? `User ${user.email} confirmed finding "${companyName}" in AHU database. Please verify and approve.`
          : `User ${user.email} submitted company "${companyName}" for verification.`,
        priority: userConfirmedInAhu ? 'high' : 'medium',
        action_required: true,
        reference_type: 'company_verification',
        reference_id: user.id,
        metadata: {
          user_id: user.id,
          company_name: companyName,
          registration_number: registrationNumber || 'Not provided',
          user_confirmed_in_ahu: userConfirmedInAhu,
          ahu_search_url: 'https://ahu.go.id/pencarian/profil-pt',
        }
      });

      setVerification(prev => ({ 
        ...prev, 
        status: 'pending', 
        submitting: false,
        message: userConfirmedInAhu 
          ? 'Your company was confirmed in AHU. Admin will verify shortly.'
          : 'Submitted for verification. Admin will check AHU database.'
      }));
      
      setAhuPopupOpen(false);
      setFoundInAhu(false);
      
      toast.success(userConfirmedInAhu 
        ? 'Verification submitted! Your confirmation speeds up the process.'
        : 'Submitted for verification!'
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

  const handleOpenAHUPopup = () => {
    setAhuLoading(true);
    setFoundInAhu(false);
    setAhuPopupOpen(true);
  };

  const handleOpenAHUNewTab = () => {
    window.open('https://ahu.go.id/pencarian/profil-pt', '_blank', 'noopener,noreferrer');
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
              variant="outline"
              size="sm"
              onClick={handleOpenAHUPopup}
              className="h-9 gap-1.5 shrink-0"
              disabled={verification.status === 'verified'}
            >
              <Search className="h-3.5 w-3.5" />
              Check AHU
            </Button>
          </div>
        </div>

        {/* Quick Verify Button */}
        {verification.status === 'unverified' && companyName.trim() && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleOpenAHUPopup}
              disabled={verification.submitting}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Verify "{companyName}" on AHU
            </Button>
          </div>
        )}

        {/* Info Banner */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0 text-xs text-muted-foreground">
            <p>
              Search for your PT name on{' '}
              <button
                type="button"
                onClick={handleOpenAHUPopup}
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                AHU Indonesia
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
              {' '}and confirm when found. Admin will then verify and approve your company.
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
      </div>

      {/* AHU Popup Modal */}
      <Dialog open={ahuPopupOpen} onOpenChange={setAhuPopupOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 gap-0 bg-background border border-border shadow-2xl flex flex-col">
          <DialogHeader className="p-3 border-b border-border flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <DialogTitle className="text-sm font-medium">
                AHU Indonesia - Search Your Company
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleOpenAHUNewTab}
              >
                <ExternalLink className="h-3 w-3" />
                New Tab
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setAhuPopupOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {/* Instructions */}
          <div className="px-3 py-2 bg-muted/50 border-b border-border text-xs text-muted-foreground shrink-0">
            <p>
              <strong>Instructions:</strong> Search for "<span className="text-foreground font-medium">{companyName || 'your company name'}</span>" 
              in the AHU search form below. If you find your company, click "I Found My Company" to submit for verification.
            </p>
          </div>
          
          <div className="flex-1 relative bg-white min-h-0">
            {ahuLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading AHU website...</p>
                </div>
              </div>
            )}
            <iframe
              src="https://ahu.go.id/pencarian/profil-pt"
              className="w-full h-full border-0"
              title="AHU Indonesia Company Search"
              onLoad={() => setAhuLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
          
          <DialogFooter className="p-3 border-t border-border bg-muted/30 flex-row justify-between items-center shrink-0">
            <p className="text-[10px] text-muted-foreground">
              Search results from ahu.go.id
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => handleSubmitVerification(false)}
                disabled={verification.submitting || !companyName.trim()}
              >
                <XCircle className="h-3.5 w-3.5" />
                Not Found - Request Review
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleSubmitVerification(true)}
                disabled={verification.submitting || !companyName.trim()}
              >
                {verification.submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ThumbsUp className="h-3.5 w-3.5" />
                )}
                I Found My Company
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyVerificationField;
