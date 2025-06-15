
import { MapPin, Building, Phone, Clock, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

interface FooterOfficesProps {
  language: "en" | "id";
}

type OfficeLocation = {
  id: string;
  name_en: string;
  name_id: string;
  address_en: string;
  address_id: string;
  phone: string | null;
  email: string | null;
  business_hours_en: string | null;
  business_hours_id: string | null;
  is_main_office: boolean;
};

const FooterOffices = ({ language }: FooterOfficesProps) => {
  const { data: offices, isLoading } = useQuery<OfficeLocation[]>({
    queryKey: ["office_locations_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("office_locations")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) {
        console.error("Error fetching office locations:", error);
        return [];
      }
      return data || [];
    },
  });

  const [selectedOfficeId, setSelectedOfficeId] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedOfficeId && offices && offices.length > 0) {
      const mainOffice = offices.find((o) => o.is_main_office) || offices[0];
      setSelectedOfficeId(mainOffice.id);
    }
  }, [offices, selectedOfficeId]);

  const selectedOffice = offices?.find((office) => office.id === selectedOfficeId);

  const text = {
    en: { offices: "Our Offices", select_office: "Select an office" },
    id: { offices: "Kantor Kami", select_office: "Pilih kantor" },
  };

  const currentText = text[language];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building className="h-5 w-5 text-primary" />
        </div>
        <h4 className="font-bold text-foreground text-lg">
          {currentText.offices}
        </h4>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg bg-muted/40" />
          <Skeleton className="h-48 w-full rounded-lg bg-muted/40" />
        </div>
      ) : (
        <div className="space-y-4">
          <Select onValueChange={setSelectedOfficeId} value={selectedOfficeId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={currentText.select_office} />
            </SelectTrigger>
            <SelectContent>
              {offices?.map((office) => (
                <SelectItem key={office.id} value={office.id}>
                  {language === "id" ? office.name_id : office.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedOffice && (
            <div
              key={selectedOffice.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                selectedOffice.is_main_office
                  ? "bg-primary/5 border-primary/20 hover:border-primary/30"
                  : "bg-muted/30 border-border/30 hover:border-border/50"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-2 h-10">
                  {selectedOffice.is_main_office && (
                    <div className="p-1 bg-primary/20 rounded text-primary mt-0.5">
                      <Building className="h-3 w-3" />
                    </div>
                  )}
                  <div className="font-semibold text-foreground text-sm leading-tight">
                    {language === "id"
                      ? selectedOffice.name_id
                      : selectedOffice.name_en}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    {language === "id"
                      ? selectedOffice.address_id
                      : selectedOffice.address_en}
                  </span>
                </div>

                {selectedOffice.phone && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                    <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="text-foreground text-xs font-medium">
                      {selectedOffice.phone}
                    </span>
                  </div>
                )}

                {selectedOffice.email && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                    <Mail className="h-3 w-3 text-primary flex-shrink-0" />
                    <a
                      href={`mailto:${selectedOffice.email}`}
                      className="text-foreground text-xs font-medium hover:underline"
                    >
                      {selectedOffice.email}
                    </a>
                  </div>
                )}

                {(() => {
                  const businessHours =
                    language === "id"
                      ? selectedOffice.business_hours_id
                      : selectedOffice.business_hours_en;
                  if (!businessHours) return null;
                  return (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                      <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground text-xs">
                        {businessHours}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FooterOffices;
