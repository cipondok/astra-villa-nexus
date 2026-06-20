import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Play, Save, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CacheRow {
  file_name: string;
  url_count: number;
  generated_at: string;
}

const PRESETS: { label: string; cron: string }[] = [
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every 6 hours", cron: "0 */6 * * *" },
  { label: "Every 12 hours", cron: "0 */12 * * *" },
  { label: "Daily at 03:00 UTC", cron: "0 3 * * *" },
  { label: "Weekly (Mon 03:00 UTC)", cron: "0 3 * * 1" },
  { label: "Custom", cron: "custom" },
];

const CRON_REGEX = /^(\S+\s+){4}\S+$/;

export default function SitemapSchedule() {
  const { toast } = useToast();
  const [cron, setCron] = useState("0 3 * * *");
  const [preset, setPreset] = useState("0 3 * * *");
  const [customCron, setCustomCron] = useState("0 3 * * *");
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [cache, setCache] = useState<CacheRow[]>([]);
  const [loadingCache, setLoadingCache] = useState(true);

  const loadAll = async () => {
    setLoadingCache(true);
    const [settingsRes, cacheRes] = await Promise.all([
      supabase
        .from("system_settings")
        .select("value")
        .eq("key", "sitemapCronSchedule")
        .maybeSingle(),
      supabase
        .from("sitemap_cache")
        .select("file_name, url_count, generated_at")
        .order("file_name"),
    ]);
    if (settingsRes.data?.value) {
      const raw =
        typeof settingsRes.data.value === "string"
          ? settingsRes.data.value.replace(/^"|"$/g, "")
          : String(settingsRes.data.value).replace(/^"|"$/g, "");
      setCron(raw);
      const match = PRESETS.find((p) => p.cron === raw);
      if (match) {
        setPreset(raw);
      } else {
        setPreset("custom");
        setCustomCron(raw);
      }
    }
    if (cacheRes.data) setCache(cacheRes.data as CacheRow[]);
    setLoadingCache(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value !== "custom") setCron(value);
  };

  const effectiveCron = preset === "custom" ? customCron.trim() : cron;

  const handleSaveSchedule = async () => {
    if (!CRON_REGEX.test(effectiveCron)) {
      toast({
        title: "Invalid cron expression",
        description: "Must be a 5-field cron expression (e.g. '0 */6 * * *').",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "update-sitemap-schedule",
        { body: { cron: effectiveCron } },
      );
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Failed to update schedule");
      setCron(effectiveCron);
      toast({
        title: "Schedule saved",
        description: `Sitemaps will regenerate on: ${effectiveCron}`,
      });
    } catch (e) {
      toast({
        title: "Failed to update schedule",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "regenerate-sitemap",
        { body: {} },
      );
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Regeneration failed");
      toast({
        title: "Sitemaps regenerated",
        description: `Updated ${data.files?.length ?? 0} files at ${new Date(
          data.generated_at,
        ).toLocaleString()}`,
      });
      await loadAll();
    } catch (e) {
      toast({
        title: "Run failed",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const lastRun = cache.length
    ? cache.reduce((a, b) =>
        new Date(a.generated_at) > new Date(b.generated_at) ? a : b,
      ).generated_at
    : null;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Sitemap Schedule
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunNow}
              disabled={running}
              className="h-8 gap-1.5 text-xs"
            >
              <Play className={`h-3.5 w-3.5 ${running ? "animate-pulse" : ""}`} />
              {running ? "Running..." : "Run Now"}
            </Button>
            <Button
              size="sm"
              onClick={handleSaveSchedule}
              disabled={saving}
              className="h-8 gap-1.5 text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        <p className="text-xs text-muted-foreground">
          Server-side pg_cron job invokes the{" "}
          <code className="text-[10px]">regenerate-sitemap</code> edge function,
          which writes the latest XML into the{" "}
          <code className="text-[10px]">sitemap_cache</code> table.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Interval</Label>
            <Select value={preset} onValueChange={handlePresetChange}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.cron} value={p.cron} className="text-xs">
                    {p.label}
                    {p.cron !== "custom" && (
                      <span className="ml-2 text-muted-foreground">
                        ({p.cron})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cron expression</Label>
            <Input
              value={preset === "custom" ? customCron : cron}
              onChange={(e) =>
                preset === "custom"
                  ? setCustomCron(e.target.value)
                  : setCron(e.target.value)
              }
              disabled={preset !== "custom"}
              placeholder="0 */6 * * *"
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>

        <div className="rounded-md border border-border/50 p-2 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <History className="h-3 w-3" /> Last regenerated
            </span>
            <span>
              {loadingCache
                ? "Loading..."
                : lastRun
                  ? new Date(lastRun).toLocaleString()
                  : "Never"}
            </span>
          </div>
          {cache.map((row) => (
            <div
              key={row.file_name}
              className="flex items-center justify-between text-xs"
            >
              <code className="text-[11px]">{row.file_name}</code>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-5 text-[10px]">
                  {row.url_count} entries
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(row.generated_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
