import { useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAutoHorizontalScroll from "@/hooks/useAutoHorizontalScroll";
import { Building2, Landmark, GraduationCap } from "lucide-react";

interface Partner {
  name: string;
  logo_url: string | null;
  type: "bank" | "corporate" | "university";
}

const typeIcon = {
  bank: Landmark,
  corporate: Building2,
  university: GraduationCap,
};

export default function PartnerLogosMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ["partner-logos-marquee"],
    queryFn: async () => {
      const [banks, corps, unis] = await Promise.all([
        supabase
          .from("acquisition_bank_partnerships")
          .select("bank_name, bank_logo_url")
          .eq("is_active", true),
        supabase
          .from("acquisition_corporate_partnerships")
          .select("company_name, company_logo_url")
          .eq("is_active", true),
        supabase
          .from("acquisition_university_partnerships")
          .select("university_name, university_logo_url")
          .eq("is_active", true),
      ]);

      const list: Partner[] = [];
      banks.data?.forEach((b) =>
        list.push({ name: b.bank_name, logo_url: b.bank_logo_url, type: "bank" })
      );
      corps.data?.forEach((c) =>
        list.push({ name: c.company_name, logo_url: c.company_logo_url, type: "corporate" })
      );
      unis.data?.forEach((u) =>
        list.push({ name: u.university_name, logo_url: u.university_logo_url, type: "university" })
      );
      return list;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Triple items for seamless loop
  const tripled = useMemo(() => [...partners, ...partners, ...partners], [partners]);

  useAutoHorizontalScroll(scrollRef as React.RefObject<HTMLElement>, {
    speed: 0.6,
    direction: "rtl",
    pauseOnHover: true,
    loopMode: "seamless",
  });

  if (partners.length === 0) return null;

  return (
    <section className="w-full py-6 mt-4">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
        Trusted Partners
      </p>

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-hidden px-4"
        style={{ scrollbarWidth: "none" }}
      >
        {tripled.map((p, i) => {
          const Icon = typeIcon[p.type];
          return (
            <div
              key={`${p.name}-${i}`}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-card/60 backdrop-blur-sm select-none"
            >
              {p.logo_url ? (
                <img
                  src={p.logo_url}
                  alt={p.name}
                  className="h-6 w-6 object-contain rounded"
                  loading="lazy"
                />
              ) : (
                <Icon className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-foreground/80 whitespace-nowrap">
                {p.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
