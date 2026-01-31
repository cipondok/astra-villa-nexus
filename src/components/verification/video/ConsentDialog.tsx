import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Lock, Eye, FileText, Video } from 'lucide-react';

interface ConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentDialog: React.FC<ConsentDialogProps> = ({
  open,
  onAccept,
  onDecline,
}) => {
  const [agreements, setAgreements] = useState({
    identityVerification: false,
    documentSharing: false,
    videoRecording: false,
    dataProcessing: false,
    termsAccepted: false,
  });

  const allAgreed = Object.values(agreements).every(Boolean);

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Video Verification Consent
          </DialogTitle>
          <DialogDescription>
            Please review and accept the following terms before proceeding with Level 4 verification.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Identity Verification */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="identity-verification"
                  checked={agreements.identityVerification}
                  onCheckedChange={() => handleAgreementChange('identityVerification')}
                />
                <div className="space-y-1">
                  <label 
                    htmlFor="identity-verification" 
                    className="font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    Identity Verification
                  </label>
                  <p className="text-sm text-muted-foreground">
                    I consent to having my identity verified through a live video call with a verification agent. 
                    I understand that I may be asked to show my face clearly and perform liveness checks.
                  </p>
                </div>
              </div>
            </div>

            {/* Document Sharing */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="document-sharing"
                  checked={agreements.documentSharing}
                  onCheckedChange={() => handleAgreementChange('documentSharing')}
                />
                <div className="space-y-1">
                  <label 
                    htmlFor="document-sharing" 
                    className="font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    Document Sharing
                  </label>
                  <p className="text-sm text-muted-foreground">
                    I consent to sharing copies of my identification documents (government ID, property documents, 
                    proof of ownership/agency license) for verification purposes. I confirm that all documents 
                    I provide are genuine and belong to me.
                  </p>
                </div>
              </div>
            </div>

            {/* Video Recording */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="video-recording"
                  checked={agreements.videoRecording}
                  onCheckedChange={() => handleAgreementChange('videoRecording')}
                />
                <div className="space-y-1">
                  <label 
                    htmlFor="video-recording" 
                    className="font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="h-4 w-4" />
                    Video Recording (Optional)
                  </label>
                  <p className="text-sm text-muted-foreground">
                    I understand that the verification call may be recorded for quality assurance and 
                    fraud prevention purposes. I will be notified before recording begins and can 
                    choose to decline recording while still completing verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Processing */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="data-processing"
                  checked={agreements.dataProcessing}
                  onCheckedChange={() => handleAgreementChange('dataProcessing')}
                />
                <div className="space-y-1">
                  <label 
                    htmlFor="data-processing" 
                    className="font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="h-4 w-4" />
                    Data Processing & Storage
                  </label>
                  <p className="text-sm text-muted-foreground">
                    I consent to the collection, processing, and secure storage of my personal data 
                    and verification materials. I understand that:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Data is encrypted at rest and in transit</li>
                    <li>Access is restricted to authorized verification personnel</li>
                    <li>Data is retained for compliance purposes (minimum 5 years)</li>
                    <li>I can request data deletion subject to legal requirements</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Terms Acceptance */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms-accepted"
                  checked={agreements.termsAccepted}
                  onCheckedChange={() => handleAgreementChange('termsAccepted')}
                />
                <div className="space-y-1">
                  <label 
                    htmlFor="terms-accepted" 
                    className="font-medium cursor-pointer"
                  >
                    Accept Terms & Conditions
                  </label>
                  <p className="text-sm text-muted-foreground">
                    I have read and understood all the above terms. I confirm that I am the person 
                    being verified and that all information I provide is true and accurate. I understand 
                    that providing false information may result in permanent account suspension and 
                    potential legal action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDecline}>
            Cancel
          </Button>
          <Button onClick={onAccept} disabled={!allAgreed}>
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentDialog;
