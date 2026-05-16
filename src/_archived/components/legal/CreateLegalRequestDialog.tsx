import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Scale, Loader2 } from 'lucide-react';
import { useCreateLegalRequest } from './useLegalServices';
import { SERVICE_TYPE_LABELS, type LegalServiceType } from './types';

interface Props {
  children?: React.ReactNode;
}

export const CreateLegalRequestDialog: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [serviceType, setServiceType] = useState<LegalServiceType>('shm_processing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [priority, setPriority] = useState('normal');

  const createRequest = useCreateLegalRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRequest.mutateAsync({
      service_type: serviceType,
      title: title.trim(),
      description: description.trim(),
      property_address: propertyAddress.trim(),
      priority,
    });
    setOpen(false);
    setTitle('');
    setDescription('');
    setPropertyAddress('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Ajukan Layanan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> Ajukan Layanan Legal
          </DialogTitle>
          <DialogDescription className="text-xs">
            Isi formulir untuk mengajukan layanan legal properti
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Jenis Layanan *</Label>
            <Select value={serviceType} onValueChange={(v) => setServiceType(v as LegalServiceType)}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(SERVICE_TYPE_LABELS).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              {SERVICE_TYPE_LABELS[serviceType]?.description}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Judul Permintaan *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pengurusan SHM untuk rumah di Jakarta Selatan"
              className="h-10 rounded-xl"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Detail Kebutuhan</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail kebutuhan layanan legal Anda..."
              rows={4}
              className="rounded-xl resize-none"
              maxLength={2000}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alamat Properti</Label>
            <Input
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="Alamat lengkap properti terkait"
              className="h-10 rounded-xl"
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Prioritas</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Tidak Mendesak</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Mendesak</SelectItem>
                <SelectItem value="urgent">Sangat Mendesak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-10 rounded-xl">
              Batal
            </Button>
            <Button type="submit" disabled={createRequest.isPending || !title.trim()} className="flex-1 h-10 rounded-xl">
              {createRequest.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Scale className="h-4 w-4 mr-1.5" />}
              Ajukan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
