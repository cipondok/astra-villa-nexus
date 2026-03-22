import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlert } from "@/contexts/AlertContext";
import {
  Shield, Search, Users, UserPlus, Trash2, ShieldCheck,
  CheckCircle, XCircle, AlertTriangle, Settings2, Grid3X3
} from "lucide-react";
import { useAllRolePermissions } from "@/hooks/usePermissions";

const ALL_ROLES = [
  "general_user", "property_owner", "agent", "vendor", "admin",
  "customer_service", "super_admin", "investor", "editor",
  "developer", "service_provider", "legal_consultant"
] as const;

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-destructive/15 text-destructive border-destructive/30",
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  agent: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  property_owner: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  vendor: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  investor: "bg-primary/10 text-primary border-primary/20",
  customer_service: "bg-accent/10 text-accent-foreground border-accent/20",
  editor: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  developer: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  service_provider: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  legal_consultant: "bg-muted text-muted-foreground border-border",
  general_user: "bg-muted text-muted-foreground border-border",
};

interface UserRoleRecord {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string;
  };
}

const UserRoleManagement = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState("");

  // New role assignment
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all role assignments with profile info
  const { data: roleAssignments = [], isLoading } = useQuery({
    queryKey: ["admin-role-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role, is_active, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch profiles for these users
      const userIds = [...new Set((data || []).map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      return (data || []).map((r) => ({
        ...r,
        profile: profileMap.get(r.user_id) || { full_name: null, email: "Unknown" },
      })) as UserRoleRecord[];
    },
  });

  // Fetch all permissions
  const { data: allPermissions = [] } = useAllRolePermissions();

  // Fetch users for assignment dialog
  const { data: allUsers = [] } = useQuery({
    queryKey: ["all-users-for-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name")
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    enabled: assignDialogOpen,
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: typeof ALL_ROLES[number] }) => {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role, is_active: true } as any, { onConflict: "user_id,role" });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Role Assigned", "Role has been assigned successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-role-assignments"] });
      setAssignDialogOpen(false);
      setNewUserId("");
      setNewRole("");
    },
    onError: (e: any) => showError("Assignment Failed", e.message),
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Role Removed", "Role assignment has been removed.");
      queryClient.invalidateQueries({ queryKey: ["admin-role-assignments"] });
    },
    onError: (e: any) => showError("Removal Failed", e.message),
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ is_active: active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Updated", "Role status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-role-assignments"] });
    },
    onError: (e: any) => showError("Update Failed", e.message),
  });

  // Bulk assign mutation
  const bulkAssignMutation = useMutation({
    mutationFn: async ({ userIds, role }: { userIds: string[]; role: string }) => {
      const records = userIds.map((uid) => ({ user_id: uid, role, is_active: true }));
      const { error } = await supabase
        .from("user_roles")
        .upsert(records, { onConflict: "user_id,role" });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Bulk Assign Complete", `Role assigned to ${selectedUserIds.size} users.`);
      queryClient.invalidateQueries({ queryKey: ["admin-role-assignments"] });
      setSelectedUserIds(new Set());
      setBulkRole("");
      setBulkMode(false);
    },
    onError: (e: any) => showError("Bulk Assign Failed", e.message),
  });

  // Filtered assignments
  const filtered = useMemo(() => {
    return roleAssignments.filter((r) => {
      const matchSearch =
        r.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === "all" || r.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [roleAssignments, searchTerm, roleFilter]);

  // Role stats
  const roleStats = useMemo(() => {
    const counts: Record<string, number> = {};
    roleAssignments.forEach((r) => {
      if (r.is_active) counts[r.role] = (counts[r.role] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => ({ role, count }));
  }, [roleAssignments]);

  // Permissions matrix
  const permMatrix = useMemo(() => {
    const roles = [...new Set(allPermissions.map((p) => p.role))].sort();
    const perms = [...new Set(allPermissions.map((p) => p.permission))].sort();
    const map = new Set(allPermissions.map((p) => `${p.role}:${p.permission}`));
    return { roles, perms, has: (r: string, p: string) => map.has(`${r}:${p}`) };
  }, [allPermissions]);

  const toggleBulkSelect = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Role & Permission Management</h2>
            <p className="text-[10px] text-muted-foreground">
              {roleAssignments.length} assignments across {roleStats.length} roles
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant={bulkMode ? "default" : "outline"}
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => setBulkMode(!bulkMode)}
          >
            <Grid3X3 className="h-3 w-3 mr-1" />
            Bulk
          </Button>
          <Button size="sm" className="h-7 text-[10px]" onClick={() => setAssignDialogOpen(true)}>
            <UserPlus className="h-3 w-3 mr-1" />
            Assign Role
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8 bg-muted/50">
          <TabsTrigger value="assignments" className="text-[10px] h-6 gap-1">
            <Users className="h-3 w-3" /> Assignments
          </TabsTrigger>
          <TabsTrigger value="matrix" className="text-[10px] h-6 gap-1">
            <Grid3X3 className="h-3 w-3" /> Permission Matrix
          </TabsTrigger>
          <TabsTrigger value="distribution" className="text-[10px] h-6 gap-1">
            <Shield className="h-3 w-3" /> Distribution
          </TabsTrigger>
        </TabsList>

        {/* Role Assignments Tab */}
        <TabsContent value="assignments" className="space-y-3 mt-3">
          {/* Filters */}
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-7 text-[10px]"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] h-7 text-[10px]">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="text-[10px]">
                    {r.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Bar */}
          {bulkMode && selectedUserIds.size > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {selectedUserIds.size} selected
                </Badge>
                <Select value={bulkRole} onValueChange={setBulkRole}>
                  <SelectTrigger className="w-[140px] h-6 text-[10px]">
                    <SelectValue placeholder="Assign role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="text-[10px]">
                        {r.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="h-6 text-[10px]"
                  disabled={!bulkRole || bulkAssignMutation.isPending}
                  onClick={() =>
                    bulkAssignMutation.mutate({
                      userIds: [...selectedUserIds],
                      role: bulkRole,
                    })
                  }
                >
                  Apply
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {bulkMode && <TableHead className="w-8" />}
                    <TableHead className="text-[10px]">User</TableHead>
                    <TableHead className="text-[10px]">Role</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                    <TableHead className="text-[10px]">Assigned</TableHead>
                    <TableHead className="text-[10px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                        No role assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.slice(0, 100).map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/20">
                        {bulkMode && (
                          <TableCell className="w-8 pr-0">
                            <Checkbox
                              checked={selectedUserIds.has(r.user_id)}
                              onCheckedChange={() => toggleBulkSelect(r.user_id)}
                              className="h-3.5 w-3.5"
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div>
                            <p className="text-[11px] font-medium truncate max-w-[160px]">
                              {r.profile?.full_name || "No Name"}
                            </p>
                            <p className="text-[9px] text-muted-foreground truncate max-w-[160px]">
                              {r.profile?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[9px] ${ROLE_COLORS[r.role] || ROLE_COLORS.general_user}`}>
                            {r.role.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {r.is_active ? (
                            <Badge className="text-[9px] bg-chart-1/10 text-chart-1 border-chart-1/20">
                              <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px]">
                              <XCircle className="h-2.5 w-2.5 mr-0.5" /> Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                toggleActiveMutation.mutate({ id: r.id, active: !r.is_active })
                              }
                              title={r.is_active ? "Deactivate" : "Activate"}
                            >
                              {r.is_active ? (
                                <XCircle className="h-3 w-3 text-chart-3" />
                              ) : (
                                <CheckCircle className="h-3 w-3 text-chart-1" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeRoleMutation.mutate(r.id)}
                              disabled={removeRoleMutation.isPending}
                              title="Remove role"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {filtered.length > 100 && (
                <div className="text-center py-2 text-[10px] text-muted-foreground border-t">
                  Showing 100 of {filtered.length} assignments
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permission Matrix Tab */}
        <TabsContent value="matrix" className="mt-3">
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5 text-primary" />
                Role × Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {permMatrix.roles.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-chart-3" />
                  No permissions configured yet. Add entries to the role_permissions table.
                </div>
              ) : (
                <div className="overflow-auto max-h-[500px]">
                  <table className="w-full text-[9px]">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="border-b">
                        <th className="text-left p-1.5 font-semibold min-w-[120px] bg-muted/30">
                          Permission
                        </th>
                        {permMatrix.roles.map((role) => (
                          <th
                            key={role}
                            className="p-1.5 font-semibold text-center min-w-[70px] bg-muted/30"
                          >
                            <span className="block truncate">{role.replace(/_/g, " ")}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permMatrix.perms.map((perm) => (
                        <tr key={perm} className="border-b border-border/30 hover:bg-muted/10">
                          <td className="p-1.5 font-medium">{perm.replace(/_/g, " ")}</td>
                          {permMatrix.roles.map((role) => (
                            <td key={role} className="p-1.5 text-center">
                              {permMatrix.has(role, perm) ? (
                                <CheckCircle className="h-3 w-3 text-chart-1 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground/30">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="mt-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {roleStats.map(({ role, count }) => (
              <Card key={role} className="border hover:border-primary/30 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`text-[9px] ${ROLE_COLORS[role] || ROLE_COLORS.general_user}`}>
                      {role.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-[10px] text-muted-foreground">active assignments</p>
                </CardContent>
              </Card>
            ))}
            {roleStats.length === 0 && (
              <div className="col-span-full text-center py-8 text-xs text-muted-foreground">
                No active role assignments
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign Role Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <UserPlus className="h-4 w-4" /> Assign Role to User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">User</label>
              <Select value={newUserId} onValueChange={setNewUserId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {allUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      {u.full_name || u.email} — {u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!newUserId || !newRole || assignRoleMutation.isPending}
                onClick={() => assignRoleMutation.mutate({ userId: newUserId, role: newRole })}
              >
                {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRoleManagement;
