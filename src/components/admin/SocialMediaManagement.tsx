import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Share2, Plus, Edit, Trash2, Settings, BarChart3 } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const SocialMediaManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [formData, setFormData] = useState({
    platform: '',
    account_name: '',
    profile_url: '',
    api_credentials: {},
    posting_settings: {},
    is_active: true
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: platforms, isLoading } = useQuery({
    queryKey: ['social-media-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createPlatformMutation = useMutation({
    mutationFn: async (platformData: any) => {
      const { error } = await supabase
        .from('social_media_settings')
        .insert([platformData]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Platform Added", "Social media platform has been added successfully.");
      queryClient.invalidateQueries({ queryKey: ['social-media-settings'] });
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      showError("Addition Failed", error.message);
    },
  });

  const updatePlatformMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('social_media_settings')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Platform Updated", "Social media platform has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['social-media-settings'] });
      setShowForm(false);
      setEditingPlatform(null);
      resetForm();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const deletePlatformMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_media_settings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Platform Deleted", "Social media platform has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['social-media-settings'] });
    },
    onError: (error: any) => {
      showError("Deletion Failed", error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      platform: '',
      account_name: '',
      profile_url: '',
      api_credentials: {},
      posting_settings: {},
      is_active: true
    });
  };

  const handleSubmit = () => {
    if (editingPlatform) {
      updatePlatformMutation.mutate({ id: editingPlatform.id, updates: formData });
    } else {
      createPlatformMutation.mutate(formData);
    }
  };

  const handleEdit = (platform: any) => {
    setEditingPlatform(platform);
    setFormData({
      platform: platform.platform,
      account_name: platform.account_name || '',
      profile_url: platform.profile_url || '',
      api_credentials: platform.api_credentials || {},
      posting_settings: platform.posting_settings || {},
      is_active: platform.is_active
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this platform?')) {
      deletePlatformMutation.mutate(id);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return '📘';
      case 'twitter': return '🐦';
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      case 'youtube': return '📺';
      case 'tiktok': return '🎵';
      default: return '📱';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Share2 className="h-5 w-5" />
                Social Media Management
              </CardTitle>
              <CardDescription className="text-gray-300">
                Manage social media accounts, posting settings, and analytics
              </CardDescription>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => { resetForm(); setEditingPlatform(null); }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingPlatform ? 'Edit Platform' : 'Add Social Media Platform'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Configure social media platform settings and credentials.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="platform" className="text-white">Platform</Label>
                      <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="account_name" className="text-white">Account Name</Label>
                      <Input
                        id="account_name"
                        value={formData.account_name}
                        onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                        placeholder="@username"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="profile_url" className="text-white">Profile URL</Label>
                    <Input
                      id="profile_url"
                      value={formData.profile_url}
                      onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                      placeholder="https://facebook.com/username"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="api_credentials" className="text-white">API Credentials (JSON)</Label>
                    <Textarea
                      id="api_credentials"
                      value={JSON.stringify(formData.api_credentials, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData({ ...formData, api_credentials: parsed });
                        } catch (error) {
                          // Invalid JSON, keep the text as is
                        }
                      }}
                      placeholder='{"api_key": "your_key", "access_token": "your_token"}'
                      rows={4}
                      className="bg-gray-800 border-gray-700 text-white font-mono"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="posting_settings" className="text-white">Posting Settings (JSON)</Label>
                    <Textarea
                      id="posting_settings"
                      value={JSON.stringify(formData.posting_settings, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData({ ...formData, posting_settings: parsed });
                        } catch (error) {
                          // Invalid JSON, keep the text as is
                        }
                      }}
                      placeholder='{"auto_post": true, "schedule": "daily", "hashtags": ["#realestate"]}'
                      rows={4}
                      className="bg-gray-800 border-gray-700 text-white font-mono"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active" className="text-white">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createPlatformMutation.isPending || updatePlatformMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingPlatform ? 'Update' : 'Add'} Platform
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-white/20 rounded-lg bg-white/5">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-gray-300">Platform</TableHead>
                  <TableHead className="text-gray-300">Account</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Created</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-300">
                      Loading platforms...
                    </TableCell>
                  </TableRow>
                ) : platforms?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-300">
                      No platforms configured
                    </TableCell>
                  </TableRow>
                ) : (
                  platforms?.map((platform) => (
                    <TableRow key={platform.id} className="border-white/20">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getPlatformIcon(platform.platform)}</span>
                          <span className="font-medium capitalize">{platform.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <div>
                          <div className="font-medium">{platform.account_name}</div>
                          {platform.profile_url && (
                            <a href={platform.profile_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
                              View Profile
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={platform.is_active ? 'default' : 'outline'} className={platform.is_active ? 'bg-green-600' : 'border-gray-600 text-gray-300'}>
                          {platform.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(platform.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(platform)} className="border-gray-600 text-gray-300">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(platform.id)}
                            className="border-gray-600 text-gray-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaManagement;
