import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Wifi, Thermometer, Lock, Lightbulb, Camera, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const integrations = [
  { name: "Smart Locks", icon: Lock, properties: 124, active: true, status: "Online", uptime: 99.8 },
  { name: "Climate Control", icon: Thermometer, properties: 89, active: true, status: "Online", uptime: 98.2 },
  { name: "Smart Lighting", icon: Lightbulb, properties: 156, active: true, status: "Online", uptime: 99.5 },
  { name: "Security Cameras", icon: Camera, properties: 67, active: false, status: "Maintenance", uptime: 95.1 },
  { name: "Energy Monitor", icon: Zap, properties: 45, active: true, status: "Online", uptime: 97.8 },
  { name: "WiFi Management", icon: Wifi, properties: 201, active: true, status: "Online", uptime: 99.9 },
];

const energyData = [
  { month: "Oct", consumption: 4200, savings: 680 },
  { month: "Nov", consumption: 3800, savings: 720 },
  { month: "Dec", consumption: 4100, savings: 690 },
  { month: "Jan", consumption: 3600, savings: 810 },
  { month: "Feb", consumption: 3400, savings: 850 },
  { month: "Mar", consumption: 3200, savings: 920 },
];

const deviceAlerts = [
  { property: "Villa Seminyak #12", device: "Smart Lock", issue: "Battery Low (8%)", priority: "High" },
  { property: "Apt. Sudirman #405", device: "AC Unit", issue: "Filter Replacement", priority: "Medium" },
  { property: "Villa Ubud #3", device: "Camera #2", issue: "Offline 2h", priority: "High" },
  { property: "Kota Kasablanka #1201", device: "Energy Meter", issue: "Unusual spike", priority: "Low" },
];

const SmartHomeIntegration = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Smart Home Integration</h2>
        <p className="text-muted-foreground text-sm">IoT device management, energy monitoring, and property automation</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Connected Properties", value: "201" },
          { label: "Total Devices", value: "1,847" },
          { label: "Avg Energy Savings", value: "18.2%" },
          { label: "Device Uptime", value: "98.4%" },
        ].map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((int) => (
          <Card key={int.name} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <int.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground text-sm">{int.name}</span>
                </div>
                <Switch checked={int.active} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{int.properties} properties</span>
                  <Badge variant={int.status === "Online" ? "outline" : "secondary"} className="text-[10px]">{int.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={int.uptime} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-muted-foreground">{int.uptime}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Energy Consumption vs Savings (kWh)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="consumption" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Device Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deviceAlerts.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.device}</p>
                    <p className="text-xs text-muted-foreground">{a.property}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.issue}</p>
                  </div>
                  <Badge variant={a.priority === "High" ? "destructive" : a.priority === "Medium" ? "secondary" : "outline"} className="text-[10px]">
                    {a.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartHomeIntegration;
