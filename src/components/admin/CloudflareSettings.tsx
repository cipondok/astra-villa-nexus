import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Cloud, 
  Shield, 
  Zap, 
  Lock, 
  Image, 
  Settings, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CloudflareConfig {
  id?: string;
  api_token?: string;
  api_email?: string;
  zone_id?: string;
  account_id?: string;
  cdn_enabled: boolean;
  auto_minify_enabled: boolean;
  auto_minify_css: boolean;
  auto_minify_js: boolean;
  auto_minify_html: boolean;
  cache_level: string;
  browser_cache_ttl: number;
  edge_cache_ttl: number;
  always_online: boolean;
  development_mode: boolean;
  rocket_loader: boolean;
  mirage: boolean;
  polish: string;
  webp_enabled: boolean;
  brotli_enabled: boolean;
  http2_enabled: boolean;
  http3_enabled: boolean;
  early_hints: boolean;
  ssl_mode: string;
  always_use_https: boolean;
  automatic_https_rewrites: boolean;
  tls_version: string;
  rate_limiting_enabled: boolean;
  ddos_protection: string;
  challenge_passage: number;
  image_resizing_enabled: boolean;
  image_optimization_quality: number;
  analytics_enabled: boolean;
  web_analytics_token?: string;
  is_active: boolean;
  sync_status?: string;
  last_sync_at?: string;
}

const CloudflareSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiToken, setShowApiToken] = useState(false);
  const [config, setConfig] = useState<CloudflareConfig>({
    cdn_enabled: false,
    auto_minify_enabled: true,
    auto_minify_css: true,
    auto_minify_js: true,
    auto_minify_html: true,
    cache_level: 'standard',
    browser_cache_ttl: 14400,
    edge_cache_ttl: 7200,
    always_online: true,
    development_mode: false,
    rocket_loader: false,
    mirage: false,
    polish: 'off',
    webp_enabled: true,
    brotli_enabled: true,
    http2_enabled: true,
    http3_enabled: true,
    early_hints: false,
    ssl_mode: 'flexible',
    always_use_https: true,
    automatic_https_rewrites: true,
    tls_version: '1.2',
    rate_limiting_enabled: false,
    ddos_protection: 'medium',
    challenge_passage: 30,
    image_resizing_enabled: false,
    image_optimization_quality: 85,
    analytics_enabled: true,
    is_active: false,
  });

  // Fetch existing Cloudflare settings
  const { data: existingConfig, isLoading } = useQuery({
    queryKey: ['cloudflare-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cloudflare_settings' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
  });

  useEffect(() => {
    if (existingConfig) {
      setConfig(existingConfig as any);
    }
  }, [existingConfig]);

  // Save configuration mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CloudflareConfig) => {
      if (config.id) {
        const { error } = await supabase
          .from('cloudflare_settings' as any)
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cloudflare_settings' as any)
          .insert(data as any);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudflare-settings'] });
      toast({
        title: "Configuration Saved",
        description: "Cloudflare settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save Cloudflare settings.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const handleInputChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const getSyncStatusBadge = () => {
    if (!config.sync_status) return null;
    
    const statusConfig = {
      synced: { icon: CheckCircle2, color: "bg-green-500", text: "Synced" },
      syncing: { icon: RefreshCw, color: "bg-blue-500", text: "Syncing" },
      failed: { icon: XCircle, color: "bg-red-500", text: "Failed" },
      pending: { icon: Clock, color: "bg-yellow-500", text: "Pending" },
    }[config.sync_status] || { icon: AlertCircle, color: "bg-gray-500", text: "Unknown" };

    const Icon = statusConfig.icon;

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${statusConfig.color} text-white rounded-full p-0.5`} />
        {statusConfig.text}
        {config.last_sync_at && (
          <span className="ml-1 text-xs text-muted-foreground">
            {new Date(config.last_sync_at).toLocaleString()}
          </span>
        )}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cloud className="h-8 w-8 text-orange-500" />
            Cloudflare Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure CDN, caching, security, and performance optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getSyncStatusBadge()}
          <Switch
            checked={config.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
          />
          <Label>Active</Label>
        </div>
      </div>

      {!config.api_token && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Configuration Required</AlertTitle>
          <AlertDescription>
            Please configure your Cloudflare API credentials in the API Settings tab to enable automatic synchronization.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="cdn" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="cdn" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            CDN
          </TabsTrigger>
          <TabsTrigger value="cache" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Cache
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        {/* CDN Settings */}
        <TabsContent value="cdn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CDN Configuration</CardTitle>
              <CardDescription>
                Enable and configure Content Delivery Network settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="cdn_enabled">Enable CDN</Label>
                  <p className="text-sm text-muted-foreground">
                    Route traffic through Cloudflare's global network
                  </p>
                </div>
                <Switch
                  id="cdn_enabled"
                  checked={config.cdn_enabled}
                  onCheckedChange={(checked) => handleInputChange('cdn_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Auto Minification</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto_minify_enabled">Enable Auto Minification</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically minify HTML, CSS, and JavaScript
                    </p>
                  </div>
                  <Switch
                    id="auto_minify_enabled"
                    checked={config.auto_minify_enabled}
                    onCheckedChange={(checked) => handleInputChange('auto_minify_enabled', checked)}
                  />
                </div>

                {config.auto_minify_enabled && (
                  <div className="ml-6 space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto_minify_html">Minify HTML</Label>
                      <Switch
                        id="auto_minify_html"
                        checked={config.auto_minify_html}
                        onCheckedChange={(checked) => handleInputChange('auto_minify_html', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto_minify_css">Minify CSS</Label>
                      <Switch
                        id="auto_minify_css"
                        checked={config.auto_minify_css}
                        onCheckedChange={(checked) => handleInputChange('auto_minify_css', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto_minify_js">Minify JavaScript</Label>
                      <Switch
                        id="auto_minify_js"
                        checked={config.auto_minify_js}
                        onCheckedChange={(checked) => handleInputChange('auto_minify_js', checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cache Settings */}
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Caching Configuration</CardTitle>
              <CardDescription>
                Configure how Cloudflare caches your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cache_level">Cache Level</Label>
                <Select
                  value={config.cache_level}
                  onValueChange={(value) => handleInputChange('cache_level', value)}
                >
                  <SelectTrigger id="cache_level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Cache static files only</SelectItem>
                    <SelectItem value="standard">Standard - Cache static & query strings</SelectItem>
                    <SelectItem value="aggressive">Aggressive - Cache everything possible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="browser_cache_ttl">Browser Cache TTL (seconds)</Label>
                  <Input
                    id="browser_cache_ttl"
                    type="number"
                    value={config.browser_cache_ttl}
                    onChange={(e) => handleInputChange('browser_cache_ttl', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long browsers should cache content
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edge_cache_ttl">Edge Cache TTL (seconds)</Label>
                  <Input
                    id="edge_cache_ttl"
                    type="number"
                    value={config.edge_cache_ttl}
                    onChange={(e) => handleInputChange('edge_cache_ttl', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long Cloudflare edge servers cache content
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="always_online">Always Online</Label>
                  <p className="text-sm text-muted-foreground">
                    Serve cached version when origin is down
                  </p>
                </div>
                <Switch
                  id="always_online"
                  checked={config.always_online}
                  onCheckedChange={(checked) => handleInputChange('always_online', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="development_mode">Development Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily bypass cache (auto-expires in 3 hours)
                  </p>
                </div>
                <Switch
                  id="development_mode"
                  checked={config.development_mode}
                  onCheckedChange={(checked) => handleInputChange('development_mode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
              <CardDescription>
                Enable advanced performance features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="rocket_loader">Rocket Loader</Label>
                  <p className="text-sm text-muted-foreground">
                    Asynchronously load JavaScript to improve page load times
                  </p>
                </div>
                <Switch
                  id="rocket_loader"
                  checked={config.rocket_loader}
                  onCheckedChange={(checked) => handleInputChange('rocket_loader', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="brotli_enabled">Brotli Compression</Label>
                  <p className="text-sm text-muted-foreground">
                    Better compression than gzip for supported browsers
                  </p>
                </div>
                <Switch
                  id="brotli_enabled"
                  checked={config.brotli_enabled}
                  onCheckedChange={(checked) => handleInputChange('brotli_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="http2_enabled">HTTP/2</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable HTTP/2 protocol for faster connections
                  </p>
                </div>
                <Switch
                  id="http2_enabled"
                  checked={config.http2_enabled}
                  onCheckedChange={(checked) => handleInputChange('http2_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="http3_enabled">HTTP/3 (QUIC)</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable HTTP/3 for even faster connections
                  </p>
                </div>
                <Switch
                  id="http3_enabled"
                  checked={config.http3_enabled}
                  onCheckedChange={(checked) => handleInputChange('http3_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="early_hints">Early Hints</Label>
                  <p className="text-sm text-muted-foreground">
                    Send HTTP 103 Early Hints to speed up page loads
                  </p>
                </div>
                <Switch
                  id="early_hints"
                  checked={config.early_hints}
                  onCheckedChange={(checked) => handleInputChange('early_hints', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="webp_enabled">WebP Conversion</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically convert images to WebP format
                  </p>
                </div>
                <Switch
                  id="webp_enabled"
                  checked={config.webp_enabled}
                  onCheckedChange={(checked) => handleInputChange('webp_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                SSL/TLS, HTTPS, and DDoS protection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ssl_mode">SSL/TLS Mode</Label>
                <Select
                  value={config.ssl_mode}
                  onValueChange={(value) => handleInputChange('ssl_mode', value)}
                >
                  <SelectTrigger id="ssl_mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off - No SSL/TLS</SelectItem>
                    <SelectItem value="flexible">Flexible - Cloudflare to visitor only</SelectItem>
                    <SelectItem value="full">Full - End-to-end encryption</SelectItem>
                    <SelectItem value="strict">Strict - Full with certificate validation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tls_version">Minimum TLS Version</Label>
                <Select
                  value={config.tls_version}
                  onValueChange={(value) => handleInputChange('tls_version', value)}
                >
                  <SelectTrigger id="tls_version">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0">TLS 1.0 (Not Recommended)</SelectItem>
                    <SelectItem value="1.1">TLS 1.1</SelectItem>
                    <SelectItem value="1.2">TLS 1.2 (Recommended)</SelectItem>
                    <SelectItem value="1.3">TLS 1.3 (Most Secure)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="always_use_https">Always Use HTTPS</Label>
                  <p className="text-sm text-muted-foreground">
                    Redirect all HTTP requests to HTTPS
                  </p>
                </div>
                <Switch
                  id="always_use_https"
                  checked={config.always_use_https}
                  onCheckedChange={(checked) => handleInputChange('always_use_https', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="automatic_https_rewrites">Automatic HTTPS Rewrites</Label>
                  <p className="text-sm text-muted-foreground">
                    Rewrite HTTP URLs to HTTPS in HTML
                  </p>
                </div>
                <Switch
                  id="automatic_https_rewrites"
                  checked={config.automatic_https_rewrites}
                  onCheckedChange={(checked) => handleInputChange('automatic_https_rewrites', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="ddos_protection">DDoS Protection Level</Label>
                <Select
                  value={config.ddos_protection}
                  onValueChange={(value) => handleInputChange('ddos_protection', value)}
                >
                  <SelectTrigger id="ddos_protection">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minimal protection</SelectItem>
                    <SelectItem value="medium">Medium - Balanced protection</SelectItem>
                    <SelectItem value="high">High - Maximum protection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="rate_limiting_enabled">Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit requests from suspicious sources
                  </p>
                </div>
                <Switch
                  id="rate_limiting_enabled"
                  checked={config.rate_limiting_enabled}
                  onCheckedChange={(checked) => handleInputChange('rate_limiting_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Settings */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Optimization</CardTitle>
              <CardDescription>
                Configure image resizing and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="polish">Polish (Image Optimization)</Label>
                <Select
                  value={config.polish}
                  onValueChange={(value) => handleInputChange('polish', value)}
                >
                  <SelectTrigger id="polish">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off - No optimization</SelectItem>
                    <SelectItem value="lossless">Lossless - No quality loss</SelectItem>
                    <SelectItem value="lossy">Lossy - Maximum compression</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="image_resizing_enabled">Image Resizing</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable on-the-fly image resizing
                  </p>
                </div>
                <Switch
                  id="image_resizing_enabled"
                  checked={config.image_resizing_enabled}
                  onCheckedChange={(checked) => handleInputChange('image_resizing_enabled', checked)}
                />
              </div>

              {config.image_resizing_enabled && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="image_optimization_quality">
                    Image Quality ({config.image_optimization_quality}%)
                  </Label>
                  <input
                    id="image_optimization_quality"
                    type="range"
                    min="1"
                    max="100"
                    value={config.image_optimization_quality}
                    onChange={(e) => handleInputChange('image_optimization_quality', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher quality = larger file size
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure Cloudflare API credentials for automatic sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  API credentials are encrypted and stored securely. Never share your API token.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="api_email">Cloudflare Email</Label>
                <Input
                  id="api_email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={config.api_email || ''}
                  onChange={(e) => handleInputChange('api_email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_token">API Token</Label>
                <div className="relative">
                  <Input
                    id="api_token"
                    type={showApiToken ? "text" : "password"}
                    placeholder="Enter your Cloudflare API token"
                    value={config.api_token || ''}
                    onChange={(e) => handleInputChange('api_token', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowApiToken(!showApiToken)}
                  >
                    {showApiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Create an API token with Zone:Read and Zone:Edit permissions
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="zone_id">Zone ID</Label>
                <Input
                  id="zone_id"
                  placeholder="Enter your Cloudflare Zone ID"
                  value={config.zone_id || ''}
                  onChange={(e) => handleInputChange('zone_id', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Found in your domain's Overview page on Cloudflare dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_id">Account ID (Optional)</Label>
                <Input
                  id="account_id"
                  placeholder="Enter your Cloudflare Account ID"
                  value={config.account_id || ''}
                  onChange={(e) => handleInputChange('account_id', e.target.value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="analytics_enabled">Web Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable Cloudflare Web Analytics tracking
                  </p>
                </div>
                <Switch
                  id="analytics_enabled"
                  checked={config.analytics_enabled}
                  onCheckedChange={(checked) => handleInputChange('analytics_enabled', checked)}
                />
              </div>

              {config.analytics_enabled && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="web_analytics_token">Analytics Token</Label>
                  <Input
                    id="web_analytics_token"
                    placeholder="Enter your Web Analytics token"
                    value={config.web_analytics_token || ''}
                    onChange={(e) => handleInputChange('web_analytics_token', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-6">
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['cloudflare-settings'] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CloudflareSettings;
