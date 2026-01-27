import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Camera,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Loader2,
  User,
  Scan,
  ChevronRight,
  Info
} from 'lucide-react';
import { useEnhancedKYC, VerificationType, DocumentType } from '@/hooks/useEnhancedKYC';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface KYCVerificationFlowProps {
  onComplete?: (success: boolean, level: VerificationType) => void;
  className?: string;
}

type Step = 'select_level' | 'upload_document' | 'selfie' | 'processing' | 'result';

export function KYCVerificationFlow({ onComplete, className }: KYCVerificationFlowProps) {
  const { isLoading, submitKYC, getKYCLevelLabel, getKYCLevelColor } = useEnhancedKYC();
  
  const [step, setStep] = useState<Step>('select_level');
  const [verificationType, setVerificationType] = useState<VerificationType>('standard');
  const [documentType, setDocumentType] = useState<DocumentType>('ktp');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const documentInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'document' | 'selfie'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'document') {
        setDocumentImage(base64);
      } else {
        setSelfieImage(base64);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async () => {
    setStep('processing');
    setProcessingProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    const submissionResult = await submitKYC({
      verificationType,
      documentType,
      documentImageBase64: documentImage || undefined,
      selfieImageBase64: selfieImage || undefined,
    });

    clearInterval(progressInterval);
    setProcessingProgress(100);

    setTimeout(() => {
      setResult(submissionResult);
      setStep('result');
      onComplete?.(submissionResult.success && submissionResult.status === 'verified', verificationType);
    }, 500);
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select_level':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Select Verification Level</Label>
              <RadioGroup
                value={verificationType}
                onValueChange={(v) => setVerificationType(v as VerificationType)}
                className="space-y-3"
              >
                <label className={cn(
                  "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                  verificationType === 'basic' && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="basic" id="basic" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Basic</span>
                      <Badge variant="outline" className="text-xs">Document Only</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload ID document for verification. Quick and simple.
                    </p>
                  </div>
                </label>

                <label className={cn(
                  "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                  verificationType === 'standard' && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="standard" id="standard" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Standard</span>
                      <Badge className="text-xs bg-green-100 text-green-700">Recommended</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID document + live selfie for liveness detection.
                    </p>
                  </div>
                </label>

                <label className={cn(
                  "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                  verificationType === 'enhanced' && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="enhanced" id="enhanced" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Enhanced</span>
                      <Badge className="text-xs bg-purple-100 text-purple-700">Full KYC</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete verification with document, liveness, and face matching.
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Document Type</Label>
              <RadioGroup
                value={documentType}
                onValueChange={(v) => setDocumentType(v as DocumentType)}
                className="grid grid-cols-2 gap-2"
              >
                {[
                  { value: 'ktp', label: 'KTP', desc: 'Indonesian ID' },
                  { value: 'passport', label: 'Passport', desc: 'International' },
                  { value: 'sim', label: 'SIM', desc: 'Driving License' },
                  { value: 'kitas', label: 'KITAS', desc: 'Stay Permit' },
                ].map((doc) => (
                  <label
                    key={doc.value}
                    className={cn(
                      "flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors text-center",
                      documentType === doc.value && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem value={doc.value} id={doc.value} className="sr-only" />
                    <span className="font-medium text-sm">{doc.label}</span>
                    <span className="text-xs text-muted-foreground">{doc.desc}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <Button className="w-full" onClick={() => setStep('upload_document')}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        );

      case 'upload_document':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload {documentType.toUpperCase()}
              </Label>
              
              <input
                ref={documentInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileUpload(e, 'document')}
                className="hidden"
              />

              {documentImage ? (
                <div className="relative">
                  <img
                    src={documentImage}
                    alt="Document"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2"
                    onClick={() => documentInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Retake
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => documentInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or take photo</p>
                  <p className="text-xs text-muted-foreground mt-1">Supported: JPG, PNG</p>
                </div>
              )}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Make sure your document is clearly visible, not blurry, and all text is readable.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('select_level')}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!documentImage}
                onClick={() => {
                  if (verificationType === 'basic') {
                    handleSubmit();
                  } else {
                    setStep('selfie');
                  }
                }}
              >
                {verificationType === 'basic' ? 'Submit' : 'Continue'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 'selfie':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Take a Selfie
              </Label>
              
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => handleFileUpload(e, 'selfie')}
                className="hidden"
              />

              {selfieImage ? (
                <div className="relative">
                  <img
                    src={selfieImage}
                    alt="Selfie"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2"
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Retake
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => selfieInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Take a selfie</p>
                  <p className="text-xs text-muted-foreground mt-1">Look directly at the camera</p>
                </div>
              )}
            </div>

            <Alert>
              <Scan className="h-4 w-4" />
              <AlertDescription className="text-xs">
                For liveness detection: ensure good lighting, look directly at the camera, and keep a neutral expression.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('upload_document')}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selfieImage}
                onClick={handleSubmit}
              >
                Submit Verification
                <Shield className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 'processing':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 py-8 text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <h3 className="font-medium">Verifying Your Identity</h3>
              <p className="text-sm text-muted-foreground">
                This may take a moment...
              </p>
            </div>
            <Progress value={processingProgress} className="h-2" />
            <div className="text-xs text-muted-foreground space-y-1">
              {processingProgress < 30 && <p>Analyzing document...</p>}
              {processingProgress >= 30 && processingProgress < 60 && <p>Checking liveness...</p>}
              {processingProgress >= 60 && processingProgress < 90 && <p>Matching faces...</p>}
              {processingProgress >= 90 && <p>Finalizing verification...</p>}
            </div>
          </motion.div>
        );

      case 'result':
        const isVerified = result?.status === 'verified';
        const isReview = result?.status === 'manual_review';
        
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 py-4 text-center"
          >
            {isVerified ? (
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            ) : isReview ? (
              <AlertCircle className="h-16 w-16 mx-auto text-yellow-500" />
            ) : (
              <XCircle className="h-16 w-16 mx-auto text-red-500" />
            )}
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isVerified ? 'Verification Successful!' : 
                 isReview ? 'Under Review' : 
                 'Verification Failed'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isVerified ? `You are now ${getKYCLevelLabel(verificationType)}` :
                 isReview ? 'Your documents are being manually reviewed' :
                 result?.rejection_reason || 'Please try again'}
              </p>
            </div>

            {isVerified && (
              <Badge className={cn("text-sm py-1 px-3", getKYCLevelColor(verificationType))}>
                <Shield className="h-4 w-4 mr-1" />
                {getKYCLevelLabel(verificationType)}
              </Badge>
            )}

            {result?.details && (
              <div className="text-left space-y-2 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium">Verification Details</h4>
                {result.details.extraction && (
                  <div className="flex justify-between text-xs">
                    <span>Document Analysis</span>
                    <span>{result.details.extraction.confidence}% confidence</span>
                  </div>
                )}
                {result.details.liveness && (
                  <div className="flex justify-between text-xs">
                    <span>Liveness Check</span>
                    <span className={result.details.liveness.passed ? 'text-green-600' : 'text-red-600'}>
                      {result.details.liveness.passed ? 'Passed' : 'Failed'} ({result.details.liveness.score}%)
                    </span>
                  </div>
                )}
                {result.details.face_match && (
                  <div className="flex justify-between text-xs">
                    <span>Face Match</span>
                    <span className={result.details.face_match.passed ? 'text-green-600' : 'text-red-600'}>
                      {result.details.face_match.passed ? 'Passed' : 'Failed'} ({result.details.face_match.score}%)
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => {
                setStep('select_level');
                setDocumentImage(null);
                setSelfieImage(null);
                setResult(null);
              }}
            >
              {isVerified ? 'Done' : 'Try Again'}
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Identity Verification</CardTitle>
        </div>
        <CardDescription>
          Verify your identity to unlock full platform features
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
