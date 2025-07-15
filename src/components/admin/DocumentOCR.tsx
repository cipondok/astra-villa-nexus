import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Eye, CheckCircle, AlertTriangle, X, Scan } from 'lucide-react';
import Tesseract from 'tesseract.js';

interface OCRResult {
  confidence: number;
  text: string;
  extractedData: {
    name?: string;
    idNumber?: string;
    dateOfBirth?: string;
    address?: string;
    documentType?: string;
  };
}

interface DocumentOCRProps {
  onDataExtracted?: (data: OCRResult) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
}

export const DocumentOCR: React.FC<DocumentOCRProps> = ({
  onDataExtracted,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [ocrResult, setOcrResult] = React.useState<OCRResult | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Indonesian document patterns for data extraction
  const patterns = {
    name: [
      /(?:nama|name)[:\s]*([a-zA-Z\s]+)/i,
      /^([A-Z\s]{2,50})$/m,
    ],
    idNumber: [
      /(?:nik|no\.?\s*(?:ktp|identitas))[:\s]*(\d{16})/i,
      /\b(\d{16})\b/,
    ],
    dateOfBirth: [
      /(?:tgl\.?\s*lahir|lahir|born)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
    ],
    address: [
      /(?:alamat|address)[:\s]*([^\n\r]+)/i,
    ],
    documentType: [
      /kartu\s*tanda\s*penduduk/i,
      /sim/i,
      /paspor/i,
      /npwp/i,
    ],
  };

  const extractDataFromText = (text: string): OCRResult['extractedData'] => {
    const extracted: OCRResult['extractedData'] = {};
    
    // Extract name
    for (const pattern of patterns.name) {
      const match = text.match(pattern);
      if (match) {
        extracted.name = match[1]?.trim();
        break;
      }
    }

    // Extract ID number
    for (const pattern of patterns.idNumber) {
      const match = text.match(pattern);
      if (match) {
        extracted.idNumber = match[1]?.trim();
        break;
      }
    }

    // Extract date of birth
    for (const pattern of patterns.dateOfBirth) {
      const match = text.match(pattern);
      if (match) {
        extracted.dateOfBirth = match[1]?.trim();
        break;
      }
    }

    // Extract address
    for (const pattern of patterns.address) {
      const match = text.match(pattern);
      if (match) {
        extracted.address = match[1]?.trim();
        break;
      }
    }

    // Detect document type
    for (const pattern of patterns.documentType) {
      if (pattern.test(text)) {
        extracted.documentType = pattern.source.replace(/[\\\/\(\)\[\]\{\}\|\*\+\?\.\^]/g, '');
        break;
      }
    }

    return extracted;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`File type ${file.type} not supported. Please use JPG, PNG, or WebP.`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit.`);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setOcrResult(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const processDocument = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await Tesseract.recognize(selectedFile, 'ind+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const extractedData = extractDataFromText(result.data.text);
      
      const ocrResult: OCRResult = {
        confidence: result.data.confidence,
        text: result.data.text,
        extractedData,
      };

      setOcrResult(ocrResult);
      onDataExtracted?.(ocrResult);

      toast({
        title: 'OCR Processing Complete',
        description: `Document processed with ${Math.round(ocrResult.confidence)}% confidence`,
      });

    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to process document. Please try again.');
      toast({
        title: 'OCR Failed',
        description: 'An error occurred while processing the document.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setOcrResult(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="w-5 h-5" />
          Document OCR Scanner
        </CardTitle>
        <CardDescription>
          Upload KYC documents to automatically extract text and data using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div>
          <Label htmlFor="document-upload">Upload Document</Label>
          <div className="mt-2">
            <Input
              ref={fileInputRef}
              id="document-upload"
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="cursor-pointer"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {/* Preview and Actions */}
        {selectedFile && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Image Preview */}
              {previewUrl && (
                <div className="flex-1">
                  <Label>Document Preview</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      className="w-full h-48 sm:h-64 object-contain bg-muted"
                    />
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <Label>File Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4" />
                      <span>{selectedFile.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Size: {Math.round(selectedFile.size / 1024)} KB
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Type: {selectedFile.type}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={processDocument}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Extract Text & Data
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={clearSelection}
                    variant="outline"
                    disabled={isProcessing}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing document...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {ocrResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Extraction Results</h3>
              <Badge variant="secondary">
                {Math.round(ocrResult.confidence)}% confidence
              </Badge>
            </div>

            {/* Extracted Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(ocrResult.extractedData).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-sm font-medium bg-muted p-2 rounded">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Raw Text (collapsible) */}
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm font-medium">
                View Raw Extracted Text
              </summary>
              <div className="text-xs bg-muted p-3 rounded max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{ocrResult.text}</pre>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentOCR;