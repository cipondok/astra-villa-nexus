import { Link, NavLink, Outlet } from "react-router-dom";
import { useT } from "@/i18n/LangProvider";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, defaultInquiryMessage } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export default function SiteLayout() {
  const { t, locale, setLocale } = useT();

  const navLinks = [
    { to: "/", label: t("nav.home"), end: true },
    { to: "/villas", label: t("nav.villas") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="container-prose flex items-center justify-between h-16">
          <Link to="/" className="font-serif text-xl font-semibold tracking-tight">
            {SITE.name}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocale(locale === "id" ? "en" : "id")}
              className="text-xs font-medium px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors"
              aria-label="Toggle language"
            >
              {locale === "id" ? "EN" : "ID"}
            </button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href={buildWhatsAppUrl(defaultInquiryMessage())} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="md:hidden border-t border-border bg-background">
          <div className="container-prose flex items-center justify-around h-12">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `text-xs transition-colors ${
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card mt-16">
        <div className="container-prose py-10 grid gap-6 md:grid-cols-3 text-sm">
          <div>
            <div className="font-serif text-lg font-semibold">{SITE.name}</div>
            <p className="text-muted-foreground mt-2">{t("footer.tagline")}</p>
          </div>
          <div>
            <div className="font-medium mb-2">Navigation</div>
            <ul className="space-y-1 text-muted-foreground">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-foreground">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">Contact</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <a href={buildWhatsAppUrl(defaultInquiryMessage())} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  WhatsApp: +{SITE.whatsappNumber}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.contactEmail}`} className="hover:text-foreground">{SITE.contactEmail}</a>
              </li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </footer>

      {/* Floating WhatsApp on mobile */}
      <a
        href={buildWhatsAppUrl(defaultInquiryMessage())}
        target="_blank"
        rel="noopener noreferrer"
        className="sm:hidden fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
