import React, { useState, useRef, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import AdminDashboardContent from "./AdminDashboardContent";
import AdminHeader from "./AdminHeader";

const ModernEnhancedAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const contentRef = useRef<HTMLDivElement>(null);

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
          onSectionChange={setActiveSection}
        />

        <SidebarInset className="flex-1">
          <AdminHeader
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <main
            ref={contentRef}
            className="flex-1 animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            <AdminDashboardContent
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ModernEnhancedAdminDashboard;
