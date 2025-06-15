import { MapPin, Building, Phone, Clock, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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

  const text = {
    en: { offices: "Our Offices" },
    id: { offices: "Kantor Kami" },
  };

  const currentText = text[language];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building className="h-5 w-5 text-primary" />
        </div>
        <h4 className="font-bold text-foreground text-lg">
          {currentText.offices}
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-lg bg-muted/40" />
          ))
        ) : (
          offices?.map((office) => {
            const officeName = language === 'id' ? office.name_id : office.name_en;
            const officeAddress = language === 'id' ? office.address_id : office.address_en;
            const businessHours = language === 'id' ? office.business_hours_id : office.business_hours_en;

            return (
              <div 
                key={office.id} 
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  office.is_main_office
                    ? 'bg-primary/5 border-primary/20 hover:border-primary/30' 
                    : 'bg-muted/30 border-border/30 hover:border-border/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-2 h-10">
                    {office.is_main_office && (
                      <div className="p-1 bg-primary/20 rounded text-primary mt-0.5">
                        <Building className="h-3 w-3" />
                      </div>
                    )}
                    <div className="font-semibold text-foreground text-sm leading-tight">
                      {officeName}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {officeAddress}
                    </span>
                  </div>
                  
                  {office.phone && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                      <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-foreground text-xs font-medium">
                        {office.phone}
                      </span>
                    </div>
                  )}
                  
                  {office.email && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                      <Mail className="h-3 w-3 text-primary flex-shrink-0" />
                      <a href={`mailto:${office.email}`} className="text-foreground text-xs font-medium hover:underline">
                        {office.email}
                      </a>
                    </div>
                  )}
                  
                  {businessHours && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                      <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground text-xs">
                        {businessHours}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FooterOffices;
