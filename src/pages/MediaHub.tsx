import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { 
  Youtube, 
  Podcast, 
  Mail, 
  FileText, 
  Calendar,
  Play,
  ExternalLink,
  Clock,
  Users,
  Download,
  MapPin,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const MediaHub = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Fetch videos
  const { data: videos = [] } = useQuery({
    queryKey: ['public-media-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_videos')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch podcasts
  const { data: podcasts = [] } = useQuery({
    queryKey: ['public-media-podcasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_podcast_episodes')
        .select('*')
        .eq('is_published', true)
        .order('episode_number', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ['public-media-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_events')
        .select('*')
        .eq('is_published', true)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch reports
  const { data: reports = [] } = useQuery({
    queryKey: ['public-media-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_research_reports')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const { error } = await supabase.from('media_newsletter_subscribers').insert({
        email,
        full_name: name || null,
        source: 'media_hub'
      });

      if (error) {
        if (error.code === '23505') {
          toast.error("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome! You've been subscribed to our newsletter.");
        setShowSubscribeDialog(false);
        setEmail("");
        setName("");
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Property Media Network
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Source for Property Insights
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Virtual tours, market analysis, expert interviews, research reports, and exclusive events.
              Stay informed about the Indonesian property market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setShowSubscribeDialog(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Subscribe to Newsletter
              </Button>
              <Button size="lg" variant="outline" onClick={() => setActiveTab("podcast")}>
                <Podcast className="h-4 w-4 mr-2" />
                Listen to Podcast
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto mb-8">
              <TabsTrigger value="videos" className="flex items-center gap-1">
                <Youtube className="h-4 w-4" />
                <span className="hidden sm:inline">Videos</span>
              </TabsTrigger>
              <TabsTrigger value="podcast" className="flex items-center gap-1">
                <Podcast className="h-4 w-4" />
                <span className="hidden sm:inline">Podcast</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
            </TabsList>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video bg-muted">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/20">
                          <Youtube className="h-12 w-12 text-red-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-8 w-8 text-red-500 ml-1" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        {video.video_type?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">{video.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{video.views_count?.toLocaleString() || 0} views</span>
                        {video.duration_seconds && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {videos.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Youtube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No videos available yet. Check back soon!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Podcast Tab */}
            <TabsContent value="podcast">
              <div className="max-w-3xl mx-auto">
                <Card className="mb-8">
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Podcast className="h-12 w-12 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Property Insights Podcast</CardTitle>
                    <CardDescription>
                      Weekly conversations with industry experts about the Indonesian property market
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center gap-4">
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Spotify
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apple Podcasts
                    </Button>
                    <Button variant="outline">
                      <Youtube className="h-4 w-4 mr-2" />
                      YouTube
                    </Button>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {podcasts.map((episode) => (
                    <Card key={episode.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 shrink-0 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-purple-600">#{episode.episode_number}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">Season {episode.season}</Badge>
                              {episode.is_featured && <Badge>Featured</Badge>}
                            </div>
                            <h3 className="font-semibold mb-1">{episode.title}</h3>
                            {episode.guest_name && (
                              <p className="text-sm text-muted-foreground mb-2">
                                with <span className="font-medium">{episode.guest_name}</span>
                                {episode.guest_title && `, ${episode.guest_title}`}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">{episode.description}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <Button size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              Play
                            </Button>
                            {episode.duration_seconds && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {Math.floor(episode.duration_seconds / 60)} min
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {podcasts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Podcast className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>First episode coming soon! Subscribe to get notified.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-green-500/20 to-emerald-600/20">
                      {report.cover_image_url ? (
                        <img src={report.cover_image_url} alt={report.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText className="h-16 w-16 text-green-500/50" />
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2" variant={report.access_tier === 'free' ? 'secondary' : 'default'}>
                        {report.access_tier === 'free' ? 'Free' : 'Premium'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2">{report.report_type?.replace('_', ' ')}</Badge>
                      <h3 className="font-semibold line-clamp-2 mb-2">{report.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{report.executive_summary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {report.downloads_count} downloads
                        </span>
                        <Button size="sm" variant={report.access_tier === 'free' ? 'default' : 'outline'}>
                          {report.access_tier === 'free' ? 'Download' : 'Unlock'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {reports.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Research reports coming soon!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <div className="max-w-4xl mx-auto space-y-6">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="md:flex">
                      <div className="md:w-48 shrink-0 p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r">
                        <p className="text-4xl font-bold">{format(new Date(event.start_datetime), 'd')}</p>
                        <p className="text-lg font-medium">{format(new Date(event.start_datetime), 'MMM yyyy')}</p>
                        <p className="text-sm text-muted-foreground mt-1">{format(new Date(event.start_datetime), 'h:mm a')}</p>
                      </div>
                      <CardContent className="flex-1 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{event.event_type?.replace('_', ' ')}</Badge>
                          <Badge variant="secondary">{event.format}</Badge>
                          {event.is_featured && <Badge>Featured</Badge>}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          {event.venue_city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.venue_city}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.current_attendees} / {event.max_attendees || '∞'} registered
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button disabled={!event.registration_open}>
                            {event.registration_open ? 'Register Now' : 'Registration Closed'}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                          <Button variant="outline">Learn More</Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming events. Subscribe to be notified of new events!</p>
                    <Button className="mt-4" onClick={() => setShowSubscribeDialog(true)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Subscribe
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Join 100,000 Property Enthusiasts
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Get weekly market insights, exclusive property listings, and early access to events.
          </p>
          <Button size="lg" onClick={() => setShowSubscribeDialog(true)}>
            Subscribe to Newsletter
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Subscribe to Newsletter
            </DialogTitle>
            <DialogDescription>
              Get weekly property insights, market updates, and exclusive content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input 
                id="name" 
                placeholder="Your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Interests</p>
              <div className="grid grid-cols-2 gap-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked /> Market Updates
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked /> New Listings
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox /> Research Reports
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked /> Events
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>Cancel</Button>
            <Button onClick={handleSubscribe}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProfessionalFooter language="en" />
    </div>
  );
};

export default MediaHub;
