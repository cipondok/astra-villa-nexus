import React, { useCallback, useState } from "react";
import { Bell, Settings, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { AdminBreadcrumb } from "./AdminBreadcrumb";

interface AdminHeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const priorityColor = (priority: string) => {
  if (priority === "high") return "bg-destructive/10 text-destructive";
  if (priority === "medium") return "bg-chart-3/10 text-chart-3";
  return "bg-primary/10 text-primary";
};

const AdminHeader = ({ activeSection, onSectionChange }: AdminHeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_alerts")
        .select("id, title, message, priority, created_at")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
    refetchInterval: 60_000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("admin_alerts")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Notification marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  const handleNotificationClick = useCallback(
    (id: string) => {
      markAsReadMutation.mutate(id);
      setNotificationsOpen(false);
      onSectionChange("admin-alerts");
    },
    [markAsReadMutation, onSectionChange]
  );

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  const unreadCount = notifications.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/60 backdrop-blur-xl shadow-sm">
      <div className="flex h-12 items-center gap-3 px-4">
        {/* Breadcrumb */}
        <div className="flex-1">
          <AdminBreadcrumb
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <AdminCommandPalette onSectionChange={onSectionChange} />

          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 hover:bg-primary/10"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive rounded-full flex items-center justify-center text-[9px] text-destructive-foreground font-bold">
                    <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-60" />
                    <span className="relative">{unreadCount}</span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 backdrop-blur-xl bg-background/95 border-border/50"
            >
              <DropdownMenuLabel className="py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    Notifications ({unreadCount})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => {
                      setNotificationsOpen(false);
                      onSectionChange("admin-alerts");
                    }}
                  >
                    View All
                  </Button>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start py-2 px-3 cursor-pointer hover:bg-accent/50"
                      onClick={() => handleNotificationClick(n.id)}
                    >
                      <div className="flex items-start justify-between w-full mb-1">
                        <p className="text-xs font-medium flex-1 pr-2 line-clamp-1">
                          {n.title}
                        </p>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${priorityColor(n.priority)}`}
                        >
                          {n.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-muted-foreground/70">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No new notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Profile */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs">
                    {profile?.full_name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 backdrop-blur-xl bg-background/95 border-border/50"
            >
              <DropdownMenuLabel className="py-2">
                <div className="flex flex-col">
                  <p className="text-xs font-medium">
                    {profile?.full_name || "Admin"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Administrator</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onSectionChange("system-settings")}
                className="text-xs py-1.5"
              >
                <Settings className="h-3.5 w-3.5 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/")}
                className="text-xs py-1.5"
              >
                <Bell className="h-3.5 w-3.5 mr-2" />
                Go to Home
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive text-xs py-1.5"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
