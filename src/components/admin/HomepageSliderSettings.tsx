import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, Monitor, Tablet, Smartphone, Settings2, Eye, EyeOff } from "lucide-react";

interface SliderSetting {
  id: string;
  slide_order: number;
  title_en: string | null;
  title_id: string | null;
  subtitle_en: string | null;
  subtitle_id: string | null;
  image_url: string;
  image_mobile: string | null;
  image_tablet: string | null;
  image_desktop: string | null;
  link_url: string | null;
  button_text_en: string | null;
  button_text_id: string | null;
  is_active: boolean;
  desktop_height: number;
  tablet_height: number;
  mobile_height: number;
  animation_type: string;
  animation_duration: number;
  auto_play: boolean;
  auto_play_delay: number;
  show_navigation: boolean;
  show_pagination: boolean;
  show_on_mobile: boolean;
  show_on_tablet: boolean;
  show_on_desktop: boolean;
}

export default function HomepageSliderSettings() {
  const queryClient = useQueryClient();
  const [editingSlide, setEditingSlide] = useState<SliderSetting | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all slider settings
  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['homepage-slider-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_slider_settings')
        .select('*')
        .order('slide_order');
      
      if (error) throw error;
      return data as SliderSetting[];
    }
  });

  // Create or update slide
  const saveSlideMutation = useMutation({
    mutationFn: async (slide: Partial<SliderSetting>) => {
      if (slide.id) {
        const { error } = await supabase
          .from('homepage_slider_settings')
          .update(slide as any)
          .eq('id', slide.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('homepage_slider_settings')
          .insert([slide as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-slider-settings'] });
      toast.success(editingSlide ? 'Slide updated' : 'Slide created');
      setIsDialogOpen(false);
      setEditingSlide(null);
    },
    onError: (error) => {
      toast.error('Failed to save slide: ' + error.message);
    }
  });

  // Delete slide
  const deleteSlideMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homepage_slider_settings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-slider-settings'] });
      toast.success('Slide deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete slide: ' + error.message);
    }
  });

  const handleSave = (formData: FormData) => {
    const slideData: Partial<SliderSetting> = {
      id: editingSlide?.id,
      slide_order: parseInt(formData.get('slide_order') as string),
      title_en: formData.get('title_en') as string,
      title_id: formData.get('title_id') as string,
      subtitle_en: formData.get('subtitle_en') as string,
      subtitle_id: formData.get('subtitle_id') as string,
      image_url: formData.get('image_url') as string,
      image_mobile: formData.get('image_mobile') as string || null,
      image_tablet: formData.get('image_tablet') as string || null,
      image_desktop: formData.get('image_desktop') as string || null,
      link_url: formData.get('link_url') as string || null,
      button_text_en: formData.get('button_text_en') as string || null,
      button_text_id: formData.get('button_text_id') as string || null,
      is_active: formData.get('is_active') === 'true',
      desktop_height: parseInt(formData.get('desktop_height') as string),
      tablet_height: parseInt(formData.get('tablet_height') as string),
      mobile_height: parseInt(formData.get('mobile_height') as string),
      animation_type: formData.get('animation_type') as string,
      animation_duration: parseInt(formData.get('animation_duration') as string),
      auto_play: formData.get('auto_play') === 'true',
      auto_play_delay: parseInt(formData.get('auto_play_delay') as string),
      show_navigation: formData.get('show_navigation') === 'true',
      show_pagination: formData.get('show_pagination') === 'true',
      show_on_mobile: formData.get('show_on_mobile') === 'true',
      show_on_tablet: formData.get('show_on_tablet') === 'true',
      show_on_desktop: formData.get('show_on_desktop') === 'true',
    };

    saveSlideMutation.mutate(slideData);
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Homepage Slider Settings</h2>
          <p className="text-muted-foreground">Manage main page slider with device-specific configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSlide(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
            </DialogHeader>
            <SlideForm
              slide={editingSlide}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingSlide(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {slides.map((slide) => (
          <Card key={slide.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">Order: {slide.slide_order}</div>
                  <CardTitle className="text-lg">{slide.title_en}</CardTitle>
                  {slide.is_active ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSlide(slide);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this slide?')) {
                        deleteSlideMutation.mutate(slide.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <img src={slide.image_url} alt={slide.title_en || ''} className="w-full h-32 object-cover rounded" />
                  <p className="text-xs text-muted-foreground mt-1">Main Image</p>
                </div>
                <div className="col-span-2 space-y-2 text-sm">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>{slide.desktop_height}px</span>
                      {slide.show_on_desktop && <span className="text-green-500">✓</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4" />
                      <span>{slide.tablet_height}px</span>
                      {slide.show_on_tablet && <span className="text-green-500">✓</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>{slide.mobile_height}px</span>
                      {slide.show_on_mobile && <span className="text-green-500">✓</span>}
                    </div>
                  </div>
                  <div className="text-muted-foreground">{slide.subtitle_en}</div>
                  <div className="flex gap-2 text-xs">
                    <span>Animation: {slide.animation_type}</span>
                    {slide.auto_play && <span>• Auto-play: {slide.auto_play_delay}ms</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SlideForm({ slide, onSave, onCancel }: {
  slide: SliderSetting | null;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<SliderSetting>>(
    slide || {
      slide_order: 1,
      is_active: true,
      desktop_height: 600,
      tablet_height: 500,
      mobile_height: 400,
      animation_type: 'fade',
      animation_duration: 500,
      auto_play: true,
      auto_play_delay: 5000,
      show_navigation: true,
      show_pagination: true,
      show_on_mobile: true,
      show_on_tablet: true,
      show_on_desktop: true,
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataObj = new FormData(e.currentTarget);
    onSave(formDataObj);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="content">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Slide Order</Label>
              <Input
                name="slide_order"
                type="number"
                defaultValue={formData.slide_order}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                name="is_active"
                defaultChecked={formData.is_active}
              />
            </div>
          </div>

          <div>
            <Label>Title (English)</Label>
            <Input name="title_en" defaultValue={formData.title_en || ''} />
          </div>

          <div>
            <Label>Title (Indonesian)</Label>
            <Input name="title_id" defaultValue={formData.title_id || ''} />
          </div>

          <div>
            <Label>Subtitle (English)</Label>
            <Textarea name="subtitle_en" defaultValue={formData.subtitle_en || ''} />
          </div>

          <div>
            <Label>Subtitle (Indonesian)</Label>
            <Textarea name="subtitle_id" defaultValue={formData.subtitle_id || ''} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Button Text (EN)</Label>
              <Input name="button_text_en" defaultValue={formData.button_text_en || ''} />
            </div>
            <div>
              <Label>Button Text (ID)</Label>
              <Input name="button_text_id" defaultValue={formData.button_text_id || ''} />
            </div>
          </div>

          <div>
            <Label>Link URL</Label>
            <Input name="link_url" type="url" defaultValue={formData.link_url || ''} />
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div>
            <Label>Main Image URL *</Label>
            <Input
              name="image_url"
              type="url"
              defaultValue={formData.image_url}
              placeholder="https://..."
              required
            />
            <p className="text-xs text-muted-foreground mt-1">This image will be used as fallback for all devices</p>
          </div>

          <Separator />

          <div>
            <Label>Desktop Image URL (Optional)</Label>
            <Input
              name="image_desktop"
              type="url"
              defaultValue={formData.image_desktop || ''}
              placeholder="https://... (recommended: 1920x600)"
            />
          </div>

          <div>
            <Label>Tablet Image URL (Optional)</Label>
            <Input
              name="image_tablet"
              type="url"
              defaultValue={formData.image_tablet || ''}
              placeholder="https://... (recommended: 1024x500)"
            />
          </div>

          <div>
            <Label>Mobile Image URL (Optional)</Label>
            <Input
              name="image_mobile"
              type="url"
              defaultValue={formData.image_mobile || ''}
              placeholder="https://... (recommended: 768x400)"
            />
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                <Label>Show on Desktop</Label>
              </div>
              <Switch name="show_on_desktop" defaultChecked={formData.show_on_desktop} />
            </div>
            <div>
              <Label>Desktop Height (px)</Label>
              <Input
                name="desktop_height"
                type="number"
                defaultValue={formData.desktop_height}
                min={300}
                max={1000}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="h-5 w-5" />
                <Label>Show on Tablet</Label>
              </div>
              <Switch name="show_on_tablet" defaultChecked={formData.show_on_tablet} />
            </div>
            <div>
              <Label>Tablet Height (px)</Label>
              <Input
                name="tablet_height"
                type="number"
                defaultValue={formData.tablet_height}
                min={300}
                max={800}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <Label>Show on Mobile</Label>
              </div>
              <Switch name="show_on_mobile" defaultChecked={formData.show_on_mobile} />
            </div>
            <div>
              <Label>Mobile Height (px)</Label>
              <Input
                name="mobile_height"
                type="number"
                defaultValue={formData.mobile_height}
                min={200}
                max={600}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="animation" className="space-y-6">
          <div>
            <Label>Animation Type</Label>
            <Select name="animation_type" defaultValue={formData.animation_type}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Animation Duration (ms)</Label>
            <Input
              name="animation_duration"
              type="number"
              defaultValue={formData.animation_duration}
              min={100}
              max={2000}
              step={100}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Auto Play</Label>
            <Switch name="auto_play" defaultChecked={formData.auto_play} />
          </div>

          <div>
            <Label>Auto Play Delay (ms)</Label>
            <Input
              name="auto_play_delay"
              type="number"
              defaultValue={formData.auto_play_delay}
              min={1000}
              max={10000}
              step={1000}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Show Navigation Arrows</Label>
            <Switch name="show_navigation" defaultChecked={formData.show_navigation} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Pagination Dots</Label>
            <Switch name="show_pagination" defaultChecked={formData.show_pagination} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Slide
        </Button>
      </div>
    </form>
  );
}