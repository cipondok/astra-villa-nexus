import { Link } from "react-router-dom";
import { Instagram, Youtube, Home, ShoppingCart, Key, UsersRound, Search, MessageSquare, Calculator, PiggyBank, PhoneCall, MapPin, Glasses, UserCheck, Facebook, Twitter, Music2 } from "lucide-react";
import { useSocialMediaSettings } from "@/hooks/useSocialMediaSettings";

interface ProfessionalFooterProps {
  language: string;
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const { settings } = useSocialMediaSettings();

  const t = language === "en" ? {
    company: "Astra Villa",
    home: "Home", buy: "Buy", rent: "Rent", vr: "VR Tour", map: "Map",
    community: "Community", agents: "Agents", search: "Search",
    consult: "Consult", valuation: "Valuation", invest: "Invest",
    faq: "FAQ", contact: "Contact",
  } : {
    company: "Astra Villa",
    home: "Beranda", buy: "Beli", rent: "Sewa", vr: "VR", map: "Peta",
    community: "Komunitas", agents: "Agen", search: "Cari",
    consult: "Konsultasi", valuation: "Valuasi", invest: "Investasi",
    faq: "FAQ", contact: "Kontak",
  };

  const links = [
    { to: "/", label: t.home, icon: Home },
    { to: "/dijual", label: t.buy, icon: ShoppingCart },
    { to: "/disewa", label: t.rent, icon: Key },
    { to: "/vr-tour", label: t.vr, icon: Glasses },
    { to: "/location", label: t.map, icon: MapPin },
    { to: "/community", label: t.community, icon: UsersRound },
    { to: "/agents", label: t.agents, icon: UserCheck },
    { to: "/search", label: t.search, icon: Search },
    { to: "/consultation", label: t.consult, icon: MessageSquare },
    { to: "/valuation", label: t.valuation, icon: Calculator },
    { to: "/investment", label: t.invest, icon: PiggyBank },
    { to: "/faq", label: t.faq, icon: PhoneCall },
    { to: "/contact", label: t.contact, icon: PhoneCall },
  ];

  const socialLinks = [
    { url: settings.facebookUrl, icon: <Facebook className="w-3 h-3" />, label: 'Facebook' },
    { url: settings.twitterUrl, icon: <Twitter className="w-3 h-3" />, label: 'X' },
    { url: settings.instagramUrl, icon: <Instagram className="w-3 h-3" />, label: 'Instagram' },
    { url: settings.tiktokUrl, icon: <Music2 className="w-3 h-3" />, label: 'TikTok' },
    { url: settings.youtubeUrl, icon: <Youtube className="w-3 h-3" />, label: 'YouTube' },
    { url: settings.whatsappNumber, icon: <span className="text-[10px] font-bold">W</span>, label: 'WhatsApp', isPhone: true },
  ].filter(l => l.url);

  const getSocialHref = (link: typeof socialLinks[0]) => {
    if (!link.url) return '#';
    if ((link as any).isPhone) return `https://wa.me/${link.url.replace(/\D/g, '')}`;
    return link.url.startsWith('http') ? link.url : `https://${link.url}`;
  };

  return (
    <footer className="w-full border-t border-border/20 bg-card/80 backdrop-blur-md px-3 py-1.5">
      {/* Links row */}
      <div className="flex items-center justify-center gap-0.5 flex-wrap mb-1">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium text-muted-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <item.icon className="w-2.5 h-2.5" />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Social + Copyright */}
      <div className="flex items-center justify-center gap-2 text-center">
        {socialLinks.length > 0 && (
          <div className="flex items-center gap-0.5">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={getSocialHref(s)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-muted-foreground/50 hover:text-primary hover:scale-110 transition-all"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        )}
        <span className="text-[9px] text-muted-foreground/50">
          © {new Date().getFullYear()} {t.company}
        </span>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
