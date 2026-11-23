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
import { canManageProperties, isManagementPath } from "@/lib/managementRoles";
import { resolveDashboardPath } from "@/lib/dashboardRoute";
import { useNotifications } from "@/contexts/NotificationContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useTranslation } from "@/i18n/useTranslation";
import { formatDistanceToNow } from "date-fns";



/* ============================================================
   ReosShell — Shared "Bloomberg Terminal" Black/Gold layout
   Provides theme tokens, sticky header, and footer used across
   the marketing surfaces (home, properties, etc.)
   ============================================================ */

/** Fired by the phone bottom bar ("Ecosystem") to open the sections menu. */
export const REOS_OPEN_MENU_EVENT = "reos:open-menu";

export const reosTokens = `
  .reos {
    /* ASTRA Villa REOS — Matte charcoal + satin champagne gold (approved emblem palette) */
    --bg: #30343A;            /* primary background — charcoal gray */
    --header: #2B3036;        /* header / sidebar */
    --bg-2: #363B42;          /* secondary / section */
    --surface: #3B4149;       /* card surface */
    --surface-2: #424851;     /* elevated / popover */
    --inset: #292E34;         /* inset fields */
    --line: rgba(255,255,255,0.08);          /* dividers */
    --line-gold: rgba(198,166,107,0.22);     /* restrained gold border */
    --line-strong: rgba(198,166,107,0.34);   /* selected / hover border */
    --gold: #C6A66B;          /* primary champagne */
    --gold-2: #C6A66B;        /* gold text */
    --gold-hover: #B99A62;    /* secondary muted gold */
    --gold-soft: rgba(198,166,107,0.07);
    --text: #F5F3EE;
    --text-2: #C2C0BA;
    --text-3: #96999D;
    --success: #4ADE80;
    --danger: #F87171;
    --gold-fg: #1F2328;
    --promo-gradient: linear-gradient(180deg, #363B42, #30343A);
    --promo-gradient-diag: linear-gradient(135deg, #363B42, #30343A);
    --hotspot-bg: #292E34;
    --hero-overlay: linear-gradient(110deg, rgba(43,48,54,0.92) 0%, rgba(43,48,54,0.6) 55%, transparent 100%);
    --hero-overlay-mobile: linear-gradient(180deg, transparent 72%, var(--bg) 100%), linear-gradient(90deg, rgba(43,48,54,0.95) 0%, rgba(43,48,54,0.80) 48%, rgba(43,48,54,0.30) 100%);
    --scrim: rgba(31,35,40,0.72);
    --hero-text: #F5F3EE;
    --hero-text-2: #B8B3A8;
    --shadow-soft: 0 8px 28px rgba(16,19,24,0.30);
    --shadow-lift: 0 4px 14px rgba(16,19,24,0.22);
    --shadow-popover: 0 20px 40px -12px rgba(16,19,24,0.45);
    color: var(--text);
    background: var(--bg);
    font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
    letter-spacing: -0.005em;
  }
  html:not(.dark) .reos {
    /* ASTRA Villa REOS — Warm pearl + muted champagne gold */
    --bg: #F5F3EE;
    --bg-2: #FCFBF8;
    --surface: #FCFBF8;
    --surface-2: #F8F6F1;
    --inset: #EFEBE3;
    --header: #FCFBF8;
    --line: #E0DBD2;
    --line-gold: rgba(198,166,107,0.32);
    --line-strong: rgba(160,128,72,0.45);
    --gold: #C6A66B;
    --gold-2: #846A3C;        /* deeper champagne for text on pearl (AA) */
    --gold-hover: #B99A62;
    --gold-soft: rgba(198,166,107,0.10);
    --text: #171614;
    --text-2: #5F5A52;
    --text-3: #858078;
    --success: #22C55E;
    --danger: #EF4444;
    --gold-fg: #1F2328;
    --promo-gradient: linear-gradient(180deg, #FCFBF8 0%, #F5F3EE 100%);
    --promo-gradient-diag: linear-gradient(135deg, #FCFBF8 0%, #F5F3EE 100%);
    --hotspot-bg: #FCFBF8;
    --hero-overlay: linear-gradient(110deg, rgba(245,243,238,0.92) 0%, rgba(245,243,238,0.55) 55%, rgba(245,243,238,0.15) 100%);
    --hero-overlay-mobile: linear-gradient(180deg, transparent 72%, var(--bg) 100%), linear-gradient(90deg, rgba(245,243,238,0.96) 0%, rgba(245,243,238,0.84) 48%, rgba(245,243,238,0.35) 100%);
    --scrim: rgba(23,22,20,0.45);
    --hero-text: #171614;
    --hero-text-2: #5F5A52;
    --shadow-soft: 0 8px 30px rgba(23,22,20,0.06);
    --shadow-lift: 0 4px 14px rgba(23,22,20,0.05);
    --shadow-popover: 0 20px 40px -12px rgba(23,22,20,0.12);
  }
  /* Photo overlays stay deep charcoal in both themes so text on photos keeps its contrast. */
  .reos {
    --photo-scrim: linear-gradient(180deg, rgba(36,41,48,0.62) 0%, rgba(36,41,48,0.42) 38%, rgba(36,41,48,0.78) 100%);
    --photo-scrim-side: linear-gradient(90deg, rgba(36,41,48,0.80) 0%, rgba(36,41,48,0.45) 55%, rgba(36,41,48,0.15) 100%);
    --tile-scrim: linear-gradient(180deg, rgba(36,41,48,0) 40%, rgba(36,41,48,0.82) 100%);
    --on-photo: #F5F3EE;
    --on-photo-2: rgba(245,243,238,0.84);
    --font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
  }
  .reos .mk-display { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.01em; }
  .reos .mk-label { display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.14em; color: var(--text-2); margin-bottom: 6px; }
  .reos .mk-field { width:100%; height:48px; border-radius:12px; background: var(--inset); border:1px solid var(--line); color: var(--text); font-size:15px; padding-left:12px; padding-right:12px; outline:none; transition: border-color 160ms ease; }
  .reos .mk-field.mk-has-icon { padding-left: 38px; padding-right: 44px; }
  .reos .mk-field::placeholder { color: var(--text-3); }
  .reos .mk-field:hover { border-color: var(--line-gold); }
  .reos .mk-field:focus-visible { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-soft); }
  .reos .mk-select { appearance:none; padding-right:36px; background-image: linear-gradient(45deg, transparent 50%, var(--text-2) 50%), linear-gradient(135deg, var(--text-2) 50%, transparent 50%); background-position: calc(100% - 18px) 50%, calc(100% - 13px) 50%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; }
  .reos .mk-select option { background: var(--surface-2); color: var(--text); }
  .reos .mk-focus:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
  .reos *::selection { background: var(--gold); color: var(--gold-fg); }
  .reos-card { background: var(--surface); border: 1px solid var(--line-gold); border-radius: 16px; }
  .reos-card-2 { background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; }
  .reos-gold { color: var(--gold-2); }
  .reos-cta { background: var(--gold); color: var(--gold-fg); font-weight: 600; border: 1px solid var(--gold); transition: background-color 180ms ease, border-color 180ms ease; }
  .reos-cta:hover { background: var(--gold-hover); border-color: var(--gold-hover); }
  .reos-outline { border: 1px solid var(--line-strong); }
  .reos-chip { border: 1px solid var(--line); color: var(--text-2); }
  .reos-chip:hover { border-color: var(--line-strong); color: var(--text); }
  .reos-tab-active { color: var(--gold-2); }
  .reos-tab-active::after { content:''; position:absolute; left:50%; bottom:-10px; transform:translateX(-50%); width: 28px; height: 2px; background: var(--gold); border-radius: 2px; }
  .reos-divider { background-image: linear-gradient(90deg, transparent, var(--line-gold), transparent); height: 1px; }
  .reos-shadow { box-shadow: 0 24px 60px -28px rgba(0,0,0,0.45); }
  .reos-scrollbar::-webkit-scrollbar{width:6px;height:6px}
  .reos-scrollbar::-webkit-scrollbar-thumb{background:var(--line-strong);border-radius:3px}
  .reos-no-scrollbar{scrollbar-width:none;-ms-overflow-style:none}
  .reos-no-scrollbar::-webkit-scrollbar{display:none}
  /* Enlarges the tap area to at least 44x44 without changing the visual size. Element must be positioned. */
  /* Phone layout (<768px): flat sections that sit directly on the page, and a full-bleed hero. */
  @media (max-width: 767px) {
    .reos-m-flat{background:transparent;border-color:transparent;border-radius:0;padding:0;box-shadow:none}
    .reos-m-bleed{margin-left:-1rem;margin-right:-1rem;border-radius:0;border:0;box-shadow:none;background:var(--bg)}
  }
  .reos-hit::after{content:"";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%)}
`;

