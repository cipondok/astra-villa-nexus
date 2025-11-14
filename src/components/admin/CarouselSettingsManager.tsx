import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw } from "lucide-react";

interface CarouselSettings {
  id: string;
  carousel_name: string;
  is_enabled: boolean;
  auto_scroll: boolean;
  scroll_speed: number;
  scroll_direction: 'ltr' | 'rtl';
  loop_mode: 'stop' | 'loop' | 'seamless';
  pause_on_hover: boolean;
  interval_ms: number;
}

export default function CarouselSettingsManager() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['carousel-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carousel_settings')
        .select('*')
        .eq('carousel_name', 'featured_properties')
        .single();
      
      if (error) throw error;
      return data as CarouselSettings;
    },
  });

  const [localSettings, setLocalSettings] = useState<Partial<CarouselSettings>>({});

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<CarouselSettings>) => {
      if (!settings?.id) throw new Error('Settings not found');
      
      const { data, error } = await supabase
        .from('carousel_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-settings-admin'] });
      queryClient.invalidateQueries({ queryKey: ['carousel-settings-featured'] });
      toast.success('Carousel settings updated successfully!');
      setHasChanges(false);
      setLocalSettings({});
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    },
  });

  const handleUpdate = (key: keyof CarouselSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(localSettings);
  };

  const handleReset = () => {
    setLocalSettings({});
    setHasChanges(false);
  };

  const currentSettings = { ...settings, ...localSettings } as CarouselSettings;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">No carousel settings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Properties Carousel Settings</CardTitle>
        <CardDescription>
          Configure how the Featured Properties carousel behaves on the homepage. 
          <br />
          <strong>Recommended:</strong> Enable with Seamless Loop mode for continuous auto-scrolling from start to end without interruption.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Carousel */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_enabled">Enable Carousel</Label>
            <p className="text-sm text-muted-foreground">Show the featured properties carousel</p>
          </div>
          <Switch
            id="is_enabled"
            checked={currentSettings.is_enabled}
            onCheckedChange={(checked) => handleUpdate('is_enabled', checked)}
          />
        </div>

        {/* Auto-scroll */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto_scroll">Auto-scroll</Label>
            <p className="text-sm text-muted-foreground">Automatically scroll through items</p>
          </div>
          <Switch
            id="auto_scroll"
            checked={currentSettings.auto_scroll}
            onCheckedChange={(checked) => handleUpdate('auto_scroll', checked)}
            disabled={!currentSettings.is_enabled}
          />
        </div>

        {/* Scroll Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="scroll_speed">Scroll Speed: {currentSettings.scroll_speed}</Label>
            <span className="text-sm text-muted-foreground">1 (Slow) - 10 (Fast)</span>
          </div>
          <Slider
            id="scroll_speed"
            min={1}
            max={10}
            step={1}
            value={[currentSettings.scroll_speed]}
            onValueChange={([value]) => handleUpdate('scroll_speed', value)}
            disabled={!currentSettings.is_enabled || !currentSettings.auto_scroll}
          />
        </div>

        {/* Scroll Direction */}
        <div className="space-y-2">
          <Label htmlFor="scroll_direction">Scroll Direction</Label>
          <Select
            value={currentSettings.scroll_direction}
            onValueChange={(value: 'ltr' | 'rtl') => handleUpdate('scroll_direction', value)}
            disabled={!currentSettings.is_enabled || !currentSettings.auto_scroll}
          >
            <SelectTrigger id="scroll_direction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ltr">Left to Right (←)</SelectItem>
              <SelectItem value="rtl">Right to Left (→)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loop Mode */}
        <div className="space-y-2">
          <Label htmlFor="loop_mode">Loop Mode</Label>
          <Select
            value={currentSettings.loop_mode}
            onValueChange={(value: 'stop' | 'loop' | 'seamless') => handleUpdate('loop_mode', value)}
            disabled={!currentSettings.is_enabled || !currentSettings.auto_scroll}
          >
            <SelectTrigger id="loop_mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stop">Stop at End</SelectItem>
              <SelectItem value="loop">Jump to Start</SelectItem>
              <SelectItem value="seamless">Seamless Loop (Recommended)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {currentSettings.loop_mode === 'stop' && 'Carousel stops when reaching the last item'}
            {currentSettings.loop_mode === 'loop' && 'Carousel jumps back to the first item (visible jump)'}
            {currentSettings.loop_mode === 'seamless' && '✓ Creates infinite loop without visible breaks - continuously scrolls from start to end'}
          </p>
        </div>

        {/* Pause on Hover */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="pause_on_hover">Pause on Hover</Label>
            <p className="text-sm text-muted-foreground">Pause scrolling when user hovers over carousel</p>
          </div>
          <Switch
            id="pause_on_hover"
            checked={currentSettings.pause_on_hover}
            onCheckedChange={(checked) => handleUpdate('pause_on_hover', checked)}
            disabled={!currentSettings.is_enabled || !currentSettings.auto_scroll}
          />
        </div>

        {/* Interval (Advanced) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="interval_ms">Scroll Interval: {currentSettings.interval_ms}ms</Label>
            <span className="text-sm text-muted-foreground">10ms - 100ms</span>
          </div>
          <Slider
            id="interval_ms"
            min={10}
            max={100}
            step={5}
            value={[currentSettings.interval_ms]}
            onValueChange={([value]) => handleUpdate('interval_ms', value)}
            disabled={!currentSettings.is_enabled || !currentSettings.auto_scroll}
          />
          <p className="text-xs text-muted-foreground">
            Lower values = smoother but more resource intensive
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            className="flex-1"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
