import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { 
  MapPin, Search, Eye, FileText, Banknote, Key, 
  CheckCircle, Circle, Plus, Calendar, Target, Home
} from "lucide-react";

const JOURNEY_STAGES = [
  { key: "searching", label: "Searching", icon: Search, progress: 10 },
  { key: "viewing", label: "Viewing", icon: Eye, progress: 25 },
  { key: "negotiating", label: "Negotiating", icon: FileText, progress: 50 },
  { key: "financing", label: "Financing", icon: Banknote, progress: 75 },
  { key: "closing", label: "Closing", icon: FileText, progress: 90 },
  { key: "completed", label: "Completed", icon: Key, progress: 100 }
];

const MILESTONE_TYPES = [
  { value: "search_started", label: "Started Search", icon: Search },
  { value: "property_saved", label: "Saved Property", icon: Target },
  { value: "property_viewed", label: "Viewed Online", icon: Eye },
  { value: "property_toured", label: "Property Tour", icon: Home },
  { value: "offer_made", label: "Made Offer", icon: FileText },
  { value: "offer_accepted", label: "Offer Accepted", icon: CheckCircle },
  { value: "financing_applied", label: "Applied for Financing", icon: Banknote },
  { value: "financing_approved", label: "Financing Approved", icon: CheckCircle },
  { value: "inspection_scheduled", label: "Inspection Scheduled", icon: Calendar },
  { value: "inspection_completed", label: "Inspection Done", icon: CheckCircle },
  { value: "closing_scheduled", label: "Closing Scheduled", icon: Calendar },
  { value: "keys_received", label: "Keys Received! 🎉", icon: Key },
  { value: "custom", label: "Custom Milestone", icon: Plus }
];

