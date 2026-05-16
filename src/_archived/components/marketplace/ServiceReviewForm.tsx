import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceReviewFormProps {
  vendorId: string;
  vendorName: string;
  services: any[];
  onClose: () => void;
}

const StarRating: React.FC<{ value: number; onChange: (v: number) => void; label: string }> = ({ value, onChange, label }) => (
  <div className="space-y-1">
    <Label className="text-xs font-semibold">{label}</Label>
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star className={`h-6 w-6 ${star <= value ? 'fill-gold-primary text-gold-primary' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
      <span className="text-xs text-muted-foreground ml-2">{value}/5</span>
    </div>
  </div>
);

const ServiceReviewForm: React.FC<ServiceReviewFormProps> = ({ vendorId, vendorName, services, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    rating: 0,
    title: '',
    review_text: '',
    service_id: '',
    professionalism_rating: 0,
    communication_rating: 0,
    value_rating: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Silakan login terlebih dahulu'); return; }
    if (form.rating === 0) { toast.error('Berikan rating minimal 1 bintang'); return; }
    if (!form.review_text.trim()) { toast.error('Tulis ulasan Anda'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.from('vendor_reviews').insert({
        customer_id: user.id,
        vendor_id: vendorId,
        service_id: form.service_id || null,
        rating: form.rating,
        title: form.title.trim() || null,
        review_text: form.review_text.trim(),
        professionalism_rating: form.professionalism_rating || null,
        communication_rating: form.communication_rating || null,
        value_rating: form.value_rating || null,
        is_published: false, // Requires admin approval
      });
      if (error) throw error;
      toast.success('Ulasan berhasil dikirim! Menunggu persetujuan admin.');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim ulasan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-gold-primary" />
        <div>
          <h3 className="text-base font-semibold">Beri Ulasan</h3>
          <p className="text-xs text-muted-foreground">untuk {vendorName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} label="Rating Keseluruhan *" />

        {services.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Layanan yang Diulas (Opsional)</Label>
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
          <Label className="text-xs font-semibold">Judul Ulasan</Label>
          <Input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Ringkasan pengalaman Anda"
            className="h-10 rounded-xl"
            maxLength={200}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Ulasan *</Label>
          <Textarea
            value={form.review_text}
            onChange={e => setForm(p => ({ ...p, review_text: e.target.value }))}
            placeholder="Ceritakan pengalaman Anda dengan vendor ini..."
            rows={4}
            className="rounded-xl resize-none"
            required
            maxLength={2000}
          />
        </div>

        {/* Detail Ratings */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground">Rating Detail (Opsional)</p>
          <StarRating value={form.professionalism_rating} onChange={v => setForm(p => ({ ...p, professionalism_rating: v }))} label="Profesionalisme" />
          <StarRating value={form.communication_rating} onChange={v => setForm(p => ({ ...p, communication_rating: v }))} label="Komunikasi" />
          <StarRating value={form.value_rating} onChange={v => setForm(p => ({ ...p, value_rating: v }))} label="Nilai untuk Harga" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl">
            Batal
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Send className="h-4 w-4 mr-1.5" />}
            Kirim Ulasan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceReviewForm;
