
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbulb, MessageSquare, Angry, Smile, Meh } from "lucide-react";

const MajorTopicsDashboard = () => {
  const { data: feedback, isLoading } = useQuery({
    queryKey: ['all-feedback-for-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_monitoring')
        .select('feedback_type, rating, content');
      if (error) throw error;
      return data || [];
    },
  });

  const getSentimentIcon = (rating: number) => {
    if (rating >= 4) return <Smile className="h-5 w-5 text-chart-1" />;
    if (rating >= 2.5) return <Meh className="h-5 w-5 text-chart-3" />;
    return <Angry className="h-5 w-5 text-destructive" />;
  };

  const analysis = feedback?.reduce((acc, item) => {
    const topic = item.feedback_type || 'uncategorized';
    if (!acc[topic]) {
      acc[topic] = { volume: 0, totalRating: 0, countWithRating: 0, topQueries: [] };
    }
    acc[topic].volume += 1;
    if (item.rating !== null) {
      acc[topic].totalRating += item.rating;
      acc[topic].countWithRating += 1;
    }
    if (acc[topic].topQueries.length < 1) {
        acc[topic].topQueries.push(item.content);
    }
    return acc;
  }, {} as Record<string, { volume: number; totalRating: number; countWithRating: number; topQueries: string[] }>);

  const topics = analysis ? Object.entries(analysis).map(([topic, data]) => {
    const avgRating = data.countWithRating > 0 ? data.totalRating / data.countWithRating : 0;
    return {
      topic,
      volume: data.volume,
      avgSentiment: avgRating.toFixed(1),
      topQuery: data.topQueries[0] || 'N/A',
    };
  }).sort((a, b) => b.volume - a.volume) : [];

  const lowestSentimentTopic = topics.filter(t => parseFloat(t.avgSentiment) > 0).sort((a,b) => parseFloat(a.avgSentiment) - parseFloat(b.avgSentiment))[0];

  const getAISuggestion = () => {
    if (isLoading) return "Analyzing feedback...";
    if (!lowestSentimentTopic) return "Keep up the great work! No major issues detected.";
    if (parseFloat(lowestSentimentTopic.avgSentiment) < 3) {
      return `Focus on improving "${lowestSentimentTopic.topic}". The sentiment is low (${lowestSentimentTopic.avgSentiment}/5.0). Consider reviewing recent feedback for specific issues.`;
    }
    return `While overall sentiment is good, there's room for improvement in "${lowestSentimentTopic.topic}".`;
  }

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loading Major Topics...</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Analyzing feedback...</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Major Topics Dashboard
          </CardTitle>
          <CardDescription>
            AI-powered analysis of customer feedback topics and sentiment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Avg. Sentiment</TableHead>
                <TableHead>Sample Query</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map(item => (
                <TableRow key={item.topic}>
                  <TableCell className="capitalize">{item.topic.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{item.volume}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getSentimentIcon(parseFloat(item.avgSentiment))}
                    <span>{item.avgSentiment} / 5.0</span>
                  </TableCell>
                  <TableCell className="italic text-muted-foreground">"{item.topQuery.substring(0, 50)}..."</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Card className="mt-6 bg-chart-2/10 border-chart-2/30">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-chart-3 mt-1" />
                    <div>
                        <p className="font-semibold">AI Suggestion</p>
                        <p className="text-sm text-muted-foreground">{getAISuggestion()}</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default MajorTopicsDashboard;

