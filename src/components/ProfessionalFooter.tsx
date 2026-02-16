import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Rocket, Instagram, Youtube, Home, ShoppingCart, Key, UsersRound, Construction, Search, MessageSquare, Calculator, PiggyBank, HelpCircle, CircleHelp, PhoneCall, MapPin, Glasses, UserCheck } from "lucide-react";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

interface DockItem {
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  to?: string;
}

/**
 * macOS-style Dock with proximity magnification.
 * Uses useEffect + refs so getBoundingClientRect is read outside render.
 */
const Dock = ({ items }: { items: DockItem[] }) => {
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scales, setScales] = useState<number[]>(() => items.map(() => 1));
  const animFrame = useRef<number>(0);
  const mouseXRef = useRef<number | null>(null);

  const MAX_DISTANCE = 100; // px radius of effect
  const MAX_SCALE = 1.65;

  const computeScales = useCallback(() => {
    const mx = mouseXRef.current;
    const newScales = items.map((_, i) => {
      const el = iconRefs.current[i];
      if (mx === null || !el) return 1;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(mx - center);
      if (dist > MAX_DISTANCE) return 1;
      // cosine ease for smooth falloff
      return 1 + (MAX_SCALE - 1) * (0.5 + 0.5 * Math.cos((Math.PI * dist) / MAX_DISTANCE));
    });
    setScales(newScales);
  }, [items.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseXRef.current = e.clientX;
    cancelAnimationFrame(animFrame.current);
    animFrame.current = requestAnimationFrame(computeScales);
  }, [computeScales]);

  const handleMouseLeave = useCallback(() => {
    mouseXRef.current = null;
    cancelAnimationFrame(animFrame.current);
    setScales(items.map(() => 1));
  }, [items.length]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  return (
    <div
      ref={dockRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex items-end justify-center gap-1 px-4 py-2 rounded-2xl
        bg-[hsl(200,40%,85%/0.6)] border border-[hsl(200,50%,75%/0.5)] backdrop-blur-md
        dark:bg-[hsl(210,40%,10%/0.6)] dark:border-[hsl(200,35%,25%/0.5)]
        shadow-[0_4px_20px_hsl(200,50%,50%/0.15)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      {items.map((item, i) => {
        const scale = scales[i] ?? 1;
        const isHovered = scale > 1.35;

        const iconEl = (
          <div
            ref={(el) => { iconRefs.current[i] = el; }}
            className="relative flex flex-col items-center justify-end cursor-pointer"
            style={{
              transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: `translateY(${-(scale - 1) * 18}px) scale(${scale})`,
              transformOrigin: 'bottom center',
              zIndex: isHovered ? 10 : 1,
            }}
          >
            {/* Tooltip label */}
            <span
              className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none
                bg-[hsl(210,30%,15%)] text-white dark:bg-[hsl(200,20%,85%)] dark:text-[hsl(210,50%,15%)]
                shadow-lg"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: `scale(${isHovered ? 1 / scale : 0.8})`,
                transition: 'opacity 0.12s ease, transform 0.12s ease',
              }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45
                bg-[hsl(210,30%,15%)] dark:bg-[hsl(200,20%,85%)]" />
            </span>

            {/* Icon box */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center
                bg-[hsl(200,60%,92%)] border border-[hsl(200,50%,80%)] shadow-md
                dark:bg-[hsl(210,40%,16%)] dark:border-[hsl(200,35%,28%)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                transition-colors duration-150"
            >
              <item.icon className="w-5 h-5 text-[hsl(210,60%,30%)] dark:text-[hsl(200,50%,72%)]" />
            </div>
          </div>
        );

        return item.to ? (
          <Link key={item.label} to={item.to} className="no-underline">
            {iconEl}
          </Link>
        ) : (
          <div key={item.label}>{iconEl}</div>
        );
      })}
    </div>
  );
};

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const { logoUrl: footerLogoUrl } = useBrandingLogo('footerLogo');

  const currentText = language === "en" ? {
    company: "Astra Villa",
    allRights: "All rights reserved.",
    home: "Home", buy: "Buy", rent: "Rent", community: "Community",
    propertySearch: "Property Search", consultation: "Consultation",
    valuation: "Property Valuation", investment: "Investment Advisory",
    help: "Help Center", faq: "FAQ", contactUs: "Contact Us",
  } : {
    company: "Astra Villa",
    allRights: "Semua hak dilindungi.",
    home: "Beranda", buy: "Beli", rent: "Sewa", community: "Komunitas",
    propertySearch: "Pencarian Properti", consultation: "Konsultasi",
    valuation: "Valuasi Properti", investment: "Konsultan Investasi",
    help: "Pusat Bantuan", faq: "FAQ", contactUs: "Hubungi Kami",
  };

  const allDockItems: DockItem[] = [
    { to: "/", label: currentText.home, icon: Home },
    { to: "/dijual", label: currentText.buy, icon: ShoppingCart },
    { to: "/disewa", label: currentText.rent, icon: Key },
    { to: "/vr-tour", label: language === "en" ? "VR Tour" : "Tur VR", icon: Glasses },
    { to: "/location", label: language === "en" ? "Location Map" : "Peta Lokasi", icon: MapPin },
    { to: "/community", label: currentText.community, icon: UsersRound },
    { to: "/agents", label: language === "en" ? "Find Agents" : "Cari Agen", icon: UserCheck },
    { to: "/development", label: language === "en" ? "Development" : "Pengembangan", icon: Construction },
    { label: currentText.propertySearch, icon: Search },
    { label: currentText.consultation, icon: MessageSquare },
    { label: currentText.valuation, icon: Calculator },
    { label: currentText.investment, icon: PiggyBank },
    { label: currentText.help, icon: HelpCircle },
    { label: currentText.faq, icon: CircleHelp },
    { label: currentText.contactUs, icon: PhoneCall },
  ];

  const socialIcons = [
    { icon: '𝕏', label: 'Twitter' },
    { icon: 'ⓕ', label: 'Facebook' },
    { icon: <Instagram className="w-4 h-4" />, label: 'Instagram' },
    { icon: <Youtube className="w-4 h-4" />, label: 'YouTube' },
  ];

  return (
    <footer
      className="w-full border-t backdrop-blur-xl px-4 md:px-8 py-6 transition-colors duration-200
        border-[hsl(200,60%,75%)] bg-gradient-to-br from-[hsl(200,85%,72%)] via-[hsl(200,90%,80%)] to-[hsl(195,80%,68%)]
        dark:border-[hsl(210,40%,20%)] dark:from-[hsl(210,55%,8%)] dark:via-[hsl(200,50%,10%)] dark:to-[hsl(210,45%,6%)]
        shadow-[0_-8px_30px_-10px_hsl(200,70%,50%/0.25)] dark:shadow-[0_-10px_40px_-15px_rgba(0,10,20,0.5)]"
    >
      {/* Logo - centered top */}
      <div className="flex justify-center mb-4">
        <div className="opacity-70 mix-blend-luminosity dark:mix-blend-screen dark:opacity-60">
          <AnimatedLogo src={footerLogoUrl} size="lg" />
        </div>
      </div>

      {/* Row 2: macOS Dock - centered */}
      <div className="flex justify-center mb-4">
        <Dock items={allDockItems} />
      </div>

      {/* Row 3: Social + Copyright - centered */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          {socialIcons.map((s, i) => (
            <a
              key={i}
              href="#"
              className="hover:scale-110 transition-transform inline-flex items-center justify-center w-8 h-8 rounded-full shadow-sm
                bg-[hsl(200,60%,90%)] border border-[hsl(200,50%,70%)] text-[hsl(210,50%,25%)]
                dark:bg-[hsl(210,40%,15%)] dark:border-[hsl(200,40%,30%)] dark:text-[hsl(200,30%,70%)]"
              aria-label={s.label}
            >
              {s.icon}
            </a>
          ))}
          <span className="text-xs text-[hsl(210,40%,30%)] dark:text-[hsl(200,20%,60%)]">@astravilla</span>
        </div>

        <span className="text-[hsl(200,40%,55%)] dark:text-[hsl(200,40%,30%)]">|</span>

        <span className="text-xs font-medium text-[hsl(210,40%,30%)] dark:text-[hsl(200,20%,60%)]">
          © {new Date().getFullYear()} {currentText.company}. {currentText.allRights}
        </span>

        <span className="text-xs text-[hsl(200,70%,40%)] dark:text-[hsl(200,60%,45%)]">✦ Astra Villa ✦</span>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full
                bg-[hsl(200,60%,60%/0.4)] dark:bg-[hsl(200,60%,50%/0.4)]
                shadow-[inset_0_1px_3px_hsl(200,60%,80%/0.5)]"
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
