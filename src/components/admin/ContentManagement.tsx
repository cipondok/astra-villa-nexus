
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/contexts/AlertContext";
import { Search, FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'page',
    content: '',
    status: 'draft',
    slug: ''
  });
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ['cms-content', searchTerm, typeFilter, statusFilter],
    queryFn: async () => {
      let query = supabase.from('cms_content').select(`
        *,
        author:profiles!cms_content_author_id_fkey(full_name, email)
      `);
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
      }
      
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('cms_content')
        .insert({
          ...contentData,
          author_id: user?.id,
          content: { body: contentData.content },
          slug: contentData.slug || contentData.title.toLowerCase().replace(/\s+/g, '-')
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      showSuccess("Success", "Content created successfully");
      setIsCreateDialogOpen(false);
      setNewContent({ title: '', type: 'page', content: '', status: 'draft', slug: '' });
    },
    onError: (error) => {
      showError("Error", `Failed to create content: ${error.message}`);
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { error } = await supabase
        .from('cms_content')
        .update({
          ...updates,
          content: { body: updates.content },
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      showSuccess("Success", "Content updated successfully");
      setEditingContent(null);
    },
    onError: (error) => {
      showError("Error", `Failed to update content: ${error.message}`);
    }
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
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      showSuccess("Success", "Content deleted successfully");
    },
    onError: (error) => {
      showError("Error", `Failed to delete content: ${error.message}`);
    }
  });

  const handleCreateContent = () => {
    if (!newContent.title.trim()) {
      showError("Error", "Title is required");
      return;
    }
    createContentMutation.mutate(newContent);
  };

  const handleUpdateContent = () => {
    if (!editingContent) return;
    updateContentMutation.mutate({
      id: editingContent.id,
      updates: {
        title: editingContent.title,
        type: editingContent.type,
        content: editingContent.content.body || editingContent.content,
        status: editingContent.status,
        slug: editingContent.slug
      }
    });
  };

  const handleDeleteContent = (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      deleteContentMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-500';
      case 'post': return 'bg-purple-500';
      case 'banner': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Management System
        </CardTitle>
        <CardDescription>Manage website content, pages, and blog posts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search content by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="page">Page</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="banner">Banner</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
                <DialogDescription>Add new content to your website</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    placeholder="Enter content title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newContent.type}
                      onValueChange={(value) => setNewContent({...newContent, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">Page</SelectItem>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="banner">Banner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newContent.status}
                      onValueChange={(value) => setNewContent({...newContent, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={newContent.slug}
                    onChange={(e) => setNewContent({...newContent, slug: e.target.value})}
                    placeholder="content-url-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newContent.content}
                    onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                    placeholder="Enter your content here..."
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateContent} disabled={createContentMutation.isPending}>
                  {createContentMutation.isPending ? 'Creating...' : 'Create Content'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading content...
                  </TableCell>
                </TableRow>
              ) : content?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(item.type)}>
                      {item.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{item.author?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{item.author?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(item.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingContent({
                              ...item,
                              content: item.content?.body || item.content || ''
                            })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Content</DialogTitle>
                            <DialogDescription>Update content information</DialogDescription>
                          </DialogHeader>
                          {editingContent && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                  id="edit-title"
                                  value={editingContent.title}
                                  onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-type">Type</Label>
                                  <Select
                                    value={editingContent.type}
                                    onValueChange={(value) => setEditingContent({...editingContent, type: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="page">Page</SelectItem>
                                      <SelectItem value="post">Post</SelectItem>
                                      <SelectItem value="banner">Banner</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-status">Status</Label>
                                  <Select
                                    value={editingContent.status}
                                    onValueChange={(value) => setEditingContent({...editingContent, status: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="draft">Draft</SelectItem>
                                      <SelectItem value="published">Published</SelectItem>
                                      <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="edit-slug">Slug</Label>
                                <Input
                                  id="edit-slug"
                                  value={editingContent.slug}
                                  onChange={(e) => setEditingContent({...editingContent, slug: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-content">Content</Label>
                                <Textarea
                                  id="edit-content"
                                  value={editingContent.content}
                                  onChange={(e) => setEditingContent({...editingContent, content: e.target.value})}
                                  rows={6}
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingContent(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateContent} disabled={updateContentMutation.isPending}>
                              {updateContentMutation.isPending ? 'Updating...' : 'Update Content'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContent(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {content?.filter(c => c.status === 'published').length || 0}
                </p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {content?.filter(c => c.status === 'draft').length || 0}
                </p>
                <p className="text-sm text-gray-600">Drafts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {content?.filter(c => c.status === 'archived').length || 0}
                </p>
                <p className="text-sm text-gray-600">Archived</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentManagement;
