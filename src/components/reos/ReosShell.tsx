import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Bell, Globe, Heart, Sparkles, ChevronDown, ChevronRight,
  LayoutDashboard, Building2, TrendingUp, Banknote, Scale, Wrench,
  Store, Cpu, MoreHorizontal, Eye, BookmarkPlus, Wallet, MessageSquare,
  ArrowLeftRight, Calendar, FileText, LifeBuoy, Shield, BarChart3,
  Sliders, CheckCircle2, Sun, Moon, Menu, LogOut, User, X, Home, Plus,
  Brain, PiggyBank, ShoppingCart, KeyRound, Tag, UsersRound, Briefcase,
  Mail, Phone, Newspaper, BookOpen, ScrollText, Lock, Cookie, Gavel, HelpCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { ReosAuthModal } from "@/components/auth/ReosAuthModal";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";
import { useUserRoles } from "@/hooks/useUserRoles";
import { resolveDashboardPath } from "@/lib/dashboardRoute";

/* ============================================================
   ReosShell — Shared "Bloomberg Terminal" Black/Gold layout
   Provides theme tokens, sticky header, and footer used across
   the marketing surfaces (home, properties, etc.)
   ============================================================ */

export const reosTokens = `
  .reos {
    --bg: #0B0B0C;
    --bg-2: #0F0F11;
    --surface: #121214;
    --surface-2: #17171A;
    --line: rgba(200,169,106,0.14);
    --line-strong: rgba(200,169,106,0.32);
    --gold: #C8A96A;
    --gold-2: #E0C384;
    --gold-soft: rgba(200,169,106,0.10);
    --text: #F4F1EA;
    --text-2: #9A958A;
    --text-3: #6B6760;
    --success: #4ADE80;
    --danger: #F87171;
    --gold-fg: #161208;
    --promo-gradient: linear-gradient(180deg, #1a1408, #0e0a04);
    --hero-overlay: linear-gradient(110deg, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.55) 55%, transparent 100%);
    --shadow-soft: 0 8px 32px rgba(0,0,0,0.35);
    --shadow-lift: 0 4px 16px rgba(0,0,0,0.25);
    --shadow-popover: 0 25px 50px -12px rgba(0,0,0,0.5);
    color: var(--text);
    background: var(--bg);
    font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
    letter-spacing: -0.005em;
  }
  html:not(.dark) .reos {
    /* ASTRA Villa REOS — Luxury Light (Bloomberg × Apple × Private Banking) */
    --bg: #F7F5F0;
    --bg-2: #FCFCFC;
    --surface: #FFFFFF;
    --surface-2: #FCFCFC;
    --line: #E5E7EB;
    --line-strong: rgba(212,175,55,0.34);
    --gold: #D4AF37;
    --gold-2: #B8941F;
    --gold-soft: rgba(212,175,55,0.10);
    --text: #111827;
    --text-2: #6B7280;
    --text-3: #9CA3AF;
    --success: #22C55E;
    --danger: #EF4444;
    --gold-fg: #111827;
    --shadow-soft: 0 8px 30px rgba(0,0,0,0.06);
    --shadow-lift: 0 4px 14px rgba(0,0,0,0.05);
    --shadow-popover: 0 20px 40px -12px rgba(0,0,0,0.08);
  }
  .reos *::selection { background: var(--gold); color: #fff; }
  .reos-card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; }
  .reos-card-2 { background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; }
  .reos-gold { color: var(--gold-2); }
  .reos-cta { background: linear-gradient(180deg, var(--gold-2), var(--gold)); color: var(--gold-fg); font-weight: 600; border: 1px solid var(--line-strong); }
  .reos-cta:hover { filter: brightness(1.06); }
  .reos-outline { border: 1px solid var(--line-strong); }
  .reos-chip { border: 1px solid var(--line); color: var(--text-2); }
  .reos-chip:hover { border-color: var(--line-strong); color: var(--text); }
  .reos-tab-active { color: var(--gold-2); }
  .reos-tab-active::after { content:''; position:absolute; left:50%; bottom:-10px; transform:translateX(-50%); width: 28px; height: 2px; background: var(--gold); border-radius: 2px; }
  .reos-divider { background-image: linear-gradient(90deg, transparent, var(--line-strong), transparent); height: 1px; }
  .reos-scrollbar::-webkit-scrollbar{width:6px;height:6px}
  .reos-scrollbar::-webkit-scrollbar-thumb{background:var(--line-strong);border-radius:3px}
`;

