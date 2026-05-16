
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TrendingUp, Plus, Edit, Trash2, BarChart3 } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const TrendingTopicsManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    category: '',
    trend_score: 0,
    related_keywords: '',
    date_tracked: new Date().toISOString().split('T')[0]
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: topics, isLoading } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('trend_score', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      const { error } = await supabase
        .from('trending_topics')
        .insert([{
          ...topicData,
          related_keywords: topicData.related_keywords.split(',').map((k: string) => k.trim())
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Topic Added", "Trending topic has been added successfully.");
      queryClient.invalidateQueries({ queryKey: ['trending-topics'] });
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      showError("Addition Failed", error.message);
    },
  });

  const updateTopicMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('trending_topics')
        .update({
          ...updates,
          related_keywords: updates.related_keywords.split(',').map((k: string) => k.trim())
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Topic Updated", "Trending topic has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['trending-topics'] });
      setShowForm(false);
      setEditingTopic(null);
      resetForm();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trending_topics')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Topic Deleted", "Trending topic has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['trending-topics'] });
    },
    onError: (error: any) => {
      showError("Deletion Failed", error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      topic: '',
      category: '',
      trend_score: 0,
      related_keywords: '',
      date_tracked: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = () => {
    if (editingTopic) {
      updateTopicMutation.mutate({ id: editingTopic.id, updates: formData });
    } else {
      createTopicMutation.mutate(formData);
    }
  };

  const handleEdit = (topic: any) => {
    setEditingTopic(topic);
    setFormData({
      topic: topic.topic,
      category: topic.category || '',
      trend_score: topic.trend_score || 0,
      related_keywords: topic.related_keywords?.join(', ') || '',
      date_tracked: topic.date_tracked || new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trending topic?')) {
      deleteTopicMutation.mutate(id);
    }
  };

  const getTrendScoreColor = (score: number) => {
    if (score >= 80) return 'bg-destructive';
    if (score >= 60) return 'bg-chart-3';
    if (score >= 40) return 'bg-chart-3/70';
    if (score >= 20) return 'bg-chart-4';
    return 'bg-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-md border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5" />
                Trending Topics Management
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Track and manage trending topics and keywords
              </CardDescription>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => { resetForm(); setEditingTopic(null); }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-md border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingTopic ? 'Edit Topic' : 'Add Trending Topic'}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Add or update a trending topic with keywords and score.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="topic" className="text-foreground">Topic</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="Real Estate Market Trends"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category" className="text-foreground">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real-estate">Real Estate</SelectItem>
                          <SelectItem value="market">Market Analysis</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="news">News</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="trend_score" className="text-foreground">Trend Score (0-100)</Label>
                      <Input
                        id="trend_score"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.trend_score}
                        onChange={(e) => setFormData({ ...formData, trend_score: parseInt(e.target.value) || 0 })}
                        placeholder="85"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="related_keywords" className="text-foreground">Related Keywords</Label>
                    <Input
                      id="related_keywords"
                      value={formData.related_keywords}
                      onChange={(e) => setFormData({ ...formData, related_keywords: e.target.value })}
                      placeholder="housing market, property prices, real estate trends"
                    />
                    <p className="text-sm text-muted-foreground">Separate keywords with commas</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="date_tracked" className="text-foreground">Date Tracked</Label>
                    <Input
                      id="date_tracked"
                      type="date"
                      value={formData.date_tracked}
                      onChange={(e) => setFormData({ ...formData, date_tracked: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createTopicMutation.isPending || updateTopicMutation.isPending}
                  >
                    {editingTopic ? 'Update' : 'Add'} Topic
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-border/40 rounded-lg bg-card/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="text-muted-foreground">Topic</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Trend Score</TableHead>
                  <TableHead className="text-muted-foreground">Keywords</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading topics...
                    </TableCell>
                  </TableRow>
                ) : topics?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No trending topics found
                    </TableCell>
                  </TableRow>
                ) : (
                  topics?.map((topic) => (
                    <TableRow key={topic.id} className="border-border/40">
                      <TableCell className="text-foreground">
                        <div className="font-medium">{topic.topic}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {topic.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getTrendScoreColor(topic.trend_score || 0)}`}></div>
                          <span className="text-foreground font-medium">{topic.trend_score || 0}</span>
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-wrap gap-1">
                          {topic.related_keywords?.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {topic.related_keywords?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{topic.related_keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {topic.date_tracked ? new Date(topic.date_tracked).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(topic)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(topic.id)}
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

export default TrendingTopicsManagement;
