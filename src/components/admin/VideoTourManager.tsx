import React, { useState } from 'react';
import { useVideoTours, VideoTour, TourScene } from '@/hooks/useVideoTours';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Video, Plus, Eye, EyeOff, Trash2, Edit, 
  MoreVertical, Camera, MapPin, BarChart3,
  Glasses, Settings, Upload, Image
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const VideoTourManager: React.FC = () => {
  const { tours, loadingTours, createTour, updateTour, deleteTour } = useVideoTours();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTour, setSelectedTour] = useState<VideoTour | null>(null);
  const [newTour, setNewTour] = useState<{
    property_id: string;
    title: string;
    description: string;
    tour_type: 'panorama' | '360_video' | 'walkthrough';
    is_vr_enabled: boolean;
  }>({
    property_id: '',
    title: '',
    description: '',
    tour_type: 'panorama',
    is_vr_enabled: true
  });

  const handleCreateTour = async () => {
    if (!newTour.property_id || !newTour.title) {
      toast.error('Property ID and title are required');
      return;
    }

    try {
      await createTour(newTour);
      setShowCreateDialog(false);
      setNewTour({
        property_id: '',
        title: '',
        description: '',
        tour_type: 'panorama',
        is_vr_enabled: true
      });
    } catch (error) {
      console.error('Failed to create tour:', error);
    }
  };

  const handleTogglePublish = (tour: VideoTour) => {
    updateTour({
      id: tour.id,
      is_published: !tour.is_published
    });
  };

  const stats = {
    total: tours.length,
    published: tours.filter(t => t.is_published).length,
    vrEnabled: tours.filter(t => t.is_vr_enabled).length,
    totalViews: tours.reduce((sum, t) => sum + t.view_count, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Video Tours</h2>
          <p className="text-muted-foreground">
            Manage 360° virtual tours for properties
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Tour
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tour</DialogTitle>
              <DialogDescription>
                Set up a new 360° virtual tour for a property
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="property_id">Property ID</Label>
                <Input
                  id="property_id"
                  placeholder="Enter property UUID"
                  value={newTour.property_id}
                  onChange={(e) => setNewTour({ ...newTour, property_id: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Tour Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Virtual Property Tour"
                  value={newTour.title}
                  onChange={(e) => setNewTour({ ...newTour, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the tour..."
                  value={newTour.description}
                  onChange={(e) => setNewTour({ ...newTour, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tour Type</Label>
                <Select
                  value={newTour.tour_type}
                  onValueChange={(value: 'panorama' | '360_video' | 'walkthrough') => 
                    setNewTour({ ...newTour, tour_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="panorama">360° Panorama</SelectItem>
                    <SelectItem value="360_video">360° Video</SelectItem>
                    <SelectItem value="walkthrough">Walkthrough</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="vr">Enable VR Mode</Label>
                <Switch
                  id="vr"
                  checked={newTour.is_vr_enabled}
                  onCheckedChange={(checked) => 
                    setNewTour({ ...newTour, is_vr_enabled: checked })
                  }
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTour}>
                Create Tour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">VR Enabled</CardTitle>
            <Glasses className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vrEnabled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tours</CardTitle>
          <CardDescription>
            Manage virtual tours across all properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTours ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tours...
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tours created yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                Create your first tour
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>VR</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                          {tour.thumbnail_url ? (
                            <img 
                              src={tour.thumbnail_url} 
                              alt={tour.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Camera className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tour.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {tour.property_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tour.tour_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tour.is_published ? "default" : "secondary"}>
                        {tour.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{tour.view_count.toLocaleString()}</TableCell>
                    <TableCell>
                      {tour.is_vr_enabled ? (
                        <Glasses className="h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(tour.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Tour
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Image className="h-4 w-4 mr-2" />
                            Manage Scenes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MapPin className="h-4 w-4 mr-2" />
                            Add Hotspots
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePublish(tour)}>
                            {tour.is_published ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteTour(tour.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoTourManager;
