import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  FileCheck, 
  AlertTriangle, 
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Flag,
  Crown,
  Gem,
  Star,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAdminVideoVerification, AdminVideoSession, FraudLog } from '@/hooks/useAdminVideoVerification';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VideoReviewPanelProps {
  session: AdminVideoSession;
  onClose: () => void;
}

const FRAUD_TYPES = [
  { id: 'face_mismatch', label: 'Face Mismatch', severity: 'high' as const },
  { id: 'document_tampering', label: 'Document Tampering', severity: 'critical' as const },
  { id: 'liveness_failure', label: 'Liveness Check Failed', severity: 'high' as const },
  { id: 'suspicious_behavior', label: 'Suspicious Behavior', severity: 'medium' as const },
  { id: 'duplicate_document', label: 'Duplicate Document', severity: 'high' as const },
  { id: 'blacklisted_user', label: 'Blacklisted User', severity: 'critical' as const },
];

const BADGE_TIERS = [
  { id: 'platinum', label: 'Platinum', icon: Crown, score: 85 },
  { id: 'gold', label: 'Gold', icon: Star, score: 75 },
  { id: 'silver', label: 'Silver', icon: Shield, score: 60 },
];

const VideoReviewPanel: React.FC<VideoReviewPanelProps> = ({
  session,
  onClose,
}) => {
  const { user } = useAuth();
  const {
    fetchSessionDocuments,
    fetchFraudLogs,
    submitReview,
    verifyDocument,
    addFraudFlag,
    isSubmittingReview,
  } = useAdminVideoVerification();

  const [documents, setDocuments] = useState<any[]>([]);
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Review form state
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'needs_more_info' | 'escalated'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [identityScore, setIdentityScore] = useState(80);
  const [documentScore, setDocumentScore] = useState(80);
  const [livenessScore, setLivenessScore] = useState(80);
  const [selectedBadgeTier, setSelectedBadgeTier] = useState<string>('platinum');
  const [fraudDetected, setFraudDetected] = useState(false);
  const [selectedFraudTypes, setSelectedFraudTypes] = useState<string[]>([]);

  useEffect(() => {
    loadSessionData();
  }, [session.id]);

  const loadSessionData = async () => {
    try {
      const [docs, logs] = await Promise.all([
        fetchSessionDocuments(session.id),
        fetchFraudLogs(session.id),
      ]);
      setDocuments(docs || []);
      setFraudLogs(logs || []);
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  };

  const overallConfidence = Math.round((identityScore + documentScore + livenessScore) / 3);
  const trustScore = decision === 'approved' 
    ? BADGE_TIERS.find(t => t.id === selectedBadgeTier)?.score || 85
    : 0;

  const handleSubmitReview = () => {
    if (!user) return;

    submitReview({
      session_id: session.id,
      reviewer_id: user.id,
      decision,
      trust_score_awarded: trustScore,
      badge_tier_awarded: decision === 'approved' ? selectedBadgeTier : null,
      fraud_detected: fraudDetected,
      fraud_indicators: selectedFraudTypes,
      review_notes: reviewNotes,
      identity_match_score: identityScore,
      document_authenticity_score: documentScore,
      liveness_score: livenessScore,
      overall_confidence: overallConfidence,
    });
  };

  const handleAddFraudFlag = (type: string) => {
    const fraudType = FRAUD_TYPES.find(f => f.id === type);
    if (!fraudType) return;

    addFraudFlag({
      sessionId: session.id,
      detectionType: type,
      severity: fraudType.severity,
    });

    setSelectedFraudTypes(prev => [...prev, type]);
    setFraudDetected(true);
  };

  const handleVerifyDocument = (docId: string, status: 'verified' | 'rejected') => {
    verifyDocument({ documentId: docId, status });
  };

  return (
    <Card className="h-[680px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {session.user?.full_name || 'Unknown User'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
        <p className="text-sm text-muted-foreground">{session.user?.email}</p>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="recording">Recording</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="p-4 space-y-4">
            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Scheduled</Label>
                <p className="font-medium">
                  {format(new Date(session.scheduled_at), 'PPpp')}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <p className="font-medium">
                  {session.started_at && session.ended_at 
                    ? `${Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)} minutes`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Consent Given</Label>
                <p className="font-medium flex items-center gap-1">
                  {session.consent_given ? (
                    <><CheckCircle className="h-4 w-4 text-green-500" /> Yes</>
                  ) : (
                    <><XCircle className="h-4 w-4 text-red-500" /> No</>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Recording</Label>
                <p className="font-medium flex items-center gap-1">
                  {session.recording_consent ? (
                    <><CheckCircle className="h-4 w-4 text-green-500" /> Consented</>
                  ) : (
                    <><XCircle className="h-4 w-4 text-muted-foreground" /> Declined</>
                  )}
                </p>
              </div>
            </div>

            <Separator />

            {/* Fraud Flags */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Fraud Alerts</Label>
              {fraudLogs.length > 0 ? (
                <div className="space-y-2">
                  {fraudLogs.map((log) => (
                    <div 
                      key={log.id}
                      className={cn(
                        "p-3 rounded-lg flex items-center justify-between",
                        log.severity === 'critical' && "bg-red-100 border border-red-200",
                        log.severity === 'high' && "bg-orange-100 border border-orange-200",
                        log.severity === 'medium' && "bg-yellow-100 border border-yellow-200",
                        log.severity === 'low' && "bg-blue-100 border border-blue-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={cn(
                          "h-4 w-4",
                          log.severity === 'critical' && "text-red-600",
                          log.severity === 'high' && "text-orange-600",
                          log.severity === 'medium' && "text-yellow-600"
                        )} />
                        <span className="font-medium">
                          {FRAUD_TYPES.find(f => f.id === log.detection_type)?.label || log.detection_type}
                        </span>
                      </div>
                      <Badge variant={log.resolved ? 'outline' : 'destructive'}>
                        {log.resolved ? 'Resolved' : log.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  No fraud flags detected
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Add Fraud Flag</Label>
              <div className="flex flex-wrap gap-2">
                {FRAUD_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFraudFlag(type.id)}
                    disabled={selectedFraudTypes.includes(type.id)}
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="p-4 space-y-4">
            {documents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No documents uploaded
              </p>
            ) : (
              documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-xs text-muted-foreground">{doc.document_name}</p>
                        </div>
                      </div>
                      <Badge variant={
                        doc.verification_status === 'verified' ? 'default' :
                        doc.verification_status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {doc.verification_status}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.document_url, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleVerifyDocument(doc.id, 'verified')}
                        disabled={doc.verification_status === 'verified'}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleVerifyDocument(doc.id, 'rejected')}
                        disabled={doc.verification_status === 'rejected'}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="recording" className="p-4">
            {session.recording_url ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    src={session.recording_url} 
                    controls 
                    className="w-full h-full"
                  />
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Recording
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recording available</p>
                {!session.recording_consent && (
                  <p className="text-xs mt-2">User declined recording consent</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="review" className="p-4 space-y-6">
            {/* Scoring */}
            <div className="space-y-4">
              <Label>Verification Scores</Label>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Identity Match</span>
                    <span className="font-medium">{identityScore}%</span>
                  </div>
                  <Slider
                    value={[identityScore]}
                    onValueChange={([v]) => setIdentityScore(v)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Document Authenticity</span>
                    <span className="font-medium">{documentScore}%</span>
                  </div>
                  <Slider
                    value={[documentScore]}
                    onValueChange={([v]) => setDocumentScore(v)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Liveness Check</span>
                    <span className="font-medium">{livenessScore}%</span>
                  </div>
                  <Slider
                    value={[livenessScore]}
                    onValueChange={([v]) => setLivenessScore(v)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-medium">Overall Confidence</span>
                  <Badge variant={overallConfidence >= 70 ? 'default' : 'destructive'} className="text-lg px-3">
                    {overallConfidence}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Decision */}
            <div className="space-y-2">
              <Label>Decision</Label>
              <Select value={decision} onValueChange={(v: any) => setDecision(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Approve
                    </span>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <span className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Reject
                    </span>
                  </SelectItem>
                  <SelectItem value="needs_more_info">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Needs More Info
                    </span>
                  </SelectItem>
                  <SelectItem value="escalated">
                    <span className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-orange-500" />
                      Escalate
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Badge Tier (only for approval) */}
            {decision === 'approved' && (
              <div className="space-y-2">
                <Label>Award Badge Tier</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BADGE_TIERS.map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <Button
                        key={tier.id}
                        variant={selectedBadgeTier === tier.id ? 'default' : 'outline'}
                        className="flex-col h-auto py-3"
                        onClick={() => setSelectedBadgeTier(tier.id)}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span>{tier.label}</span>
                        <span className="text-xs opacity-70">{tier.score} pts</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fraud Detection */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="fraud-detected"
                checked={fraudDetected}
                onCheckedChange={(c) => setFraudDetected(!!c)}
              />
              <Label htmlFor="fraud-detected" className="cursor-pointer">
                Fraud detected during verification
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Review Notes</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any observations or notes about this verification..."
                rows={4}
              />
            </div>

            {/* Submit */}
            <Button 
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
              className="w-full"
              variant={decision === 'approved' ? 'default' : decision === 'rejected' ? 'destructive' : 'secondary'}
            >
              {isSubmittingReview ? 'Submitting...' : `Submit ${decision.replace('_', ' ').toUpperCase()}`}
            </Button>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};

export default VideoReviewPanel;
