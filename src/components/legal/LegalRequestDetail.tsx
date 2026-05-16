import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, FileText, Upload, Clock, MapPin, DollarSign, CheckCircle, Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useLegalRequestById, useLegalTimeline, useLegalDocuments, useUploadLegalDocument, useApproveFee } from './useLegalServices';
import { LegalTimelineTracker } from './LegalTimelineTracker';
import { SERVICE_TYPE_LABELS, STATUS_CONFIG } from './types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  requestId: string;
  onBack: () => void;
}

export const LegalRequestDetail: React.FC<Props> = ({ requestId, onBack }) => {
  const { data: request, isLoading } = useLegalRequestById(requestId);
  const { data: timeline = [] } = useLegalTimeline(requestId);
  const { data: documents = [] } = useLegalDocuments(requestId);
  const uploadDoc = useUploadLegalDocument();
  const approveFee = useApproveFee();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDoc.mutateAsync({ requestId, file });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Permintaan tidak ditemukan</p>
        <Button variant="outline" size="sm" onClick={onBack} className="mt-3 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali
        </Button>
      </div>
    );
  }

  const serviceConfig = SERVICE_TYPE_LABELS[request.service_type];
  const statusConfig = STATUS_CONFIG[request.status];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground">{request.request_number}</span>
            <Badge className={`text-[10px] px-2 py-0 ${statusConfig.color}`}>
              {statusConfig.label}
            </Badge>
          </div>
          <h2 className="text-base font-bold text-foreground mt-0.5 truncate">{request.title}</h2>
        </div>
      </div>

      {/* Info Card */}
      <Card className="rounded-2xl border-border/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{serviceConfig.icon}</span>
            <div>
              <p className="text-sm font-semibold">{serviceConfig.label}</p>
              <p className="text-[10px] text-muted-foreground">{serviceConfig.description}</p>
            </div>
          </div>

          {request.description && (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
              {request.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            {request.property_address && (
              <div className="flex items-start gap-1.5 col-span-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{request.property_address}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: idLocale })}
              </span>
            </div>
            {request.assigned_consultant_name && (
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-chart-2" />
                <span className="text-muted-foreground">{request.assigned_consultant_name}</span>
              </div>
            )}
          </div>

          {/* Fee Quotation */}
          {request.fee_amount && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold">Biaya Layanan</p>
                    <p className="text-base font-bold text-primary">
                      {formatCurrency(request.fee_amount)}
                    </p>
                  </div>
                </div>
                {request.status === 'fee_quotation' && !request.fee_approved_at && (
                  <Button
                    size="sm"
                    className="rounded-xl h-8 text-xs"
                    onClick={() => approveFee.mutate(requestId)}
                    disabled={approveFee.isPending}
                  >
                    {approveFee.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Setujui Biaya'}
                  </Button>
                )}
                {request.fee_approved_at && (
                  <Badge variant="outline" className="text-[10px] border-chart-2/30 text-chart-2 bg-chart-2/10">
                    <CheckCircle className="h-3 w-3 mr-0.5" /> Disetujui
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Progress */}
      <Card className="rounded-2xl border-border/30">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <LegalTimelineTracker currentStatus={request.status} />
        </CardContent>
      </Card>

      {/* Activity Log */}
      {timeline.length > 0 && (
        <Card className="rounded-2xl border-border/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Riwayat Aktivitas</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {timeline.map(entry => (
              <div key={entry.id} className="flex items-start gap-2 text-xs">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-muted-foreground">{entry.description}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {new Date(entry.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card className="rounded-2xl border-border/30">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Dokumen ({documents.length})
          </CardTitle>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileUpload}
            />
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl h-8 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
              Upload
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {documents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Belum ada dokumen diupload</p>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <a
                  key={doc.id}
                  href={doc.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 hover:bg-muted transition-colors"
                >
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{doc.document_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
