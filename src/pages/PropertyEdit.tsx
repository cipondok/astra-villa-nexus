import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Save, Loader2, Home, MapPin, Ruler, CheckCircle,
  Image as ImageIcon, Trash2, Building2,
} from "lucide-react";
import SimpleImageUpload from "@/components/property/SimpleImageUpload";
import OpportunityScoreRing from "@/components/property/OpportunityScoreRing";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const PropertyEdit = () => {
  const { isAuthenticated, profile, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "", description: "", price: "",
    property_type: "", listing_type: "",
    location: "", city: "", state: "",
    bedrooms: "", bathrooms: "", area_sqm: "",
    land_area_sqm: "", building_area_sqm: "",
    status: "active", images: [] as string[],
  });

  useEffect(() => {
    if (!isAuthenticated) navigate('/?auth=true');
  }, [isAuthenticated, navigate]);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property-edit', id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      // Check ownership
      if (data.agent_id !== user.id && data.owner_id !== user.id && profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return data;
    },
    enabled: !!id && !!user,
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        price: property.price?.toString() || "",
        property_type: property.property_type || "",
        listing_type: property.listing_type || "",
        location: property.location || "",
        city: property.city || "",
        state: property.state || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        area_sqm: property.area_sqm?.toString() || "",
        land_area_sqm: (property as any).land_area_sqm?.toString() || "",
        building_area_sqm: (property as any).building_area_sqm?.toString() || "",
        status: property.status || "active",
        images: property.images || property.image_urls || [],
      });
    }
  }, [property]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user) throw new Error('Missing data');
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
        status: formData.status,
        images: formData.images,
        image_urls: formData.images,
        updated_at: new Date().toISOString(),
      };

      let query = supabase.from('properties').update(updateData).eq('id', id);
      // Allow update if owner or agent
      if (profile?.role !== 'admin') {
        query = query.or(`agent_id.eq.${user.id},owner_id.eq.${user.id}`);
      }
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-edit', id] });
      toast.success('Properti berhasil diperbarui!');
      navigate(-1);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memperbarui properti');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Missing ID');
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      toast.success('Properti berhasil dihapus');
      navigate('/my-properties');
    },
    onError: () => toast.error('Gagal menghapus properti'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { toast.error('Judul wajib diisi'); return; }
    setIsSubmitting(true);
    updateMutation.mutate();
    setIsSubmitting(false);
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Memuat properti...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Properti Tidak Ditemukan</h2>
          <p className="text-sm text-muted-foreground mb-4">Properti tidak ada atau Anda tidak memiliki akses.</p>
          <Button onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-lg font-bold text-foreground">Edit Properti</h1>
              <p className="text-xs text-muted-foreground line-clamp-1">{property.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OpportunityScoreRing score={property.opportunity_score} size={36} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Properti?</AlertDialogTitle>
                  <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                  <AlertDialogAction className="rounded-xl bg-destructive" onClick={() => deleteMutation.mutate()}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-11 p-1 bg-muted/50 border border-border/40 rounded-xl">
              <TabsTrigger value="basic" className="text-xs sm:text-sm gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Home className="h-3.5 w-3.5" /> Info
              </TabsTrigger>
              <TabsTrigger value="location" className="text-xs sm:text-sm gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <MapPin className="h-3.5 w-3.5" /> Lokasi
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs sm:text-sm gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Ruler className="h-3.5 w-3.5" /> Detail
              </TabsTrigger>
              <TabsTrigger value="images" className="text-xs sm:text-sm gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <ImageIcon className="h-3.5 w-3.5" /> Foto
              </TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="mt-4">
              <Card className="rounded-2xl border-border/40">
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Judul *</Label>
                    <Input value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required className="h-10 rounded-xl" placeholder="Judul properti" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Deskripsi</Label>
                    <Textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={5} className="rounded-xl resize-none" placeholder="Deskripsi properti..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Tipe Properti *</Label>
                      <Select value={formData.property_type} onValueChange={(v) => handleInputChange('property_type', v)}>
                        <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pilih" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">Rumah</SelectItem>
                          <SelectItem value="apartment">Apartemen</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="land">Tanah</SelectItem>
                          <SelectItem value="commercial">Komersial</SelectItem>
                          <SelectItem value="warehouse">Gudang</SelectItem>
                          <SelectItem value="office">Kantor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Tipe Listing *</Label>
                      <Select value={formData.listing_type} onValueChange={(v) => handleInputChange('listing_type', v)}>
                        <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">Dijual</SelectItem>
                          <SelectItem value="rent">Disewa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Harga (IDR) *</Label>
                    <Input type="number" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} required className="h-10 rounded-xl" placeholder="Harga" />
                    {formData.price && (
                      <p className="text-[11px] text-primary font-medium">{formatCurrency(Number(formData.price))}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                      <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="sold">Terjual</SelectItem>
                        <SelectItem value="inactive">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location */}
            <TabsContent value="location" className="mt-4">
              <Card className="rounded-2xl border-border/40">
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Alamat Lengkap *</Label>
                    <Input value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} className="h-10 rounded-xl" placeholder="Alamat lengkap" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Kota</Label>
                      <Input value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className="h-10 rounded-xl" placeholder="Kota" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Provinsi</Label>
                      <Input value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} className="h-10 rounded-xl" placeholder="Provinsi" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details */}
            <TabsContent value="details" className="mt-4">
              <Card className="rounded-2xl border-border/40">
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Kamar Tidur</Label>
                      <Input type="number" value={formData.bedrooms} onChange={(e) => handleInputChange('bedrooms', e.target.value)} className="h-10 rounded-xl" min="0" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Kamar Mandi</Label>
                      <Input type="number" value={formData.bathrooms} onChange={(e) => handleInputChange('bathrooms', e.target.value)} className="h-10 rounded-xl" min="0" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Luas (m²)</Label>
                      <Input type="number" value={formData.area_sqm} onChange={(e) => handleInputChange('area_sqm', e.target.value)} className="h-10 rounded-xl" min="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Luas Tanah (m²)</Label>
                      <Input type="number" value={formData.land_area_sqm} onChange={(e) => handleInputChange('land_area_sqm', e.target.value)} className="h-10 rounded-xl" min="0" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Luas Bangunan (m²)</Label>
                      <Input type="number" value={formData.building_area_sqm} onChange={(e) => handleInputChange('building_area_sqm', e.target.value)} className="h-10 rounded-xl" min="0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images */}
            <TabsContent value="images" className="mt-4">
              <Card className="rounded-2xl border-border/40">
                <CardContent className="p-4 sm:p-5">
                  <SimpleImageUpload
                    images={formData.images}
                    onImagesChange={(imgs) => handleInputChange('images', imgs)}
                    maxImages={20}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 h-11 rounded-xl">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || updateMutation.isPending} className="flex-1 h-11 rounded-xl">
              {(isSubmitting || updateMutation.isPending) ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Simpan Perubahan</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyEdit;
