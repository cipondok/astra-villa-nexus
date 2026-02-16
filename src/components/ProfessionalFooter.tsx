import { useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Handshake, ChevronDown, Home, ShoppingCart, Key, UsersRound, Construction, Search, MessageSquare, Calculator, PiggyBank, HelpCircle, CircleHelp, PhoneCall, Shield, FileText, Cookie, MapPin, Glasses, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const { logoUrl: footerLogoUrl } = useBrandingLogo('footerLogo');

  const text = {
    en: {
      company: "Astra Villa",
      tagline: "Your trusted real estate partner",
      allRights: "All rights reserved.",
      home: "Home",
      buy: "Buy",
      rent: "Rent",
      community: "Community",
      propertySearch: "Property Search",
      consultation: "Consultation",
      valuation: "Property Valuation",
      investment: "Investment Advisory",
      help: "Help Center",
      faq: "FAQ",
      contactUs: "Contact Us",
    },
    id: {
      company: "Astra Villa",
      tagline: "Mitra real estate terpercaya Anda",
      allRights: "Semua hak dilindungi.",
      home: "Beranda",
      buy: "Beli",
      rent: "Sewa",
      community: "Komunitas",
      propertySearch: "Pencarian Properti",
      consultation: "Konsultasi",
      valuation: "Valuasi Properti",
      investment: "Konsultan Investasi",
      help: "Pusat Bantuan",
      faq: "FAQ",
      contactUs: "Hubungi Kami",
    },
  };

  const currentText = text[language];

  const quickLinks = [
    { to: "/", label: currentText.home, icon: Home },
    { to: "/dijual", label: currentText.buy, icon: ShoppingCart },
    { to: "/disewa", label: currentText.rent, icon: Key },
    { to: "/vr-tour", label: language === "en" ? "VR Tour" : "Tur VR", icon: Glasses },
    { to: "/location", label: language === "en" ? "Location Map" : "Peta Lokasi", icon: MapPin },
    { to: "/community", label: currentText.community, icon: UsersRound },
    { to: "/agents", label: language === "en" ? "Find Agents" : "Cari Agen", icon: UserCheck },
    { to: "/development", label: language === "en" ? "Development" : "Pengembangan", icon: Construction },
  ];

  const serviceLinks = [
    { label: currentText.propertySearch, icon: Search },
    { label: currentText.consultation, icon: MessageSquare },
    { label: currentText.valuation, icon: Calculator },
    { label: currentText.investment, icon: PiggyBank },
  ];

  const supportLinks = [
    { label: currentText.help, icon: HelpCircle },
    { label: currentText.faq, icon: CircleHelp },
    { label: currentText.contactUs, icon: PhoneCall },
  ];

  const socialIcons = [
    { icon: '𝕏', label: 'Twitter' },
    { icon: 'ⓕ', label: 'Facebook' },
    { icon: <Instagram className="w-5 h-5" />, label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, label: 'YouTube' },
  ];

  return (
    <footer
      className="w-full border-t backdrop-blur-xl px-4 md:px-8 py-5 transition-colors duration-200
        border-[hsl(200,60%,75%)] bg-gradient-to-br from-[hsl(200,85%,72%)] via-[hsl(200,90%,80%)] to-[hsl(195,80%,68%)]
        dark:border-[hsl(210,40%,20%)] dark:bg-gradient-to-br dark:from-[hsl(210,55%,8%)] dark:via-[hsl(200,50%,10%)] dark:to-[hsl(210,45%,6%)]
        shadow-[0_-8px_30px_-10px_hsl(200,70%,50%/0.25)] dark:shadow-[0_-10px_40px_-15px_rgba(0,10,20,0.5)]"
    >
      {/* Row 1: Logo left + Links right */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        {/* Logo - left aligned */}
        <div className="flex items-center gap-3 mr-auto">
          <AnimatedLogo src={footerLogoUrl} size="lg" />
        </div>

        {/* Links */}
        {quickLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="relative group hover:opacity-70 inline-flex items-center justify-center transition-colors
              text-[hsl(210,50%,20%)] hover:text-[hsl(210,80%,30%)]
              dark:text-[hsl(200,30%,70%)] dark:hover:text-[hsl(200,80%,70%)]"
            title={link.label}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </Link>
        ))}

        <span className="text-[hsl(200,40%,55%)] dark:text-[hsl(200,40%,30%)]">|</span>

        {serviceLinks.map(link => (
          <span
            key={link.label}
            className="relative group cursor-pointer hover:opacity-70 inline-flex items-center justify-center transition-colors
              text-[hsl(210,50%,20%)] hover:text-[hsl(210,80%,30%)]
              dark:text-[hsl(200,30%,70%)] dark:hover:text-[hsl(200,80%,70%)]"
            title={link.label}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </span>
        ))}

        <span className="text-[hsl(200,40%,55%)] dark:text-[hsl(200,40%,30%)]">|</span>

        {supportLinks.map(link => (
          <span
            key={link.label}
            className="relative group cursor-pointer hover:opacity-70 inline-flex items-center justify-center transition-colors
              text-[hsl(210,50%,20%)] hover:text-[hsl(210,80%,30%)]
              dark:text-[hsl(200,30%,70%)] dark:hover:text-[hsl(200,80%,70%)]"
            title={link.label}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </span>
        ))}
      </div>

      {/* Row 2: Social + Copyright */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          {socialIcons.map((s, i) => (
            <a
              key={i}
              href="#"
              className="hover:opacity-80 transition-opacity inline-flex items-center justify-center w-8 h-8 rounded-full shadow-sm
                bg-[hsl(200,60%,90%)] border border-[hsl(200,50%,70%)] text-[hsl(210,50%,25%)] hover:text-[hsl(210,80%,30%)]
                dark:bg-[hsl(210,40%,15%)] dark:border-[hsl(200,40%,30%)] dark:text-[hsl(200,30%,70%)] dark:hover:text-[hsl(200,80%,70%)]"
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
