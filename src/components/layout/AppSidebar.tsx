import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Banknote,
  Scale,
  Wrench,
  Sparkles,
  Settings,
  User,
  Heart,
  BarChart3,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin-dashboard", icon: BarChart3 },
    ],
  },
  {
    label: "Property",
    items: [
      { title: "My Properties", url: "/my-properties", icon: Building2 },
      { title: "Saved", url: "/favorites", icon: Heart },
    ],
  },
  {
    label: "Ecosystem",
    items: [
      { title: "Investment", url: "/investment-intelligence", icon: Banknote },
      { title: "Legal", url: "/legal", icon: Scale },
      { title: "Vendors", url: "/vendor-marketplace", icon: Wrench },
      { title: "AI Center", url: "/ai-center", icon: Sparkles },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Profile", url: "/profile", icon: User },
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Admin", url: "/admin", icon: Shield },
    ],
  },
];

/**
 * ASTRA Design System V3 — App Sidebar
 *
 * Collapsible (icon rail ↔ expanded) navigation rendered on
 * authenticated app routes (dashboard, admin, settings, profile,
 * my-properties, vendor-marketplace, etc.).
 */
export default function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const isActive = (url: string) =>
    pathname === url || (url !== "/" && pathname.startsWith(url + "/"));

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary/15 grid place-items-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold leading-none">ASTRA</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Property OS</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-2.5 text-sm",
                          isActive(item.url)
                            ? "text-primary font-medium"
                            : "text-foreground/80 hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
