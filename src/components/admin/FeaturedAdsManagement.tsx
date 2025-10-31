import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Image as ImageIcon, ArrowUp, ArrowDown } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface FeaturedAd {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  property_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function FeaturedAdsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<FeaturedAd | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    property_id: '',
    display_order: 0,
    is_active: true
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch featured ads
  const { data: ads, isLoading } = useQuery({
    queryKey: ['admin-featured-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_ads')
        .select('*')
        .order('display_order')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FeaturedAd[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (adData: typeof formData) => {
      const { error } = await supabase
        .from('featured_ads')
        .insert([{
          ...adData,
          subtitle: adData.subtitle || null,
          link_url: adData.link_url || null,
          property_id: adData.property_id || null
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Featured Ad Created", "Featured ad has been created successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-featured-ads'] });
      queryClient.invalidateQueries({ queryKey: ['featured-ads'] });
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from('featured_ads')
        .update({
          ...updates,
          subtitle: updates.subtitle || null,
          link_url: updates.link_url || null,
          property_id: updates.property_id || null
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Featured Ad Updated", "Featured ad has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-featured-ads'] });
      queryClient.invalidateQueries({ queryKey: ['featured-ads'] });
      setShowForm(false);
      setEditingAd(null);
      resetForm();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('featured_ads')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Featured Ad Deleted", "Featured ad has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-featured-ads'] });
      queryClient.invalidateQueries({ queryKey: ['featured-ads'] });
    },
    onError: (error: any) => {
      showError("Deletion Failed", error.message);
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('featured_ads')
        .update({ display_order: newOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-ads'] });
      queryClient.invalidateQueries({ queryKey: ['featured-ads'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      property_id: '',
      display_order: 0,
      is_active: true
    });
  };

  const handleSubmit = () => {
    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (ad: FeaturedAd) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      subtitle: ad.subtitle || '',
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      property_id: ad.property_id || '',
      display_order: ad.display_order,
      is_active: ad.is_active
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this featured ad?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    const currentAd = ads?.find(ad => ad.id === id);
    if (!currentAd) return;

    const newOrder = direction === 'up' ? currentAd.display_order - 1 : currentAd.display_order + 1;
    reorderMutation.mutate({ id, newOrder });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <ImageIcon className="h-5 w-5" />
              Featured Ads Carousel
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage featured property ads displayed on the homepage
            </CardDescription>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { resetForm(); setEditingAd(null); }} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Featured Ad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">
                  {editingAd ? 'Edit Featured Ad' : 'Create New Featured Ad'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {editingAd ? 'Update the featured ad details below.' : 'Fill in the details to create a new featured ad.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-foreground">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Featured Property Title"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subtitle" className="text-foreground">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Additional description"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image_url" className="text-foreground">Image URL *</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="bg-background border-border text-foreground"
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg mt-2" />
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="property_id" className="text-foreground">Property ID (UUID)</Label>
                  <Input
                    id="property_id"
                    value={formData.property_id}
                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    placeholder="Optional: Link to specific property"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="link_url" className="text-foreground">Custom Link URL</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="Optional: External link"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="display_order" className="text-foreground">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active" className="text-foreground">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!formData.title || !formData.image_url}>
                  {editingAd ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : !ads || ads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No featured ads yet. Create your first one!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleReorder(ad.id, 'up')}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleReorder(ad.id, 'down')}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <span className="ml-2">{ad.display_order}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <img src={ad.image_url} alt={ad.title} className="w-16 h-10 object-cover rounded" />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ad.title}</div>
                      {ad.subtitle && <div className="text-sm text-muted-foreground">{ad.subtitle}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ad.is_active ? "default" : "secondary"}>
                      {ad.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(ad.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
