
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
    if (score >= 80) return 'bg-red-600';
    if (score >= 60) return 'bg-orange-600';
    if (score >= 40) return 'bg-yellow-600';
    if (score >= 20) return 'bg-blue-600';
    return 'bg-gray-600';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                Trending Topics Management
              </CardTitle>
              <CardDescription className="text-gray-300">
                Track and manage trending topics and keywords
              </CardDescription>
            </div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => { resetForm(); setEditingTopic(null); }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingTopic ? 'Edit Topic' : 'Add Trending Topic'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Add or update a trending topic with keywords and score.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="topic" className="text-white">Topic</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="Real Estate Market Trends"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category" className="text-white">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
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
                      <Label htmlFor="trend_score" className="text-white">Trend Score (0-100)</Label>
                      <Input
                        id="trend_score"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.trend_score}
                        onChange={(e) => setFormData({ ...formData, trend_score: parseInt(e.target.value) || 0 })}
                        placeholder="85"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="related_keywords" className="text-white">Related Keywords</Label>
                    <Input
                      id="related_keywords"
                      value={formData.related_keywords}
                      onChange={(e) => setFormData({ ...formData, related_keywords: e.target.value })}
                      placeholder="housing market, property prices, real estate trends"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-sm text-gray-400">Separate keywords with commas</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="date_tracked" className="text-white">Date Tracked</Label>
                    <Input
                      id="date_tracked"
                      type="date"
                      value={formData.date_tracked}
                      onChange={(e) => setFormData({ ...formData, date_tracked: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createTopicMutation.isPending || updateTopicMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingTopic ? 'Update' : 'Add'} Topic
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
                  <TableHead className="text-gray-300">Topic</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300">Trend Score</TableHead>
                  <TableHead className="text-gray-300">Keywords</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                      Loading topics...
                    </TableCell>
                  </TableRow>
                ) : topics?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                      No trending topics found
                    </TableCell>
                  </TableRow>
                ) : (
                  topics?.map((topic) => (
                    <TableRow key={topic.id} className="border-white/20">
                      <TableCell className="text-white">
                        <div className="font-medium">{topic.topic}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                          {topic.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getTrendScoreColor(topic.trend_score || 0)}`}></div>
                          <span className="text-white font-medium">{topic.trend_score || 0}</span>
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex flex-wrap gap-1">
                          {topic.related_keywords?.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {topic.related_keywords?.length > 3 && (
                            <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                              +{topic.related_keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {topic.date_tracked ? new Date(topic.date_tracked).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(topic)} className="border-gray-600 text-gray-300">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(topic.id)}
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

export default TrendingTopicsManagement;
