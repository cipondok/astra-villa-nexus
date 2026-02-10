import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Shield, Users, UserCheck, Building2, Store,
  Mail, Phone, FileText, Camera, Video, Briefcase,
  GripVertical, Save, RotateCcw, ChevronUp, ChevronDown,
  Crown, Gem, Award, Star, CheckCircle2, Settings2,
  AlertTriangle, Loader2, Zap
} from "lucide-react";

const ROLE_CONFIG = {
  user: { label: "Users", icon: Users, color: "text-blue-500" },
  agent: { label: "Agents", icon: UserCheck, color: "text-emerald-500" },
  property_owner: { label: "Property Owners", icon: Building2, color: "text-amber-500" },
  vendor: { label: "Vendors", icon: Store, color: "text-purple-500" },
};

const STEP_ICONS: Record<string, React.ElementType> = {
  email_verification: Mail,
  phone_verification: Phone,
  id_upload: FileText,
  selfie_verification: Camera,
  license_upload: FileText,
  business_docs: Briefcase,
  video_call: Video,
  address_proof: FileText,
  ownership_docs: FileText,
  tax_docs: FileText,
  portfolio: FileText,
};

const TIER_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  verified: { icon: CheckCircle2, color: "text-blue-500" },
  vip: { icon: Star, color: "text-purple-500" },
  gold: { icon: Award, color: "text-yellow-500" },
  platinum: { icon: Gem, color: "text-cyan-500" },
  diamond: { icon: Crown, color: "text-sky-500" },
};

interface VerificationStep {
  id: string;
  role_type: string;
  step_order: number;
  step_key: string;
  step_label: string;
  step_description: string | null;
  is_enabled: boolean;
  is_required: boolean;
  auto_approve: boolean;
  auto_approve_conditions: any;
  tier_requirement: string;
  documents_required: string[];
  expiry_days: number | null;
}

interface TierRequirement {
  id: string;
  tier_name: string;
  min_properties: number;
  min_transactions: number;
  min_listings: number;
  min_rating: number;
  min_account_age_days: number;
  requires_verification: boolean;
  requires_subscription: boolean;
  auto_upgrade: boolean;
  custom_requirements: any;
}

