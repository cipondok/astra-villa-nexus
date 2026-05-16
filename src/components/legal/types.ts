export type LegalServiceType =
  | 'shm_processing'
  | 'ajb_ppjb_documentation'
  | 'balik_nama'
  | 'certificate_verification'
  | 'tax_consultation';

export type LegalRequestStatus =
  | 'request_received'
  | 'document_review'
  | 'fee_quotation'
  | 'awaiting_payment'
  | 'processing'
  | 'completed'
  | 'cancelled';

export interface LegalServiceRequest {
  id: string;
  user_id: string;
  request_number: string;
  service_type: LegalServiceType;
  title: string;
  description: string | null;
  property_address: string | null;
  property_id: string | null;
  status: LegalRequestStatus;
  assigned_consultant_id: string | null;
  assigned_consultant_name: string | null;
  priority: string;
  fee_amount: number | null;
  fee_currency: string;
  fee_approved_at: string | null;
  fee_approved_by: string | null;
  notes: string | null;
  admin_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface LegalServiceDocument {
  id: string;
  request_id: string;
  document_name: string;
  document_url: string;
  document_type: string | null;
  uploaded_by: string;
  notes: string | null;
  created_at: string;
}

export interface LegalServiceTimeline {
  id: string;
  request_id: string;
  action: string;
  description: string | null;
  performed_by: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export const SERVICE_TYPE_LABELS: Record<LegalServiceType, { label: string; description: string; icon: string }> = {
  shm_processing: { label: 'Pengurusan SHM', description: 'Pembuatan atau perpanjangan Sertifikat Hak Milik', icon: '📜' },
  ajb_ppjb_documentation: { label: 'AJB / PPJB', description: 'Akta Jual Beli atau Perjanjian Pengikatan Jual Beli', icon: '📋' },
  balik_nama: { label: 'Balik Nama', description: 'Proses pengalihan nama sertifikat properti', icon: '🔄' },
  certificate_verification: { label: 'Verifikasi Sertifikat', description: 'Pengecekan keaslian dan status sertifikat tanah', icon: '✅' },
  tax_consultation: { label: 'Konsultasi Pajak', description: 'Konsultasi pajak properti (PBB, BPHTB, PPh)', icon: '💰' },
};

export const STATUS_CONFIG: Record<LegalRequestStatus, { label: string; color: string; step: number }> = {
  request_received: { label: 'Diterima', color: 'bg-muted text-muted-foreground', step: 0 },
  document_review: { label: 'Review Dokumen', color: 'bg-chart-4/20 text-chart-4', step: 1 },
  fee_quotation: { label: 'Penawaran Biaya', color: 'bg-chart-3/20 text-chart-3', step: 2 },
  awaiting_payment: { label: 'Menunggu Pembayaran', color: 'bg-chart-5/20 text-chart-5', step: 3 },
  processing: { label: 'Diproses', color: 'bg-chart-1/20 text-chart-1', step: 4 },
  completed: { label: 'Selesai', color: 'bg-chart-2/20 text-chart-2', step: 5 },
  cancelled: { label: 'Dibatalkan', color: 'bg-destructive/20 text-destructive', step: -1 },
};
