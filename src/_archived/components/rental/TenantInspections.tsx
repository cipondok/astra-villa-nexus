
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardCheck, Camera, Loader2, CalendarIcon } from "lucide-react";
import { format, isToday, isBefore } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  scheduled: "Terjadwal", pending: "Menunggu", in_progress: "Berlangsung", completed: "Selesai", disputed: "Sengketa",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-accent/50 text-accent-foreground border-accent",
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
        .order("inspection_date", { ascending: true });
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
    const isScheduled = activeInspection.status === "scheduled";

    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => setDetailId(null)} className="text-xs">← Kembali</Button>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold">{activeInspection.properties?.title || "Properti"}</h3>
            <Badge className={`${statusColors[activeInspection.status]} border text-[10px]`}>
              {statusLabels[activeInspection.status] || activeInspection.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {activeInspection.inspection_type === "check_in" ? "Check-In" : "Check-Out"} •{" "}
            {activeInspection.inspection_date
              ? format(new Date(activeInspection.inspection_date), "d MMMM yyyy, HH:mm", { locale: idLocale })
              : new Date(activeInspection.created_at).toLocaleDateString("id-ID")}
          </p>
          {activeInspection.overall_condition && (
            <Badge className={`${conditionColors[activeInspection.overall_condition]} border text-[9px] mt-1`}>
              Kondisi Keseluruhan: {conditionLabels[activeInspection.overall_condition]}
            </Badge>
          )}
        </Card>

        {isScheduled && (
          <Card className="p-4 text-center border-dashed border-2 border-primary/20">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-primary/60" />
            <p className="text-xs font-medium text-foreground">Inspeksi Terjadwal</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Inspeksi dijadwalkan pada{" "}
              <span className="font-semibold text-foreground">
                {format(new Date(activeInspection.inspection_date), "d MMMM yyyy, HH:mm", { locale: idLocale })}
              </span>.
              Detail checklist akan tersedia saat inspeksi dimulai.
            </p>
          </Card>
        )}

        {!isScheduled && areas.map((area) => (
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
                    {activeInspection.status !== "completed" && !isScheduled && (
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

  // Separate upcoming and completed
  const upcoming = inspections.filter((i: any) => ["scheduled", "pending", "in_progress"].includes(i.status));
  const completed = inspections.filter((i: any) => ["completed", "disputed"].includes(i.status));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Inspeksi Properti</h2>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : inspections.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold">Belum Ada Inspeksi</h3>
          <p className="text-xs text-muted-foreground">Inspeksi check-in/check-out akan muncul di sini saat pemilik properti menjadwalkannya.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Mendatang</h3>
              <div className="space-y-3">
                {upcoming.map((insp: any) => {
                  const itemCount = insp.inspection_items?.length || 0;
                  const ratedCount = insp.inspection_items?.filter((i: any) => i.condition).length || 0;
                  const inspDate = insp.inspection_date ? new Date(insp.inspection_date) : null;
                  const isUpcomingToday = inspDate && isToday(inspDate);

                  return (
                    <Card
                      key={insp.id}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-muted/30 transition-colors",
                        isUpcomingToday && "ring-1 ring-primary/30"
                      )}
                      onClick={() => setDetailId(insp.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold">{insp.properties?.title || "Properti"}</h4>
                        <Badge className={`${statusColors[insp.status]} border text-[10px]`}>
                          {statusLabels[insp.status] || insp.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{insp.inspection_type === "check_in" ? "Check-In" : "Check-Out"}</span>
                        <span>•</span>
                        <span className={isUpcomingToday ? "text-primary font-semibold" : ""}>
                          {inspDate
                            ? format(inspDate, "d MMM yyyy, HH:mm", { locale: idLocale })
                            : new Date(insp.created_at).toLocaleDateString("id-ID")}
                          {isUpcomingToday && " (Hari ini)"}
                        </span>
                        {insp.status !== "scheduled" && (
                          <>
                            <span>•</span>
                            <span>{ratedCount}/{itemCount} item dinilai</span>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Selesai</h3>
              <div className="space-y-3">
                {completed.map((insp: any) => {
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
                        <span>{insp.inspection_date
                          ? format(new Date(insp.inspection_date), "d MMM yyyy", { locale: idLocale })
                          : new Date(insp.created_at).toLocaleDateString("id-ID")}</span>
                        <span>•</span>
                        <span>{ratedCount}/{itemCount} item</span>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TenantInspections;