const VerificationSystemSettings = () => {
  const queryClient = useQueryClient();
  const [activeRole, setActiveRole] = useState("user");
  const [editingTier, setEditingTier] = useState<string | null>(null);

  // Fetch verification steps
  const { data: steps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ["portal-verification-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_verification_settings")
        .select("*")
        .order("step_order", { ascending: true });
      if (error) throw error;
      return data as VerificationStep[];
    },
  });

  // Fetch tier requirements
  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["portal-tier-requirements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_tier_requirements")
        .select("*")
        .order("min_account_age_days", { ascending: true });
      if (error) throw error;
      return data as TierRequirement[];
    },
  });

  // Update step mutation
  const updateStepMutation = useMutation({
    mutationFn: async (step: Partial<VerificationStep> & { id: string }) => {
      const { id, ...updates } = step;
      const { error } = await supabase
        .from("portal_verification_settings")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-verification-settings"] });
      toast.success("Step updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Update tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async (tier: Partial<TierRequirement> & { id: string }) => {
      const { id, ...updates } = tier;
      const { error } = await supabase
        .from("portal_tier_requirements")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-tier-requirements"] });
      toast.success("Tier requirements updated");
      setEditingTier(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Reorder step
  const moveStep = (stepId: string, direction: "up" | "down") => {
    const roleSteps = steps.filter((s) => s.role_type === activeRole).sort((a, b) => a.step_order - b.step_order);
    const idx = roleSteps.findIndex((s) => s.id === stepId);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === roleSteps.length - 1)) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const currentOrder = roleSteps[idx].step_order;
    const swapOrder = roleSteps[swapIdx].step_order;

    updateStepMutation.mutate({ id: roleSteps[idx].id, step_order: swapOrder });
    updateStepMutation.mutate({ id: roleSteps[swapIdx].id, step_order: currentOrder });
  };

  const roleSteps = steps.filter((s) => s.role_type === activeRole).sort((a, b) => a.step_order - b.step_order);
  const isLoading = stepsLoading || tiersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-sm font-bold">Verification System Settings</h2>
            <p className="text-[10px] text-muted-foreground">
              Configure verification steps, tier requirements & auto-approve rules
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px]">
          <Settings2 className="h-3 w-3 mr-1" />
          Admin Only
        </Badge>
      </div>

      <Tabs defaultValue="steps" className="space-y-3">
        <TabsList className="h-8 bg-muted/50 p-0.5">
          <TabsTrigger value="steps" className="text-[10px] h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-3 w-3 mr-1" />
            Verification Steps
          </TabsTrigger>
          <TabsTrigger value="tiers" className="text-[10px] h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Crown className="h-3 w-3 mr-1" />
            Tier Requirements
          </TabsTrigger>
          <TabsTrigger value="auto-approve" className="text-[10px] h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="h-3 w-3 mr-1" />
            Auto-Approve Rules
          </TabsTrigger>
        </TabsList>

        {/* === VERIFICATION STEPS TAB === */}
        <TabsContent value="steps" className="space-y-3">
          {/* Role Selector */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(ROLE_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const count = steps.filter((s) => s.role_type === key && s.is_enabled).length;
              return (
                <Button
                  key={key}
                  variant={activeRole === key ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-[10px] gap-1.5"
                  onClick={() => setActiveRole(key)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                  <Badge variant="secondary" className="text-[8px] h-4 px-1 ml-1">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Steps List */}
          <div className="space-y-2">
            {roleSteps.map((step, index) => {
              const StepIcon = STEP_ICONS[step.step_key] || FileText;
              return (
                <Card key={step.id} className={`border ${step.is_enabled ? "border-border" : "border-border/30 opacity-60"}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Reorder */}
                      <div className="flex flex-col gap-0.5 pt-1">
                        <Button
                          variant="ghost" size="icon"
                          className="h-5 w-5"
                          onClick={() => moveStep(step.id, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <span className="text-[9px] text-center text-muted-foreground font-mono">{step.step_order}</span>
                        <Button
                          variant="ghost" size="icon"
                          className="h-5 w-5"
                          onClick={() => moveStep(step.id, "down")}
                          disabled={index === roleSteps.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Icon */}
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <StepIcon className="h-4 w-4 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold">{step.step_label}</span>
                          {step.is_required && (
                            <Badge variant="destructive" className="text-[8px] h-4 px-1">Required</Badge>
                          )}
                          {step.auto_approve && (
                            <Badge className="text-[8px] h-4 px-1 bg-emerald-500/20 text-emerald-700 border-emerald-300">
                              <Zap className="h-2.5 w-2.5 mr-0.5" />Auto
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{step.step_description}</p>

                        {/* Expiry */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-[9px] text-muted-foreground">Expiry (days):</Label>
                            <Input
                              type="number"
                              className="h-6 w-16 text-[10px]"
                              value={step.expiry_days ?? ""}
                              placeholder="Never"
                              onChange={(e) =>
                                updateStepMutation.mutate({
                                  id: step.id,
                                  expiry_days: e.target.value ? parseInt(e.target.value) : null,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="flex flex-col gap-2 items-end shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Label className="text-[9px]">Enabled</Label>
                          <Switch
                            checked={step.is_enabled}
                            onCheckedChange={(v) => updateStepMutation.mutate({ id: step.id, is_enabled: v })}
                            className="scale-75"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Label className="text-[9px]">Required</Label>
                          <Switch
                            checked={step.is_required}
                            onCheckedChange={(v) => updateStepMutation.mutate({ id: step.id, is_required: v })}
                            className="scale-75"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Label className="text-[9px]">Auto-Approve</Label>
                          <Switch
                            checked={step.auto_approve}
                            onCheckedChange={(v) => updateStepMutation.mutate({ id: step.id, auto_approve: v })}
                            className="scale-75"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {roleSteps.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No verification steps configured for this role</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === TIER REQUIREMENTS TAB === */}
        <TabsContent value="tiers" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => {
              const tierMeta = TIER_ICONS[tier.tier_name] || { icon: CheckCircle2, color: "text-muted-foreground" };
              const TierIcon = tierMeta.icon;
              const isEditing = editingTier === tier.id;

              return (
                <Card key={tier.id} className="border">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TierIcon className={`h-4 w-4 ${tierMeta.color}`} />
                        <CardTitle className="text-xs font-bold capitalize">{tier.tier_name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost" size="sm"
                        className="h-6 text-[9px]"
                        onClick={() => setEditingTier(isEditing ? null : tier.id)}
                      >
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {isEditing ? (
                      <TierEditForm tier={tier} onSave={(updates) => updateTierMutation.mutate({ id: tier.id, ...updates })} />
                    ) : (
                      <div className="space-y-1.5">
                        <TierRow label="Min Properties" value={tier.min_properties} />
                        <TierRow label="Min Transactions" value={tier.min_transactions} />
                        <TierRow label="Min Listings" value={tier.min_listings} />
                        <TierRow label="Min Rating" value={tier.min_rating} />
                        <TierRow label="Min Account Age" value={`${tier.min_account_age_days}d`} />
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Requires Verification</span>
                          <Badge variant={tier.requires_verification ? "default" : "secondary"} className="text-[8px] h-4">
                            {tier.requires_verification ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Requires Subscription</span>
                          <Badge variant={tier.requires_subscription ? "default" : "secondary"} className="text-[8px] h-4">
                            {tier.requires_subscription ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Auto Upgrade</span>
                          <Badge variant={tier.auto_upgrade ? "default" : "outline"} className="text-[8px] h-4">
                            {tier.auto_upgrade ? "Enabled" : "Manual"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* === AUTO-APPROVE RULES TAB === */}
        <TabsContent value="auto-approve" className="space-y-3">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Auto-Approve Configuration
              </CardTitle>
              <CardDescription className="text-[10px]">
                Steps marked as "Auto-Approve" will be automatically verified without manual admin review
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-3">
                {Object.entries(ROLE_CONFIG).map(([roleKey, roleConfig]) => {
                  const Icon = roleConfig.icon;
                  const roleAutoSteps = steps.filter((s) => s.role_type === roleKey);
                  return (
                    <div key={roleKey} className="space-y-1.5">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-3.5 w-3.5 ${roleConfig.color}`} />
                        <span className="text-[11px] font-semibold">{roleConfig.label}</span>
                      </div>
                      <div className="grid gap-1.5 pl-5">
                        {roleAutoSteps.sort((a, b) => a.step_order - b.step_order).map((step) => (
                          <div key={step.id} className="flex items-center justify-between py-1 px-2 rounded bg-muted/30">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] ${step.is_enabled ? "text-foreground" : "text-muted-foreground line-through"}`}>
                                {step.step_label}
                              </span>
                              {!step.is_enabled && (
                                <Badge variant="outline" className="text-[7px] h-3.5 px-1">Disabled</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-[8px] text-muted-foreground">Auto</Label>
                              <Switch
                                checked={step.auto_approve}
                                onCheckedChange={(v) => updateStepMutation.mutate({ id: step.id, auto_approve: v })}
                                className="scale-[0.65]"
                                disabled={!step.is_enabled}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[10px] text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-semibold">Auto-Approve Security Notice</p>
                  <p>Auto-approved steps bypass manual admin review. Only enable for low-risk steps like email verification. High-risk steps (ID upload, video call) should require manual review.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper components
const TierRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex items-center justify-between text-[10px]">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const TierEditForm = ({ tier, onSave }: { tier: TierRequirement; onSave: (updates: Partial<TierRequirement>) => void }) => {
  const [form, setForm] = useState({ ...tier });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[9px]">Min Properties</Label>
          <Input type="number" className="h-6 text-[10px]" value={form.min_properties}
            onChange={(e) => setForm({ ...form, min_properties: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-[9px]">Min Transactions</Label>
          <Input type="number" className="h-6 text-[10px]" value={form.min_transactions}
            onChange={(e) => setForm({ ...form, min_transactions: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-[9px]">Min Listings</Label>
          <Input type="number" className="h-6 text-[10px]" value={form.min_listings}
            onChange={(e) => setForm({ ...form, min_listings: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-[9px]">Min Rating</Label>
          <Input type="number" step="0.1" className="h-6 text-[10px]" value={form.min_rating}
            onChange={(e) => setForm({ ...form, min_rating: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-[9px]">Min Account Age (days)</Label>
          <Input type="number" className="h-6 text-[10px]" value={form.min_account_age_days}
            onChange={(e) => setForm({ ...form, min_account_age_days: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Switch checked={form.requires_verification} onCheckedChange={(v) => setForm({ ...form, requires_verification: v })} className="scale-75" />
          <Label className="text-[9px]">Requires Verification</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.requires_subscription} onCheckedChange={(v) => setForm({ ...form, requires_subscription: v })} className="scale-75" />
          <Label className="text-[9px]">Requires Subscription</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.auto_upgrade} onCheckedChange={(v) => setForm({ ...form, auto_upgrade: v })} className="scale-75" />
          <Label className="text-[9px]">Auto Upgrade</Label>
        </div>
      </div>
      <Button size="sm" className="h-7 text-[10px] w-full" onClick={() => onSave(form)}>
        <Save className="h-3 w-3 mr-1" />
        Save Changes
      </Button>
    </div>
  );
};

export default VerificationSystemSettings;
