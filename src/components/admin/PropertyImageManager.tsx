import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useImageHealthCheck, type ImageHealthResult } from "@/hooks/useImageHealthCheck";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  Search,
  AlertTriangle,
  Loader2,
  ImageOff,
  CheckCircle,
  X,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileWarning,
  ScanSearch,
  RefreshCw,
  XCircle,
  CheckCircle2,
  BrainCircuit,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Wand2,
  CheckSquare,
} from "lucide-react";

interface AIRelevanceResult {
  relevant: boolean;
  relevanceScore: number;
  imageType: string;
  issues: string[];
  suggestion: string;
  confidence: number;
}

const PropertyImageManager = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "with-images" | "no-images" | "broken">("all");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 30;

  // Image health checking
  const { results: healthResults, checking: healthChecking, checkAllImages, clearResults } = useImageHealthCheck();
  const [checkedPropertyId, setCheckedPropertyId] = useState<string | null>(null);

  // AI Relevance checking
  const [aiResults, setAiResults] = useState<Record<string, AIRelevanceResult>>({});
  const [aiChecking, setAiChecking] = useState(false);
  const [aiCheckingUrl, setAiCheckingUrl] = useState<string | null>(null);

  // Image regeneration
  const [regenerating, setRegenerating] = useState<string | null>(null);

  // Bulk selection
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(new Set());
  const [bulkRegenerating, setBulkRegenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  const toggleSelectProperty = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllOnPage = useCallback((pageProps: any[]) => {
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      const allSelected = pageProps.every(p => next.has(p.id));
      if (allSelected) {
        pageProps.forEach(p => next.delete(p.id));
      } else {
        pageProps.forEach(p => next.add(p.id));
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedPropertyIds(new Set()), []);

  // Bulk AI regenerate all broken images for selected properties
  const handleBulkRegenerate = async () => {
    const selectedProps = properties.filter(p => selectedPropertyIds.has(p.id));
    const brokenEntries: { url: string; property: any }[] = [];
    for (const prop of selectedProps) {
      const imgs = getImages(prop);
      for (const url of imgs) {
        if (healthResults[url]?.status === 'broken') {
          brokenEntries.push({ url, property: prop });
        }
      }
    }
    if (brokenEntries.length === 0) {
      showError("No broken images", "Run health check first to find broken images in selected properties.");
      return;
    }

    setBulkRegenerating(true);
    setBulkProgress({ done: 0, total: brokenEntries.length });

    // Process in batches of 3
    const BATCH_SIZE = 3;
    for (let i = 0; i < brokenEntries.length; i += BATCH_SIZE) {
      const batch = brokenEntries.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async ({ url, property }) => {
          try {
            const { data, error } = await supabase.functions.invoke('regenerate-property-image', {
              body: {
                propertyId: property.id,
                title: property.title,
                description: property.description,
                propertyType: property.property_type,
                location: property.location || property.city,
                brokenImageUrl: url,
              }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
          } catch (err) {
            console.error("Bulk regen failed for", url, err);
          } finally {
            setBulkProgress(prev => ({ ...prev, done: prev.done + 1 }));
          }
        })
      );
    }

    setBulkRegenerating(false);
    showSuccess("Bulk Regeneration Complete", `Processed ${brokenEntries.length} broken image(s)`);
    queryClient.invalidateQueries({ queryKey: ["admin-property-images"] });
    queryClient.invalidateQueries({ queryKey: ["simple-properties"] });
    clearResults();
    clearSelection();
  };

  // Bulk AI relevance check for selected properties
  const handleBulkAICheck = async () => {
    const selectedProps = properties.filter(p => selectedPropertyIds.has(p.id));
    const allImgs: { url: string; property: any }[] = [];
    for (const prop of selectedProps) {
      for (const url of getImages(prop)) {
        allImgs.push({ url, property: prop });
      }
    }
    if (allImgs.length === 0) return;

    setAiChecking(true);
    for (const { url, property } of allImgs) {
      setAiCheckingUrl(url);
      try {
        const { data, error } = await supabase.functions.invoke('check-image-relevance', {
          body: {
            imageUrl: url,
            title: property.title,
            description: property.description,
            propertyType: property.property_type,
            location: property.location || property.city,
          }
        });
        if (!error && data) {
          setAiResults(prev => ({ ...prev, [url]: data }));
        }
      } catch { /* continue */ }
    }
    setAiChecking(false);
    setAiCheckingUrl(null);
  };

  // Fetch all properties with image data
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["admin-property-images", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select("id, title, description, images, image_urls, thumbnail_url, property_type, status, city, location")
        .order("created_at", { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Helper to get images from property
  const getImages = (p: any): string[] => {
    const imgs: string[] = [];
    if (Array.isArray(p.images)) imgs.push(...p.images.filter((i: any) => typeof i === "string" && i.length > 5));
    else if (typeof p.images === "string" && p.images.length > 5) imgs.push(p.images);
    if (Array.isArray(p.image_urls)) imgs.push(...p.image_urls.filter((i: any) => typeof i === "string" && i.length > 5));
    if (p.thumbnail_url && typeof p.thumbnail_url === "string" && p.thumbnail_url.length > 5) {
      if (!imgs.includes(p.thumbnail_url)) imgs.push(p.thumbnail_url);
    }
    return [...new Set(imgs)];
  };

  // Detect image format from URL
  const getImageFormat = (url: string): string => {
    const extMatch = url.match(/\.(\w+)(\?.*)?$/);
    if (extMatch) return extMatch[1].toUpperCase();
    if (url.includes('unsplash.com')) return 'JPG';
    if (url.startsWith('data:image/')) {
      const match = url.match(/data:image\/(\w+)/);
      return match ? match[1].toUpperCase() : 'Unknown';
    }
    return 'Unknown';
  };

  // Health status icon
  const HealthIcon = ({ result }: { result?: ImageHealthResult }) => {
    if (!result) return null;
    switch (result.status) {
      case 'ok': return <CheckCircle2 className="h-3.5 w-3.5 text-chart-1" />;
      case 'broken': return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      case 'slow': return <Clock className="h-3.5 w-3.5 text-chart-3" />;
      case 'loading': return <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />;
      default: return null;
    }
  };

  const filteredProperties = properties.filter((p) => {
    const imgs = getImages(p);
    if (filter === "with-images") return imgs.length > 0;
    if (filter === "no-images") return imgs.length === 0;
    if (filter === "broken") {
      return imgs.some(url => healthResults[url]?.status === 'broken');
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProperties = filteredProperties.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Stats
  const allImageUrls = properties.flatMap(p => getImages(p));
  const brokenCount = allImageUrls.filter(url => healthResults[url]?.status === 'broken').length;
  const slowCount = allImageUrls.filter(url => healthResults[url]?.status === 'slow').length;
  const okCount = allImageUrls.filter(url => healthResults[url]?.status === 'ok').length;
  const checkedCount = Object.keys(healthResults).length;

  const stats = {
    total: properties.length,
    withImages: properties.filter((p) => getImages(p).length > 0).length,
    noImages: properties.filter((p) => getImages(p).length === 0).length,
  };

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f);
    setCurrentPage(1);
  };

  // Run health check on all visible property images
  const handleBulkHealthCheck = async () => {
    clearResults();
    const urls = paginatedProperties.flatMap(p => getImages(p));
    await checkAllImages(urls);
  };

  // Run health check for a single property
  const handlePropertyHealthCheck = async (property: any) => {
    const urls = getImages(property);
    setCheckedPropertyId(property.id);
    await checkAllImages(urls);
  };

  // AI Relevance check for a single image
  const handleAIRelevanceCheck = async (imageUrl: string, property: any) => {
    setAiChecking(true);
    setAiCheckingUrl(imageUrl);
    try {
      const { data, error } = await supabase.functions.invoke('check-image-relevance', {
        body: {
          imageUrl,
          title: property.title,
          description: property.description,
          propertyType: property.property_type,
          location: property.location || property.city,
        }
      });
      if (error) throw error;
      setAiResults(prev => ({ ...prev, [imageUrl]: data }));
    } catch (err: any) {
      showError("AI Check Failed", err.message);
    } finally {
      setAiChecking(false);
      setAiCheckingUrl(null);
    }
  };

  // AI check all images of a property
  const handleAICheckAllImages = async (property: any) => {
    const imgs = getImages(property);
    setAiChecking(true);
    for (const img of imgs) {
      setAiCheckingUrl(img);
      try {
        const { data, error } = await supabase.functions.invoke('check-image-relevance', {
          body: {
            imageUrl: img,
            title: property.title,
            description: property.description,
            propertyType: property.property_type,
            location: property.location || property.city,
          }
        });
        if (error) continue;
        setAiResults(prev => ({ ...prev, [img]: data }));
      } catch {
        // continue to next image
      }
    }
    setAiChecking(false);
    setAiCheckingUrl(null);
  };

  // Regenerate broken image using AI — auto-deletes broken + applies new image
  const handleRegenerateImage = async (brokenUrl: string, property: any) => {
    setRegenerating(brokenUrl);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-property-image', {
        body: {
          propertyId: property.id,
          title: property.title,
          description: property.description,
          propertyType: property.property_type,
          location: property.location || property.city,
          brokenImageUrl: brokenUrl,
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      // Immediately update local state so new image shows without refresh
      const currentImages = getImages(property);
      const updatedImages = currentImages.map(img => img === brokenUrl ? data.newImageUrl : img);
      const newThumb = property.thumbnail_url === brokenUrl ? data.newImageUrl : property.thumbnail_url;
      const updatedProperty = { ...property, images: updatedImages, thumbnail_url: newThumb };
      setSelectedProperty(updatedProperty);
      
      // Clear stale health/AI results for the old broken URL
      clearResults();
      setAiResults(prev => {
        const next = { ...prev };
        delete next[brokenUrl];
        return next;
      });

      showSuccess("Image Replaced", "Broken image deleted & replaced with AI-generated photo");
      queryClient.invalidateQueries({ queryKey: ["admin-property-images"] });
      queryClient.invalidateQueries({ queryKey: ["simple-properties"] });
    } catch (err: any) {
      showError("Regeneration Failed", err.message);
    } finally {
      setRegenerating(null);
    }
  };

  // Upload image to selected property
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedProperty || !user) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(e.target.files)) {
        if (!file.type.startsWith("image/")) {
          showError("Invalid Format", `${file.name} is not a supported image format. Use JPG, PNG, WebP, or GIF.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          showError("Too Large", `${file.name} exceeds 5MB limit`);
          continue;
        }
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("property-images").upload(path, file, { contentType: file.type });
        if (error) {
          console.error("Upload error:", error);
          continue;
        }
        const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }

      if (newUrls.length > 0) {
        const currentImages = getImages(selectedProperty);
        const updatedImages = [...currentImages, ...newUrls];
        const { error } = await supabase
          .from("properties")
          .update({
            images: updatedImages,
            thumbnail_url: selectedProperty.thumbnail_url || updatedImages[0],
          })
          .eq("id", selectedProperty.id);

        if (error) throw error;
        showSuccess("Success", `${newUrls.length} image(s) uploaded`);
        queryClient.invalidateQueries({ queryKey: ["admin-property-images"] });
        queryClient.invalidateQueries({ queryKey: ["simple-properties"] });
        setSelectedProperty({ ...selectedProperty, images: updatedImages, thumbnail_url: selectedProperty.thumbnail_url || updatedImages[0] });
      }
    } catch (err: any) {
      showError("Error", err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Delete image from property
  const handleDeleteImage = async (imageUrl: string) => {
    if (!selectedProperty) return;
    try {
      const currentImages = getImages(selectedProperty);
      const updatedImages = currentImages.filter((i) => i !== imageUrl);
      const newThumb = selectedProperty.thumbnail_url === imageUrl ? (updatedImages[0] || null) : selectedProperty.thumbnail_url;

      const cleanImageUrls = Array.isArray(selectedProperty.image_urls)
        ? selectedProperty.image_urls.filter((u: string) => u !== imageUrl)
        : [];

      const { error } = await supabase
        .from("properties")
        .update({ images: updatedImages, image_urls: cleanImageUrls, thumbnail_url: newThumb })
        .eq("id", selectedProperty.id);

      if (error) throw error;

      const marker = "/object/public/property-images/";
      const idx = imageUrl.indexOf(marker);
      if (idx !== -1) {
        const path = imageUrl.substring(idx + marker.length);
        await supabase.storage.from("property-images").remove([path]);
      }

      showSuccess("Deleted", "Image removed");
      queryClient.invalidateQueries({ queryKey: ["admin-property-images"] });
      queryClient.invalidateQueries({ queryKey: ["simple-properties"] });
      setSelectedProperty({ ...selectedProperty, images: updatedImages, thumbnail_url: newThumb });
    } catch (err: any) {
      showError("Error", err.message);
    }
  };

  // Set thumbnail
  const handleSetThumbnail = async (imageUrl: string) => {
    if (!selectedProperty) return;
    try {
      const { error } = await supabase
        .from("properties")
        .update({ thumbnail_url: imageUrl })
        .eq("id", selectedProperty.id);
      if (error) throw error;
      showSuccess("Updated", "Thumbnail set");
      queryClient.invalidateQueries({ queryKey: ["admin-property-images"] });
      setSelectedProperty({ ...selectedProperty, thumbnail_url: imageUrl });
    } catch (err: any) {
      showError("Error", err.message);
    }
  };

  // Remove all broken images from a property
  const handleRemoveBrokenImages = async (property: any) => {
    const imgs = getImages(property);
    const brokenUrls = new Set(imgs.filter(url => healthResults[url]?.status === 'broken'));
    if (brokenUrls.size === 0) return;

    try {
      const validImages = imgs.filter(url => !brokenUrls.has(url));
      const newThumb = brokenUrls.has(property.thumbnail_url) 
        ? (validImages[0] || null) 
        : property.thumbnail_url;

      // Clear broken URLs from BOTH images and image_urls fields
      const cleanImageUrls = Array.isArray(property.image_urls)
        ? property.image_urls.filter((u: string) => !brokenUrls.has(u))
        : [];

      const { error } = await supabase
        .from("properties")
        .update({ images: validImages, image_urls: cleanImageUrls, thumbnail_url: newThumb })
        .eq("id", property.id);

      if (error) throw error;
      showSuccess("Cleaned", `Removed ${brokenUrls.size} broken image(s)`);
      queryClient.invalidateQueries({ queryKey: ["admin-property-images"] });
    } catch (err: any) {
      showError("Error", err.message);
    }
  };

  // Bulk delete ALL broken images across all properties on the page
  const handleBulkDeleteBroken = async () => {
    const targetProps = selectedPropertyIds.size > 0
      ? properties.filter(p => selectedPropertyIds.has(p.id))
      : paginatedProperties;

    let totalRemoved = 0;
    for (const prop of targetProps) {
      const imgs = getImages(prop);
      const brokenUrls = new Set(imgs.filter(url => healthResults[url]?.status === 'broken'));
      if (brokenUrls.size === 0) continue;

      const validImages = imgs.filter(url => !brokenUrls.has(url));
      const newThumb = brokenUrls.has(prop.thumbnail_url)
        ? (validImages[0] || null)
        : prop.thumbnail_url;

      const cleanImageUrls = Array.isArray(prop.image_urls)
        ? prop.image_urls.filter((u: string) => !brokenUrls.has(u))
        : [];

      try {
        const { error } = await supabase
          .from("properties")
          .update({ images: validImages, image_urls: cleanImageUrls, thumbnail_url: newThumb })
          .eq("id", prop.id);
        if (!error) totalRemoved += brokenUrls.size;
      } catch { /* continue */ }
    }

    if (totalRemoved > 0) {
      showSuccess("Bulk Cleanup", `Deleted ${totalRemoved} broken image(s)`);
      queryClient.invalidateQueries({ queryKey: ["admin-property-images"] });
      queryClient.invalidateQueries({ queryKey: ["simple-properties"] });
      clearResults();
    } else {
      showError("No broken images", "Run health check first to detect broken images.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleFilterChange("all")}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{stats.total}</p>
              </div>
              <Building2 className={`h-5 w-5 ${filter === "all" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleFilterChange("with-images")}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">With Images</p>
                <p className="text-lg font-bold text-chart-1">{stats.withImages}</p>
              </div>
              <CheckCircle className={`h-5 w-5 ${filter === "with-images" ? "text-chart-1" : "text-muted-foreground"}`} />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleFilterChange("no-images")}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">No Images</p>
                <p className="text-lg font-bold text-destructive">{stats.noImages}</p>
              </div>
              <ImageOff className={`h-5 w-5 ${filter === "no-images" ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleFilterChange("broken")}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Broken</p>
                <p className="text-lg font-bold text-chart-3">{brokenCount}</p>
              </div>
              <ShieldAlert className={`h-5 w-5 ${filter === "broken" ? "text-chart-3" : "text-muted-foreground"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Check Bar */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ScanSearch className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">Image Health Checker</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[10px] gap-1.5"
              onClick={handleBulkHealthCheck}
              disabled={healthChecking}
            >
              {healthChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              {healthChecking ? "Checking..." : "Check This Page"}
            </Button>
            {brokenCount > 0 && (
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-[10px] gap-1.5"
                onClick={handleBulkDeleteBroken}
              >
                <Trash2 className="h-3 w-3" />
                Delete All Broken ({brokenCount})
              </Button>
            )}
          </div>
          {checkedCount > 0 && (
            <div className="space-y-1.5">
              <Progress value={(checkedCount / Math.max(allImageUrls.length, 1)) * 100} className="h-1.5" />
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-chart-1">
                  <CheckCircle2 className="h-3 w-3" /> {okCount} OK
                </span>
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="h-3 w-3" /> {brokenCount} Broken
                </span>
                <span className="flex items-center gap-1 text-chart-3">
                  <Clock className="h-3 w-3" /> {slowCount} Slow
                </span>
                <span className="text-muted-foreground ml-auto">
                  {checkedCount} / {allImageUrls.length} checked
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search properties by title or city..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {/* Bulk Selection Bar */}
      {selectedPropertyIds.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">{selectedPropertyIds.size} selected</span>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={clearSelection}>
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1.5"
                  onClick={handleBulkAICheck}
                  disabled={aiChecking}
                >
                  {aiChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />}
                  Bulk AI Check
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-[10px] gap-1.5"
                  onClick={handleBulkRegenerate}
                  disabled={bulkRegenerating}
                >
                  {bulkRegenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                  {bulkRegenerating
                    ? `Regenerating ${bulkProgress.done}/${bulkProgress.total}...`
                    : "Bulk AI Regenerate Broken"}
                </Button>
              </div>
            </div>
            {bulkRegenerating && (
              <Progress value={(bulkProgress.done / Math.max(bulkProgress.total, 1)) * 100} className="h-1.5 mt-2" />
            )}
          </CardContent>
        </Card>
      )}

      {/* Property Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      ) : (
        <>
          {/* Select All on Page */}
          <div className="flex items-center gap-2 mb-1">
            <Checkbox
              checked={paginatedProperties.length > 0 && paginatedProperties.every(p => selectedPropertyIds.has(p.id))}
              onCheckedChange={() => selectAllOnPage(paginatedProperties)}
              className="h-3.5 w-3.5"
            />
            <span className="text-[10px] text-muted-foreground cursor-pointer" onClick={() => selectAllOnPage(paginatedProperties)}>
              Select all on this page
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {paginatedProperties.map((property) => {
              const imgs = getImages(property);
              const propertyBroken = imgs.filter(url => healthResults[url]?.status === 'broken').length;
              const propertyOk = imgs.filter(url => healthResults[url]?.status === 'ok').length;
              const firstImg = imgs[0];
              const firstHealth = firstImg ? healthResults[firstImg] : undefined;

              const isSelected = selectedPropertyIds.has(property.id);

              return (
                <Card
                  key={property.id}
                  className={`cursor-pointer hover:shadow-md transition-all group overflow-hidden ${propertyBroken > 0 ? 'border-destructive/50' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedProperty(property)}
                >
                  <CardContent className="p-2">
                    {/* Checkbox */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectProperty(property.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-[8px] text-muted-foreground">{isSelected ? 'Selected' : 'Select'}</span>
                    </div>
                    <div className="aspect-[4/3] rounded overflow-hidden relative mb-1.5 bg-muted">
                      {imgs.length > 0 ? (
                        <>
                          <img
                            src={imgs[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                              target.classList.add('p-6', 'opacity-40');
                            }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                      )}
                      {/* Image count + health indicators */}
                      <div className="absolute top-1 right-1 flex gap-1">
                        {propertyBroken > 0 && (
                          <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4">
                            ⚠️ {propertyBroken}
                          </Badge>
                        )}
                        <Badge variant={imgs.length > 0 ? "default" : "destructive"} className="text-[8px] px-1 py-0 h-4">
                          📷 {imgs.length}
                        </Badge>
                      </div>
                      {/* Format badge */}
                      {firstImg && (
                        <div className="absolute bottom-1 left-1">
                          <Badge variant="secondary" className="text-[7px] px-1 py-0 h-3.5 bg-background/80 text-foreground border-0">
                            {getImageFormat(firstImg)}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <h4 className="text-[10px] font-semibold line-clamp-1">{property.title}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{property.city || property.location}</p>
                      {firstHealth && <HealthIcon result={firstHealth} />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredProperties.length)} of {filteredProperties.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === "string" ? (
                      <span key={`e-${i}`} className="px-1 text-[10px] text-muted-foreground">…</span>
                    ) : (
                      <Button key={p} variant={p === safePage ? "default" : "outline"} size="sm" className="h-7 min-w-[28px] px-1.5 text-[10px]" onClick={() => setCurrentPage(p)}>
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Image Manager Dialog - Enhanced */}
      <Dialog open={!!selectedProperty} onOpenChange={(o) => !o && setSelectedProperty(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4 text-primary" />
              Images: {selectedProperty?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(85vh-100px)] space-y-4">
            {/* Actions bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex-1 min-w-[200px]">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
                <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5" asChild disabled={uploading}>
                  <span>
                    {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    {uploading ? "Uploading..." : "Upload Images (JPG, PNG, WebP)"}
                  </span>
                </Button>
              </label>
              {selectedProperty && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => handlePropertyHealthCheck(selectedProperty)}
                    disabled={healthChecking}
                  >
                    {healthChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : <ScanSearch className="h-3 w-3" />}
                    Check Health
                  </Button>
                  {getImages(selectedProperty).some(url => healthResults[url]?.status === 'broken') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => handleRemoveBrokenImages(selectedProperty)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove Broken
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-primary/30 text-primary"
                    onClick={() => handleAICheckAllImages(selectedProperty)}
                    disabled={aiChecking}
                  >
                    {aiChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />}
                    {aiChecking ? "AI Checking..." : "AI Relevance Check"}
                  </Button>
                </>
              )}
            </div>

            {/* Image Grid */}
            {selectedProperty && (() => {
              const imgs = getImages(selectedProperty);
              if (imgs.length === 0) {
                return (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <ImageOff className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">No images. Upload some above.</p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imgs.map((img, idx) => {
                    const health = healthResults[img];
                    const format = getImageFormat(img);
                    const isBroken = health?.status === 'broken';
                    const ai = aiResults[img];
                    const isAiChecking = aiCheckingUrl === img;
                    
                    return (
                      <div key={idx} className={`rounded-lg overflow-hidden border ${isBroken ? 'border-destructive border-2' : ai && !ai.relevant ? 'border-yellow-500 border-2' : ''}`}>
                        {/* Image */}
                        <div className="aspect-video bg-muted relative group/img">
                          {isBroken ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-destructive/5">
                              {regenerating === img ? (
                                <>
                                  <Wand2 className="h-8 w-8 text-primary animate-pulse mb-1" />
                                  <p className="text-[10px] text-primary font-medium">AI Generating...</p>
                                  <p className="text-[8px] text-muted-foreground">Creating replacement image</p>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-6 w-6 text-destructive/60 mb-1" />
                                  <p className="text-[10px] text-destructive font-medium">Broken Image</p>
                                  <p className="text-[8px] text-muted-foreground mt-0.5 px-2 text-center truncate max-w-full">{img.slice(0, 50)}...</p>
                                  <div className="flex gap-1.5 mt-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-6 text-[9px] px-2 gap-1"
                                      onClick={() => handleRegenerateImage(img, selectedProperty)}
                                      disabled={!!regenerating}
                                    >
                                      <Wand2 className="h-3 w-3" />
                                      AI Regenerate
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-6 text-[9px] px-2 gap-1"
                                      onClick={() => handleDeleteImage(img)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Remove
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <img
                              src={img}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                                target.classList.add('p-4', 'opacity-30');
                              }}
                            />
                          )}

                          {/* Status badges */}
                          <div className="absolute top-1 left-1 flex gap-1 flex-wrap">
                            {selectedProperty.thumbnail_url === img && (
                              <Badge className="text-[8px] bg-primary h-4">Thumbnail</Badge>
                            )}
                            <Badge variant="secondary" className="text-[7px] px-1 py-0 h-3.5 bg-background/80 text-foreground border-0">
                              {format}
                            </Badge>
                            {health && (
                              <Badge
                                variant={health.status === 'ok' ? 'default' : health.status === 'broken' ? 'destructive' : 'secondary'}
                                className="text-[7px] px-1 py-0 h-3.5"
                              >
                                {health.status === 'ok' ? '✓' : health.status === 'broken' ? '✗' : '⏳'}
                              </Badge>
                            )}
                          </div>

                          {/* AI relevance badge */}
                          {ai && (
                            <div className="absolute top-1 right-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge
                                      variant={ai.relevant ? 'default' : 'destructive'}
                                      className="text-[7px] px-1.5 py-0 h-4 gap-0.5"
                                    >
                                      {ai.relevant ? <ThumbsUp className="h-2.5 w-2.5" /> : <ThumbsDown className="h-2.5 w-2.5" />}
                                      {ai.relevanceScore}%
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-[250px]">
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium">{ai.imageType}</p>
                                      <p className="text-[10px]">{ai.suggestion}</p>
                                      {ai.issues.length > 0 && (
                                        <ul className="text-[10px] text-destructive list-disc pl-3">
                                          {ai.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                        </ul>
                                      )}
                                      <p className="text-[9px] text-muted-foreground">Confidence: {ai.confidence}%</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}

                          {/* Loading overlay for AI check */}
                          {isAiChecking && (
                            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-1">
                                <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
                                <p className="text-[9px] text-primary font-medium">AI Analyzing...</p>
                              </div>
                            </div>
                          )}

                          {/* Hover actions */}
                          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {!isBroken && (
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={() => setViewImage(img)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            {!isBroken && (
                              <Button size="sm" variant="secondary" className="h-7 text-[10px] px-2" onClick={() => handleSetThumbnail(img)}>
                                Set Cover
                              </Button>
                            )}
                            {!isBroken && !ai && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 w-7 p-0"
                                onClick={() => handleAIRelevanceCheck(img, selectedProperty)}
                                disabled={aiChecking}
                              >
                                <BrainCircuit className="h-3 w-3" />
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => handleDeleteImage(img)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* AI Result panel below image */}
                        {ai && (
                          <div className={`px-2 py-1.5 text-[9px] border-t ${ai.relevant ? 'bg-chart-1/10' : 'bg-chart-3/10'}`}>
                            <div className="flex items-center gap-1 mb-0.5">
                              {ai.relevant ? (
                                <CheckCircle2 className="h-3 w-3 text-chart-1 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-chart-3 shrink-0" />
                              )}
                              <span className="font-medium truncate">
                                {ai.relevant ? 'Relevant' : 'May not match'} • {ai.imageType}
                              </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2">{ai.suggestion}</p>
                            {ai.issues.length > 0 && (
                              <p className="text-destructive mt-0.5">⚠ {ai.issues[0]}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Image View */}
      <Dialog open={!!viewImage} onOpenChange={(o) => !o && setViewImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {viewImage && (
            <div className="space-y-2">
              <img src={viewImage} alt="Full view" className="w-full h-auto rounded-lg" />
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
                <span>Format: {getImageFormat(viewImage)}</span>
                {healthResults[viewImage] && (
                  <>
                    <span>•</span>
                    <span>Status: {healthResults[viewImage].status}</span>
                    {healthResults[viewImage].loadTime && (
                      <>
                        <span>•</span>
                        <span>Load: {healthResults[viewImage].loadTime}ms</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyImageManager;
