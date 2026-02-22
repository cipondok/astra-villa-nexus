import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileCheck, 
  FileX, 
  Image, 
  CreditCard, 
  Building, 
  FileText,
  Camera,
  Loader2,
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionDocument } from '@/hooks/useVideoVerification';
import { toast } from 'sonner';

interface DocumentUploadPanelProps {
  sessionId: string;
  uploadedDocs: SessionDocument[];
  onUpload: (file: File, type: SessionDocument['document_type']) => Promise<void>;
  onProceed: () => void;
  onBack: () => void;
}

interface DocumentType {
  id: SessionDocument['document_type'];
  label: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
  acceptedFormats: string[];
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'government_id',
    label: 'Government ID',
    description: 'Passport, National ID, or Driver\'s License',
    icon: CreditCard,
    required: true,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  {
    id: 'selfie',
    label: 'Live Selfie',
    description: 'Current photo holding your ID',
    icon: Camera,
    required: true,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    id: 'property_document',
    label: 'Property Document',
    description: 'Certificate of ownership or title deed',
    icon: Building,
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  {
    id: 'proof_of_ownership',
    label: 'Proof of Ownership',
    description: 'Tax receipts, utility bills, or legal documents',
    icon: FileText,
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  {
    id: 'agency_license',
    label: 'Agency License',
    description: 'Real estate license or agency registration',
    icon: FileCheck,
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
  },
];

const DocumentUploadPanel: React.FC<DocumentUploadPanelProps> = ({
  sessionId,
  uploadedDocs,
  onUpload,
  onProceed,
  onBack,
}) => {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<SessionDocument['document_type'] | null>(null);

  const getUploadedDoc = (type: SessionDocument['document_type']) => {
    return uploadedDocs.find(doc => doc.document_type === type);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedType) return;

    const docType = DOCUMENT_TYPES.find(d => d.id === selectedType);
    if (!docType) return;

    // Validate file type
    if (!docType.acceptedFormats.includes(file.type)) {
      toast.error(`Invalid file type. Accepted formats: ${docType.acceptedFormats.join(', ')}`);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingType(selectedType);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onUpload(file, selectedType);
      setUploadProgress(100);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      clearInterval(progressInterval);
      setUploadingType(null);
      setUploadProgress(0);
      setSelectedType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = (type: SessionDocument['document_type']) => {
    setSelectedType(type);
    fileInputRef.current?.click();
  };

  const requiredDocsUploaded = DOCUMENT_TYPES
    .filter(d => d.required)
    .every(d => getUploadedDoc(d.id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-chart-1"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><FileX className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'needs_review':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Needs Review</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileCheck className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold">Document Verification</h3>
        <p className="text-muted-foreground mt-2">
          Upload the required documents for identity verification.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
      />

      <div className="grid gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const uploadedDoc = getUploadedDoc(docType.id);
          const Icon = docType.icon;
          const isUploading = uploadingType === docType.id;

          return (
            <Card 
              key={docType.id}
              className={cn(
                "transition-colors",
                uploadedDoc && "border-chart-1/30 bg-chart-1/5"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center",
                    uploadedDoc ? "bg-chart-1/10" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6",
                      uploadedDoc ? "text-chart-1" : "text-muted-foreground"
                    )} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{docType.label}</h4>
                      {docType.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{docType.description}</p>
                    
                    {isUploading && (
                      <div className="mt-2">
                        <Progress value={uploadProgress} className="h-1" />
                      </div>
                    )}
                    
                    {uploadedDoc && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {uploadedDoc.document_name}
                        </span>
                        {getStatusBadge(uploadedDoc.verification_status)}
                      </div>
                    )}
                  </div>

                  <div>
                    {uploadedDoc ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUploadClick(docType.id)}
                        disabled={isUploading}
                      >
                        Replace
                      </Button>
                    ) : (
                      <Button
                        variant={docType.required ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUploadClick(docType.id)}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back to Video Call
        </Button>
        <Button 
          onClick={onProceed}
          disabled={!requiredDocsUploaded}
        >
          Proceed to Review
          {!requiredDocsUploaded && (
            <span className="ml-2 text-xs opacity-70">
              (Upload required docs)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadPanel;
