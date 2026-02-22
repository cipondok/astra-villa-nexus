import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Youtube, 
  Podcast, 
  Mail, 
  FileText, 
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Download,
  Play,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Target,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const MediaNetworkManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showPodcastDialog, setShowPodcastDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);

  // Fetch videos
  const { data: videos = [] } = useQuery({
    queryKey: ['media-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_videos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch podcasts
  const { data: podcasts = [] } = useQuery({
    queryKey: ['media-podcasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_podcast_episodes')
        .select('*')
        .order('episode_number', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch newsletter subscribers
  const { data: subscribers = [] } = useQuery({
    queryKey: ['media-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ['media-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_events')
        .select('*')
        .order('start_datetime', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch research reports
  const { data: reports = [] } = useQuery({
    queryKey: ['media-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_research_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch sponsorships
  const { data: sponsorships = [] } = useQuery({
    queryKey: ['media-sponsorships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_sponsorships')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate stats
  const totalViews = videos.reduce((sum, v) => sum + (v.views_count || 0), 0);
  const totalListens = podcasts.reduce((sum, p) => sum + (p.listens_count || 0), 0);
  const activeSubscribers = subscribers.filter(s => s.is_active).length;
  const subscriberGoal = 100000;
  const subscriberProgress = (activeSubscribers / subscriberGoal) * 100;
  const totalSponsorRevenue = sponsorships.reduce((sum, s) => sum + (s.amount_paid || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Property Media Network
          </h2>
          <p className="text-muted-foreground">
            Manage YouTube, Podcast, Newsletter, Research Reports, and Events
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Videos</p>
                <p className="text-xl font-bold">{videos.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{totalViews.toLocaleString()} views</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Podcast className="h-5 w-5 text-accent-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Episodes</p>
                <p className="text-xl font-bold">{podcasts.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{totalListens.toLocaleString()} listens</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-chart-4" />
              <div>
                <p className="text-xs text-muted-foreground">Subscribers</p>
                <p className="text-xl font-bold">{activeSubscribers.toLocaleString()}</p>
              </div>
            </div>
            <Progress value={subscriberProgress} className="h-1 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{subscriberProgress.toFixed(1)}% of 100k goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-chart-1" />
              <div>
                <p className="text-xs text-muted-foreground">Reports</p>
                <p className="text-xl font-bold">{reports.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Research & Analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-chart-5" />
              <div>
                <p className="text-xs text-muted-foreground">Events</p>
                <p className="text-xl font-bold">{events.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Virtual & In-person</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-chart-1" />
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(totalSponsorRevenue)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{sponsorships.length} sponsors</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="youtube" className="text-xs">YouTube</TabsTrigger>
          <TabsTrigger value="podcast" className="text-xs">Podcast</TabsTrigger>
          <TabsTrigger value="newsletter" className="text-xs">Newsletter</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
          <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Videos */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-destructive" />
                    Recent Videos
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("youtube")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {videos.slice(0, 3).map((video) => (
                  <div key={video.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                      <Play className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {video.views_count?.toLocaleString() || 0} views
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">{video.video_type}</Badge>
                  </div>
                ))}
                {videos.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No videos yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Podcast Episodes */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Podcast className="h-4 w-4 text-accent-foreground" />
                    Recent Episodes
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("podcast")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {podcasts.slice(0, 3).map((episode) => (
                  <div key={episode.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-accent-foreground">#{episode.episode_number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{episode.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {episode.guest_name ? `with ${episode.guest_name}` : 'Solo episode'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {episode.listens_count?.toLocaleString() || 0} listens
                    </p>
                  </div>
                ))}
                {podcasts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No episodes yet</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-chart-5" />
                    Upcoming Events
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("events")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {events.filter(e => new Date(e.start_datetime) > new Date()).slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="text-center">
                      <p className="text-lg font-bold">{format(new Date(event.start_datetime), 'd')}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(event.start_datetime), 'MMM')}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.event_type} • {event.format}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{event.current_attendees}</p>
                      <p className="text-xs text-muted-foreground">registered</p>
                    </div>
                  </div>
                ))}
                {events.filter(e => new Date(e.start_datetime) > new Date()).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                )}
              </CardContent>
            </Card>

            {/* Newsletter Stats */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-chart-4" />
                    100K Subscriber Goal
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{activeSubscribers.toLocaleString()} subscribers</span>
                    <span>100,000 goal</span>
                  </div>
                  <Progress value={subscriberProgress} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{subscribers.filter(s => s.subscriber_tier === 'free').length}</p>
                    <p className="text-xs text-muted-foreground">Free</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{subscribers.filter(s => s.subscriber_tier === 'premium').length}</p>
                    <p className="text-xs text-muted-foreground">Premium</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{subscribers.filter(s => s.subscriber_tier === 'vip').length}</p>
                    <p className="text-xs text-muted-foreground">VIP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* YouTube Tab */}
        <TabsContent value="youtube" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>YouTube Videos</CardTitle>
                <Button onClick={() => setShowVideoDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </div>
              <CardDescription>
                Virtual tours, market analysis, and property showcases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                            <Play className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{video.title}</p>
                            <p className="text-xs text-muted-foreground">{video.youtube_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{video.video_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views_count?.toLocaleString() || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={video.is_published ? "default" : "secondary"}>
                          {video.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {videos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No videos added yet. Click "Add Video" to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Podcast Tab */}
        <TabsContent value="podcast" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Property Insights Podcast</CardTitle>
                <Button onClick={() => setShowPodcastDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Episode
                </Button>
              </div>
              <CardDescription>
                Industry expert interviews and market insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Episode</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Listens</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {podcasts.map((episode) => (
                    <TableRow key={episode.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">S{episode.season}E{episode.episode_number}: {episode.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{episode.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {episode.guest_name ? (
                          <div>
                            <p className="text-sm">{episode.guest_name}</p>
                            <p className="text-xs text-muted-foreground">{episode.guest_title}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Solo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {episode.duration_seconds ? `${Math.floor(episode.duration_seconds / 60)}min` : '-'}
                      </TableCell>
                      <TableCell>{episode.listens_count?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <Badge variant={episode.is_published ? "default" : "secondary"}>
                          {episode.is_published ? "Live" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {podcasts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No episodes yet. Click "Add Episode" to start your podcast.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletter Tab */}
        <TabsContent value="newsletter" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Newsletter Subscribers</CardTitle>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
              <CardDescription>
                {activeSubscribers.toLocaleString()} active subscribers • Goal: 100,000
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.slice(0, 10).map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.email}</TableCell>
                      <TableCell>{sub.full_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sub.subscriber_tier}</Badge>
                      </TableCell>
                      <TableCell>{sub.source}</TableCell>
                      <TableCell>
                        <Badge variant={sub.is_active ? "default" : "secondary"}>
                          {sub.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(sub.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Research Reports</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </div>
              <CardDescription>
                Market analysis and industry research for authority positioning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{report.title}</p>
                          <p className="text-xs text-muted-foreground">{report.time_period}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.report_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.access_tier === 'free' ? 'secondary' : 'default'}>
                          {report.access_tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {report.downloads_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.is_published ? "default" : "secondary"}>
                          {report.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No reports yet. Create your first research report.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Virtual Property Expos & Events</CardTitle>
                <Button onClick={() => setShowEventDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
              <CardDescription>
                Webinars, workshops, and virtual property showcases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{event.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.event_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(event.start_datetime), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{event.format}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.current_attendees}/{event.max_attendees || '∞'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.registration_open ? "default" : "secondary"}>
                          {event.registration_open ? "Open" : "Closed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {events.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No events scheduled. Create your first virtual expo.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add YouTube Video</DialogTitle>
            <DialogDescription>Add a new video to your media network</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Video Title</Label>
              <Input placeholder="Enter video title" />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <Input placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="space-y-2">
              <Label>Video Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
                  <SelectItem value="market_analysis">Market Analysis</SelectItem>
                  <SelectItem value="property_showcase">Property Showcase</SelectItem>
                  <SelectItem value="neighborhood_guide">Neighborhood Guide</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Video added!"); setShowVideoDialog(false); }}>Add Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Podcast Dialog */}
      <Dialog open={showPodcastDialog} onOpenChange={setShowPodcastDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Podcast Episode</DialogTitle>
            <DialogDescription>Add a new episode to Property Insights podcast</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Season</Label>
                <Input type="number" defaultValue={1} />
              </div>
              <div className="space-y-2">
                <Label>Episode #</Label>
                <Input type="number" placeholder="1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Episode title" />
            </div>
            <div className="space-y-2">
              <Label>Guest Name (optional)</Label>
              <Input placeholder="Guest name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Episode description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPodcastDialog(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Episode added!"); setShowPodcastDialog(false); }}>Add Episode</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>Schedule a virtual expo, webinar, or workshop</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual_expo">Virtual Expo</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="property_showcase">Property Showcase</SelectItem>
                    <SelectItem value="investor_meetup">Investor Meetup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in_person">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Start Date & Time</Label>
              <Input type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Event description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Event created!"); setShowEventDialog(false); }}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaNetworkManagement;
