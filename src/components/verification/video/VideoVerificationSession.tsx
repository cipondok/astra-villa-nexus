import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useVideoVerification, VideoSession, SessionDocument } from '@/hooks/useVideoVerification';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Upload, 
  FileCheck, 
  Shield, 
  AlertTriangle,
  Camera,
  CheckCircle,
  Clock,
  Phone,
  PhoneOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DocumentUploadPanel from './DocumentUploadPanel';
import ConsentDialog from './ConsentDialog';
import { toast } from 'sonner';

interface VideoVerificationSessionProps {
  session: VideoSession;
  onComplete?: (session: VideoSession) => void;
  onCancel?: () => void;
}

type VerificationStep = 'consent' | 'setup' | 'connecting' | 'verification' | 'documents' | 'review' | 'complete';

const VERIFICATION_STEPS: { id: VerificationStep; label: string; icon: React.ElementType }[] = [
  { id: 'consent', label: 'Consent', icon: Shield },
  { id: 'setup', label: 'Camera Setup', icon: Camera },
  { id: 'connecting', label: 'Connecting', icon: Phone },
  { id: 'verification', label: 'Video Call', icon: Video },
  { id: 'documents', label: 'Documents', icon: FileCheck },
  { id: 'review', label: 'Review', icon: CheckCircle },
];

