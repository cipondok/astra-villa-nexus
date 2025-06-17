
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Building2, Store, MessageSquare } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ComponentType<{ className?: string }>;
}

const StatCard = ({ title, value, change, icon: Icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {change.type === 'increase' ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={change.type === 'increase' ? 'text-green-500' : 'text-red-500'}>
            {change.value}%
          </span>
          <span>from last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const AdminDashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Users"
        value="2,847"
        change={{ value: 12, type: 'increase' }}
        icon={Users}
      />
      <StatCard
        title="Active Properties"
        value="1,284"
        change={{ value: 8, type: 'increase' }}
        icon={Building2}
      />
      <StatCard
        title="Vendors"
        value="156"
        change={{ value: 3, type: 'decrease' }}
        icon={Store}
      />
      <StatCard
        title="Support Tickets"
        value="48"
        change={{ value: 15, type: 'decrease' }}
        icon={MessageSquare}
      />
    </div>
  );
};

export default AdminDashboardStats;
