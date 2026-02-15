import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { suppressSessionCheck } from "@/hooks/useSessionMonitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";
import { Sparkles, MapPin, Loader2, CheckCircle, AlertTriangle, ImageIcon, StopCircle, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'land', 'commercial', 'townhouse', 'warehouse', 'kost'];

const SamplePropertyGenerator = () => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [skipExisting, setSkipExisting] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ created: 0, skipped: 0, errors: 0, processed: 0, total: 0 });
  const [result, setResult] = useState<any>(null);
  const cancelRef = useRef(false);

  const { data: provinces = [], isLoading: loadingProvinces } = useQuery({
    queryKey: ["provinces-for-seeding"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_distinct_provinces");
      if (error) throw error;
      return ((data || []) as Array<{ province_name: string }>).map(d => d.province_name).filter(Boolean).sort();
    },
  });

  const { data: kelurahanCount = 0 } = useQuery({
    queryKey: ["kelurahan-count", selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return 0;
      const { data, error } = await supabase
        .from("locations")
        .select("subdistrict_name")
        .eq("province_name", selectedProvince)
        .eq("is_active", true)
        .not("subdistrict_name", "is", null);
      if (error) return 0;
      return new Set((data || []).map(d => d.subdistrict_name)).size;
    },
    enabled: !!selectedProvince,
  });

  const { data: existingCount = 0 } = useQuery({
    queryKey: ["existing-properties-count", selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return 0;
      const { count, error } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("state", selectedProvince);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!selectedProvince,
  });

  const totalExpected = kelurahanCount * PROPERTY_TYPES.length;

  const handleGenerate = async () => {
    // Verify we have a valid user session before starting
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error("You must be logged in to generate properties. Please log in again.");
      return;
    }

    suppressSessionCheck(true);
    cancelRef.current = false;
    setIsRunning(true);
    setResult(null);
    const totals = { created: 0, skipped: 0, errors: 0, processed: 0, total: kelurahanCount };
    setProgress(totals);

    let offset = 0;
    let hasMore = true;

    while (hasMore && !cancelRef.current) {
      try {
        // Refresh session to prevent token expiry during long batch runs
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          toast.error("Session expired during generation. Please log in again and retry.");
          break;
        }
        
        const { data, error } = await supabase.functions.invoke("seed-sample-properties", {
          body: { province: selectedProvince, skipExisting, offset },
        });

        if (error) {
          const errorMsg = error.message || '';
          // If 401/auth error, stop the loop instead of continuing (prevents logout cascade)
          if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Invalid token')) {
            toast.error("Session expired. Please log in again and retry.");
            break;
          }
          toast.error(`Batch error at offset ${offset}: ${errorMsg}`);
          totals.errors += 1;
          offset += 5;
          hasMore = offset < kelurahanCount;
          continue;
        }

        totals.created += data.created || 0;
        totals.skipped += data.skipped || 0;
        totals.errors += data.errors || 0;
        totals.processed += data.batchProcessed || 0;
        setProgress({ ...totals });

        hasMore = data.hasMore;
        if (data.nextOffset != null) {
          offset = data.nextOffset;
        } else {
          hasMore = false;
        }
      } catch (err: any) {
        toast.error(`Batch failed at offset ${offset}`);
        offset += 5;
        hasMore = offset < kelurahanCount;
      }
    }

    suppressSessionCheck(false);
    setIsRunning(false);
    setResult(totals);
    if (cancelRef.current) {
      toast.info("Generation cancelled");
    } else {
      toast.success(`Done! Created ${totals.created} properties for ${selectedProvince}`);
    }
  };

  const progressPercent = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Sample Property Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate sample properties with AI images for each kelurahan/desa per province (batched)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Select Province
          </CardTitle>
          <CardDescription>
            Choose a province to generate 1 property per type ({PROPERTY_TYPES.length} types) for each kelurahan/desa.
            Processed in small batches to avoid timeouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={provinceOpen}
                disabled={isRunning}
                className="w-full justify-between font-normal"
              >
                {selectedProvince || (loadingProvinces ? "Loading provinces..." : "Select a province...")}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover border border-border shadow-lg z-50" align="start">
              <Command>
                <CommandInput placeholder="Search province..." />
                <CommandList className="max-h-64">
                  <CommandEmpty>No province found.</CommandEmpty>
                  <CommandGroup>
                    {provinces.map((p) => (
                      <CommandItem
                        key={p}
                        value={p}
                        onSelect={() => {
                          setSelectedProvince(p);
                          setProvinceOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedProvince === p ? "opacity-100" : "opacity-0")} />
                        {p}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedProvince && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">{kelurahanCount}</p>
                <p className="text-xs text-muted-foreground">Kelurahan/Desa</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">{totalExpected}</p>
                <p className="text-xs text-muted-foreground">Properties to Create</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-orange-500">{existingCount}</p>
                <p className="text-xs text-muted-foreground">Existing Properties</p>
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium mb-2 block">Property Types (1 per kelurahan)</Label>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs capitalize">{type}</Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label className="text-sm font-medium">Skip existing kelurahan</Label>
              <p className="text-xs text-muted-foreground">Skip kelurahan that already have properties of the same type</p>
            </div>
            <Switch checked={skipExisting} onCheckedChange={setSkipExisting} disabled={isRunning} />
          </div>

          {selectedProvince && totalExpected > 100 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <div className="text-xs text-orange-700 dark:text-orange-300">
                <p className="font-medium">Large batch info</p>
                <p>This will generate {totalExpected} properties in batches of {PROPERTY_TYPES.length * 5} (5 kelurahan at a time). You can cancel at any time.</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2"
              size="lg"
              disabled={!selectedProvince || isRunning}
              onClick={handleGenerate}
            >
              <ImageIcon className="h-4 w-4" />
              Generate {totalExpected} Properties
            </Button>
            {isRunning && (
              <Button
                variant="destructive"
                size="lg"
                onClick={() => { cancelRef.current = true; }}
                className="gap-2"
              >
                <StopCircle className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">
                Processing batch {Math.ceil(progress.processed / 5)} of {Math.ceil(progress.total / 5)}...
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="text-green-600">✓ {progress.created} created</span>
              <span className="text-orange-500">⊘ {progress.skipped} skipped</span>
              <span className="text-red-500">✗ {progress.errors} errors</span>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !isRunning && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-green-700 dark:text-green-300">Generation Complete!</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-2 rounded bg-background/50">
                    <p className="text-lg font-bold">{progress.total}</p>
                    <p className="text-[10px] text-muted-foreground">Kelurahan</p>
                  </div>
                  <div className="text-center p-2 rounded bg-background/50">
                    <p className="text-lg font-bold text-green-600">{result.created}</p>
                    <p className="text-[10px] text-muted-foreground">Created</p>
                  </div>
                  <div className="text-center p-2 rounded bg-background/50">
                    <p className="text-lg font-bold text-orange-500">{result.skipped}</p>
                    <p className="text-[10px] text-muted-foreground">Skipped</p>
                  </div>
                  <div className="text-center p-2 rounded bg-background/50">
                    <p className="text-lg font-bold text-red-500">{result.errors}</p>
                    <p className="text-[10px] text-muted-foreground">Errors</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SamplePropertyGenerator;
