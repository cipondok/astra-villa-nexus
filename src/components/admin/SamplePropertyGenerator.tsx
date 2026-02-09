import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Sparkles, MapPin, Loader2, CheckCircle, AlertTriangle, ImageIcon } from "lucide-react";

const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'land', 'commercial', 'townhouse', 'warehouse', 'kost'];

const SamplePropertyGenerator = () => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [skipExisting, setSkipExisting] = useState(true);
  const [result, setResult] = useState<any>(null);

  // Fetch provinces from locations table
  const { data: provinces = [], isLoading: loadingProvinces } = useQuery({
    queryKey: ["provinces-for-seeding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("province_name")
        .eq("is_active", true)
        .not("subdistrict_name", "is", null);

      if (error) throw error;

      const unique = [...new Set((data || []).map(d => d.province_name))].filter(Boolean).sort();
      return unique as string[];
    },
  });

  // Fetch kelurahan count for selected province
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
      const unique = new Set((data || []).map(d => d.subdistrict_name));
      return unique.size;
    },
    enabled: !!selectedProvince,
  });

  // Fetch existing property count for province
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

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("seed-sample-properties", {
        body: { province: selectedProvince, skipExisting },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Generated ${data.created} properties for ${selectedProvince}!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate properties");
    },
  });

  const totalExpected = kelurahanCount * PROPERTY_TYPES.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Sample Property Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate sample properties with AI images for each kelurahan/desa per province
          </p>
        </div>
      </div>

      {/* Config Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Select Province
          </CardTitle>
          <CardDescription>
            Choose a province to generate 1 property per type ({PROPERTY_TYPES.length} types) for each kelurahan/desa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Province Selector */}
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger>
              <SelectValue placeholder={loadingProvinces ? "Loading provinces..." : "Select a province"} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stats */}
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

          {/* Property Types */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Property Types (1 per kelurahan)</Label>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs capitalize">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Skip Existing */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label className="text-sm font-medium">Skip existing kelurahan</Label>
              <p className="text-xs text-muted-foreground">Skip kelurahan that already have properties of the same type</p>
            </div>
            <Switch checked={skipExisting} onCheckedChange={setSkipExisting} />
          </div>

          {/* Warning */}
          {selectedProvince && totalExpected > 100 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <div className="text-xs text-orange-700 dark:text-orange-300">
                <p className="font-medium">Large batch warning</p>
                <p>This will generate {totalExpected} properties with AI images. This may take a long time and use significant AI credits. The edge function has a timeout limit so very large provinces may need multiple runs.</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            disabled={!selectedProvince || generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating... (this may take several minutes)
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                Generate {totalExpected} Properties with AI Images
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {generateMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Generating properties for {selectedProvince}...</span>
              </div>
              <Progress value={undefined} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Creating properties with AI-generated images. This may take several minutes depending on the number of kelurahan.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-green-700 dark:text-green-300">Generation Complete!</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-2 rounded bg-background/50">
                    <p className="text-lg font-bold">{result.totalKelurahan}</p>
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
