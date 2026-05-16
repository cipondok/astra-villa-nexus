import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBadgeSettings, BadgeSettings, DEFAULT_BADGE_SETTINGS } from "@/hooks/useBadgeSettings";
import { toast } from "sonner";
import { Save, RotateCcw, Eye } from "lucide-react";
import BrandedStatusBadge from "@/components/ui/BrandedStatusBadge";

const LEVEL_KEYS = ["diamond", "platinum", "gold", "vip", "silver", "premium"] as const;

const BadgeSettingsPanel = () => {
  const { settings, isLoading, saveSettings, isSaving } = useBadgeSettings();
  const [draft, setDraft] = useState<BadgeSettings>(DEFAULT_BADGE_SETTINGS);
  const [previewLevel, setPreviewLevel] = useState("diamond");

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  const updateLevel = (key: string, field: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      levels: {
        ...prev.levels,
        [key]: { ...prev.levels[key], [field]: value },
      },
    }));
  };

  const handleSave = async () => {
    try {
      await saveSettings(draft);
      toast.success("Badge settings saved!");
    } catch (e: any) {
      toast.error("Failed to save: " + (e.message || "Unknown error"));
    }
  };

  const handleReset = () => {
    setDraft(DEFAULT_BADGE_SETTINGS);
    toast.info("Reset to defaults (unsaved)");
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Live Preview</h3>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Label>Preview Level:</Label>
          <Select value={previewLevel} onValueChange={setPreviewLevel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {draft.levels[k]?.label || k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-6 p-4 bg-muted/50 rounded-xl border">
          {/* XS */}
          <div className="text-center space-y-1">
            <p className="text-[10px] text-muted-foreground">XS</p>
            <BadgeSettingsPreview draft={draft} level={previewLevel} size="xs" />
          </div>
          {/* SM */}
          <div className="text-center space-y-1">
            <p className="text-[10px] text-muted-foreground">SM</p>
            <BadgeSettingsPreview draft={draft} level={previewLevel} size="sm" />
          </div>
          {/* MD */}
          <div className="text-center space-y-1">
            <p className="text-[10px] text-muted-foreground">MD</p>
            <BadgeSettingsPreview draft={draft} level={previewLevel} size="md" />
          </div>
        </div>
        {/* All levels preview */}
        <div className="mt-4 flex flex-wrap items-center gap-4 p-4 bg-background rounded-xl border">
          {LEVEL_KEYS.map((k) => (
            <div key={k} className="text-center space-y-1">
              <BadgeSettingsPreview draft={draft} level={k} size="sm" />
              <p className="text-[9px] text-muted-foreground">{draft.levels[k]?.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Shield Style</Label>
            <Select
              value={draft.shieldStyle}
              onValueChange={(v: any) => setDraft((p) => ({ ...p, shieldStyle: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="diamond">Diamond (Faceted)</SelectItem>
                <SelectItem value="classic">Classic (Smooth)</SelectItem>
                <SelectItem value="minimal">Minimal (Flat)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Badge Text</Label>
            <Input
              value={draft.badgeText}
              onChange={(e) => setDraft((p) => ({ ...p, badgeText: e.target.value }))}
              placeholder="Verified Partner"
            />
          </div>
          <div>
            <Label>Text Style</Label>
            <Select
              value={draft.badgeTextStyle}
              onValueChange={(v: any) => setDraft((p) => ({ ...p, badgeTextStyle: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pill">Pill (Colored)</SelectItem>
                <SelectItem value="plain">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={draft.showBadgeText}
              onCheckedChange={(c) => setDraft((p) => ({ ...p, showBadgeText: c }))}
            />
            <Label>Show Badge Text</Label>
          </div>
          <div className="md:col-span-2">
            <Label>Custom Logo URL (leave empty for header logo)</Label>
            <Input
              value={draft.logoUrl}
              onChange={(e) => setDraft((p) => ({ ...p, logoUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>
      </Card>

      {/* Per-Level Color Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Level Colors</h3>
        <div className="space-y-4">
          {LEVEL_KEYS.map((key) => {
            const level = draft.levels[key];
            return (
              <div key={key} className="grid grid-cols-5 gap-3 items-end border-b pb-3 last:border-0">
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={level?.label || key}
                    onChange={(e) => updateLevel(key, "label", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Main Color</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={level?.shieldColor || "#000"}
                      onChange={(e) => updateLevel(key, "shieldColor", e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={level?.shieldColor || ""}
                      onChange={(e) => updateLevel(key, "shieldColor", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Light</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={level?.shieldLight || "#000"}
                      onChange={(e) => updateLevel(key, "shieldLight", e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={level?.shieldLight || ""}
                      onChange={(e) => updateLevel(key, "shieldLight", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Dark</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={level?.shieldDark || "#000"}
                      onChange={(e) => updateLevel(key, "shieldDark", e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={level?.shieldDark || ""}
                      onChange={(e) => updateLevel(key, "shieldDark", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <BadgeSettingsPreview draft={draft} level={key} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end sticky bottom-4">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Badge Settings"}
        </Button>
      </div>
    </div>
  );
};

// Inline preview component using draft settings directly
const BadgeSettingsPreview = ({
  draft,
  level,
  size,
}: {
  draft: BadgeSettings;
  level: string;
  size: "xs" | "sm" | "md";
}) => {
  // We render BrandedStatusBadge but it reads from DB.
  // For instant preview, render inline SVG with draft values.
  const config = draft.levels[level];
  if (!config) return null;

  const SIZE_MAP = {
    xs: { width: 22, height: 26, logoSize: 16, logoY: 5 },
    sm: { width: 28, height: 32, logoSize: 20, logoY: 6 },
    md: { width: 34, height: 40, logoSize: 24, logoY: 7 },
  };
  const s = SIZE_MAP[size];
  const uid = `prev-${level}-${size}`;

  return (
    <div className="inline-flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 38"
        width={s.width}
        height={s.height}
        style={{ display: "block", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}
      >
        <defs>
          <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={config.shieldLight} />
            <stop offset="50%" stopColor={config.shieldColor} />
            <stop offset="100%" stopColor={config.shieldDark} />
          </linearGradient>
          <linearGradient id={`gl-${uid}`} x1="0.5" y1="0" x2="0.5" y2="0.6">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`fl-${uid}`} x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={`fr-${uid}`} x1="1" y1="0" x2="0" y2="0.5">
            <stop offset="0%" stopColor="black" stopOpacity="0.15" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`ft-${uid}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shield */}
        <path d="M16 1L2 7v11c0 9.5 6.2 17.4 14 19.5 7.8-2.1 14-10 14-19.5V7L16 1z" fill={`url(#sg-${uid})`} stroke={config.shieldDark} strokeWidth="0.8" />

        {draft.shieldStyle === "diamond" && (
          <>
            <path d="M16 1L2 7 16 13 30 7z" fill={`url(#ft-${uid})`} />
            <path d="M2 7v11c0 4 1.5 8 4 11.5L16 13z" fill={`url(#fl-${uid})`} />
            <path d="M30 7v11c0 4-1.5 8-4 11.5L16 13z" fill={`url(#fr-${uid})`} />
            <path d="M16 13v24.5" stroke="white" strokeWidth="0.3" strokeOpacity="0.25" />
            <circle cx="10" cy="10" r="0.6" fill="white" opacity="0.7" />
            <circle cx="22" cy="10" r="0.4" fill="white" opacity="0.5" />
            <circle cx="16" cy="6" r="0.5" fill="white" opacity="0.6" />
          </>
        )}

        {draft.shieldStyle === "classic" && (
          <path d="M16 1L2 7v11c0 9.5 6.2 17.4 14 19.5 7.8-2.1 14-10 14-19.5V7L16 1z" fill={`url(#gl-${uid})`} />
        )}

        {/* Checkmark */}
        <circle cx="25" cy="30" r="5" fill="white" />
        <circle cx="25" cy="30" r="4" fill={config.shieldColor} />
        <path d="M23 30l1.5 1.5 3-3" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {size !== "xs" && draft.showBadgeText && (
        <span
          className={`text-[9px] font-bold leading-none whitespace-nowrap ${
            draft.badgeTextStyle === "pill"
              ? "px-1.5 py-0.5 rounded-full text-primary-foreground"
              : "text-foreground/80"
          }`}
          style={draft.badgeTextStyle === "pill" ? { backgroundColor: config.shieldColor } : undefined}
        >
          {draft.badgeText}
        </span>
      )}
    </div>
  );
};

export default BadgeSettingsPanel;
