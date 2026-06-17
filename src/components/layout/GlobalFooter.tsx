import { Link } from "react-router-dom";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

/**
 * ASTRA Design System V3 — Global Footer
 *
 * Unified footer rendered on every route. Themed via design tokens
 * (background / foreground / primary) so it adapts to both
 * ASTRA Black Gold and ASTRA Pearl White automatically.
 */
const FOOTER_LINKS = [
  {
    heading: "Marketplace",
    items: [
      { label: "Buy", to: "/buy" },
      { label: "Rent", to: "/rent" },
      { label: "New Projects", to: "/projects" },
      { label: "Luxury", to: "/luxury" },
      { label: "Locations", to: "/locations" },
    ],
  },
  {
    heading: "Invest",
    items: [
      { label: "Opportunities", to: "/investment-opportunities" },
      { label: "Investment Intelligence", to: "/investment-intelligence" },
      { label: "Fractional", to: "/fractional-investment" },
      { label: "Market Heatmap", to: "/market-heatmap" },
    ],
  },
  {
    heading: "Platform",
    items: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "AI Center", to: "/ai-center" },
      { label: "Vendor Marketplace", to: "/vendor-marketplace" },
      { label: "Sell", to: "/sell" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Legal", to: "/legal" },
      { label: "Privacy", to: "/privacy" },
    ],
  },
];

export default function GlobalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background text-foreground mt-auto">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src="/astra-logo.png"
                alt="ASTRA Villa"
                className="h-9 w-9 rounded-full object-contain shadow-sm bg-primary/10"
              />
              <span className="font-bold text-lg tracking-tight">
                ASTRA <span className="text-primary">Villa</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mt-3 max-w-xs leading-relaxed">
              The AI-powered Real Estate Operating System for premium property
              discovery, investment and management.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <SocialIcon href="https://instagram.com" icon={Instagram} label="Instagram" />
              <SocialIcon href="https://facebook.com" icon={Facebook} label="Facebook" />
              <SocialIcon href="https://twitter.com" icon={Twitter} label="Twitter" />
              <SocialIcon href="https://linkedin.com" icon={Linkedin} label="LinkedIn" />
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact strip */}
        <div className="mt-10 pt-6 border-t border-border/40 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Jakarta · Bali · Lombok
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <a href="mailto:hello@astravilla.com" className="hover:text-foreground">
              hello@astravilla.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <a href="tel:+622112345678" className="hover:text-foreground">
              +62 21 1234 5678
            </a>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-border/40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <p>© {year} ASTRA Villa · Property Operating System</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="h-8 w-8 rounded-lg border border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
    >
      <Icon className="h-3.5 w-3.5" />
    </a>
  );
}