const topTabs = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Building2, label: "Properties", to: "/properties" },
  { icon: TrendingUp, label: "Investment", to: "/investment" },
  { icon: Banknote, label: "Finance", to: "/wallet" },
  { icon: Scale, label: "Legal", to: "/legal-services" },
  { icon: Wrench, label: "Management", to: "/agent-dashboard" },
  { icon: Store, label: "Vendors", to: "/services" },
  { icon: Cpu, label: "AI Center", to: "/ai-search" },
  { icon: MoreHorizontal, label: "More", to: "/search" },
];

const sideNav = [
  { icon: Eye, label: "Overview", to: "/" },
  { icon: BarChart3, label: "Market Intelligence", to: "/market-heatmap" },
  { icon: BookmarkPlus, label: "Watchlist", to: "/favorites" },
  { icon: Wallet, label: "My Portfolio", to: "/investment-performance" },
  { icon: MessageSquare, label: "Messages", to: "/messages", badge: 12 as number | undefined },
  { icon: ArrowLeftRight, label: "Transactions", to: "/wallet" },
  { icon: Calendar, label: "Calendar", to: "/profile" },
  { icon: FileText, label: "Documents", to: "/documents" },
  { icon: LifeBuoy, label: "Support Center", to: "/support" },
];

const banks = ["BCA", "Mandiri", "CIMB NIAGA", "HSBC", "DBS", "Maybank", "UOB", "OCBC NISP", "BNI", "BRI"];

