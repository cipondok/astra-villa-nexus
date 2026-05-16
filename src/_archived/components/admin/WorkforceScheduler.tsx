import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const weeklySchedule = [
  { day: 'Mon', agents: 12, support: 4, managers: 2, utilization: 85 },
  { day: 'Tue', agents: 14, support: 5, managers: 2, utilization: 92 },
  { day: 'Wed', agents: 11, support: 4, managers: 3, utilization: 78 },
  { day: 'Thu', agents: 13, support: 5, managers: 2, utilization: 88 },
  { day: 'Fri', agents: 15, support: 6, managers: 3, utilization: 95 },
  { day: 'Sat', agents: 8, support: 3, managers: 1, utilization: 72 },
  { day: 'Sun', agents: 5, support: 2, managers: 1, utilization: 58 },
];

const teamMembers = [
  { id: 1, name: 'Andi Pratama', role: 'Senior Agent', shift: 'Morning', status: 'on-duty', hours: 38, rating: 4.8 },
  { id: 2, name: 'Siti Rahayu', role: 'Support Lead', shift: 'Afternoon', status: 'on-duty', hours: 40, rating: 4.9 },
  { id: 3, name: 'Budi Santoso', role: 'Agent', shift: 'Morning', status: 'off-duty', hours: 32, rating: 4.5 },
  { id: 4, name: 'Dewi Lestari', role: 'Manager', shift: 'Full Day', status: 'on-leave', hours: 0, rating: 4.7 },
  { id: 5, name: 'Rizky Ramadan', role: 'Agent', shift: 'Evening', status: 'on-duty', hours: 36, rating: 4.3 },
  { id: 6, name: 'Maya Putri', role: 'Support', shift: 'Morning', status: 'on-duty', hours: 39, rating: 4.6 },
];

const shiftDistribution = [
  { name: 'Morning (6-14)', value: 42, fill: 'hsl(var(--primary))' },
  { name: 'Afternoon (14-22)', value: 35, fill: 'hsl(var(--secondary))' },
  { name: 'Evening (22-6)', value: 15, fill: 'hsl(var(--accent))' },
  { name: 'Full Day', value: 8, fill: 'hsl(var(--muted))' },
];

const WorkforceScheduler = () => {
  const [selectedWeek, setSelectedWeek] = useState('current');
  const totalOnDuty = teamMembers.filter(m => m.status === 'on-duty').length;
  const totalOnLeave = teamMembers.filter(m => m.status === 'on-leave').length;
  const avgUtilization = Math.round(weeklySchedule.reduce((s, d) => s + d.utilization, 0) / weeklySchedule.length);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-duty': return <Badge className="bg-primary/20 text-primary text-[9px]">On Duty</Badge>;
      case 'off-duty': return <Badge variant="secondary" className="text-[9px]">Off Duty</Badge>;
      case 'on-leave': return <Badge variant="outline" className="text-[9px] text-destructive border-destructive/30">On Leave</Badge>;
      default: return <Badge variant="outline" className="text-[9px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Workforce Scheduler
          </h2>
          <p className="text-xs text-muted-foreground">Staff scheduling, shift management, and utilization tracking</p>
        </div>
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="current">This Week</SelectItem>
            <SelectItem value="next">Next Week</SelectItem>
            <SelectItem value="previous">Last Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'On Duty', value: totalOnDuty, icon: UserCheck, color: 'text-primary' },
          { label: 'On Leave', value: totalOnLeave, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Avg Utilization', value: `${avgUtilization}%`, icon: TrendingUp, color: 'text-primary' },
          { label: 'Total Staff', value: teamMembers.length, icon: Users, color: 'text-foreground' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-foreground mt-1">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="h-8">
          <TabsTrigger value="schedule" className="text-xs gap-1"><Clock className="h-3 w-3" /> Weekly Schedule</TabsTrigger>
          <TabsTrigger value="team" className="text-xs gap-1"><Users className="h-3 w-3" /> Team Roster</TabsTrigger>
          <TabsTrigger value="distribution" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> Shift Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Staff Coverage</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklySchedule}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="agents" fill="hsl(var(--primary))" name="Agents" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="support" fill="hsl(var(--secondary))" name="Support" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="managers" fill="hsl(var(--accent))" name="Managers" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">{member.role} · {member.shift} Shift</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{member.hours}h/wk</span>
                      <span className="text-[10px] font-medium text-foreground">⭐ {member.rating}</span>
                      {getStatusBadge(member.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Shift Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={shiftDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {shiftDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkforceScheduler;
