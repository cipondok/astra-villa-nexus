
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
import { FileText, Plus, Edit, Trash2, Eye, Search, Filter, Globe, BookOpen, FileIcon, Tag } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const ContentManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'page',
    content: '',
    status: 'draft',
    category_id: '',
    featured_image: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    author_id: '',
    publish_date: '',
    tags: ''
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch content with filtering
  const { data: content, isLoading } = useQuery({
    queryKey: ['cms-content', searchTerm, filterType, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('cms_content')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%`);
      }
      
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories for dropdown
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
      const processedData = {
        ...contentData,
        content: contentData.content || '',
        seo_keywords: contentData.seo_keywords ? contentData.seo_keywords.split(',').map((k: string) => k.trim()) : [],
        category_id: contentData.category_id || null
      };
      
      const { error } = await supabase
        .from('cms_content')
        .insert([processedData]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Content Created", "Content has been created successfully.");
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const processedUpdates = {
        ...updates,
        content: updates.content || '',
        seo_keywords: updates.seo_keywords ? updates.seo_keywords.split(',').map((k: string) => k.trim()) : [],
        category_id: updates.category_id || null
      };
      
      const { error } = await supabase
        .from('cms_content')
        .update(processedUpdates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Content Updated", "Content has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
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
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
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
      content: '',
      status: 'draft',
      category_id: '',
      featured_image: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      author_id: '',
      publish_date: '',
      tags: ''
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
      title: item.title || '',
      slug: item.slug || '',
      type: item.type || 'page',
      content: typeof item.content === 'string' ? item.content : (item.content ? JSON.stringify(item.content, null, 2) : ''),
      status: item.status || 'draft',
      category_id: item.category_id || '',
      featured_image: item.featured_image || '',
      seo_title: item.seo_title || '',
      seo_description: item.seo_description || '',
      seo_keywords: Array.isArray(item.seo_keywords) ? item.seo_keywords.join(', ') : '',
      author_id: item.author_id || '',
      publish_date: item.publish_date || '',
      tags: item.tags || ''
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <BookOpen className="h-4 w-4" />;
      case 'documentation': return <FileIcon className="h-4 w-4" />;
      case 'page': return <Globe className="h-4 w-4" />;
      case 'news': return <FileText className="h-4 w-4" />;
      case 'faq': return <Tag className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getContentPreview = (content: any) => {
    if (typeof content === 'string') {
      return content.length > 100 ? content.substring(0, 100) + '...' : content;
    }
    if (content && typeof content === 'object') {
      const contentStr = JSON.stringify(content);
      return contentStr.length > 100 ? contentStr.substring(0, 100) + '...' : contentStr;
    }
    return 'No content available';
  };

  const filteredContent = content?.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <FileText className="h-5 w-5" />
                Content Management System
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage website content, blogs, and documentation with advanced features
              </CardDescription>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingContent(null); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">
                    {editingContent ? 'Edit Content' : 'Create New Content'}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {editingContent ? 'Update the content details below.' : 'Fill in the details to create new content.'}
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-muted">
                    <TabsTrigger value="basic" className="text-foreground">Basic Info</TabsTrigger>
                    <TabsTrigger value="content" className="text-foreground">Content</TabsTrigger>
                    <TabsTrigger value="seo" className="text-foreground">SEO & Meta</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title" className="text-foreground">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Content title"
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="slug" className="text-foreground">Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="content-slug"
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type" className="text-foreground">Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger className="bg-background border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="page" className="text-foreground hover:bg-muted">Website Page</SelectItem>
                            <SelectItem value="blog" className="text-foreground hover:bg-muted">Blog Post</SelectItem>
                            <SelectItem value="documentation" className="text-foreground hover:bg-muted">Documentation</SelectItem>
                            <SelectItem value="news" className="text-foreground hover:bg-muted">News Article</SelectItem>
                            <SelectItem value="faq" className="text-foreground hover:bg-muted">FAQ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category" className="text-foreground">Category</Label>
                        <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                          <SelectTrigger className="bg-background border-border text-foreground">
                            <SelectValue placeholder="Select category (optional)" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} className="text-foreground hover:bg-muted">{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status" className="text-foreground">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger className="bg-background border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="draft" className="text-foreground hover:bg-muted">Draft</SelectItem>
                            <SelectItem value="published" className="text-foreground hover:bg-muted">Published</SelectItem>
                            <SelectItem value="archived" className="text-foreground hover:bg-muted">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="featured_image" className="text-foreground">Featured Image URL</Label>
                      <Input
                        id="featured_image"
                        value={formData.featured_image}
                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="bg-background border-border text-foreground"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tags" className="text-foreground">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="tag1, tag2, tag3"
                        className="bg-background border-border text-foreground"
                      />
                      <p className="text-sm text-muted-foreground">Separate tags with commas</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="content" className="text-foreground">Content</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Enter your content here..."
                        rows={15}
                        className="bg-background border-border text-foreground font-mono"
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter your content in markdown or HTML format
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="seo" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="seo_title" className="text-foreground">SEO Title</Label>
                      <Input
                        id="seo_title"
                        value={formData.seo_title}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        placeholder="SEO optimized title"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="seo_description" className="text-foreground">SEO Description</Label>
                      <Textarea
                        id="seo_description"
                        value={formData.seo_description}
                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                        placeholder="SEO meta description"
                        rows={3}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="seo_keywords" className="text-foreground">SEO Keywords</Label>
                      <Input
                        id="seo_keywords"
                        value={formData.seo_keywords}
                        onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                        placeholder="keyword1, keyword2, keyword3"
                        className="bg-background border-border text-foreground"
                      />
                      <p className="text-sm text-muted-foreground">Separate keywords with commas</p>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="publish_date" className="text-foreground">Publish Date</Label>
                      <Input
                        id="publish_date"
                        type="datetime-local"
                        value={formData.publish_date}
                        onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="border-border text-foreground hover:bg-muted">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createContentMutation.isPending || updateContentMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {editingContent ? 'Update' : 'Create'} Content
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 bg-background border-border text-foreground">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-foreground hover:bg-muted">All Types</SelectItem>
                  <SelectItem value="page" className="text-foreground hover:bg-muted">Pages</SelectItem>
                  <SelectItem value="blog" className="text-foreground hover:bg-muted">Blogs</SelectItem>
                  <SelectItem value="documentation" className="text-foreground hover:bg-muted">Documentation</SelectItem>
                  <SelectItem value="news" className="text-foreground hover:bg-muted">News</SelectItem>
                  <SelectItem value="faq" className="text-foreground hover:bg-muted">FAQ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-background border-border text-foreground">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-foreground hover:bg-muted">All Status</SelectItem>
                  <SelectItem value="draft" className="text-foreground hover:bg-muted">Draft</SelectItem>
                  <SelectItem value="published" className="text-foreground hover:bg-muted">Published</SelectItem>
                  <SelectItem value="archived" className="text-foreground hover:bg-muted">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border border-border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Content</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading content...
                    </TableCell>
                  </TableRow>
                ) : filteredContent?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No content found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContent?.map((item) => (
                    <TableRow key={item.id} className="border-border hover:bg-muted/50">
                      <TableCell className="text-foreground">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          {item.slug && (
                            <div className="text-sm text-muted-foreground">/{item.slug}</div>
                          )}
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {getContentPreview(item.content)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <Badge variant="outline" className="border-border text-muted-foreground">
                            {item.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(item.status)} className={
                          item.status === 'published' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="border-border text-foreground hover:bg-muted">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(item.id)}
                            className="border-border text-foreground hover:bg-muted hover:text-destructive"
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

export default ContentManagement;
