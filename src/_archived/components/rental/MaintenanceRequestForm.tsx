import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Loader2, Camera, X, ImageIcon } from "lucide-react";
import browserImageCompression from "browser-image-compression";

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
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      showError("Batas Foto", "Maksimal 4 foto per permintaan");
      return;
    }

    const compressed: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      try {
        const comp = await browserImageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });
        compressed.push(new File([comp], file.name, { type: comp.type }));
        newPreviews.push(URL.createObjectURL(comp));
      } catch {
        compressed.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setImages(prev => [...prev, ...compressed]);
    setPreviews(prev => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];
    const urls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `maintenance/${bookingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("inspection-photos").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("inspection-photos").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const imageUrls = await uploadImages();
      const { error } = await supabase.from("maintenance_requests" as any).insert([{
        booking_id: bookingId,
        property_id: propertyId,
        tenant_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        images: imageUrls.length > 0 ? imageUrls : null,
      }]);
      if (error) throw error;
      showSuccess("Berhasil", "Permintaan maintenance berhasil dikirim");
      // Reset
      setTitle(""); setDescription(""); setCategory("general"); setPriority("medium");
      previews.forEach(p => URL.revokeObjectURL(p));
      setImages([]); setPreviews([]);
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

          {/* Photo upload */}
          <div>
            <Label>Foto Dokumentasi (maks. 4)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                  <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-md border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-[9px] mt-1">Tambah</span>
                </button>
              )}
            </div>
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