const VideoVerificationSession: React.FC<VideoVerificationSessionProps> = ({
  session,
  onComplete,
  onCancel,
}) => {
  const {
    webrtcState,
    localVideoRef,
    remoteVideoRef,
    startLocalStream,
    stopLocalStream,
    initializePeerConnection,
    closePeerConnection,
    startRecording,
    stopRecording,
    uploadSessionDocument,
    fetchSessionDocuments,
    updateSessionStatus,
    giveConsent,
    documents,
  } = useVideoVerification();

  const [currentStep, setCurrentStep] = useState<VerificationStep>('consent');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [consentGiven, setConsentGiven] = useState(session.consent_given);
  const [recordingConsent, setRecordingConsent] = useState(session.recording_consent);
  const [isRecording, setIsRecording] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(!session.consent_given);
  const [uploadedDocs, setUploadedDocs] = useState<SessionDocument[]>([]);

  useEffect(() => {
    fetchSessionDocuments(session.id).then(docs => {
      if (docs) setUploadedDocs(docs);
    });
  }, [session.id, fetchSessionDocuments]);

  const currentStepIndex = VERIFICATION_STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / VERIFICATION_STEPS.length) * 100;

  const handleConsentAccept = async () => {
    await giveConsent(session.id);
    setConsentGiven(true);
    setShowConsentDialog(false);
    setCurrentStep('setup');
  };

  const handleStartCamera = async () => {
    const stream = await startLocalStream();
    if (stream) {
      setCurrentStep('connecting');
    }
  };

  const handleConnect = async () => {
    await updateSessionStatus(session.id, 'in_progress');
    const pc = await initializePeerConnection(session.id);
    if (pc) {
      setCurrentStep('verification');
    }
  };

  const handleToggleVideo = useCallback(() => {
    if (webrtcState.localStream) {
      const videoTrack = webrtcState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [webrtcState.localStream]);

  const handleToggleAudio = useCallback(() => {
    if (webrtcState.localStream) {
      const audioTrack = webrtcState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [webrtcState.localStream]);

  const handleStartRecording = async () => {
    if (!recordingConsent) {
      toast.error('Recording consent required');
      return;
    }
    const success = await startRecording(session.id);
    if (success) setIsRecording(true);
  };

  const handleStopRecording = async () => {
    await stopRecording(session.id);
    setIsRecording(false);
  };

  const handleDocumentUpload = async (file: File, type: SessionDocument['document_type']) => {
    const doc = await uploadSessionDocument(session.id, file, type);
    if (doc) {
      setUploadedDocs(prev => [...prev, doc]);
    }
  };

  const handleProceedToDocuments = () => {
    setCurrentStep('documents');
  };

  const handleProceedToReview = () => {
    setCurrentStep('review');
  };

  const handleComplete = async () => {
    if (isRecording) {
      await handleStopRecording();
    }
    stopLocalStream();
    closePeerConnection();
    await updateSessionStatus(session.id, 'pending_review');
    setCurrentStep('complete');
    toast.success('Verification session completed! Awaiting admin review.');
    onComplete?.(session);
  };

  const handleCancel = async () => {
    if (isRecording) {
      await handleStopRecording();
    }
    stopLocalStream();
    closePeerConnection();
    await updateSessionStatus(session.id, 'cancelled');
    onCancel?.();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'consent':
        return (
          <div className="text-center space-y-6">
            <Shield className="h-16 w-16 mx-auto text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Verification Consent Required</h3>
              <p className="text-muted-foreground mt-2">
                Before we proceed, please review and accept our verification terms.
              </p>
            </div>
            <Button onClick={() => setShowConsentDialog(true)}>
              Review & Accept Terms
            </Button>
          </div>
        );

      case 'setup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold">Camera Setup</h3>
              <p className="text-muted-foreground mt-2">
                Enable your camera and microphone for the verification call.
              </p>
            </div>
            
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!webrtcState.localStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Camera preview will appear here</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={handleStartCamera}>
                <Video className="h-4 w-4 mr-2" />
                Enable Camera
              </Button>
            </div>
          </div>
        );

      case 'connecting':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute bottom-2 left-2" variant="secondary">You</Badge>
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
                  <p className="text-muted-foreground mt-2">Waiting for agent...</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleToggleVideo}
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleToggleAudio}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button onClick={handleConnect} disabled={webrtcState.isConnecting}>
                <Phone className="h-4 w-4 mr-2" />
                {webrtcState.isConnecting ? 'Connecting...' : 'Join Call'}
              </Button>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 aspect-video bg-muted rounded-lg overflow-hidden relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute bottom-2 left-2" variant="secondary">Agent</Badge>
                {isRecording && (
                  <Badge className="absolute top-2 right-2 bg-destructive animate-pulse">
                    Recording
                  </Badge>
                )}
              </div>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute bottom-2 left-2" variant="secondary">You</Badge>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleToggleVideo}
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleToggleAudio}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              {!isRecording && recordingConsent && (
                <Button variant="outline" onClick={handleStartRecording}>
                  Start Recording
                </Button>
              )}
              {isRecording && (
                <Button variant="destructive" onClick={handleStopRecording}>
                  Stop Recording
                </Button>
              )}
              
              <Button variant="destructive" size="icon" onClick={handleCancel}>
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 justify-center">
              <Checkbox
                id="recording-consent"
                checked={recordingConsent}
                onCheckedChange={(checked) => setRecordingConsent(!!checked)}
              />
              <label htmlFor="recording-consent" className="text-sm">
                I consent to this call being recorded for verification purposes
              </label>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleProceedToDocuments}>
                <FileCheck className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          </div>
        );

      case 'documents':
        return (
          <DocumentUploadPanel
            sessionId={session.id}
            uploadedDocs={uploadedDocs}
            onUpload={handleDocumentUpload}
            onProceed={handleProceedToReview}
            onBack={() => setCurrentStep('verification')}
          />
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-chart-1 mb-4" />
              <h3 className="text-xl font-semibold">Review & Submit</h3>
              <p className="text-muted-foreground mt-2">
                Please review your uploaded documents before submitting.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Documents ({uploadedDocs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uploadedDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-chart-1" />
                        <span className="text-sm">{doc.document_name || doc.document_type}</span>
                      </div>
                      <Badge variant="outline">{doc.verification_status}</Badge>
                    </div>
                  ))}
                  {uploadedDocs.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No documents uploaded</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('documents')}>
                Back to Documents
              </Button>
              <Button onClick={handleComplete}>
                Submit for Review
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="h-20 w-20 mx-auto text-chart-1" />
            <div>
              <h3 className="text-2xl font-semibold">Verification Submitted!</h3>
              <p className="text-muted-foreground mt-2">
                Your Level 4 verification is now pending admin review. 
                You'll be notified once the review is complete.
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Estimated Review Time: 24-48 hours
            </Badge>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Verification Progress</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between">
          {VERIFICATION_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div 
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-1",
                  isCompleted && "text-primary",
                  isCurrent && "text-primary font-medium",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary",
                  !isCompleted && !isCurrent && "border-muted"
                )}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-xs hidden md:block">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Consent Dialog */}
      <ConsentDialog
        open={showConsentDialog}
        onAccept={handleConsentAccept}
        onDecline={() => {
          setShowConsentDialog(false);
          onCancel?.();
        }}
      />
    </div>
  );
};

export default VideoVerificationSession;
