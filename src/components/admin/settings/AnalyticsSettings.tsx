import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  Activity, 
  Save, 
  Loader2, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Eye,
  MousePointer,
  ShoppingCart,
  Users
} from 'lucide-react';
import { ga4 } from '@/services/analytics/GoogleAnalytics';

interface AnalyticsConfig {
  id?: string;
  tracking_id: string;
  is_active: boolean;
  configuration: {
    track_page_views: boolean;
    track_search: boolean;
    track_property_views: boolean;
    track_bookings: boolean;
    track_payments: boolean;
    track_user_events: boolean;
    enhanced_ecommerce: boolean;
    debug_mode: boolean;
  };
}

const defaultConfig: AnalyticsConfig = {
  tracking_id: '',
  is_active: false,
  configuration: {
    track_page_views: true,
    track_search: true,
    track_property_views: true,
    track_bookings: true,
    track_payments: true,
    track_user_events: true,
    enhanced_ecommerce: true,
    debug_mode: false,
  },
};

export function AnalyticsSettings() {
  const [config, setConfig] = useState<AnalyticsConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_settings')
        .select('*')
        .eq('tool_name', 'google_analytics')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          id: data.id,
          tracking_id: data.tracking_id,
          is_active: data.is_active ?? false,
          configuration: {
            ...defaultConfig.configuration,
            ...(data.configuration as any),
          },
        });
      }
    } catch (error) {
      console.error('Error fetching analytics config:', error);
      toast.error('Failed to load analytics settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.tracking_id) {
      toast.error('Please enter a GA4 Measurement ID');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        tool_name: 'google_analytics',
        tracking_id: config.tracking_id,
        is_active: config.is_active,
        configuration: config.configuration,
        updated_at: new Date().toISOString(),
      };

      if (config.id) {
        const { error } = await supabase
          .from('analytics_settings')
          .update(payload)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('analytics_settings')
          .insert(payload);

        if (error) throw error;
      }

      toast.success('Analytics settings saved successfully');
      
      // Reinitialize GA4 if active
      if (config.is_active && config.tracking_id) {
        ga4.initialize(config.tracking_id);
      }
      
      fetchConfig();
    } catch (error) {
      console.error('Error saving analytics config:', error);
      toast.error('Failed to save analytics settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.tracking_id) {
      toast.error('Please enter a GA4 Measurement ID first');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Initialize GA4 with the provided ID
      ga4.initialize(config.tracking_id);
      
      // Send a test event
      ga4.trackEvent('test_connection', {
        test_timestamp: new Date().toISOString(),
        source: 'admin_settings',
      });

      // If we get here without errors, connection is successful
      setConnectionStatus('success');
      toast.success('Test event sent! Check your GA4 real-time reports.');
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Failed to connect to GA4');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const updateConfiguration = (key: keyof AnalyticsConfig['configuration'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Google Analytics 4</CardTitle>
          </div>
          <CardDescription>
            Track user behavior, conversions, and property engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Measurement ID */}
          <div className="space-y-2">
            <Label htmlFor="tracking_id">GA4 Measurement ID</Label>
            <div className="flex gap-2">
              <Input
                id="tracking_id"
                placeholder="G-XXXXXXXXXX"
                value={config.tracking_id}
                onChange={(e) => setConfig(prev => ({ ...prev, tracking_id: e.target.value }))}
                className="font-mono"
              />
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection || !config.tracking_id}
              >
                {isTestingConnection ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : connectionStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : connectionStatus === 'error' ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                <span className="ml-2">Test</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find your Measurement ID in GA4 → Admin → Data Streams → Web stream
            </p>
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label>Enable Analytics Tracking</Label>
              <p className="text-xs text-muted-foreground">
                Start collecting user behavior data
              </p>
            </div>
            <Switch
              checked={config.is_active}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </>
            )}
          </Button>

          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            Open Google Analytics Dashboard
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      {/* Event Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Tracking Configuration</CardTitle>
          <CardDescription>
            Choose which events to track
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {/* Page Views */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Page Views</p>
                  <p className="text-xs text-muted-foreground">Track all page navigation</p>
                </div>
              </div>
              <Switch
                checked={config.configuration.track_page_views}
                onCheckedChange={(v) => updateConfiguration('track_page_views', v)}
              />
            </div>

            <Separator />

            {/* Search */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MousePointer className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Search Events</p>
                  <p className="text-xs text-muted-foreground">Track search queries and results</p>
                </div>
              </div>
              <Switch
                checked={config.configuration.track_search}
                onCheckedChange={(v) => updateConfiguration('track_search', v)}
              />
            </div>

            <Separator />

            {/* Property Views */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Property Views</p>
                  <p className="text-xs text-muted-foreground">Track property detail page views</p>
                </div>
              </div>
              <Switch
                checked={config.configuration.track_property_views}
                onCheckedChange={(v) => updateConfiguration('track_property_views', v)}
              />
            </div>

            <Separator />

            {/* Bookings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Bookings & Payments</p>
                  <p className="text-xs text-muted-foreground">Track booking funnel and conversions</p>
                </div>
              </div>
              <Switch
                checked={config.configuration.track_bookings}
                onCheckedChange={(v) => updateConfiguration('track_bookings', v)}
              />
            </div>

            <Separator />

            {/* User Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">User Events</p>
                  <p className="text-xs text-muted-foreground">Track sign ups, logins, and user actions</p>
                </div>
              </div>
              <Switch
                checked={config.configuration.track_user_events}
                onCheckedChange={(v) => updateConfiguration('track_user_events', v)}
              />
            </div>

            <Separator />

            {/* Debug Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Debug Mode</p>
                  <p className="text-xs text-muted-foreground">Log all events to console</p>
                </div>
              </div>
              <Switch
                checked={config.configuration.debug_mode}
                onCheckedChange={(v) => updateConfiguration('debug_mode', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracked Events Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tracked Events</CardTitle>
          <CardDescription>
            Events automatically tracked by the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">page_view</Badge>
            <Badge variant="outline">search</Badge>
            <Badge variant="outline">view_item</Badge>
            <Badge variant="outline">add_to_wishlist</Badge>
            <Badge variant="outline">view_item_list</Badge>
            <Badge variant="outline">begin_checkout</Badge>
            <Badge variant="outline">add_payment_info</Badge>
            <Badge variant="outline">purchase</Badge>
            <Badge variant="outline">sign_up</Badge>
            <Badge variant="outline">login</Badge>
            <Badge variant="outline">generate_lead</Badge>
            <Badge variant="outline">valuation_requested</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
