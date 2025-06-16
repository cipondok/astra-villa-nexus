
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Brain, 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Award,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

const AIVendorMatching = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testRequest, setTestRequest] = useState("");
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch recent matching results
  const { data: recentMatches, isLoading } = useQuery({
    queryKey: ['vendor-ai-matching'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_ai_matching')
        .select(`
          *,
          vendor_profiles:vendor_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Simulate AI matching (in production, this would call an AI service)
  const simulateAIMatching = async (request: string) => {
    // Mock AI matching logic
    const mockVendors = [
      {
        id: '1',
        name: 'GreenClean Co.',
        email: 'contact@greenclean.co.id',
        matching_score: 95.5,
        proximity_score: 90,
        experience_score: 88,
        rating_score: 95,
        availability_score: 100,
        specialization_match: 98.0,
        explanation: 'Top match: Eco-certified cleaning service with 4.9★ rating, specializes in villa maintenance, 2km away from your location.'
      },
      {
        id: '2',
        name: 'Villa Care Experts',
        email: 'info@villacare.co.id',
        matching_score: 87.2,
        proximity_score: 75,
        experience_score: 95,
        rating_score: 85,
        availability_score: 90,
        specialization_match: 92.0,
        explanation: 'Excellent choice: 15+ years experience with luxury villas, available this week, 5km distance.'
      },
      {
        id: '3',
        name: 'Quick Clean Service',
        email: 'hello@quickclean.co.id',
        matching_score: 78.9,
        proximity_score: 95,
        experience_score: 70,
        rating_score: 80,
        availability_score: 85,
        specialization_match: 75.0,
        explanation: 'Budget-friendly option: Fast response time, very close location (1km), good for basic cleaning needs.'
      }
    ];

    return mockVendors.map((vendor, index) => ({
      ...vendor,
      recommendation_rank: index + 1,
      request_id: `test-${Date.now()}`,
      created_at: new Date().toISOString()
    }));
  };

  // Test AI matching
  const testMatchingMutation = useMutation({
    mutationFn: async (request: string) => {
      return await simulateAIMatching(request);
    },
    onSuccess: (results) => {
      setMatchingResults(results);
      showSuccess("Success", "AI matching completed successfully");
    },
    onError: () => {
      showError("Error", "Failed to perform AI matching");
    }
  });

  const handleTestMatching = () => {
    if (!testRequest.trim()) return;
    testMatchingMutation.mutate(testRequest);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading AI matching data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Vendor Matching Engine
          </h2>
          <p className="text-muted-foreground">Intelligent vendor matching with ML-powered recommendations</p>
        </div>
        <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Test AI Matching
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Test AI Vendor Matching</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Customer Request</Label>
                <Textarea
                  value={testRequest}
                  onChange={(e) => setTestRequest(e.target.value)}
                  placeholder="Example: Need eco-friendly cleaner for 5BR villa in Seminyak, urgent service required"
                  rows={3}
                />
              </div>
              <Button onClick={handleTestMatching} className="w-full" disabled={testMatchingMutation.isPending}>
                {testMatchingMutation.isPending ? "Processing..." : "Run AI Matching"}
              </Button>
              
              {/* Display test results */}
              {matchingResults.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold">Matching Results:</h3>
                  {matchingResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">#{result.recommendation_rank} {result.name}</h4>
                        <Badge variant="secondary">Score: {result.matching_score}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{result.explanation}</p>
                      
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Proximity</p>
                          <p className={`font-medium ${getScoreColor(result.proximity_score)}`}>
                            {result.proximity_score}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Experience</p>
                          <p className={`font-medium ${getScoreColor(result.experience_score)}`}>
                            {result.experience_score}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rating</p>
                          <p className={`font-medium ${getScoreColor(result.rating_score)}`}>
                            {result.rating_score}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Availability</p>
                          <p className={`font-medium ${getScoreColor(result.availability_score)}`}>
                            {result.availability_score}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Specialization</p>
                          <p className={`font-medium ${getScoreColor(result.specialization_match)}`}>
                            {result.specialization_match}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold">{recentMatches?.length || 0}</p>
              </div>
              <Search className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Match Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {recentMatches?.length ? 
                    Math.round(recentMatches.reduce((sum, match) => sum + (match.matching_score || 0), 0) / recentMatches.length) : 0}%
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Matches (90%+)</p>
                <p className="text-2xl font-bold text-orange-600">
                  {recentMatches?.filter(m => (m.matching_score || 0) >= 90).length || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Vendors</p>
                <p className="text-2xl font-bold">
                  {new Set(recentMatches?.map(m => m.vendor_id)).size || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Matching Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Matching Results</CardTitle>
          <CardDescription>Latest vendor matching results with AI explanations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMatches?.map((match) => (
              <div key={match.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">
                      #{match.recommendation_rank} {match.vendor_profiles?.full_name || 'Unknown Vendor'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{match.vendor_profiles?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Overall Match Score</p>
                    <p className={`text-lg font-bold ${getScoreColor(match.matching_score)}`}>
                      {match.matching_score}%
                    </p>
                  </div>
                </div>

                {match.explanation && (
                  <div className="mb-3 p-2 bg-blue-50 rounded">
                    <p className="text-sm"><strong>AI Explanation:</strong> {match.explanation}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-muted-foreground">Proximity</span>
                    </div>
                    <Progress value={match.proximity_score} className="h-2" />
                    <p className="text-xs mt-1">{match.proximity_score}%</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Award className="h-3 w-3" />
                      <span className="text-muted-foreground">Experience</span>
                    </div>
                    <Progress value={match.experience_score} className="h-2" />
                    <p className="text-xs mt-1">{match.experience_score}%</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3 w-3" />
                      <span className="text-muted-foreground">Rating</span>
                    </div>
                    <Progress value={match.rating_score} className="h-2" />
                    <p className="text-xs mt-1">{match.rating_score}%</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-muted-foreground">Availability</span>
                    </div>
                    <Progress value={match.availability_score} className="h-2" />
                    <p className="text-xs mt-1">{match.availability_score}%</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-muted-foreground">Specialization</span>
                    </div>
                    <Progress value={match.specialization_match} className="h-2" />
                    <p className="text-xs mt-1">{match.specialization_match}%</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Matched on {new Date(match.created_at).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIVendorMatching;
