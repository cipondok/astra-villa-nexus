import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuotationRequestFormProps {
  vendorId: string;
  vendorName: string;
  services: any[];
  onClose: () => void;
}

const QuotationRequestForm: React.FC<QuotationRequestFormProps> = ({ vendorId, vendorName, services, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    service_id: '',
    budget_min: '',
    budget_max: '',
    preferred_date: '',
    preferred_time: '',
    urgency: 'normal',
    service_address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Silakan login terlebih dahulu'); return; }
    if (!form.title.trim() || !form.description.trim()) { toast.error('Judul dan deskripsi wajib diisi'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.from('service_quotation_requests').insert({
        customer_id: user.id,
        vendor_id: vendorId,
        service_id: form.service_id || null,
        title: form.title.trim(),
        description: form.description.trim(),
        budget_min: form.budget_min ? parseFloat(form.budget_min) : null,
        budget_max: form.budget_max ? parseFloat(form.budget_max) : null,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        urgency: form.urgency,
        service_address: form.service_address || null,
      });
      if (error) throw error;
      toast.success('Permintaan penawaran berhasil dikirim!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim permintaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-base font-semibold">Minta Penawaran</h3>
          <p className="text-xs text-muted-foreground">ke {vendorName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Judul Permintaan *</Label>
          <Input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Contoh: Renovasi dapur rumah"
            className="h-10 rounded-xl"
            required
            maxLength={200}
          />
        </div>

        {services.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Pilih Layanan (Opsional)</Label>
            <Select value={form.service_id} onValueChange={v => setForm(p => ({ ...p, service_id: v }))}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pilih layanan" /></SelectTrigger>
              <SelectContent>
                {services.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.service_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Deskripsi Kebutuhan *</Label>
          <Textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Jelaskan detail pekerjaan yang dibutuhkan..."
            rows={4}
            className="rounded-xl resize-none"
            required
            maxLength={2000}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Budget Min (IDR)</Label>
            <Input type="number" value={form.budget_min} onChange={e => setForm(p => ({ ...p, budget_min: e.target.value }))} className="h-10 rounded-xl" placeholder="500.000" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Budget Max (IDR)</Label>
            <Input type="number" value={form.budget_max} onChange={e => setForm(p => ({ ...p, budget_max: e.target.value }))} className="h-10 rounded-xl" placeholder="5.000.000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tanggal Preferensi</Label>
            <Input type="date" value={form.preferred_date} onChange={e => setForm(p => ({ ...p, preferred_date: e.target.value }))} className="h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Urgensi</Label>
            <Select value={form.urgency} onValueChange={v => setForm(p => ({ ...p, urgency: v }))}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Tidak Mendesak</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Mendesak</SelectItem>
                <SelectItem value="emergency">Darurat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Alamat Lokasi</Label>
          <Input
            value={form.service_address}
            onChange={e => setForm(p => ({ ...p, service_address: e.target.value }))}
            placeholder="Alamat lengkap lokasi pekerjaan"
            className="h-10 rounded-xl"
            maxLength={500}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl">
            Batal
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Send className="h-4 w-4 mr-1.5" />}
            Kirim Permintaan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuotationRequestForm;