const topTabs = [
  { icon: Home, tKey: "shell.tabs.home", to: "/" },
  { icon: Building2, tKey: "shell.tabs.properties", to: "/properties" },
  { icon: TrendingUp, tKey: "shell.tabs.investment", to: "/investment" },
  { icon: Banknote, tKey: "shell.tabs.finance", to: "/wallet" },
  { icon: Scale, tKey: "shell.tabs.legal", to: "/legal-services" },
  
  { icon: Store, tKey: "shell.tabs.vendors", to: "/services" },
  { icon: Cpu, tKey: "shell.tabs.aiCenter", to: "/ai-search" },
  { icon: MoreHorizontal, tKey: "shell.tabs.more", to: "/search" },
];

/** Marketplace navigation (primary row of the header and top of the phone menu). */
const marketNav = [
  { key: "home", fallback: "Beranda", to: "/" },
  { key: "buy", fallback: "Beli", to: "/dijual" },
  { key: "rent", fallback: "Sewa", to: "/disewa" },
  { key: "newProjects", fallback: "Properti Baru", to: "/new-projects" },
  { key: "commercial", fallback: "Komersial", to: "/properties?type=commercial" },
  { key: "insight", fallback: "Insight", to: "/blog" },
];

const sideNav = [
  { icon: Eye, tKey: "shell.side.overview", to: "/" },
  { icon: BarChart3, tKey: "shell.side.marketIntelligence", to: "/market-heatmap" },
  { icon: BookmarkPlus, tKey: "shell.side.watchlist", to: "/favorites" },
  { icon: Wallet, tKey: "shell.side.portfolio", to: "/investment-performance" },
  { icon: MessageSquare, tKey: "shell.side.messages", to: "/messages", badge: 12 as number | undefined },
  { icon: ArrowLeftRight, tKey: "shell.side.transactions", to: "/wallet" },
  { icon: Calendar, tKey: "shell.side.calendar", to: "/profile" },
  { icon: FileText, tKey: "shell.side.documents", to: "/documents" },
  { icon: LifeBuoy, tKey: "shell.side.support", to: "/support" },
];



