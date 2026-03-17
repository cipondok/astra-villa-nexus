import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Scale, Shield, ArrowLeft, ChevronRight, Clock, FileText,
  Lock, CheckCircle, AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useLegalRequests } from '@/components/legal/useLegalServices';
import { CreateLegalRequestDialog } from '@/components/legal/CreateLegalRequestDialog';
import { LegalRequestDetail } from '@/components/legal/LegalRequestDetail';
import { SERVICE_TYPE_LABELS, STATUS_CONFIG, type LegalServiceType } from '@/components/legal/types';

const SERVICE_CARDS: { type: LegalServiceType; icon: string; features: string[] }[] = [
  { type: 'shm_processing', icon: '📜', features: ['Pembuatan SHM baru', 'Perpanjangan SHM', 'Konversi hak tanah'] },
  { type: 'ajb_ppjb_documentation', icon: '📋', features: ['Pembuatan AJB', 'Penyusunan PPJB', 'Review dokumen'] },
  { type: 'balik_nama', icon: '🔄', features: ['Pengalihan sertifikat', 'Update data BPN', 'Proses cepat'] },
  { type: 'certificate_verification', icon: '✅', features: ['Cek keaslian', 'Validasi BPN', 'Laporan lengkap'] },
  { type: 'tax_consultation', icon: '💰', features: ['Konsultasi PBB', 'BPHTB', 'PPh properti'] },
];

const LegalServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: requests, isLoading } = useLegalRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="rounded-2xl border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-bold">Login Diperlukan</h2>
              <p className="text-sm text-muted-foreground">Silakan login untuk mengakses layanan legal</p>
              <Button onClick={() => navigate('/auth?mode=login')} className="rounded-xl h-10 w-full">Login</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedRequestId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
          <div className="container mx-auto px-4 py-3">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" /> Detail Permintaan
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-5 max-w-3xl">
          <LegalRequestDetail
            requestId={selectedRequestId}
            onBack={() => setSelectedRequestId(null)}
          />
        </div>
      </div>
    );
  }

  const activeCount = requests?.filter(r => !['completed', 'cancelled'].includes(r.status)).length ?? 0;
  const completedCount = requests?.filter(r => r.status === 'completed').length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> Layanan Legal
              </h1>
              <p className="text-[10px] text-muted-foreground">Bantuan dokumen properti terpercaya</p>
            </div>
          </div>
          <CreateLegalRequestDialog />
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 max-w-4xl space-y-5">
        {/* Trust Banner */}
        <Card className="rounded-2xl border-chart-2/20 bg-gradient-to-r from-chart-2/5 to-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Dukungan Legal Terpercaya</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Tim konsultan hukum berpengalaman siap membantu urusan dokumen properti Anda
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="rounded-2xl border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{requests?.length ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-chart-4">{activeCount}</p>
              <p className="text-[10px] text-muted-foreground">Aktif</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-chart-2">{completedCount}</p>
              <p className="text-[10px] text-muted-foreground">Selesai</p>
            </CardContent>
          </Card>
        </div>

        {/* Service Types */}
        <div>
          <h2 className="text-base font-semibold mb-3">Jenis Layanan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICE_CARDS.map(({ type, icon, features }) => {
              const cfg = SERVICE_TYPE_LABELS[type];
              return (
                <Card key={type} className="rounded-2xl border-border/30 hover:border-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{icon}</span>
                      <h3 className="text-sm font-semibold">{cfg.label}</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-3">{cfg.description}</p>
                    <ul className="space-y-1 mb-3">
                      {features.map(f => (
                        <li key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-chart-2 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <CreateLegalRequestDialog>
                      <Button variant="outline" size="sm" className="w-full rounded-xl h-8 text-xs">
                        Ajukan Layanan
                      </Button>
                    </CreateLegalRequestDialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* My Requests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Permintaan Saya</h2>
            <CreateLegalRequestDialog>
              <Button variant="ghost" size="sm" className="text-xs h-7">+ Baru</Button>
            </CreateLegalRequestDialog>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : !requests || requests.length === 0 ? (
            <Card className="rounded-2xl border-border/30">
              <CardContent className="p-6 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Belum ada permintaan</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Pilih layanan di atas untuk mulai
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea style={{ maxHeight: '400px' }}>
              <div className="space-y-2">
                {requests.map(req => {
                  const svcCfg = SERVICE_TYPE_LABELS[req.service_type];
                  const stsCfg = STATUS_CONFIG[req.status];
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted cursor-pointer transition-colors active:scale-[0.98]"
                    >
                      <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center flex-shrink-0 text-base">
                        {svcCfg.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-muted-foreground">{req.request_number}</span>
                          <Badge className={`text-[9px] px-1.5 py-0 ${stsCfg.color}`}>
                            {stsCfg.label}
                          </Badge>
                          {req.priority === 'urgent' && (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-medium truncate mt-0.5">
                          {req.title}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: idLocale })}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalServices;
