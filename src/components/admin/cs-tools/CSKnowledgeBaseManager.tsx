import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAlert } from "@/contexts/AlertContext";
import { BookOpen, Plus, Edit, Trash2, Eye, ThumbsUp, Search } from "lucide-react";

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_published: boolean;
  view_count: number;
  helpful_votes: number;
  created_at: string;
}

const CSKnowledgeBaseManager = () => {
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [articleDialog, setArticleDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    is_published: false
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch knowledge base articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ['cs-knowledge-base', searchTerm, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('cs_knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Create/Update article mutation
  const saveArticleMutation = useMutation({
    mutationFn: async (articleData: any) => {
      const tagsArray = articleData.tags ? articleData.tags.split(',').map((tag: string) => tag.trim()) : [];
      const dataToSave = {
        ...articleData,
        tags: tagsArray
      };

      if (selectedArticle) {
        const { error } = await supabase
          .from('cs_knowledge_base')
          .update(dataToSave)
          .eq('id', selectedArticle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cs_knowledge_base')
          .insert([{ ...dataToSave, created_by: (await supabase.auth.getUser()).data.user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-knowledge-base'] });
      showSuccess("Article Saved", "Knowledge base article has been saved successfully.");
      setArticleDialog(false);
      resetForm();
    },
    onError: () => {
      showError("Save Failed", "Failed to save knowledge base article.");
    },
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('cs_knowledge_base')
        .delete()
        .eq('id', articleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-knowledge-base'] });
      showSuccess("Article Deleted", "Knowledge base article has been deleted successfully.");
    },
    onError: () => {
      showError("Delete Failed", "Failed to delete knowledge base article.");
    },
  });

  // Toggle publish status
  const togglePublishMutation = useMutation({
    mutationFn: async ({ articleId, isPublished }: { articleId: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from('cs_knowledge_base')
        .update({ is_published: isPublished })
        .eq('id', articleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-knowledge-base'] });
      showSuccess("Status Updated", "Article publish status has been updated.");
    },
    onError: () => {
      showError("Update Failed", "Failed to update article status.");
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      tags: '',
      is_published: false
    });
    setSelectedArticle(null);
  };

  const handleEdit = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags.join(', '),
      is_published: article.is_published
    });
    setArticleDialog(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      showError("Validation Error", "Please fill in title and content.");
      return;
    }
    saveArticleMutation.mutate(formData);
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'billing': return 'bg-green-100 text-green-800';
      case 'account': return 'bg-purple-100 text-purple-800';
      case 'troubleshooting': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['general', 'technical', 'billing', 'account', 'troubleshooting'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Knowledge Base Manager
            </CardTitle>
            <CardDescription>
              Create and manage FAQ articles and troubleshooting guides
            </CardDescription>
          </div>
          <Dialog open={articleDialog} onOpenChange={setArticleDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedArticle ? 'Edit Knowledge Article' : 'Create New Knowledge Article'}
                </DialogTitle>
                <DialogDescription>
                  Write helpful articles for your knowledge base
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Article Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="How to reset your password"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="password, login, security"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Article Content *</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your article content in markdown format..."
                    rows={12}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can use markdown formatting for better readability
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publish"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <label htmlFor="publish" className="text-sm font-medium">
                    Publish article immediately
                  </label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setArticleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saveArticleMutation.isPending}>
                    {saveArticleMutation.isPending ? 'Saving...' : 'Save Article'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading articles...</div>
        ) : articles?.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No knowledge base articles found. Create your first article!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Helpful</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles?.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div>
                      <div className="truncate">{article.title}</div>
                      {article.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {article.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryVariant(article.category)}>
                      {article.category.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={article.is_published ? "default" : "secondary"}>
                        {article.is_published ? "Published" : "Draft"}
                      </Badge>
                      <Switch
                        checked={article.is_published}
                        onCheckedChange={(checked) => 
                          togglePublishMutation.mutate({ articleId: article.id, isPublished: checked })
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>{article.view_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      {article.helpful_votes}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(article.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedArticle(article);
                          setPreviewDialog(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteArticleMutation.mutate(article.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Preview Dialog */}
        <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedArticle?.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={getCategoryVariant(selectedArticle?.category || '')}>
                  {selectedArticle?.category.toUpperCase()}
                </Badge>
                <Badge variant={selectedArticle?.is_published ? "default" : "secondary"}>
                  {selectedArticle?.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
            </DialogHeader>
            {selectedArticle && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Views: {selectedArticle.view_count}</span>
                  <span>Helpful votes: {selectedArticle.helpful_votes}</span>
                  <span>Created: {new Date(selectedArticle.created_at).toLocaleDateString()}</span>
                </div>
                
                {selectedArticle.tags.length > 0 && (
                  <div className="flex gap-2">
                    {selectedArticle.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {selectedArticle.content}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CSKnowledgeBaseManager;