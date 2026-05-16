import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, ExternalLink, Check, X } from "lucide-react";
import { SITE } from "@/config/site";
import { useToast } from "@/hooks/use-toast";

type Lead = {
  id: string;
  property_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
};

export default function AdminLeads() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Lead["status"] }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl font-semibold mb-6">Leads inbox</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="text-muted-foreground">No leads yet.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{lead.name}</span>
                    <Badge variant={lead.status === "new" ? "default" : "secondary"}>{lead.status}</Badge>
                    <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(lead.created_at).toLocaleString("id-ID")}</div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-3.5 w-3.5" />{lead.email}</a>
                    {lead.phone && (
                      <>
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="h-3.5 w-3.5" />{lead.phone}</a>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo ${lead.name}, terima kasih telah menghubungi ${SITE.name}.`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {lead.status !== "contacted" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: lead.id, status: "contacted" })}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Mark contacted
                    </Button>
                  )}
                  {lead.status !== "closed" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: lead.id, status: "closed" })}>
                      <X className="h-3.5 w-3.5 mr-1" /> Close
                    </Button>
                  )}
                </div>
              </div>
              {lead.message && (
                <p className="mt-3 text-sm bg-muted rounded-lg p-3 whitespace-pre-line">{lead.message}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
