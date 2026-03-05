import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, User, Settings, Database, FileText, Clock, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  details: string;
  severity: "info" | "warning" | "critical";
  ip: string;
}

const auditEntries: AuditEntry[] = [
  { id: "1", timestamp: "2026-03-05 14:32:15", actor: "admin@astra.com", action: "UPDATE", resource: "user_roles", details: "Changed role for user_id=abc123 from 'user' to 'agent'", severity: "warning", ip: "103.xx.xx.45" },
  { id: "2", timestamp: "2026-03-05 14:28:00", actor: "system", action: "AUTO_TUNE", resource: "ai_model_weights", details: "Adjusted Location weight from 25 to 24, Price from 20 to 22", severity: "info", ip: "internal" },
  { id: "3", timestamp: "2026-03-05 13:55:22", actor: "admin@astra.com", action: "DELETE", resource: "properties", details: "Removed property id=prop_456 (flagged as duplicate)", severity: "critical", ip: "103.xx.xx.45" },
  { id: "4", timestamp: "2026-03-05 13:42:10", actor: "system", action: "LOCKOUT", resource: "account_lockouts", details: "Account locked for user@test.com after 5 failed attempts", severity: "critical", ip: "45.xx.xx.12" },
  { id: "5", timestamp: "2026-03-05 13:30:00", actor: "admin@astra.com", action: "APPROVE", resource: "agent_registration_requests", details: "Approved agent registration for Budi Santoso", severity: "info", ip: "103.xx.xx.45" },
  { id: "6", timestamp: "2026-03-05 12:15:33", actor: "system", action: "BACKUP", resource: "database", details: "Daily automated backup completed successfully", severity: "info", ip: "internal" },
  { id: "7", timestamp: "2026-03-05 11:45:00", actor: "admin2@astra.com", action: "UPDATE", resource: "system_settings", details: "Changed maintenance mode to false", severity: "warning", ip: "103.xx.xx.88" },
  { id: "8", timestamp: "2026-03-05 10:20:12", actor: "admin@astra.com", action: "CREATE", resource: "admin_alerts", details: "Created manual alert: Server migration notice", severity: "info", ip: "103.xx.xx.45" },
  { id: "9", timestamp: "2026-03-05 09:00:00", actor: "system", action: "CRON", resource: "notification-engine", details: "Sent 1,250 scheduled lease reminder emails", severity: "info", ip: "internal" },
  { id: "10", timestamp: "2026-03-04 23:55:00", actor: "system", action: "RLS_VIOLATION", resource: "properties", details: "Blocked unauthorized access attempt on property id=prop_789", severity: "critical", ip: "92.xx.xx.33" },
];

const hourlyActivity = Array.from({ length: 12 }, (_, i) => ({
  hour: `${(i * 2 + 8).toString().padStart(2, "0")}:00`,
  actions: Math.floor(Math.random() * 20 + 5),
  critical: Math.floor(Math.random() * 3),
}));

const severityColor: Record<string, string> = {
  info: "text-muted-foreground", warning: "text-chart-3", critical: "text-destructive"
};
const severityBadge: Record<string, "default" | "secondary" | "destructive"> = {
  info: "secondary", warning: "default", critical: "destructive"
};
const actionIcon: Record<string, typeof Shield> = {
  UPDATE: Settings, DELETE: AlertTriangle, CREATE: FileText, APPROVE: User, AUTO_TUNE: Database, LOCKOUT: Shield, BACKUP: Database, CRON: Clock, RLS_VIOLATION: Shield,
};

const SystemAuditTrail = () => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = auditEntries.filter(e => {
    const matchSearch = !search || e.action.toLowerCase().includes(search.toLowerCase()) || e.resource.toLowerCase().includes(search.toLowerCase()) || e.details.toLowerCase().includes(search.toLowerCase()) || e.actor.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "all" || e.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">System Audit Trail</h2>
        <p className="text-sm text-muted-foreground">Complete record of administrative and system actions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Shield className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{auditEntries.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Events</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{auditEntries.filter(e => e.severity === "critical").length}</p>
          <p className="text-[10px] text-muted-foreground">Critical</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <User className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-foreground">{new Set(auditEntries.map(e => e.actor)).size}</p>
          <p className="text-[10px] text-muted-foreground">Actors</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Database className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{new Set(auditEntries.map(e => e.resource)).size}</p>
          <p className="text-[10px] text-muted-foreground">Resources</p>
        </CardContent></Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Activity Timeline</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="actions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Actions" />
              <Bar dataKey="critical" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search actions, resources, actors..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(e => {
          const Icon = actionIcon[e.action] || Shield;
          return (
            <Card key={e.id} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg shrink-0 ${e.severity === "critical" ? "bg-destructive/10" : e.severity === "warning" ? "bg-chart-3/10" : "bg-muted/50"}`}>
                    <Icon className={`h-3.5 w-3.5 ${severityColor[e.severity]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-medium text-foreground">{e.action}</code>
                      <Badge variant={severityBadge[e.severity]} className="text-[8px]">{e.severity}</Badge>
                      <Badge variant="outline" className="text-[8px]">{e.resource}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{e.details}</p>
                    <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                      <span>{e.actor}</span>
                      <span>{e.timestamp}</span>
                      <span>IP: {e.ip}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SystemAuditTrail;
