
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardCheck, Camera, Loader2 } from "lucide-react";

const conditionColors: Record<string, string> = {
  excellent: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  good: "bg-primary/10 text-primary border-primary/20",
  fair: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  poor: "bg-destructive/10 text-destructive border-destructive/20",
  damaged: "bg-destructive/10 text-destructive border-destructive/20",
  missing: "bg-muted text-muted-foreground border-border",
};

const conditionLabels: Record<string, string> = {
  excellent: "Sempurna", good: "Baik", fair: "Cukup", poor: "Buruk", damaged: "Rusak", missing: "Hilang",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu", in_progress: "Berlangsung", completed: "Selesai", disputed: "Sengketa",
};

const statusColors: Record<string, string> = {
  pending: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  disputed: "bg-destructive/10 text-destructive border-destructive/20",
};

const TenantInspections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["tenant-inspections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("property_inspections")
        .select("*, properties(title), inspection_items(*)")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const uploadPhoto = async (itemId: string, file: File, currentPhotos: string[]) => {
    const path = `tenant/${user?.id}/${itemId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("inspection-photos").upload(path, file);
    if (error) { toast.error("Gagal upload foto"); return; }

    const { data: { publicUrl } } = supabase.storage.from("inspection-photos").getPublicUrl(path);
    await supabase.from("inspection_items").update({ photo_urls: [...currentPhotos, publicUrl] }).eq("id", itemId);
    queryClient.invalidateQueries({ queryKey: ["tenant-inspections"] });
    toast.success("Foto berhasil diupload");
  };

  const activeInspection = inspections.find((i: any) => i.id === detailId) as any;

  if (detailId && activeInspection) {
    const items = (activeInspection.inspection_items || []) as any[];
    const areas = [...new Set(items.map((i: any) => i.area))];

    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => setDetailId(null)} className="text-xs">← Kembali</Button>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold">{activeInspection.properties?.title || "Properti"}</h3>
            <Badge className={`${statusColors[activeInspection.status]} border text-[10px]`}>
              {statusLabels[activeInspection.status]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {activeInspection.inspection_type === "check_in" ? "Check-In" : "Check-Out"} • {new Date(activeInspection.created_at).toLocaleDateString("id-ID")}
          </p>
          {activeInspection.overall_condition && (
            <Badge className={`${conditionColors[activeInspection.overall_condition]} border text-[9px] mt-1`}>
              Kondisi Keseluruhan: {conditionLabels[activeInspection.overall_condition]}
            </Badge>
          )}
        </Card>

        {areas.map((area) => (
          <Card key={area} className="p-3">
            <h4 className="text-xs font-semibold mb-2">{area}</h4>
            <div className="space-y-2">
              {items.filter((i: any) => i.area === area).sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any) => (
                <div key={item.id} className="border border-border rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{item.item_name}</span>
                    {item.condition ? (
                      <Badge className={`${conditionColors[item.condition]} border text-[9px]`}>
                        {conditionLabels[item.condition]}
                      </Badge>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">Belum dinilai</span>
                    )}
                  </div>
                  {item.notes && <p className="text-[10px] text-muted-foreground mb-1">{item.notes}</p>}
                  <div className="flex gap-1 flex-wrap">
                    {(item.photo_urls || []).map((url: string, pi: number) => (
                      <img key={pi} src={url} alt="" className="w-12 h-12 rounded object-cover border border-border" />
                    ))}
                    {activeInspection.status !== "completed" && (
                      <label className="w-12 h-12 rounded border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadPhoto(item.id, file, item.photo_urls || []);
                        }} />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {activeInspection.notes && (
          <Card className="p-3">
            <h4 className="text-xs font-semibold mb-1">Catatan Inspektur</h4>
            <p className="text-xs text-muted-foreground">{activeInspection.notes}</p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Inspeksi Properti</h2>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : inspections.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold">Belum Ada Inspeksi</h3>
          <p className="text-xs text-muted-foreground">Inspeksi check-in/check-out akan muncul di sini saat pemilik properti membuatnya.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {inspections.map((insp: any) => {
            const itemCount = insp.inspection_items?.length || 0;
            const ratedCount = insp.inspection_items?.filter((i: any) => i.condition).length || 0;

            return (
              <Card key={insp.id} className="p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setDetailId(insp.id)}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">{insp.properties?.title || "Properti"}</h4>
                  <Badge className={`${statusColors[insp.status]} border text-[10px]`}>
                    {statusLabels[insp.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{insp.inspection_type === "check_in" ? "Check-In" : "Check-Out"}</span>
                  <span>•</span>
                  <span>{new Date(insp.created_at).toLocaleDateString("id-ID")}</span>
                  <span>•</span>
                  <span>{ratedCount}/{itemCount} item dinilai</span>
                </div>
                {insp.overall_condition && (
                  <Badge className={`${conditionColors[insp.overall_condition]} border text-[9px] mt-1.5`}>
                    Kondisi: {conditionLabels[insp.overall_condition]}
                  </Badge>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TenantInspections;
