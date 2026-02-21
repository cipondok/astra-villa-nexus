import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Home, FileText, MessageSquare, Clock, BarChart3, Settings, Phone, HelpCircle, Headphones } from "lucide-react";

interface CSNavSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myOpenTickets: number;
  pendingInquiries: number;
  availableTickets: number;
}

const CSNavSidebar = ({ 
  activeTab, 
  setActiveTab, 
  myOpenTickets, 
  pendingInquiries, 
  availableTickets 
}: CSNavSidebarProps) => {
  const navItems = [
    { title: "Dashboard", value: "dashboard", icon: Home, color: "cyan" },
    { title: "My Tickets", value: "my-tickets", icon: FileText, badge: myOpenTickets, color: "orange" },
    { title: "Inquiries", value: "inquiries", icon: MessageSquare, badge: pendingInquiries, color: "blue" },
    { title: "Available", value: "available", icon: Clock, badge: availableTickets, color: "purple" },
    { title: "Analytics", value: "analytics", icon: BarChart3, color: "green" },
    { title: "Settings", value: "settings", icon: Settings, color: "slate" },
  ];

  const getActiveStyles = (color: string, isActive: boolean) => {
    if (!isActive) return "";
    return "bg-gold-primary/15 text-gold-primary border-l-2 border-gold-primary";
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <div className="p-3">
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <div className="w-7 h-7 bg-gradient-to-br from-gold-primary to-gold-primary/70 rounded-lg flex items-center justify-center">
              <Headphones className="h-3.5 w-3.5 text-background" />
            </div>
            <div>
              <h2 className="font-semibold text-xs">CS Dashboard</h2>
              <p className="text-[9px] text-muted-foreground">Support Center</p>
            </div>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-muted-foreground px-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.value)}
                    className={`text-xs h-8 ${getActiveStyles(item.color, activeTab === item.value)}`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.title}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge className="ml-auto bg-destructive/90 text-destructive-foreground text-[9px] px-1.5 py-0 h-4">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-[10px] text-muted-foreground px-3">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-xs h-8 hover:bg-chart-1/10">
                  <Phone className="h-3.5 w-3.5 text-chart-1" />
                  <span>Live Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-xs h-8 hover:bg-chart-4/10">
                  <HelpCircle className="h-3.5 w-3.5 text-chart-4" />
                  <span>Help Center</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default CSNavSidebar;
