import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Loader2 } from "lucide-react";

interface MaintenanceRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  propertyId: string;
  onSuccess: () => void;
}

const categories = [
  { value: "plumbing", label: "Pipa & Air" },
  { value: "electrical", label: "Listrik" },
  { value: "ac_heating", label: "AC / Pendingin" },
  { value: "appliance", label: "Peralatan" },
  { value: "structural", label: "Struktur Bangunan" },
  { value: "pest", label: "Hama" },
  { value: "cleaning", label: "Kebersihan" },
  { value: "general", label: "Umum / Lainnya" },
];

const priorities = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
  { value: "urgent", label: "Darurat" },
];

const MaintenanceRequestForm = ({ open, onOpenChange, bookingId, propertyId, onSuccess }: MaintenanceRequestFormProps) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("maintenance_requests" as any).insert([{
        booking_id: bookingId,
        property_id: propertyId,
        tenant_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      }]);
      if (error) throw error;
      showSuccess("Berhasil", "Permintaan maintenance berhasil dikirim");
      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("medium");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      showError("Gagal", err.message || "Gagal mengirim permintaan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Ajukan Permintaan Perbaikan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul Masalah</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: AC tidak dingin" required maxLength={100} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioritas</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="desc">Deskripsi</Label>
            <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Jelaskan masalah secara detail..." required maxLength={1000} rows={4} />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !title.trim() || !description.trim()}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Kirim Permintaan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceRequestForm;
