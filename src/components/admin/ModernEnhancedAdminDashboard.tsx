import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { AdminSidebar } from "./AdminSidebar";
import AdminDashboardContent from "./AdminDashboardContent";
import AdminHeader from "./AdminHeader";
import { useNavigate } from "react-router-dom";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { useAuth } from "@/contexts/AuthContext";
import AIIntelligenceSystem from "./AIIntelligenceSystem";
import { InvestorDemoMode } from "./InvestorDemoMode";
import DecacornNarrativeMode from "./DecacornNarrativeMode";
import { contentOffsetClass, useAdminLayoutOverlapGuard } from "./adminLayoutTokens";

const SIDEBAR_PREF_PREFIX = "astra:admin:sidebar-collapsed";
const sidebarPrefKey = (userId?: string | null) =>
  `${SIDEBAR_PREF_PREFIX}:${userId ?? "anon"}`;

const readStoredSidebar = (userId?: string | null): boolean | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(sidebarPrefKey(userId));
    if (raw === "1") return true;
    if (raw === "0") return false;
    return null;
  } catch {
    return null;
  }
};

const DemoModeController = lazy(() => import("./demo/DemoModeController"));
const DemoModeOverlay = lazy(() => import("./demo/DemoModeOverlay"));

const normalizeSection = (section: string | null) => {
  if (!section) return "overview";
  if (section === "settings") return "system-settings";
  return section;
};

const ModernEnhancedAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return normalizeSection(params.get("section"));
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = readStoredSidebar(null);
    if (stored !== null) return stored;
    return typeof window !== "undefined" ? window.innerWidth < 1024 : false;
  });
  const hasUserPref = useRef(false);

  // Load user-scoped preference once user is known
  useEffect(() => {
    const stored = readStoredSidebar(userId);
    if (stored !== null) {
      hasUserPref.current = true;
      setSidebarCollapsed(stored);
    } else {
      hasUserPref.current = false;
    }
  }, [userId]);

  // Persist preference whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(sidebarPrefKey(userId), sidebarCollapsed ? "1" : "0");
    } catch {
      /* ignore quota / disabled storage */
    }
  }, [sidebarCollapsed, userId]);

  // Auto-collapse on small screens; on large screens, restore user preference (or expand)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setSidebarCollapsed(true);
      } else {
        const stored = readStoredSidebar(userId);
        setSidebarCollapsed(stored ?? false);
      }
    };
    handler(mql);
    mql.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
  }, [userId]);
  const [prioritySections, setPrioritySections] = useState<string[]>([]);
  const [investorMode, setInvestorMode] = useState(false);
  const [narrativeMode, setNarrativeMode] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  useAdminLayoutOverlapGuard();

  // Expose investor demo trigger globally for header
  useEffect(() => {
    (window as any).__investorDemoTrigger = true;
    (window as any).__investorDemoOpen = () => setInvestorMode(true);
    (window as any).__narrativeDemoOpen = () => setNarrativeMode(true);
    return () => {
      delete (window as any).__investorDemoTrigger;
      delete (window as any).__investorDemoOpen;
      delete (window as any).__narrativeDemoOpen;
    };
  }, []);

  const handleSectionChange = useCallback((section: string) => {
    const normalized = normalizeSection(section);
    setActiveSection(normalized);

    const params = new URLSearchParams(window.location.search);
    if (normalized === "overview") {
      params.delete("section");
    } else {
      params.set("section", normalized);
    }

    const query = params.toString();
    navigate(`/admin-dashboard${query ? `?${query}` : ""}`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sectionFromUrl = normalizeSection(params.get("section"));
    if (sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl);
    }
  }, [activeSection]);

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  // Collapse sidebar when investor mode is active
  useEffect(() => {
    if (investorMode) setSidebarCollapsed(true);
  }, [investorMode]);

  const handlePriorityChange = useCallback((priorities: string[]) => {
    setPrioritySections(priorities);
  }, []);

  // Mobile drawer state — only meaningful below `lg`.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);

  // Close the mobile drawer if the viewport grows past `lg`.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setMobileNavOpen(false);
    };
    handler(mql);
    mql.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
  }, []);

  return (
    <DemoModeProvider>
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        {/* Fixed Left Sidebar */}
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          mobileOpen={mobileNavOpen}
          onMobileClose={closeMobileNav}
        />

        {/* Main content area */}
        <div data-admin-content className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-200 ${contentOffsetClass(sidebarCollapsed)}`}>
          <AdminHeader
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onOpenMobileNav={openMobileNav}
          />

          <main ref={contentRef} className="flex-1 min-w-0 overflow-x-hidden px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <AdminDashboardContent
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              prioritySections={prioritySections}
            />
          </main>
        </div>
      </div>

      {/* Unified AI Intelligence System */}
      <AIIntelligenceSystem onPriorityChange={handlePriorityChange} />

      {/* Investor Cinematic Demo Mode */}
      <InvestorDemoMode isActive={investorMode} onClose={() => setInvestorMode(false)} />
      <DecacornNarrativeMode isActive={narrativeMode} onClose={() => setNarrativeMode(false)} />

      {/* Demo Mode overlays */}
      <Suspense fallback={null}>
        <DemoModeController />
        <DemoModeOverlay />
      </Suspense>
    </DemoModeProvider>
  );
};

export default ModernEnhancedAdminDashboard;
