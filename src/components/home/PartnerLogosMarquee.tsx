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

const typeBadgeStyle: Record<Partner["type"], string> = {
  bank: "bg-blue-500/10 border-blue-400/30 text-blue-600 dark:text-blue-400",
  corporate: "bg-violet-500/10 border-violet-400/30 text-violet-600 dark:text-violet-400",
  university: "bg-emerald-500/10 border-emerald-400/30 text-emerald-600 dark:text-emerald-400",
};

// Fallback partners shown when DB tables are empty
const FALLBACK_PARTNERS: Partner[] = [
  { name: "Bank BCA", logo_url: null, type: "bank" },
  { name: "Bank Mandiri", logo_url: null, type: "bank" },
  { name: "Bank BRI", logo_url: null, type: "bank" },
  { name: "Bank BNI", logo_url: null, type: "bank" },
  { name: "Bank BTN", logo_url: null, type: "bank" },
  { name: "CIMB Niaga", logo_url: null, type: "bank" },
  { name: "PT Astra", logo_url: null, type: "corporate" },
  { name: "PT Telkom", logo_url: null, type: "corporate" },
  { name: "Sinarmas Group", logo_url: null, type: "corporate" },
  { name: "Ciputra Group", logo_url: null, type: "corporate" },
  { name: "Summarecon", logo_url: null, type: "corporate" },
  { name: "UI Jakarta", logo_url: null, type: "university" },
  { name: "ITB Bandung", logo_url: null, type: "university" },
  { name: "UGM Yogyakarta", logo_url: null, type: "university" },
  { name: "ITS Surabaya", logo_url: null, type: "university" },
];

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

  // Use real data if available, else show fallback placeholders
  const displayPartners = partners.length > 0 ? partners : FALLBACK_PARTNERS;

  // Triple items for seamless loop
  const tripled = useMemo(
    () => [...displayPartners, ...displayPartners, ...displayPartners],
    [displayPartners]
  );

  useAutoHorizontalScroll(scrollRef as React.RefObject<HTMLElement>, {
    speed: 0.6,
    direction: "rtl",
    pauseOnHover: true,
    loopMode: "seamless",
  });

  return (
    <section className="w-full py-6 mt-4">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
        Trusted Partners
      </p>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-hidden px-4"
        style={{ scrollbarWidth: "none" }}
      >
        {tripled.map((p, i) => {
          const Icon = typeIcon[p.type];
          return (
            <div
              key={`${p.name}-${i}`}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm select-none ${typeBadgeStyle[p.type]}`}
            >
              {p.logo_url ? (
                <img
                  src={p.logo_url}
                  alt={p.name}
                  className="h-5 w-5 object-contain rounded"
                  loading="lazy"
                />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="text-xs font-semibold whitespace-nowrap">
                {p.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