export function ReosHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { logoUrl: headerLogo } = useBrandingLogo("headerLogo", "/astra-logo.png");
  const { data: userRoles = [] } = useUserRoles();
  const dashboardPath = resolveDashboardPath(userRoles);

  const [aiQuery, setAiQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authInitial, setAuthInitial] = useState<"login" | "register">("login");
  const [savedOpen, setSavedOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (langRef.current && !langRef.current.contains(t)) setLangOpen(false);
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (savedRef.current && !savedRef.current.contains(t)) setSavedOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const runSearch = () => {
    if (!aiQuery.trim()) return navigate("/search");
    navigate(`/search?q=${encodeURIComponent(aiQuery)}`);
  };

  const languages: { code: any; label: string; native: string }[] = [
    { code: "en", label: "EN", native: "English" },
    { code: "id", label: "ID", native: "Bahasa Indonesia" },
    { code: "zh", label: "ZH", native: "中文" },
    { code: "ja", label: "JA", native: "日本語" },
    { code: "ko", label: "KO", native: "한국어" },
    { code: "ru", label: "RU", native: "Русский" },
  ];

  const notifications = [
    { id: 1, title: "New villa match in Canggu", desc: "Villa Asteria · IDR 8.5B · 92 AI score", time: "2m", unread: true, to: "/properties" },
    { id: 2, title: "Price drop on your watchlist", desc: "Seminyak Cliff Estate · −5%", time: "1h", unread: true, to: "/favorites" },
    { id: 3, title: "Offer accepted", desc: "Your bid on Ubud Sanctuary was approved.", time: "3h", unread: true, to: "/investment-performance" },
    { id: 4, title: "Market report ready", desc: "Q2 Bali liquidity report is now available.", time: "1d", unread: false, to: "/investor-reports" },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const savedItems = [
    { id: 1, title: "Villa Asteria", desc: "Canggu · IDR 8.5B · 92 AI score", to: "/properties" },
    { id: 2, title: "Seminyak Cliff Estate", desc: "Seminyak · IDR 12B · Villa", to: "/properties" },
    { id: 3, title: "Ubud Sanctuary", desc: "Ubud · IDR 4.2B · Estate", to: "/properties" },
  ];
  const savedCount = savedItems.length;

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <>
      <header className={`reos-shell-header sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--line)] transition-shadow duration-300 ${scrolled ? "shadow-[var(--shadow-soft)]" : "shadow-[var(--shadow-lift)]"}`}>
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 h-full flex items-center gap-3 md:gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden h-10 w-10 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center"
          >
            <Menu className="h-5 w-5 text-[var(--text)]" />
          </button>

          <Link to="/" aria-label="ASTRA Villa home" className="flex items-center gap-2.5 shrink-0">
            <img src={headerLogo} alt="ASTRA Villa" className="h-9 w-9 rounded-full object-contain shadow-sm" />
            <div className="leading-none hidden sm:block">
              <div className="font-semibold tracking-[0.18em] text-[15px]">ASTRA<span className="reos-gold ml-1">VILLA</span></div>
              <div className="text-[9px] tracking-[0.28em] text-[var(--text-3)] mt-1">REAL ESTATE OPERATING SYSTEM</div>
            </div>
          </Link>

          <div className="flex-1 max-w-3xl mx-auto relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-2)]" />
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              placeholder="AI Search: Properties, Locations, ROI, Developers, Laws…"
              aria-label="Search"
              className="w-full h-11 pl-11 pr-12 rounded-xl bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--line-strong)] outline-none text-sm placeholder:text-[var(--text-2)] text-[var(--text)]"
            />
            <button
              type="button"
              onClick={() => navigate("/search-advanced")}
              aria-label="Advanced search"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md hover:bg-[var(--surface-2)] flex items-center justify-center"
            >
              <Sliders className="h-3.5 w-3.5 text-[var(--text-2)]" />
            </button>
          </div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0 ml-auto">
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => { setLangOpen(o => !o); setNotifOpen(false); setProfileOpen(false); }}
                className="h-9 px-3 rounded-lg inline-flex items-center gap-1.5 text-xs hover:bg-[var(--surface)] text-[var(--text-2)]"
                aria-haspopup="menu"
                aria-expanded={langOpen}
              >
                <Globe className="h-4 w-4" /> {language.toUpperCase()} <ChevronDown className="h-3 w-3" />
              </button>
              {langOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-56 reos-card p-1 z-50 shadow-[var(--shadow-popover)]">
                  <div className="px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--text-3)]">Language</div>
                  {languages.map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] flex items-center justify-between gap-2 ${language === l.code ? "reos-gold" : "text-[var(--text)]"}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] font-bold w-7 text-[var(--text-2)]">{l.label}</span>
                        <span>{l.native}</span>
                      </span>
                      {language === l.code && <CheckCircle2 className="h-3.5 w-3.5 reos-gold" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-[var(--text-2)]" /> : <Moon className="h-4 w-4 text-[var(--text-2)]" />}
            </button>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => { setNotifOpen(o => !o); setLangOpen(false); setProfileOpen(false); }}
                aria-label="Notifications"
                aria-haspopup="menu"
                aria-expanded={notifOpen}
                className="h-9 w-9 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center relative"
              >
                <Bell className="h-4 w-4 text-[var(--text-2)]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-[var(--gold)] text-[10px] text-[var(--gold-fg)] font-bold flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-[340px] reos-card p-0 z-50 shadow-[var(--shadow-popover)] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
                    <div className="text-[12.5px] font-semibold text-[var(--text)]">Notifications</div>
                    <span className="text-[10px] uppercase tracking-[0.18em] reos-gold">{unreadCount} new</span>
                  </div>
                  <div className="max-h-[340px] overflow-y-auto reos-scrollbar">
                    {notifications.map(n => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => { setNotifOpen(false); navigate(n.to); }}
                        className="w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-[var(--surface-2)] border-b border-[var(--line)] last:border-b-0 transition-colors"
                      >
                        <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.unread ? "bg-[var(--gold)]" : "bg-[var(--text-3)]/40"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[12.5px] font-medium text-[var(--text)] truncate">{n.title}</div>
                            <div className="text-[10px] text-[var(--text-3)] shrink-0">{n.time}</div>
                          </div>
                          <div className="text-[11.5px] text-[var(--text-2)] mt-0.5 line-clamp-2">{n.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setNotifOpen(false); navigate("/notifications"); }}
                    className="w-full text-[12px] text-center py-3 reos-gold hover:bg-[var(--surface-2)] border-t border-[var(--line)]"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
            <div className="relative" ref={savedRef}>
              <button
                type="button"
                onClick={() => { setSavedOpen(o => !o); setLangOpen(false); setNotifOpen(false); setProfileOpen(false); }}
                aria-label="Saved"
                aria-haspopup="menu"
                aria-expanded={savedOpen}
                className="h-9 w-9 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center relative"
              >
                <Heart className="h-4 w-4 text-[var(--text-2)]" />
                {savedCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-[var(--gold)] text-[10px] text-[var(--gold-fg)] font-bold flex items-center justify-center">{savedCount}</span>
                )}
              </button>
              {savedOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-[320px] reos-card p-0 z-50 shadow-[var(--shadow-popover)] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
                    <div className="text-[12.5px] font-semibold text-[var(--text)]">Saved</div>
                    <span className="text-[10px] uppercase tracking-[0.18em] reos-gold">{savedCount} items</span>
                  </div>
                  <div className="max-h-[340px] overflow-y-auto reos-scrollbar">
                    {savedItems.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSavedOpen(false); navigate(s.to); }}
                        className="w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-[var(--surface-2)] border-b border-[var(--line)] last:border-b-0 transition-colors"
                      >
                        <Heart className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-medium text-[var(--text)] truncate">{s.title}</div>
                          <div className="text-[11.5px] text-[var(--text-2)] mt-0.5 line-clamp-2">{s.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSavedOpen(false); navigate("/favorites"); }}
                    className="w-full text-[12px] text-center py-3 reos-gold hover:bg-[var(--surface-2)] border-t border-[var(--line)]"
                  >
                    View all saved
                  </button>
                </div>
              )}
            </div>


            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(o => !o)}
                  className="h-9 pl-1.5 pr-3 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center gap-2 hover:border-[var(--line-strong)]"
                >
                  <div className="h-7 w-7 rounded-full reos-cta flex items-center justify-center text-[11px] font-bold">
                    {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-none hidden md:block">
                    <div className="text-[12px] font-medium truncate max-w-[120px] text-left text-[var(--text)]">{profile?.full_name || user.email}</div>
                    <div className="text-[9px] reos-gold mt-0.5 text-left">Premium Investor</div>
                  </div>
                  <ChevronDown className="h-3 w-3 text-[var(--text-2)]" />
                </button>
                {profileOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-48 reos-card p-1 z-50 shadow-[var(--shadow-popover)]">
                    <button type="button" onClick={() => { setProfileOpen(false); navigate(dashboardPath); }} className="w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2 text-[var(--text)]"><LayoutDashboard className="h-3.5 w-3.5" /> Dashboard</button>
                    <button type="button" onClick={() => { setProfileOpen(false); navigate("/profile"); }} className="w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2 text-[var(--text)]"><User className="h-3.5 w-3.5" /> My Profile</button>
                    <button type="button" onClick={() => { setProfileOpen(false); navigate("/wallet"); }} className="w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2 text-[var(--text)]"><Wallet className="h-3.5 w-3.5" /> Wallet</button>
                    <button type="button" onClick={() => { setProfileOpen(false); navigate("/favorites"); }} className="w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2 text-[var(--text)]"><Heart className="h-3.5 w-3.5" /> Saved</button>
                    <div className="reos-divider my-1" />
                    <button type="button" onClick={async () => { setProfileOpen(false); await signOut(); }} className="w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] text-[var(--danger)] inline-flex items-center gap-2"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button type="button" onClick={() => { setAuthInitial("login"); setShowAuth(true); }} className="h-9 px-4 rounded-lg text-[12.5px] hover:bg-[var(--surface)] text-[var(--text)] transition">Sign in</button>
                <button type="button" onClick={() => { setAuthInitial("register"); setShowAuth(true); }} className="h-9 px-4 rounded-lg reos-cta text-[12.5px] inline-flex items-center gap-1.5">
                  Get Started <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--line)] bg-[var(--bg)]">
          <div className="mx-auto max-w-[1600px] px-6 h-[52px] flex items-center gap-8 overflow-x-auto reos-scrollbar">
            {topTabs.map(tab => {
              const active = isActive(tab.to);
              return (
                <Link
                  key={tab.label}
                  to={tab.to}
                  className={`relative inline-flex items-center gap-2 text-[13px] whitespace-nowrap transition-colors ${active ? "reos-tab-active font-medium" : "text-[var(--text-2)] hover:text-[var(--text)]"}`}
                >
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[82%] max-w-[320px] h-full overflow-y-auto reos-scrollbar border-r border-[var(--line-strong)] p-4"
              style={{ background: "var(--bg)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img src={headerLogo} alt="ASTRA Villa" className="h-8 w-8 rounded-full object-contain shadow-sm" />
                  <span className="font-semibold tracking-[0.18em] text-[14px]">ASTRA<span className="reos-gold ml-1">VILLA</span></span>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="h-9 w-9 rounded-md hover:bg-[var(--surface)] flex items-center justify-center"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-1">
                {topTabs.map(tab => {
                  const t = tab.label === "Dashboard" ? { ...tab, to: dashboardPath } : tab;
                  return (
                    <Link key={t.label} to={t.to} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                      <t.icon className="h-4 w-4" /> {t.label}
                    </Link>
                  );
                })}
                <div className="reos-divider my-3" />
                {sideNav.map(n => (
                  <Link key={n.label} to={n.to} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                    <n.icon className="h-4 w-4" /><span className="flex-1">{n.label}</span>
                    {n.badge && <span className="text-[10px] bg-[var(--gold)] text-[var(--gold-fg)] font-bold px-1.5 py-0.5 rounded">{n.badge}</span>}
                  </Link>
                ))}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <ReosAuthModal open={showAuth} onOpenChange={setShowAuth} initialMode={authInitial} />
    </>
  );
}

export function ReosFooter() {
  const footerLinks: { title: string; links: { label: string; to: string; icon: typeof Home }[] }[] = [
    {
      title: "Explore",
      links: [
        { label: "Home", to: "/", icon: Home },
        { label: "Properties", to: "/properties", icon: Building2 },
        { label: "Market Intelligence", to: "/market-intelligence", icon: BarChart3 },
        { label: "Wealth Advisor", to: "/wealth-advisor", icon: Brain },
        { label: "Investment Fund", to: "/investment", icon: PiggyBank },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Buy", to: "/properties?intent=buy", icon: ShoppingCart },
        { label: "Rent", to: "/properties?intent=rent", icon: KeyRound },
        { label: "Sell with Us", to: "/sell", icon: Tag },
        { label: "Agents", to: "/agents", icon: UsersRound },
        { label: "Vendors", to: "/vendors", icon: Store },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", to: "/about", icon: Briefcase },
        { label: "Contact", to: "/contact", icon: Mail },
        { label: "Careers", to: "/careers", icon: UsersRound },
        { label: "Press", to: "/press", icon: Newspaper },
        { label: "Blog", to: "/blog", icon: BookOpen },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", to: "/terms", icon: ScrollText },
        { label: "Privacy Policy", to: "/privacy", icon: Lock },
        { label: "Cookie Policy", to: "/cookies", icon: Cookie },
        { label: "Cookie Settings", to: "/cookie-preferences", icon: Cookie },
        { label: "Compliance", to: "/compliance", icon: Gavel },
        { label: "Help Center", to: "/help", icon: HelpCircle },
      ],
    },
  ];

  return (
    <footer className="mx-auto max-w-[1600px] px-6 pb-10 pt-4">
      <div className="reos-card p-5">
        <div className="flex items-center flex-wrap gap-5 justify-between">
          <div className="text-[12px] text-[var(--text-2)]">Trusted By Thousands</div>
          <div className="flex items-center flex-wrap gap-x-7 gap-y-2">
            {banks.map(b => (
              <span key={b} className="text-[12px] font-bold tracking-wider text-[var(--text-2)]/70 hover:text-[var(--text)] transition">{b}</span>
            ))}
          </div>
          <div className="flex items-center gap-5 text-[11px]">
            {[
              { icon: CheckCircle2, label: "Verified Properties", sub: "100% Verified" },
              { icon: Shield, label: "Secure Transactions", sub: "Bank-Level Security" },
              { icon: LifeBuoy, label: "Expert Support", sub: "24/7 Assistance" },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2">
                <t.icon className="h-4 w-4 reos-gold" />
                <div className="leading-tight">
                  <div className="text-[11px] font-medium text-[var(--text)]">{t.label}</div>
                  <div className="text-[9px] text-[var(--text-2)]">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sitemap weblinks */}
      <div className="mt-4 reos-card p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {footerLinks.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] reos-gold mb-3">
                {col.title}
              </div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="group flex items-center gap-2 text-[12px] text-[var(--text-2)] hover:text-[var(--text)] transition"
                    >
                      <l.icon className="h-3.5 w-3.5 text-[var(--gold)] group-hover:text-[var(--gold-2)] transition shrink-0" />
                      <span>{l.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-[11px] text-[var(--text-3)] py-6">
        © {new Date().getFullYear()} ASTRA Villa REOS · Built for ASEAN · Enterprise-grade
      </div>
    </footer>
  );
}

interface ReosShellProps {
  children: ReactNode;
  className?: string;
}

export default function ReosShell({ children, className = "" }: ReosShellProps) {
  useEffect(() => {
    document.documentElement.setAttribute("data-reos-theme", "on");
    return () => document.documentElement.removeAttribute("data-reos-theme");
  }, []);

  // ReosHeader + ReosFooter are rendered globally in App.tsx so every page
  // shares the exact same chrome. ReosShell only ensures the .reos tokens are
  // applied to its subtree (safe to nest when global layout already supplies them).
  return (
    <>
      <style>{reosTokens}</style>
      <div className={`reos flex-1 flex flex-col ${className}`}>
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}
