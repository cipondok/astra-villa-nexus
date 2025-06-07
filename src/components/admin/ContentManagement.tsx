
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAlert } from "@/contexts/AlertContext";
import { FileText, Plus, Edit, Trash2, Eye, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ContentManagement = () => {
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState({
    type: 'page',
    title: '',
    slug: '',
    content: { body: '', meta_title: '', meta_description: '' },
    status: 'draft'
  });
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ['cms-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select(`
          *,
          author:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const { error } = await supabase
        .from('cms_content')
        .insert({
          ...contentData,
          author_id: (await supabase.auth.getUser()).data.user?.id,
          content: JSON.stringify(contentData.content)
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      showSuccess("Success", "Content created successfully");
      setIsCreateDialogOpen(false);
      setNewContent({
        type: 'page',
        title: '',
        slug: '',
        content: { body: '', meta_title: '', meta_description: '' },
        status: 'draft'
      });
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
          content: JSON.stringify(updates.content),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      showSuccess("Success", "Content updated successfully");
      setIsEditDialogOpen(false);
      setSelectedContent(null);
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

  const handleEditContent = (contentItem: any) => {
    setSelectedContent({
      ...contentItem,
      content: typeof contentItem.content === 'string' 
        ? JSON.parse(contentItem.content) 
        : contentItem.content
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateContent = () => {
    createContentMutation.mutate(newContent);
  };

  const handleUpdateContent = () => {
    if (!selectedContent) return;
    updateContentMutation.mutate({
      id: selectedContent.id,
      updates: {
        title: selectedContent.title,
        slug: selectedContent.slug,
        content: selectedContent.content,
        status: selectedContent.status,
        type: selectedContent.type
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getContentBody = (contentData: any) => {
    if (typeof contentData === 'string') {
      try {
        const parsed = JSON.parse(contentData);
        return parsed.body || '';
      } catch {
        return contentData;
      }
    }
    return contentData?.body || '';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Content Management System</CardTitle>
            <CardDescription>Manage website pages, posts, and content</CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
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
                    <Badge variant="outline">{item.type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {Array.isArray(item.author) && item.author.length > 0 
                      ? item.author[0]?.full_name || item.author[0]?.email
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditContent(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteContentMutation.mutate(item.id)}
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

        {/* Create Content Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>Add new page or post content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={newContent.slug}
                    onChange={(e) => setNewContent({...newContent, slug: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Content Type</Label>
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
                      <SelectItem value="announcement">Announcement</SelectItem>
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
                <Label htmlFor="content">Content Body</Label>
                <Textarea
                  id="content"
                  rows={6}
                  value={newContent.content.body}
                  onChange={(e) => setNewContent({
                    ...newContent, 
                    content: {...newContent.content, body: e.target.value}
                  })}
                />
              </div>
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={newContent.content.meta_title}
                  onChange={(e) => setNewContent({
                    ...newContent, 
                    content: {...newContent.content, meta_title: e.target.value}
                  })}
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  rows={2}
                  value={newContent.content.meta_description}
                  onChange={(e) => setNewContent({
                    ...newContent, 
                    content: {...newContent.content, meta_description: e.target.value}
                  })}
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

        {/* Edit Content Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
              <DialogDescription>Update content information</DialogDescription>
            </DialogHeader>
            {selectedContent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_title">Title</Label>
                    <Input
                      id="edit_title"
                      value={selectedContent.title || ''}
                      onChange={(e) => setSelectedContent({...selectedContent, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_slug">Slug</Label>
                    <Input
                      id="edit_slug"
                      value={selectedContent.slug || ''}
                      onChange={(e) => setSelectedContent({...selectedContent, slug: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_type">Content Type</Label>
                    <Select
                      value={selectedContent.type}
                      onValueChange={(value) => setSelectedContent({...selectedContent, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">Page</SelectItem>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_status">Status</Label>
                    <Select
                      value={selectedContent.status}
                      onValueChange={(value) => setSelectedContent({...selectedContent, status: value})}
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
                  <Label htmlFor="edit_content">Content Body</Label>
                  <Textarea
                    id="edit_content"
                    rows={6}
                    value={selectedContent.content?.body || ''}
                    onChange={(e) => setSelectedContent({
                      ...selectedContent, 
                      content: {...selectedContent.content, body: e.target.value}
                    })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateContent} disabled={updateContentMutation.isPending}>
                {updateContentMutation.isPending ? 'Updating...' : 'Update Content'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ContentManagement;
