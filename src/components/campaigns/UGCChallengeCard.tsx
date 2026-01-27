import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, Trophy, Heart, Eye, Clock, Upload, 
  Award, Users, Share2, CheckCircle, ImagePlus
} from "lucide-react";
import { format, differenceInDays, differenceInHours, isPast, isFuture } from "date-fns";
import useUGCChallenge from "@/hooks/useUGCChallenge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const UGCChallengeCard = () => {
  const { challenge, submissions, userSubmission, isLoading, submitEntry, voteFor } = useUGCChallenge();
  const [activeTab, setActiveTab] = useState("gallery");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-96" />
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Camera className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Active Challenge</h3>
          <p className="text-sm text-muted-foreground">
            Check back soon for exciting content challenges!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTimeRemaining = () => {
    const end = new Date(challenge.submission_end);
    if (isPast(end)) return "Submissions Closed";
    const days = differenceInDays(end, new Date());
    if (days > 0) return `${days} days left`;
    const hours = differenceInHours(end, new Date());
    return `${hours} hours left`;
  };

  const canSubmit = isFuture(new Date(challenge.submission_end)) && !userSubmission;
  const canVote = challenge.status === 'voting' || 
    (challenge.voting_start && isPast(new Date(challenge.voting_start)));

  const handleSubmit = async () => {
    if (!title || !description || mediaUrls.length === 0) return;
    
    setIsSubmitting(true);
    const result = await submitEntry(title, description, mediaUrls, location);
    setIsSubmitting(false);
    
    if (result) {
      setShowSubmitDialog(false);
      setTitle("");
      setDescription("");
      setMediaUrls([]);
      setLocation("");
    }
  };

  const addDemoImage = () => {
    const demoImages = [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
    ];
    if (mediaUrls.length < 10) {
      setMediaUrls([...mediaUrls, demoImages[mediaUrls.length % demoImages.length]]);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative">
          <Badge className="bg-white/20 text-white border-white/30 mb-3">
            {challenge.theme}
          </Badge>
          <h2 className="text-2xl font-bold mb-2">{challenge.title}</h2>
          <p className="text-white/90 mb-4">{challenge.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{getTimeRemaining()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">{challenge.total_submissions} entries</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{challenge.total_votes} votes</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="submit">Submit</TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            {submissions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No submissions yet. Be the first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submissions.slice(0, 9).map((submission) => (
                  <Card key={submission.id} className="overflow-hidden group">
                    <div className="relative aspect-video">
                      <img 
                        src={submission.media_urls[0] || '/placeholder.svg'} 
                        alt={submission.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="font-medium text-white truncate">{submission.title}</h4>
                        <div className="flex items-center gap-3 text-white/80 text-sm">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {submission.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {submission.vote_count}
                          </span>
                        </div>
                      </div>
                    </div>
                    {canVote && (
                      <div className="p-3">
                        <Button 
                          variant={submission.has_voted ? "secondary" : "default"}
                          size="sm"
                          className="w-full"
                          onClick={() => voteFor(submission.id)}
                          disabled={submission.has_voted}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${submission.has_voted ? 'fill-current' : ''}`} />
                          {submission.has_voted ? 'Voted' : 'Vote'}
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Prizes Tab */}
          <TabsContent value="prizes" className="space-y-4">
            {challenge.prizes?.map((prize: any, index: number) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/30' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/30' :
                  index === 2 ? 'bg-gradient-to-r from-amber-600/10 to-amber-700/5 border-amber-600/30' :
                  'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-primary'
                  }`}>
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{prize.title}</h4>
                    <p className="text-sm text-muted-foreground">{prize.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      IDR {(prize.value / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Participation Requirements</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Minimum {challenge.participation_rules?.min_photos || 3} photos required
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Maximum {challenge.participation_rules?.max_photos || 10} photos allowed
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Description must be at least {challenge.participation_rules?.min_description_length || 100} characters
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Content must be original
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3">Judging Criteria</h4>
              <div className="space-y-3">
                {challenge.judging_criteria?.map((criteria: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm flex-1">{criteria.name}</span>
                    <div className="w-32">
                      <Progress value={criteria.weight} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{criteria.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Submit Tab */}
          <TabsContent value="submit">
            {userSubmission ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-medium mb-2">Submission Received!</h3>
                <p className="text-muted-foreground mb-4">
                  Your entry "{userSubmission.title}" is {userSubmission.status}.
                </p>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userSubmission.view_count}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userSubmission.vote_count}</p>
                    <p className="text-xs text-muted-foreground">Votes</p>
                  </div>
                </div>
              </div>
            ) : canSubmit ? (
              <div className="space-y-4">
                <Input
                  placeholder="Give your entry a catchy title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  placeholder={`Tell your story (min ${challenge.participation_rules?.min_description_length || 100} characters)`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
                <Input
                  placeholder="Location (optional)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                
                {/* Image Upload Area */}
                <div className="border-2 border-dashed rounded-lg p-6">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="relative w-20 h-20 rounded overflow-hidden">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-5 h-5"
                          onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={addDemoImage} className="gap-2">
                    <ImagePlus className="w-4 h-4" />
                    Add Photo (Demo)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    {mediaUrls.length} / {challenge.participation_rules?.max_photos || 10} photos
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title || !description || mediaUrls.length < (challenge.participation_rules?.min_photos || 3)}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Entry'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Submissions Closed</h3>
                <p className="text-sm text-muted-foreground">
                  This challenge is no longer accepting new entries.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UGCChallengeCard;
