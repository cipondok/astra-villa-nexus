import { useState } from 'react';
import { useCreateOffer, type CreateOfferInput, type FinancingMethod } from '@/hooks/usePropertyOffers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';

function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

interface MakeOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle?: string;
  propertyImage?: string;
  propertyPrice?: number;
  sellerId?: string | null;
  agentId?: string | null;
}

export default function MakeOfferDialog({
  open, onOpenChange, propertyId, propertyTitle, propertyImage, propertyPrice, sellerId, agentId,
}: MakeOfferDialogProps) {
  const createOffer = useCreateOffer();
  const [form, setForm] = useState({
    offer_price: propertyPrice ? Math.round(propertyPrice * 0.9) : 0,
    financing_method: 'cash' as FinancingMethod,
    completion_timeline: '30 days',
    buyer_message: '',
  });

  const discount = propertyPrice && form.offer_price
    ? Math.round((1 - form.offer_price / propertyPrice) * 100)
    : 0;

  const handleSubmit = () => {
    if (form.offer_price <= 0) return;
    const input: CreateOfferInput = {
      property_id: propertyId,
      seller_id: sellerId,
      agent_id: agentId,
      offer_price: form.offer_price,
      financing_method: form.financing_method,
      completion_timeline: form.completion_timeline,
      buyer_message: form.buyer_message || undefined,
      property_title: propertyTitle,
      property_image: propertyImage,
      property_original_price: propertyPrice,
    };
    createOffer.mutate(input, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Make an Offer
          </DialogTitle>
        </DialogHeader>

        {/* Property info */}
        {propertyTitle && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            {propertyImage && (
              <img src={propertyImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{propertyTitle}</p>
              {propertyPrice && (
                <p className="text-xs text-muted-foreground">Listed: {formatPrice(propertyPrice)}</p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Offer price */}
          <div>
            <label className="text-xs font-medium text-foreground">Your Offer Price (Rp) *</label>
            <Input
              type="number"
              min={1}
              value={form.offer_price}
              onChange={e => setForm(f => ({ ...f, offer_price: Number(e.target.value) }))}
              className="mt-1"
            />
            {discount > 0 && (
              <p className="text-[10px] text-emerald-500 mt-1">{discount}% below asking price</p>
            )}
            {discount < 0 && (
              <p className="text-[10px] text-amber-500 mt-1">{Math.abs(discount)}% above asking price</p>
            )}
          </div>

          {/* Financing */}
          <div>
            <label className="text-xs font-medium text-foreground">Financing Method</label>
            <Select value={form.financing_method} onValueChange={v => setForm(f => ({ ...f, financing_method: v as FinancingMethod }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="mortgage">🏦 Mortgage / KPR</SelectItem>
                <SelectItem value="mixed">🔀 Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <div>
            <label className="text-xs font-medium text-foreground">Preferred Completion Timeline</label>
            <Select value={form.completion_timeline} onValueChange={v => setForm(f => ({ ...f, completion_timeline: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="14 days">14 days</SelectItem>
                <SelectItem value="30 days">30 days</SelectItem>
                <SelectItem value="60 days">60 days</SelectItem>
                <SelectItem value="90 days">90 days</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-foreground">Message to Seller (optional)</label>
            <Textarea
              rows={3}
              placeholder="Tell the seller why you're interested..."
              value={form.buyer_message}
              onChange={e => setForm(f => ({ ...f, buyer_message: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createOffer.isPending || form.offer_price <= 0}>
            {createOffer.isPending ? 'Submitting...' : 'Submit Offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