export function ReosHeader() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const isHome = pathname === "/";
  const isMarketActive = (to: string) => {
    const [p, q] = to.split("?");
    if (p === "/") return isHome;
    return pathname === p && (!q || search.replace(/^\?/, "") === q);
  };
  const { theme, setTheme } = useTheme();
  const { logoUrl: headerLogo } = useBrandingLogo("headerLogo", "/astra-logo.png");
  const { data: userRoles = [] } = useUserRoles();
  const dashboardPath = resolveDashboardPath(userRoles);
  const canManage = canManageProperties(userRoles);
  const isManagementActive = isManagementPath(pathname);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);

  const getMenuItems = () =>
    Array.from(
      profileMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );

  const handleProfileMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = getMenuItems();
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(index + 1 + items.length) % items.length].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(index - 1 + items.length) % items.length].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      setProfileOpen(false);
      profileTriggerRef.current?.focus();
    }
  };


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

  // Mobile drawer: close on navigation, close on Escape, lock page scroll while open.
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const open = () => setMobileMenuOpen(true);
    window.addEventListener(REOS_OPEN_MENU_EVENT, open);
    return () => window.removeEventListener(REOS_OPEN_MENU_EVENT, open);
  }, []);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    // Class-based lock: global CSS forces body overflow with !important, so inline styles are ignored.
    document.documentElement.classList.add("reos-scroll-lock");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => drawerCloseRef.current?.focus());
    return () => {
      document.documentElement.classList.remove("reos-scroll-lock");
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);

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

  // Real, user-scoped notifications. Guests get an empty list and see a login CTA.
  const {
    notifications: userNotifications,
    unreadCount: notifUnread,
    markAsRead,
  } = useNotifications();
  const notifications = user ? userNotifications : [];
  const unreadCount = user ? notifUnread : 0;

  // Real, user-scoped saved properties.
  const { favorites } = useFavorites();
  const savedCount = user ? favorites.size : 0;
  const savedItems = user
    ? Array.from(favorites).slice(0, 5).map((id) => ({ id, propertyId: id }))
    : [];


  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <>
      <header
        className={`reos-shell-header sticky top-0 z-40 bg-[var(--header)] border-b border-[var(--line)] transition-shadow duration-300 ${scrolled ? "shadow-[var(--shadow-soft)]" : "shadow-[var(--shadow-lift)]"}`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div
          className="mx-auto max-w-[1600px] px-3 sm:px-4 md:px-6 h-full flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-3 md:gap-6"
          style={{ paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))", paddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))" }}
        >
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t("shell.openMenu")}
            aria-haspopup="dialog"
            aria-expanded={mobileMenuOpen}
            aria-controls="reos-mobile-drawer"
            className="lg:hidden order-last sm:order-none shrink-0 h-11 w-11 rounded-full sm:rounded-lg border border-[var(--line)] sm:border-transparent bg-[var(--surface)]/60 sm:bg-transparent sm:-ml-1 hover:bg-[var(--surface)] flex items-center justify-center touch-manipulation"
          >
            <Menu className="h-5 w-5 text-[var(--text)]" />
          </button>

          <Link to="/" aria-label="ASTRA Villa home" className="flex items-center gap-2 min-[360px]:gap-2.5 shrink-0 min-h-11 min-w-11">
            <img src={headerLogo} alt="ASTRA Villa" className="h-8 w-8 min-[360px]:h-9 min-[360px]:w-9 rounded-full object-contain shadow-sm" />
            <div className="leading-none">
              <div className="font-semibold tracking-[0.06em] min-[360px]:tracking-[0.16em] sm:tracking-[0.18em] text-[13px] min-[360px]:text-[15px] whitespace-nowrap">ASTRA<span className="reos-gold ml-1">VILLA</span></div>
              <div className="sm:hidden text-[9px] min-[360px]:text-[10px] tracking-[0.3em] min-[360px]:tracking-[0.4em] text-[var(--text-2)] mt-1">PROPERTY</div>
              <div className="hidden xl:block text-[9px] tracking-[0.28em] text-[var(--text-3)] mt-1">REAL ESTATE OPERATING SYSTEM</div>
            </div>
          </Link>

          <nav aria-label={t("marketHome.nav.mainNav", "Navigasi utama")} className="flex-1 hidden lg:flex items-center justify-center min-w-0">
            <ul className="flex items-center gap-0.5 xl:gap-1">
              {marketNav.map((item) => {
                const active = isMarketActive(item.to);
                return (
                  <li key={item.key}>
                    <Link
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={`mk-focus relative inline-flex items-center h-11 px-2 xl:px-3 rounded-lg text-[13.5px] whitespace-nowrap transition-colors ${active ? "text-[var(--text)] font-semibold" : "text-[var(--text-2)] hover:text-[var(--text)]"}`}
                    >
                      {t(`marketHome.nav.${item.key}`, item.fallback)}
                      {active && <span aria-hidden="true" className="absolute left-2 right-2 xl:left-3 xl:right-3 bottom-1.5 h-[2px] rounded-full bg-[var(--gold)]" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>


          <div className="flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-1 md:gap-2 shrink-0 ml-auto">
            {/* Phones: search + notifications as round icon buttons (sign-in lives in the menu) */}
            <Link to="/search" aria-label="Search" className="sm:hidden h-11 w-11 rounded-full sm:rounded-lg border border-[var(--line)] sm:border-transparent bg-[var(--surface)]/60 sm:bg-transparent flex items-center justify-center hover:bg-[var(--surface)]">
              <Search className="h-[18px] w-[18px] text-[var(--text)]" aria-hidden="true" />
            </Link>
            {!user && (
              <button
                type="button"
                onClick={() => { setAuthInitial("login"); setShowAuth(true); }}
                aria-label={t("shell.notifications")}
                className="sm:hidden h-11 w-11 rounded-full sm:rounded-lg border border-[var(--line)] sm:border-transparent bg-[var(--surface)]/60 sm:bg-transparent flex items-center justify-center hover:bg-[var(--surface)]"
              >
                <Bell className="h-[18px] w-[18px] text-[var(--text)]" aria-hidden="true" />
              </button>
            )}
            <Link
              to="/add-property"
              className="mk-focus hidden md:inline-flex items-center gap-1.5 h-11 lg:h-9 px-3 rounded-lg border border-[var(--line-strong)] text-[12.5px] font-semibold whitespace-nowrap text-[var(--text)] hover:bg-[var(--gold-soft)] transition-colors"
            >
              <Plus className="h-3.5 w-3.5 reos-gold" aria-hidden="true" />
              {t("marketHome.nav.postListing", "Pasang Iklan")}
            </Link>
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                type="button"
                onClick={() => { setLangOpen(o => !o); setNotifOpen(false); setProfileOpen(false); }}
                className="mk-focus h-11 lg:h-9 px-2.5 rounded-lg inline-flex items-center gap-1.5 text-xs hover:bg-[var(--surface)] text-[var(--text-2)]"
                aria-haspopup="menu"
                aria-expanded={langOpen}
                aria-label={t("shell.language")}
              >
                <Globe className="h-4 w-4" /> {language.toUpperCase()} <ChevronDown className="h-3 w-3" />
              </button>
              {langOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-56 reos-card p-1 z-50 shadow-[var(--shadow-popover)]">
                  <div className="px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--text-3)]">{t("shell.language")}</div>
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
              aria-label={t("shell.toggleTheme")}
              className="mk-focus hidden sm:flex lg:hidden xl:flex h-11 w-11 lg:h-9 lg:w-9 rounded-lg hover:bg-[var(--surface)] items-center justify-center"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-[var(--text-2)]" /> : <Moon className="h-4 w-4 text-[var(--text-2)]" />}
            </button>

            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => { setNotifOpen(o => !o); setLangOpen(false); setProfileOpen(false); }}
                  aria-label={t("shell.notifications")}
                  aria-haspopup="menu"
                  aria-expanded={notifOpen}
                  className="h-11 w-11 rounded-full sm:rounded-lg border border-[var(--line)] sm:border-transparent bg-[var(--surface)]/60 sm:bg-transparent lg:h-9 lg:w-9 hover:bg-[var(--surface)] flex items-center justify-center relative"
                >
                  <Bell className="h-[18px] w-[18px] sm:h-4 sm:w-4 text-[var(--text)] sm:text-[var(--text-2)]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 sm:top-1.5 sm:right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-[var(--gold)] text-[10px] text-[var(--gold-fg)] font-bold flex items-center justify-center">{unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <div role="menu" className="fixed left-3 right-3 top-[calc(var(--reos-header-h)+env(safe-area-inset-top,0px)+8px)] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[340px] reos-card p-0 z-50 shadow-[var(--shadow-popover)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
                      <div className="text-[12.5px] font-semibold text-[var(--text)]">{t("shell.notifications")}</div>
                      <span className="text-[10px] uppercase tracking-[0.18em] reos-gold">{unreadCount} {t("shell.newSuffix")}</span>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto reos-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-[12px] text-[var(--text-3)]">
                          {t("shell.noNotifications")}
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => {
                          const to = n.propertyId ? `/property/${n.propertyId}` : "/notifications";
                          const time = (() => {
                            try { return formatDistanceToNow(n.timestamp, { addSuffix: false }); } catch { return ""; }
                          })();
                          return (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => { markAsRead(n.id); setNotifOpen(false); navigate(to); }}
                              className="w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-[var(--surface-2)] border-b border-[var(--line)] last:border-b-0 transition-colors"
                            >
                              <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? "bg-[var(--gold)]" : "bg-[var(--text-3)]/40"}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-[12.5px] font-medium text-[var(--text)] truncate">{n.title}</div>
                                  <div className="text-[10px] text-[var(--text-3)] shrink-0">{time}</div>
                                </div>
                                <div className="text-[11.5px] text-[var(--text-2)] mt-0.5 line-clamp-2">{n.message}</div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setNotifOpen(false); navigate("/notifications"); }}
                      className="w-full text-[12px] text-center py-3 reos-gold hover:bg-[var(--surface-2)] border-t border-[var(--line)]"
                    >
                      {t("shell.viewAllNotifications")}
                    </button>
                  </div>
                )}
              </div>
            )}
            {user && (
              <div className="relative hidden sm:block" ref={savedRef}>
                <button
                  type="button"
                  onClick={() => { setSavedOpen(o => !o); setLangOpen(false); setNotifOpen(false); setProfileOpen(false); }}
                  aria-label={t("shell.saved")}
                  aria-haspopup="menu"
                  aria-expanded={savedOpen}
                  className="h-11 w-11 lg:h-9 lg:w-9 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center relative"
                >
                  <Heart className="h-4 w-4 text-[var(--text-2)]" />
                  {savedCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-[var(--gold)] text-[10px] text-[var(--gold-fg)] font-bold flex items-center justify-center">{savedCount}</span>
                  )}
                </button>
                {savedOpen && (
                  <div role="menu" className="fixed left-3 right-3 top-[calc(var(--reos-header-h)+env(safe-area-inset-top,0px)+8px)] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[320px] reos-card p-0 z-50 shadow-[var(--shadow-popover)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
                      <div className="text-[12.5px] font-semibold text-[var(--text)]">{t("shell.saved")}</div>
                      <span className="text-[10px] uppercase tracking-[0.18em] reos-gold">{savedCount} {t("shell.itemsSuffix")}</span>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto reos-scrollbar">
                      {savedItems.length === 0 ? (
                        <div className="px-4 py-8 text-center text-[12px] text-[var(--text-3)]">
                          {t("shell.noSaved")}
                        </div>
                      ) : (
                        savedItems.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => { setSavedOpen(false); navigate(`/property/${s.propertyId}`); }}
                            className="w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-[var(--surface-2)] border-b border-[var(--line)] last:border-b-0 transition-colors"
                          >
                            <Heart className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[12.5px] font-medium text-[var(--text)] truncate">{t("shell.savedProperty")}</div>
                              <div className="text-[11.5px] text-[var(--text-2)] mt-0.5 line-clamp-2 font-mono">{s.propertyId.slice(0, 8)}…</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSavedOpen(false); navigate("/favorites"); }}
                      className="w-full text-[12px] text-center py-3 reos-gold hover:bg-[var(--surface-2)] border-t border-[var(--line)]"
                    >
                      {t("shell.viewAllSaved")}
                    </button>
                  </div>
                )}
              </div>
            )}



            {user ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  type="button"
                  ref={profileTriggerRef}
                  onClick={() => setProfileOpen(o => !o)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setProfileOpen(true);
                      requestAnimationFrame(() => getMenuItems()[0]?.focus());
                    }
                  }}
                  aria-label={t("shell.openUserMenu")}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  className="h-11 lg:h-9 pl-1.5 pr-2 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center gap-1.5 hover:border-[var(--line-strong)]"
                >
                  <div className="h-7 w-7 rounded-full reos-cta flex items-center justify-center text-[11px] font-bold">
                    {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="h-3 w-3 text-[var(--text-2)]" />
                </button>
                {profileOpen && (
                  <div
                    role="menu"
                    ref={profileMenuRef}
                    aria-label={t("shell.openUserMenu")}
                    onKeyDown={handleProfileMenuKeyDown}
                    className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-24px)] reos-card p-1 z-50 shadow-[var(--shadow-popover)]"
                  >

                    {/* Identity block — full name & email live INSIDE the dropdown only */}
                    <div className="px-3 py-3 border-b border-[var(--line)] mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full reos-cta flex items-center justify-center text-[12px] font-bold">
                          {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-semibold text-[var(--text)] truncate">
                            {profile?.full_name || t("shell.member")}
                          </div>
                          <div className="text-[10.5px] text-[var(--text-2)] truncate">{user.email}</div>
                        </div>
                      </div>
                    </div>

                    <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate(dashboardPath); }} className="w-full text-left px-3 py-2 min-h-11 lg:min-h-0 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2 text-[var(--text)]"><LayoutDashboard className="h-3.5 w-3.5" /> {t("shell.dashboard")}</button>
                    <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate("/profile"); }} className="w-full text-left px-3 py-2 min-h-11 lg:min-h-0 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2 text-[var(--text)]"><User className="h-3.5 w-3.5" /> {t("shell.myProfile")}</button>
                    <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate("/wallet"); }} className="w-full text-left px-3 py-2 min-h-11 lg:min-h-0 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2 text-[var(--text)]"><Wallet className="h-3.5 w-3.5" /> {t("shell.wallet")}</button>
                    <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate("/favorites"); }} className="w-full text-left px-3 py-2 min-h-11 lg:min-h-0 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2 text-[var(--text)]"><Heart className="h-3.5 w-3.5" /> {t("shell.saved")}</button>
                    {canManage && (
                      <button
                        type="button" role="menuitem"
                        aria-current={isManagementActive ? "page" : undefined}
                        onClick={() => { setProfileOpen(false); navigate("/my-properties"); }}
                        className={`w-full text-left px-3 py-2 min-h-11 lg:min-h-0 rounded-md text-[12.5px] inline-flex items-center gap-2 transition outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold,#C6A66B)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)] ${
                          isManagementActive
                            ? "bg-[var(--surface-2)] text-[var(--gold,#C6A66B)] font-semibold border-l-2 border-[var(--gold,#C6A66B)] pl-[10px]"
                            : "text-[var(--text)] hover:bg-[var(--surface-2)]"
                        }`}
                      >
                        <Wrench className="h-3.5 w-3.5" aria-hidden="true" /> {t("shell.tabs.management")}
                        {isManagementActive && <span className="sr-only"> (current page)</span>}
                      </button>
                    )}
                    <div className="reos-divider my-1" />
                    <button type="button" role="menuitem" onClick={async () => { setProfileOpen(false); await signOut(); }} className="w-full text-left px-3 py-2 min-h-11 lg:min-h-0 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] text-[var(--danger)] inline-flex items-center gap-2"><LogOut className="h-3.5 w-3.5" /> {t("shell.signOut")}</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button type="button" onClick={() => { setAuthInitial("login"); setShowAuth(true); }} className="mk-focus hidden sm:inline-flex items-center h-11 lg:h-9 px-2.5 xl:px-3.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap hover:bg-[var(--surface)] text-[var(--text)] transition">{t("marketHome.nav.login", "Masuk")}</button>
                <button type="button" onClick={() => { setAuthInitial("register"); setShowAuth(true); }} className="mk-focus hidden sm:inline-flex h-11 lg:h-9 px-3 xl:px-4 rounded-lg reos-cta text-[12.5px] whitespace-nowrap items-center gap-1.5">
                  {t("marketHome.nav.register", "Daftar")}
                </button>
              </>
            )}
          </div>
        </div>

        {!isHome && <nav aria-label="Main sections" className="hidden md:block border-t border-[var(--line)] bg-[var(--header)]">
          <div className="mx-auto max-w-[1600px] px-6 h-[52px] flex items-center gap-6 lg:gap-8 overflow-x-auto overflow-y-hidden reos-no-scrollbar">
            {topTabs.map(tab => {
              const active = isActive(tab.to);
              return (
                <Link
                  key={tab.tKey}
                  to={tab.to}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex items-center gap-2 h-11 text-[13px] whitespace-nowrap transition-colors ${active ? "reos-tab-active font-medium" : "text-[var(--text-2)] hover:text-[var(--text)]"}`}
                >
                  <tab.icon className="h-4 w-4" /> {t(tab.tKey)}
                </Link>
              );
            })}
          </div>
        </nav>}
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-sm lg:hidden"
            style={{ background: "var(--scrim)" }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.aside
              id="reos-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={t("shell.openMenu")}
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[86%] max-w-[340px] h-full flex flex-col border-r border-[var(--line-strong)] overscroll-contain"
              style={{
                background: "var(--header)",
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                paddingLeft: "env(safe-area-inset-left, 0px)",
              }}
            >
              <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-[var(--line)]">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 min-h-11">
                  <img src={headerLogo} alt="" aria-hidden="true" className="h-8 w-8 rounded-full object-contain shadow-sm" />
                  <span className="font-semibold tracking-[0.18em] text-[14px]">ASTRA<span className="reos-gold ml-1">VILLA</span></span>
                </Link>
                <button
                  ref={drawerCloseRef}
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t("shell.closeMenu")}
                  className="h-11 w-11 -mr-2 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto reos-scrollbar px-3 py-3">
                {!user && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button type="button" onClick={() => { setMobileMenuOpen(false); setAuthInitial("login"); setShowAuth(true); }} className="h-11 rounded-lg border border-[var(--line-strong)] text-[13px] font-medium text-[var(--text)] hover:bg-[var(--surface)]">{t("marketHome.nav.login", "Masuk")}</button>
                    <button type="button" onClick={() => { setMobileMenuOpen(false); setAuthInitial("register"); setShowAuth(true); }} className="h-11 rounded-lg reos-cta text-[13px]">{t("marketHome.nav.register", "Daftar")}</button>
                  </div>
                )}
                {user && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)} className="h-11 rounded-lg border border-[var(--line-strong)] text-[13px] font-medium text-[var(--text)] hover:bg-[var(--surface)] inline-flex items-center justify-center gap-2">
                      <LayoutDashboard className="h-4 w-4 reos-gold" aria-hidden="true" /> Dashboard
                    </Link>
                    <button type="button" onClick={async () => { setMobileMenuOpen(false); await signOut(); }} className="h-11 rounded-lg border border-[var(--line)] text-[13px] font-medium text-[var(--danger)] hover:bg-[var(--surface)] inline-flex items-center justify-center gap-2">
                      <LogOut className="h-4 w-4" aria-hidden="true" /> {t("shell.signOut")}
                    </button>
                  </div>
                )}
                <Link
                  to="/add-property"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mb-3 flex items-center justify-center gap-2 h-11 rounded-lg border border-[var(--line-gold)] bg-[var(--surface)] text-[13px] font-semibold text-[var(--text)] hover:border-[var(--line-strong)]"
                >
                  <Plus className="h-4 w-4 reos-gold" /> {t("marketHome.nav.postListing", "Pasang Iklan")}
                </Link>

                <div className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.22em] text-[var(--text-3)]">{t("marketHome.nav.marketplace", "Marketplace")}</div>
                <ul className="space-y-0.5 mb-3">
                  {marketNav.map((item) => {
                    const active = isMarketActive(item.to);
                    return (
                      <li key={item.key}>
                        <Link to={item.to} onClick={() => setMobileMenuOpen(false)} aria-current={active ? "page" : undefined} className={`flex items-center px-3 min-h-11 rounded-lg text-[14px] ${active ? "bg-[var(--gold-soft)] reos-gold font-medium" : "text-[var(--text)] hover:bg-[var(--surface)]"}`}>
                          {t(`marketHome.nav.${item.key}`, item.fallback)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.22em] text-[var(--text-3)]">{t("marketHome.nav.ecosystem", "Ekosistem ASTRA")}</div>
                <ul className="space-y-0.5">
                  {topTabs.map(tab => {
                    const active = isActive(tab.to);
                    return (
                      <li key={tab.tKey}>
                        <Link to={tab.to} onClick={() => setMobileMenuOpen(false)} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 px-3 min-h-11 rounded-lg text-[14px] ${active ? "bg-[var(--gold-soft)] reos-gold font-medium" : "text-[var(--text-2)] hover:bg-[var(--surface)] hover:text-[var(--text)]"}`}>
                          <tab.icon className="h-4 w-4 shrink-0" /> {t(tab.tKey)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="reos-divider my-3" />
                <ul className="space-y-0.5">
                  {sideNav.map(n => (
                    <li key={n.tKey}>
                      <Link to={n.to} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-11 rounded-lg text-[14px] text-[var(--text-2)] hover:bg-[var(--surface)] hover:text-[var(--text)]">
                        <n.icon className="h-4 w-4 shrink-0" /><span className="flex-1">{t(n.tKey)}</span>
                        {n.badge && <span className="text-[10px] bg-[var(--gold)] text-[var(--gold-fg)] font-bold px-1.5 py-0.5 rounded">{n.badge}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preferences — language + theme live here on phones */}
              <div className="shrink-0 border-t border-[var(--line)] px-4 py-3 space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-3)] mb-2">{t("shell.language")}</div>
                  <div className="grid grid-cols-6 gap-1" role="group" aria-label={t("shell.language")}>
                    {languages.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLanguage(l.code)}
                        aria-pressed={language === l.code}
                        aria-label={l.native}
                        className={`h-11 rounded-lg text-[11px] font-semibold border ${language === l.code ? "border-[var(--gold)] reos-gold bg-[var(--gold-soft)]" : "border-[var(--line)] text-[var(--text-2)] hover:border-[var(--line-strong)]"}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full h-11 rounded-lg border border-[var(--line)] flex items-center justify-between px-3 text-[13px] text-[var(--text)] hover:border-[var(--line-strong)]"
                >
                  <span>{t("shell.toggleTheme")}</span>
                  {theme === "dark" ? <Sun className="h-4 w-4 text-[var(--text-2)]" /> : <Moon className="h-4 w-4 text-[var(--text-2)]" />}
                </button>
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
  const { t } = useTranslation();
  const { logoUrl } = useBrandingLogo("headerLogo", "/astra-logo.png");
  type FooterLink = { label: string; to: string };
  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t("marketHome.footer.marketplace", "Marketplace"),
      links: [
        { label: t("marketHome.nav.buy", "Beli"), to: "/dijual" },
        { label: t("marketHome.nav.rent", "Sewa"), to: "/disewa" },
        { label: t("marketHome.nav.newProjects", "Properti Baru"), to: "/new-projects" },
        { label: t("marketHome.nav.commercial", "Komersial"), to: "/properties?type=commercial" },
        { label: t("marketHome.footer.locations", "Lokasi"), to: "/locations" },
        { label: t("marketHome.nav.postListing", "Pasang Iklan"), to: "/add-property" },
      ],
    },
    {
      title: t("marketHome.footer.ecosystem", "Ekosistem"),
      links: [
        { label: t("marketHome.footer.insight", "Insight"), to: "/blog" },
        { label: t("shell.footer.links.marketIntelligence"), to: "/market-intelligence" },
        { label: t("shell.footer.links.investmentFund"), to: "/investment" },
        { label: t("shell.footer.links.wealthAdvisor"), to: "/wealth-advisor" },
        { label: t("marketHome.footer.agents", "Agen"), to: "/agents" },
        { label: t("shell.footer.links.vendors"), to: "/services" },
        { label: t("shell.footer.links.sellWithUs"), to: "/sell" },
      ],
    },
    {
      title: t("marketHome.footer.company", "Perusahaan"),
      links: [
        { label: t("shell.footer.links.about"), to: "/about" },
        { label: t("shell.footer.links.contact"), to: "/contact" },
        { label: t("shell.footer.links.careers"), to: "/careers" },
        { label: t("shell.footer.links.press"), to: "/press" },
      ],
    },
    {
      title: t("marketHome.footer.legal", "Legal & Bantuan"),
      links: [
        { label: t("shell.footer.links.terms"), to: "/terms" },
        { label: t("shell.footer.links.privacy"), to: "/privacy" },
        { label: t("shell.footer.links.cookies"), to: "/cookies" },
        { label: t("shell.footer.links.cookieSettings"), to: "/cookie-preferences" },
        { label: t("shell.footer.links.compliance"), to: "/compliance" },
        { label: t("shell.footer.links.helpCenter"), to: "/help" },
      ],
    },
  ];

  return (
    <footer className="mt-4 border-t border-[var(--line)] bg-[var(--header)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 pt-10 pb-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,3fr)]">
        <div className="max-w-sm">
          <Link to="/" aria-label="ASTRA Villa home" className="mk-focus inline-flex items-center gap-2.5 min-h-11 rounded-lg">
            <img src={logoUrl} alt="" aria-hidden="true" width={36} height={36} loading="lazy" className="h-9 w-9 rounded-full object-contain" />
            <span className="font-semibold tracking-[0.18em] text-[15px] text-[var(--text)]">ASTRA<span className="reos-gold ml-1">VILLA</span></span>
          </Link>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-2)]">
            {t("marketHome.footer.tagline", "Marketplace properti Indonesia untuk mencari, membandingkan, dan memasang iklan rumah, villa, apartemen, tanah, dan properti komersial.")}
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-7">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] reos-gold mb-2.5">{col.title}</h2>
              <ul className="space-y-0 md:space-y-1">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="mk-focus inline-flex items-center min-h-11 md:min-h-8 rounded text-[13px] text-[var(--text-2)] hover:text-[var(--text)] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-5 text-[12px] text-[var(--text-3)]">
          © {new Date().getFullYear()} {t("shell.footer.copyright")}
        </div>
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