const PropertyJourneyTimeline = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewJourney, setShowNewJourney] = useState(false);
  const [showNewMilestone, setShowNewMilestone] = useState(false);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    type: "",
    title: "",
    description: ""
  });

  // Fetch user journeys
  const { data: journeys = [] } = useQuery({
    queryKey: ["property-journeys", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("mobile_property_journeys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch milestones for selected journey
  const { data: milestones = [] } = useQuery({
    queryKey: ["journey-milestones", selectedJourneyId],
    queryFn: async () => {
      if (!selectedJourneyId) return [];
      const { data, error } = await supabase
        .from("mobile_journey_milestones")
        .select("*, properties(title, images)")
        .eq("journey_id", selectedJourneyId)
        .order("milestone_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedJourneyId
  });

  const selectedJourney = journeys.find(j => j.id === selectedJourneyId);
  const currentStage = JOURNEY_STAGES.find(s => s.key === selectedJourney?.status);

  // Create journey mutation
  const createJourney = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { data, error } = await supabase
        .from("mobile_property_journeys")
        .insert({
          user_id: user.id,
          name: "My Property Journey",
          status: "searching"
        })
        .select()
        .single();
      if (error) throw error;
      
      // Add first milestone
      await supabase.from("mobile_journey_milestones").insert({
        journey_id: data.id,
        milestone_type: "search_started",
        title: "Started my property search"
      });
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-journeys"] });
      setSelectedJourneyId(data.id);
      setShowNewJourney(false);
      toast({ title: "Journey Started!", description: "Track your path to homeownership" });
    }
  });

  // Add milestone mutation
  const addMilestone = useMutation({
    mutationFn: async () => {
      if (!selectedJourneyId) throw new Error("No journey selected");
      const milestoneType = MILESTONE_TYPES.find(m => m.value === newMilestone.type);
      
      const { error } = await supabase.from("mobile_journey_milestones").insert({
        journey_id: selectedJourneyId,
        milestone_type: newMilestone.type,
        title: newMilestone.title || milestoneType?.label || "Milestone",
        description: newMilestone.description
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey-milestones", selectedJourneyId] });
      setShowNewMilestone(false);
      setNewMilestone({ type: "", title: "", description: "" });
      toast({ title: "Milestone Added!" });
    }
  });

  // Update journey status mutation
  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      if (!selectedJourneyId) throw new Error("No journey selected");
      const { error } = await supabase
        .from("mobile_property_journeys")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", selectedJourneyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-journeys"] });
      toast({ title: "Journey Updated!" });
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">Track Your Property Journey</h2>
            <p className="text-muted-foreground mb-4">
              Sign in to track your path from search to keys
            </p>
            <Button onClick={() => window.location.href = "/auth"}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Journey list view
  if (!selectedJourneyId) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Property Journey
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your path from search to homeowner
          </p>
        </div>

        <div className="space-y-4">
          {journeys.map((journey) => {
            const stage = JOURNEY_STAGES.find(s => s.key === journey.status);
            const StageIcon = stage?.icon || Search;
            
            return (
              <Card 
                key={journey.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedJourneyId(journey.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <StageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{journey.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {journey.status?.replace(/_/g, " ")}
                      </p>
                      {journey.budget_max && (
                        <p className="text-xs text-muted-foreground">
                          Budget: up to {formatCurrency(journey.budget_max)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge>{stage?.progress || 0}%</Badge>
                    </div>
                  </div>
                  <Progress value={stage?.progress || 0} className="mt-3 h-2" />
                </CardContent>
              </Card>
            );
          })}

          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => createJourney.mutate()}
            disabled={createJourney.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Start New Journey
          </Button>
        </div>
      </div>
    );
  }

  // Journey detail view
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedJourneyId(null)}
          >
            <MapPin className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold">{selectedJourney?.name}</h2>
            <p className="text-xs text-muted-foreground capitalize">
              {selectedJourney?.status?.replace(/_/g, " ")}
            </p>
          </div>
          <Badge>{currentStage?.progress || 0}%</Badge>
        </div>
        <Progress value={currentStage?.progress || 0} className="mt-3 h-2" />
      </div>

      {/* Stage selector */}
      <div className="p-4">
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
          {JOURNEY_STAGES.map((stage) => {
            const isActive = selectedJourney?.status === stage.key;
            const isPast = (currentStage?.progress || 0) > stage.progress;
            const StageIcon = stage.icon;
            
            return (
              <Button
                key={stage.key}
                variant={isActive ? "default" : isPast ? "secondary" : "outline"}
                size="sm"
                className="flex-shrink-0"
                onClick={() => updateStatus.mutate(stage.key)}
              >
                {isPast ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <StageIcon className="h-4 w-4 mr-1" />
                )}
                {stage.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Timeline</h3>
          <Dialog open={showNewMilestone} onOpenChange={setShowNewMilestone}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Milestone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Select
                    value={newMilestone.type}
                    onValueChange={(v) => {
                      const milestone = MILESTONE_TYPES.find(m => m.value === v);
                      setNewMilestone({ 
                        ...newMilestone, 
                        type: v,
                        title: milestone?.label || ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select milestone type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MILESTONE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {newMilestone.type === "custom" && (
                  <Input
                    placeholder="Milestone title"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  />
                )}
                <Textarea
                  placeholder="Notes (optional)"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                />
                <Button 
                  className="w-full"
                  onClick={() => addMilestone.mutate()}
                  disabled={!newMilestone.type || addMilestone.isPending}
                >
                  Add Milestone
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Milestones list */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const milestoneType = MILESTONE_TYPES.find(m => m.value === milestone.milestone_type);
              const MilestoneIcon = milestoneType?.icon || Circle;
              
              return (
                <div key={milestone.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                    <MilestoneIcon className="h-4 w-4 text-primary" />
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(milestone.milestone_date).toLocaleDateString()}
                        </p>
                      </div>
                      {milestone.properties && (
                        <div className="mt-2 flex items-center gap-2 p-2 bg-muted rounded-lg">
                          {(milestone.properties as any)?.images?.[0] && (
                            <img 
                              src={(milestone.properties as any).images[0]}
                              alt=""
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="text-sm">{(milestone.properties as any)?.title}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {milestones.length === 0 && (
            <Card className="ml-10">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No milestones yet</p>
                <p className="text-sm">Add your first milestone to track progress</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyJourneyTimeline;
