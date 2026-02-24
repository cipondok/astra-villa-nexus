import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Home, ShoppingCart, Key, UsersRound, Construction, Search, MessageSquare, Calculator, PiggyBank, HelpCircle, PhoneCall, MapPin, Glasses, UserCheck, Facebook, Twitter, Music2 } from "lucide-react";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";
import { useSocialMediaSettings } from "@/hooks/useSocialMediaSettings";

interface ProfessionalFooterProps {
  language: "en" | "id" | "zh" | "ja" | "ko";
}

interface DockItem {
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  to?: string;
}

/**
 * macOS-style Dock with proximity magnification.
 */
const Dock = ({ items }: { items: DockItem[] }) => {
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scales, setScales] = useState<number[]>(() => items.map(() => 1));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const animFrame = useRef<number>(0);
  const mouseXRef = useRef<number | null>(null);

  const MAX_DISTANCE = 80;
  const MAX_SCALE = 1.35;

  const computeScales = useCallback(() => {
    const mx = mouseXRef.current;
    let closestIdx = -1;
    let closestDist = Infinity;
    const newScales = items.map((_, i) => {
      const el = iconRefs.current[i];
      if (mx === null || !el) return 1;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(mx - center);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
      if (dist > MAX_DISTANCE) return 1;
      return 1 + (MAX_SCALE - 1) * (0.5 + 0.5 * Math.cos((Math.PI * dist) / MAX_DISTANCE));
    });
    setScales(newScales);
    setHoveredIndex(closestDist <= MAX_DISTANCE ? closestIdx : null);
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
    setHoveredIndex(null);
  }, [items.length]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  return (
    <div
      ref={dockRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-end gap-1.5 md:gap-2.5 px-3 md:px-5 py-2.5 pt-7 md:pt-9 rounded-2xl
        overflow-x-auto overflow-y-visible md:overflow-visible md:justify-center
        scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-xl
        shadow-sm"
    >
      {items.map((item, i) => {
        const scale = scales[i] ?? 1;
        const isHovered = hoveredIndex === i;

        const iconEl = (
          <div
            ref={(el) => { iconRefs.current[i] = el; }}
            className="relative flex flex-col items-center justify-end cursor-pointer"
            style={{
              transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: `translateY(${-(scale - 1) * 12}px) scale(${scale})`,
              transformOrigin: 'bottom center',
              zIndex: isHovered ? 10 : 1,
            }}
          >
            {/* Tooltip label */}
            <span
              className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap pointer-events-none z-50
                bg-foreground text-background shadow-lg"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: `scale(${isHovered ? 1 / scale : 0.8})`,
                transition: 'opacity 0.12s ease, transform 0.12s ease',
              }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-foreground" />
            </span>

            {/* Icon box */}
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0
                bg-primary-foreground/8 border border-primary-foreground/10 shadow-sm
                hover:bg-gold-primary/10 hover:border-gold-primary/30
                transition-colors duration-150"
            >
              <item.icon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-gold-primary" />
            </div>
          </div>
        );

        return item.to ? (
          <Link key={item.label} to={item.to} className="no-underline group">
            {iconEl}
          </Link>
        ) : (
          <div key={item.label} className="group">{iconEl}</div>
        );
      })}
    </div>
  );
};

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const { logoUrl: footerLogoUrl } = useBrandingLogo('footerLogo');
  const { settings } = useSocialMediaSettings();

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
    { to: "/search", label: currentText.propertySearch, icon: Search },
    { to: "/consultation", label: currentText.consultation, icon: MessageSquare },
    { to: "/valuation", label: currentText.valuation, icon: Calculator },
    { to: "/investment", label: currentText.investment, icon: PiggyBank },
    { to: "/faq", label: currentText.faq, icon: HelpCircle },
    { to: "/contact", label: currentText.contactUs, icon: PhoneCall },
  ];

  const allSocialLinks = [
    { url: settings.facebookUrl, icon: <Facebook className="w-4 h-4" />, label: 'Facebook' },
    { url: settings.twitterUrl, icon: <Twitter className="w-4 h-4" />, label: 'Twitter / X' },
    { url: settings.instagramUrl, icon: <Instagram className="w-4 h-4" />, label: 'Instagram' },
    { url: settings.tiktokUrl, icon: <Music2 className="w-4 h-4" />, label: 'TikTok' },
    { url: settings.youtubeUrl, icon: <Youtube className="w-4 h-4" />, label: 'YouTube' },
    { url: settings.whatsappNumber, icon: <span className="text-sm font-bold">W</span>, label: 'WhatsApp', isPhone: true },
  ].filter(l => l.url);

  const getSocialHref = (link: typeof allSocialLinks[0]) => {
    if (!link.url) return '#';
    if ((link as any).isPhone) return `https://wa.me/${link.url.replace(/\D/g, '')}`;
    return link.url.startsWith('http') ? link.url : `https://${link.url}`;
  };

  return (
    <footer
      className="w-full border-t border-gold-primary/15 backdrop-blur-xl px-4 md:px-8 py-6 transition-colors duration-200
        bg-card/95 shadow-[0_-4px_20px_hsl(var(--gold-primary)/0.05)]"
      style={{ contain: 'layout', minHeight: '120px' }}
    >
      {/* Logo + Dock */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-5">
        <div className="flex-shrink-0 opacity-60 hidden md:block">
          <AnimatedLogo src={footerLogoUrl} size="lg" />
        </div>
        <div className="w-full md:flex-1 flex justify-center">
          <Dock items={allDockItems} />
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md mx-auto h-px bg-gradient-to-r from-transparent via-gold-primary/20 to-transparent mb-4" />

      {/* Social + Copyright */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
        {allSocialLinks.length > 0 && (
          <div className="flex items-center gap-1.5">
            {allSocialLinks.map((s, i) => (
              <a
                key={i}
                href={getSocialHref(s)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full
                  bg-primary-foreground/8 border border-primary-foreground/10 text-muted-foreground
                  hover:bg-gold-primary/10 hover:border-gold-primary/30 hover:text-gold-primary
                  hover:scale-110 transition-all duration-200"
                aria-label={s.label}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        )}

        <span className="hidden sm:inline text-border">|</span>

        <span className="text-xs font-medium text-muted-foreground">
          © {new Date().getFullYear()} {currentText.company}. {currentText.allRights}
        </span>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
