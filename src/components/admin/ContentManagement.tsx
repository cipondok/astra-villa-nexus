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
import { FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const ContentManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'page',
    content: {},
    status: 'draft'
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ['cms-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const { error } = await supabase
        .from('cms_content')
        .insert([contentData]);
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
      const { error } = await supabase
        .from('cms_content')
        .update(updates)
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
      content: {},
      status: 'draft'
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
      status: item.status
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Management
              </CardTitle>
              <CardDescription>
                Manage website content, pages, and blog posts
              </CardDescription>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingContent(null); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingContent ? 'Edit Content' : 'Create New Content'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingContent ? 'Update the content details below.' : 'Fill in the details to create new content.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Content title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="content-slug"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="blog">Blog Post</SelectItem>
                          <SelectItem value="news">News</SelectItem>
                          <SelectItem value="faq">FAQ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content (JSON)</Label>
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
                      placeholder='{"body": "Content goes here..."}'
                      rows={8}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createContentMutation.isPending || updateContentMutation.isPending}
                  >
                    {editingContent ? 'Update' : 'Create'} Content
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading content...
                    </TableCell>
                  </TableRow>
                ) : content?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No content found
                    </TableCell>
                  </TableRow>
                ) : (
                  content?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          {item.slug && (
                            <div className="text-sm text-muted-foreground">/{item.slug}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(item.id)}
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
