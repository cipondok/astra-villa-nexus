import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { contentOffsetClass, useAdminLayoutOverlapGuard } from "./adminLayoutTokens";

/**
 * Shared admin layout wrapper for `/admin/*` sub-pages.
 *
 * The primary `/admin` and `/admin-dashboard` routes render
 * `ModernEnhancedAdminDashboard`, which contains its own internal shell.
 * This layout gives every OTHER admin sub-route the same sidebar + header
 * chrome, so the admin experience feels consistent and no public shell
 * (ReosHeader, GlobalFooter, AppSidebar) leaks through.
 */
export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setSidebarCollapsed(e.matches);
    handler(mql);
    mql.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () =>
      mql.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
  }, []);

  // Derive an active section token from the URL for the sidebar/header.
  const activeSection = location.pathname
    .replace(/^\/admin\/?/, "")
    .split("/")[0] || "overview";

  const handleSectionChange = (section: string) => {
    // Sidebar categories map back to the primary dashboard.
    navigate(section === "overview" ? "/admin" : `/admin?section=${section}`);
  };

  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useAdminLayoutOverlapGuard(sidebarRef, contentRef);

  return (
    <DemoModeProvider>
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        <div
          ref={contentRef}
          data-admin-content
          className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-200 ${contentOffsetClass(sidebarCollapsed)}`}
        >
          <AdminHeader
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
          <main className="flex-1 min-w-0 overflow-x-hidden px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </DemoModeProvider>
  );
}
