import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, Users, Flag, TrendingUp, ThumbsUp, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const forumStats = [
  { label: "Total Topics", value: "2,847", icon: MessageCircle, change: "+124 this week" },
  { label: "Active Members", value: "1,203", icon: Users, change: "+8.3% MoM" },
  { label: "Flagged Posts", value: "18", icon: Flag, change: "3 urgent" },
  { label: "Engagement Rate", value: "34.2%", icon: TrendingUp, change: "+2.1%" },
];

const categories = [
  { name: "Property Investment Tips", topics: 412, replies: 3280, members: 890, trending: true },
  { name: "Bali Real Estate", topics: 356, replies: 2940, members: 720, trending: true },
  { name: "Jakarta Market Discussion", topics: 298, replies: 2120, members: 650, trending: false },
  { name: "Legal & Tax Advice", topics: 187, replies: 1560, members: 420, trending: false },
  { name: "Renovation & Interior", topics: 234, replies: 1890, members: 530, trending: true },
  { name: "Expat Housing", topics: 156, replies: 1240, members: 380, trending: false },
];

const weeklyActivity = [
  { day: "Mon", posts: 45, replies: 180, views: 2400 },
  { day: "Tue", posts: 52, replies: 210, views: 2800 },
  { day: "Wed", posts: 38, replies: 165, views: 2200 },
  { day: "Thu", posts: 61, replies: 240, views: 3100 },
  { day: "Fri", posts: 48, replies: 195, views: 2600 },
  { day: "Sat", posts: 32, replies: 120, views: 1800 },
  { day: "Sun", posts: 28, replies: 105, views: 1500 },
];

const topContributors = [
  { name: "PropertyGuru_ID", posts: 89, likes: 342, badge: "Expert" },
  { name: "BaliInvestor", posts: 67, likes: 289, badge: "Top Contributor" },
  { name: "JakartaRealtor", posts: 54, likes: 198, badge: "Verified Agent" },
  { name: "ExpatHelper", posts: 42, likes: 176, badge: "Community Star" },
];

const CommunityForumManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Community Forum</h2>
        <p className="text-muted-foreground text-sm">Forum moderation, category management, and member engagement analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {forumStats.map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">{s.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="posts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="replies" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topContributors.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.posts} posts • {c.likes} likes</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{c.badge}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Forum Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                      {cat.trending && <Badge className="text-[10px] bg-chart-3/20 text-chart-3 border-chart-3/30">🔥 Trending</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.members} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span>{cat.topics} topics</span>
                  <span>{cat.replies} replies</span>
                  <Button variant="ghost" size="sm" className="text-xs h-7">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityForumManager;
