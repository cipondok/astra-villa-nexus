import React, { useState, useRef, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import AdminDashboardContent from "./AdminDashboardContent";
import AdminHeader from "./AdminHeader";
import { useNavigate } from "react-router-dom";

const normalizeSection = (section: string | null) => {
  if (!section) return "overview";

  if (section === "settings") return "system-settings";
  if (section === "vendors-hub") return "vendor-management";

  return section;
};

const ModernEnhancedAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return normalizeSection(params.get("section"));
  });
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

  // Scroll to top whenever the active section changes
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <SidebarInset className="flex-1">
          <AdminHeader
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />

          <main
            ref={contentRef}
            className="flex-1 animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            <AdminDashboardContent
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ModernEnhancedAdminDashboard;
