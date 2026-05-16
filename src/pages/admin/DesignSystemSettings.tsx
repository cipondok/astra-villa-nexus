import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDesignSystem, DESIGN_SYSTEM_VERSION } from "@/stores/designSystemStore";
import { toast } from "sonner";
import {
  Palette, Type, Layout, Bell, Square, Zap, RotateCcw, Shield,
  CheckCircle2, Settings2, Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ================================================================
   ASTRA Style Settings — Enterprise Admin Panel
   Route: /admin/style-settings  (also /admin/design-system)
   ================================================================ */

const SectionCard = ({ title, icon: Icon, children, className }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <Card className={cn(
    "border border-border/60 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden",
    className
  )}>
    <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-muted/30">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </Card>
);

const TokenRow = ({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="flex items-center gap-4">
    <Label className="w-24 text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">{label}</Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 text-sm bg-background/60 border-border/50 focus:border-primary/60"
    />
  </div>
);

const DesignSystemSettings = () => {
  const { config, updateConfig, resetConfig } = useDesignSystem();
  const [activeTab, setActiveTab] = useState("typography");

  const handleSave = () => {
    toast.success("Style settings saved successfully");
  };

  const handleReset = () => {
    resetConfig();
    toast.info("Design system reset to ASTRA defaults");
  };

  const tabs = [
    { id: "typography", label: "Typography", icon: Type },
    { id: "spacing", label: "Spacing", icon: Layout },
    { id: "borders", label: "Borders & Shadows", icon: Square },
    { id: "toasts", label: "Notifications", icon: Bell },
    { id: "modals", label: "Modals", icon: Palette },
    { id: "animations", label: "Motion", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">ASTRA Style Settings</h1>
                <p className="text-sm text-muted-foreground">Global design tokens &amp; UI configuration</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              <Shield className="h-3 w-3 mr-1" />
              v{DESIGN_SYSTEM_VERSION}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 border border-border/40 p-1 rounded-xl h-auto flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Typography */}
          <TabsContent value="typography" className="space-y-5 mt-6">
            <SectionCard title="Font Families" icon={Type}>
              <div className="space-y-4">
                <TokenRow label="Heading" value={config.fontFamily.heading} onChange={(v) => updateConfig({ fontFamily: { ...config.fontFamily, heading: v } })} placeholder="Playfair Display, serif" />
                <TokenRow label="Body" value={config.fontFamily.body} onChange={(v) => updateConfig({ fontFamily: { ...config.fontFamily, body: v } })} placeholder="Inter, sans-serif" />
                <TokenRow label="Mono" value={config.fontFamily.mono} onChange={(v) => updateConfig({ fontFamily: { ...config.fontFamily, mono: v } })} placeholder="SF Mono, monospace" />
              </div>
            </SectionCard>

            <SectionCard title="Font Sizes" icon={Eye}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(config.fontSize).map(([key, value]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => updateConfig({ fontSize: { ...config.fontSize, [key]: e.target.value } })}
                      className="h-9 text-sm bg-background/60 border-border/50"
                    />
                    <span className="text-[10px] text-muted-foreground/60" style={{ fontSize: value }}>Aa</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Spacing */}
          <TabsContent value="spacing" className="space-y-5 mt-6">
            <SectionCard title="Spacing Scale" icon={Layout}>
              <div className="space-y-4">
                {Object.entries(config.spacing).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-16 text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => updateConfig({ spacing: { ...config.spacing, [key]: e.target.value } })}
                      className="h-9 text-sm bg-background/60 border-border/50 max-w-48"
                    />
                    <div className="h-4 bg-primary/20 rounded" style={{ width: value }} />
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Borders & Shadows */}
          <TabsContent value="borders" className="space-y-5 mt-6">
            <SectionCard title="Border Radius" icon={Square}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(config.borderRadius).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => updateConfig({ borderRadius: { ...config.borderRadius, [key]: e.target.value } })}
                      className="h-9 text-sm bg-background/60 border-border/50"
                    />
                    <div className="w-12 h-12 bg-primary/15 border border-primary/30" style={{ borderRadius: value }} />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Shadows" icon={Palette}>
              <div className="space-y-4">
                {Object.entries(config.shadows).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => updateConfig({ shadows: { ...config.shadows, [key]: e.target.value } })}
                      className="h-9 text-sm bg-background/60 border-border/50"
                    />
                    <div className="w-20 h-10 bg-card rounded-lg" style={{ boxShadow: value }} />
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="toasts" className="space-y-5 mt-6">
            <SectionCard title="Toast Configuration" icon={Bell}>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Position</Label>
                  <Select value={config.toastSettings.position} onValueChange={(v: any) => updateConfig({ toastSettings: { ...config.toastSettings, position: v } })}>
                    <SelectTrigger className="h-9 bg-background/60 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["top-left","top-center","top-right","bottom-left","bottom-center","bottom-right"].map(p => (
                        <SelectItem key={p} value={p}>{p.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <TokenRow label="Duration" value={String(config.toastSettings.duration)} onChange={(v) => updateConfig({ toastSettings: { ...config.toastSettings, duration: parseInt(v) || 5000 } })} placeholder="5000" />
                <TokenRow label="Max Visible" value={String(config.toastSettings.maxVisible)} onChange={(v) => updateConfig({ toastSettings: { ...config.toastSettings, maxVisible: parseInt(v) || 3 } })} placeholder="3" />
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Show Progress Bar</Label>
                  <Switch checked={config.toastSettings.showProgress} onCheckedChange={(c) => updateConfig({ toastSettings: { ...config.toastSettings, showProgress: c } })} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Preview Toasts" icon={Eye}>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Success notification test")}>Success</Button>
                <Button variant="outline" size="sm" onClick={() => toast.error("Error notification test")}>Error</Button>
                <Button variant="outline" size="sm" onClick={() => toast.warning("Warning notification test")}>Warning</Button>
                <Button variant="outline" size="sm" onClick={() => toast.info("Info notification test")}>Info</Button>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Modals */}
          <TabsContent value="modals" className="space-y-5 mt-6">
            <SectionCard title="Modal & Popup Behavior" icon={Palette}>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Animation</Label>
                  <Select value={config.modalSettings.animation} onValueChange={(v: any) => updateConfig({ modalSettings: { ...config.modalSettings, animation: v } })}>
                    <SelectTrigger className="h-9 bg-background/60 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {[
                  { id: "backdrop", label: "Backdrop Blur", key: "backdropBlur" as const },
                  { id: "outside", label: "Close on Outside Click", key: "closeOnOutsideClick" as const },
                  { id: "close", label: "Show Close Button", key: "showCloseButton" as const },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">{item.label}</Label>
                    <Switch
                      checked={config.modalSettings[item.key]}
                      onCheckedChange={(c) => updateConfig({ modalSettings: { ...config.modalSettings, [item.key]: c } })}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Animations */}
          <TabsContent value="animations" className="space-y-5 mt-6">
            <SectionCard title="Motion Timing" icon={Zap}>
              <div className="space-y-4">
                <TokenRow label="Fast" value={config.animations.duration.fast} onChange={(v) => updateConfig({ animations: { ...config.animations, duration: { ...config.animations.duration, fast: v } } })} placeholder="150ms" />
                <TokenRow label="Normal" value={config.animations.duration.normal} onChange={(v) => updateConfig({ animations: { ...config.animations, duration: { ...config.animations.duration, normal: v } } })} placeholder="300ms" />
                <TokenRow label="Slow" value={config.animations.duration.slow} onChange={(v) => updateConfig({ animations: { ...config.animations, duration: { ...config.animations.duration, slow: v } } })} placeholder="500ms" />
                <TokenRow label="Easing" value={config.animations.easing} onChange={(v) => updateConfig({ animations: { ...config.animations, easing: v } })} placeholder="cubic-bezier(0.4, 0, 0.2, 1)" />
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DesignSystemSettings;
