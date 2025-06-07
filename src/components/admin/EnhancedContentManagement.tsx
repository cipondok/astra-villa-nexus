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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Edit, Trash2, Eye, Tags, Search, TrendingUp } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const EnhancedContentManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'page',
    content: {},
    status: 'draft',
    category_id: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    featured_image: ''
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch content with categories
  const { data: content, isLoading } = useQuery({
    queryKey: ['enhanced-cms-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select(`
          *,
          category:content_categories(name, slug)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['content-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const { error } = await supabase
        .from('cms_content')
        .insert([{
          ...contentData,
          seo_keywords: contentData.seo_keywords?.split(',').map((k: string) => k.trim()) || []
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Content Created", "Content has been created successfully.");
      queryClient.invalidateQueries({ queryKey: ['enhanced-cms-content'] });
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('cms_content')
        .update({
          ...updates,
          seo_keywords: updates.seo_keywords?.split(',').map((k: string) => k.trim()) || []
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Content Updated", "Content has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['enhanced-cms-content'] });
      setShowForm(false);
      setEditingContent(null);
      resetForm();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_content')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Content Deleted", "Content has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['enhanced-cms-content'] });
    },
    onError: (error: any) => {
      showError("Deletion Failed", error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      type: 'page',
      content: {},
      status: 'draft',
      category_id: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: [],
      featured_image: ''
    });
  };

  const handleSubmit = () => {
    if (editingContent) {
      updateContentMutation.mutate({ id: editingContent.id, updates: formData });
    } else {
      createContentMutation.mutate(formData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingContent(item);
    setFormData({
      title: item.title,
      slug: item.slug || '',
      type: item.type,
      content: item.content || {},
      status: item.status,
      category_id: item.category_id || '',
      seo_title: item.seo_title || '',
      seo_description: item.seo_description || '',
      seo_keywords: item.seo_keywords?.join(', ') || '',
      featured_image: item.featured_image || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      deleteContentMutation.mutate(id);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                Enhanced Content Management
              </CardTitle>
              <CardDescription className="text-gray-300">
                Manage website content, SEO, categories, and more
              </CardDescription>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => { resetForm(); setEditingContent(null); }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-md border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingContent ? 'Edit Content' : 'Create New Content'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    {editingContent ? 'Update the content details below.' : 'Fill in the details to create new content.'}
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                    <TabsTrigger value="basic" className="text-white">Basic Info</TabsTrigger>
                    <TabsTrigger value="seo" className="text-white">SEO & Meta</TabsTrigger>
                    <TabsTrigger value="content" className="text-white">Content</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title" className="text-white">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Content title"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="slug" className="text-white">Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="content-slug"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type" className="text-white">Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="page">Page</SelectItem>
                            <SelectItem value="blog">Blog Post</SelectItem>
                            <SelectItem value="news">News</SelectItem>
                            <SelectItem value="faq">FAQ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category" className="text-white">Category</Label>
                        <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status" className="text-white">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="featured_image" className="text-white">Featured Image URL</Label>
                      <Input
                        id="featured_image"
                        value={formData.featured_image}
                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="seo" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="seo_title" className="text-white">SEO Title</Label>
                      <Input
                        id="seo_title"
                        value={formData.seo_title}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        placeholder="SEO optimized title"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="seo_description" className="text-white">SEO Description</Label>
                      <Textarea
                        id="seo_description"
                        value={formData.seo_description}
                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                        placeholder="SEO meta description"
                        rows={3}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="seo_keywords" className="text-white">SEO Keywords</Label>
                      <Input
                        id="seo_keywords"
                        value={formData.seo_keywords}
                        onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                        placeholder="keyword1, keyword2, keyword3"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <p className="text-sm text-gray-400">Separate keywords with commas</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="content" className="text-white">Content (JSON)</Label>
                      <Textarea
                        id="content"
                        value={JSON.stringify(formData.content, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setFormData({ ...formData, content: parsed });
                          } catch (error) {
                            // Invalid JSON, keep the text as is
                          }
                        }}
                        placeholder='{"body": "Content goes here...", "sections": []}'
                        rows={12}
                        className="bg-gray-800 border-gray-700 text-white font-mono"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createContentMutation.isPending || updateContentMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingContent ? 'Update' : 'Create'} Content
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
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Created</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                      Loading content...
                    </TableCell>
                  </TableRow>
                ) : content?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                      No content found
                    </TableCell>
                  </TableRow>
                ) : (
                  content?.map((item) => (
                    <TableRow key={item.id} className="border-white/20">
                      <TableCell className="text-white">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          {item.slug && (
                            <div className="text-sm text-gray-400">/{item.slug}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">{item.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {item.category?.name || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="border-gray-600 text-gray-300">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(item.id)}
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

export default EnhancedContentManagement;
