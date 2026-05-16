import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, MessageSquare, FileText, Pin, Clock, CheckCircle, AlertTriangle, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import RentalChatDialog from "./RentalChatDialog";
import RentalDocumentsDialog from "./RentalDocumentsDialog";

const priorityConfig: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  low: { label: "Info", color: "bg-muted text-muted-foreground", icon: Bell },
  normal: { label: "Normal", color: "bg-primary/10 text-primary", icon: Bell },
  high: { label: "Penting", color: "bg-chart-3/10 text-chart-3", icon: AlertTriangle },
  urgent: { label: "Darurat", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const categoryLabels: Record<string, string> = {
  general: "Umum", maintenance: "Pemeliharaan", billing: "Pembayaran",
  rules: "Aturan", event: "Acara", emergency: "Darurat",
};

const TenantCommunicationHub = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [chatBooking, setChatBooking] = useState<{ id: string; title: string } | null>(null);
  const [docsBooking, setDocsBooking] = useState<{ id: string; title: string } | null>(null);

  // Fetch active bookings for chat/docs
  const { data: bookings = [] } = useQuery({
    queryKey: ["tenant-active-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("rental_bookings")
        .select("id, property_id, properties(title)")
        .eq("customer_id", user.id)
        .in("booking_status", ["confirmed", "pending"])
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch announcements for tenant's properties
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["tenant-announcements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("property_announcements")
        .select("*, properties(title), announcement_reads!left(tenant_id)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: async (announcementId: string) => {
      if (!user) return;
      const { error } = await supabase.from("announcement_reads").upsert({
        announcement_id: announcementId,
        tenant_id: user.id,
      }, { onConflict: "announcement_id,tenant_id" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-announcements"] }),
  });

  const isRead = (a: any) => a.announcement_reads?.some((r: any) => r.tenant_id === user?.id);
  const unreadCount = announcements.filter((a: any) => !isRead(a)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Pusat Komunikasi</h2>
      </div>

      <Tabs defaultValue="announcements" className="space-y-3">
        <TabsList className="w-full h-8 p-0.5">
          <TabsTrigger value="announcements" className="flex-1 text-xs h-6 gap-1">
            <Megaphone className="h-3 w-3" /> Pengumuman
            {unreadCount > 0 && (
              <Badge className="text-[8px] px-1 py-0 h-3.5 bg-destructive text-destructive-foreground">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex-1 text-xs h-6 gap-1">
            <MessageSquare className="h-3 w-3" /> Chat
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 text-xs h-6 gap-1">
            <FileText className="h-3 w-3" /> Dokumen
          </TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            </div>
          ) : announcements.length === 0 ? (
            <Card className="p-6 text-center">
              <Megaphone className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-xs font-medium">Tidak ada pengumuman</p>
              <p className="text-[10px] text-muted-foreground">Pengumuman dari pemilik properti akan muncul di sini</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {announcements.map((a: any) => {
                const read = isRead(a);
                const prio = priorityConfig[a.priority] || priorityConfig.normal;
                const PrioIcon = prio.icon;
                return (
                  <Card
                    key={a.id}
                    className={`p-2.5 cursor-pointer transition-all ${a.is_pinned ? "border-primary/30 bg-primary/5" : ""} ${!read ? "border-l-2 border-l-primary" : "opacity-80"}`}
                    onClick={() => !read && markRead.mutate(a.id)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${prio.color}`}>
                        <PrioIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {a.is_pinned && <Pin className="h-2.5 w-2.5 text-primary" />}
                          <h3 className="text-xs font-semibold text-foreground truncate">{a.title}</h3>
                          {!read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1">{a.content}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-[8px] px-1.5 py-0 ${prio.color}`}>{prio.label}</Badge>
                          <Badge variant="outline" className="text-[8px] px-1.5 py-0">{categoryLabels[a.category] || a.category}</Badge>
                          <span className="text-[8px] text-muted-foreground">{(a as any).properties?.title}</span>
                          <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: idLocale })}
                          </span>
                          {read && (
                            <span className="text-[8px] text-chart-1 flex items-center gap-0.5">
                              <CheckCircle className="h-2.5 w-2.5" /> Dibaca
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Chats Tab */}
        <TabsContent value="chats">
          {bookings.length === 0 ? (
            <Card className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-xs font-medium">Tidak ada chat aktif</p>
              <p className="text-[10px] text-muted-foreground">Chat akan tersedia saat Anda memiliki booking aktif</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {bookings.map((b: any) => (
                <Card key={b.id} className="p-2.5 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setChatBooking({ id: b.id, title: b.properties?.title || "Properti" })}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{b.properties?.title || "Properti"}</p>
                      <p className="text-[10px] text-muted-foreground">Ketuk untuk membuka chat</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          {bookings.length === 0 ? (
            <Card className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-xs font-medium">Tidak ada dokumen</p>
              <p className="text-[10px] text-muted-foreground">Dokumen akan tersedia saat Anda memiliki booking aktif</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {bookings.map((b: any) => (
                <Card key={b.id} className="p-2.5 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setDocsBooking({ id: b.id, title: b.properties?.title || "Properti" })}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-chart-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{b.properties?.title || "Properti"}</p>
                      <p className="text-[10px] text-muted-foreground">Ketuk untuk lihat dokumen</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {chatBooking && (
        <RentalChatDialog
          bookingId={chatBooking.id}
          propertyTitle={chatBooking.title}
          open={!!chatBooking}
          onOpenChange={() => setChatBooking(null)}
        />
      )}
      {docsBooking && (
        <RentalDocumentsDialog
          bookingId={docsBooking.id}
          propertyTitle={docsBooking.title}
          open={!!docsBooking}
          onOpenChange={() => setDocsBooking(null)}
        />
      )}
    </div>
  );
};

export default TenantCommunicationHub;
