import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { AdminSidebar } from "./AdminSidebar";
import AdminDashboardContent from "./AdminDashboardContent";
import AdminHeader from "./AdminHeader";
import { useNavigate } from "react-router-dom";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import AIFloatingWidget from "./AIFloatingWidget";
import AIControlPanel from "./AIControlPanel";

const DemoModeController = lazy(() => import("./demo/DemoModeController"));
const DemoModeOverlay = lazy(() => import("./demo/DemoModeOverlay"));

const normalizeSection = (section: string | null) => {
  if (!section) return "overview";
  if (section === "settings") return "system-settings";
  return section;
};

const ModernEnhancedAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return normalizeSection(params.get("section"));
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  return (
    <DemoModeProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Fixed Left Sidebar */}
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />

        {/* Main content area */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${sidebarCollapsed ? 'ml-14' : 'ml-14 lg:ml-60'}`}>
          <AdminHeader
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />

          <main
            ref={contentRef}
            className="flex-1"
          >
            <AdminDashboardContent
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </main>
        </div>
      </div>

      {/* AI Intelligence Panels */}
      <AIFloatingWidget />
      <AIControlPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />

      {/* Demo Mode overlays */}
      <Suspense fallback={null}>
        <DemoModeController />
        <DemoModeOverlay />
      </Suspense>
    </DemoModeProvider>
  );
};

export default ModernEnhancedAdminDashboard;
