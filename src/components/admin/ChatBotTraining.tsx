import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Bot, MessageSquare, Brain, Zap, ThumbsUp, ThumbsDown, Plus, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const intents = [
  { name: 'Property Search', examples: 128, accuracy: 94.2, lastTrained: '2h ago', status: 'active' },
  { name: 'Price Inquiry', examples: 95, accuracy: 91.8, lastTrained: '2h ago', status: 'active' },
  { name: 'Booking Request', examples: 72, accuracy: 88.5, lastTrained: '5h ago', status: 'active' },
  { name: 'Mortgage Calculator', examples: 56, accuracy: 86.1, lastTrained: '1d ago', status: 'active' },
  { name: 'Location Info', examples: 83, accuracy: 90.3, lastTrained: '3h ago', status: 'active' },
  { name: 'Agent Contact', examples: 41, accuracy: 82.7, lastTrained: '2d ago', status: 'needs_training' },
  { name: 'Complaint Handling', examples: 38, accuracy: 79.4, lastTrained: '3d ago', status: 'needs_training' },
  { name: 'Legal Questions', examples: 29, accuracy: 75.2, lastTrained: '5d ago', status: 'needs_training' },
];

const weeklyMetrics = [
  { day: 'Mon', conversations: 342, resolved: 298, escalated: 44 },
  { day: 'Tue', conversations: 389, resolved: 341, escalated: 48 },
  { day: 'Wed', conversations: 356, resolved: 312, escalated: 44 },
  { day: 'Thu', conversations: 412, resolved: 367, escalated: 45 },
  { day: 'Fri', conversations: 378, resolved: 338, escalated: 40 },
  { day: 'Sat', conversations: 245, resolved: 218, escalated: 27 },
  { day: 'Sun', conversations: 198, resolved: 176, escalated: 22 },
];

const satisfactionTrend = [
  { week: 'W1', positive: 82, neutral: 12, negative: 6 },
  { week: 'W2', positive: 84, neutral: 11, negative: 5 },
  { week: 'W3', positive: 86, neutral: 10, negative: 4 },
  { week: 'W4', positive: 85, neutral: 11, negative: 4 },
  { week: 'W5', positive: 88, neutral: 9, negative: 3 },
  { week: 'W6', positive: 87, neutral: 10, negative: 3 },
];

const topicDistribution = [
  { name: 'Property Info', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Pricing', value: 25, color: 'hsl(var(--chart-3))' },
  { name: 'Booking', value: 20, color: 'hsl(var(--chart-4))' },
  { name: 'Support', value: 12, color: 'hsl(var(--chart-5))' },
  { name: 'Other', value: 8, color: 'hsl(var(--muted-foreground))' },
];

const ChatBotTraining = () => {
  const avgAccuracy = (intents.reduce((s, i) => s + i.accuracy, 0) / intents.length).toFixed(1);
  const needsTraining = intents.filter(i => i.status === 'needs_training').length;
  const totalConversations = weeklyMetrics.reduce((s, d) => s + d.conversations, 0);
  const resolutionRate = ((weeklyMetrics.reduce((s, d) => s + d.resolved, 0) / totalConversations) * 100).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Chatbot Training Center</h2>
          <p className="text-xs text-muted-foreground">Train AI responses, manage intents, and monitor conversations</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs"><RefreshCw className="h-3 w-3 mr-1" /> Retrain All</Button>
          <Button size="sm" className="text-xs"><Plus className="h-3 w-3 mr-1" /> New Intent</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><Brain className="h-4 w-4 text-primary" /><span className="text-[10px] text-muted-foreground">Avg Accuracy</span></div>
          <div className="text-lg font-bold text-foreground">{avgAccuracy}%</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><Zap className="h-4 w-4 text-chart-3" /><span className="text-[10px] text-muted-foreground">Needs Training</span></div>
          <div className="text-lg font-bold text-foreground">{needsTraining}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><MessageSquare className="h-4 w-4 text-chart-4" /><span className="text-[10px] text-muted-foreground">Weekly Chats</span></div>
          <div className="text-lg font-bold text-foreground">{totalConversations.toLocaleString()}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><ThumbsUp className="h-4 w-4 text-primary" /><span className="text-[10px] text-muted-foreground">Resolution Rate</span></div>
          <div className="text-lg font-bold text-foreground">{resolutionRate}%</div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="intents" className="w-full">
        <TabsList className="h-8 bg-muted/30">
          <TabsTrigger value="intents" className="text-xs">Intents</TabsTrigger>
          <TabsTrigger value="conversations" className="text-xs">Conversations</TabsTrigger>
          <TabsTrigger value="satisfaction" className="text-xs">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="intents" className="space-y-2 mt-3">
          {intents.map(intent => (
            <Card key={intent.name} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{intent.name}</span>
                      <Badge variant={intent.status === 'active' ? 'default' : 'destructive'} className="text-[9px]">
                        {intent.status === 'needs_training' ? 'Needs Training' : 'Active'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>{intent.examples} examples</span>
                      <span>Last trained: {intent.lastTrained}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={intent.accuracy} className="flex-1 h-1.5" />
                      <span className={`text-xs font-medium ${intent.accuracy >= 85 ? 'text-primary' : 'text-destructive'}`}>{intent.accuracy}%</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-[10px] h-6 ml-2"><Brain className="h-3 w-3 mr-1" />Train</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="conversations" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Conversations</CardTitle></CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="resolved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Resolved" stackId="a" />
                    <Bar dataKey="escalated" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Escalated" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Topic Distribution</CardTitle></CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topicDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {topicDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction" className="mt-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">User Satisfaction Trend</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={satisfactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="positive" stroke="hsl(var(--primary))" strokeWidth={2} name="Positive %" />
                  <Line type="monotone" dataKey="neutral" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Neutral %" />
                  <Line type="monotone" dataKey="negative" stroke="hsl(var(--destructive))" strokeWidth={2} name="Negative %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatBotTraining;
