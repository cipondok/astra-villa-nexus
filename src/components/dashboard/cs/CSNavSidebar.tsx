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
    { title: "Dashboard", value: "dashboard", icon: Home },
    { title: "My Tickets", value: "my-tickets", icon: FileText, badge: myOpenTickets },
    { title: "Inquiries", value: "inquiries", icon: MessageSquare, badge: pendingInquiries },
    { title: "Available", value: "available", icon: Clock, badge: availableTickets },
    { title: "Analytics", value: "analytics", icon: BarChart3 },
    { title: "Settings", value: "settings", icon: Settings },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="h-6 w-6 text-blue-600" />
            <h2 className="font-semibold text-lg">CS Dashboard</h2>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.value)}
                    className={activeTab === item.value ? "bg-blue-100 text-blue-700" : ""}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">
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
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Phone className="h-4 w-4" />
                  <span>Live Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HelpCircle className="h-4 w-4" />
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