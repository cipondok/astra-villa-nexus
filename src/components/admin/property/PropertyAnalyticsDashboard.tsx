import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Heart,
  Share,
  MessageSquare,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Building,
  Target,
  Clock,
  Filter,
  Download
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const PropertyAnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('views');

  // Mock data for charts
  const viewsData = [
    { date: '2024-01-01', views: 120, inquiries: 8, shares: 5 },
    { date: '2024-01-02', views: 132, inquiries: 12, shares: 7 },
    { date: '2024-01-03', views: 101, inquiries: 6, shares: 3 },
    { date: '2024-01-04', views: 164, inquiries: 15, shares: 9 },
    { date: '2024-01-05', views: 189, inquiries: 18, shares: 12 },
    { date: '2024-01-06', views: 156, inquiries: 14, shares: 8 },
    { date: '2024-01-07', views: 178, inquiries: 16, shares: 10 }
  ];

  const propertyTypeData = [
    { name: 'House', value: 35, color: '#8884d8' },
    { name: 'Apartment', value: 28, color: '#82ca9d' },
    { name: 'Villa', value: 18, color: '#ffc658' },
    { name: 'Townhouse', value: 12, color: '#ff7300' },
    { name: 'Land', value: 7, color: '#0088fe' }
  ];

  const locationData = [
    { location: 'Jakarta', properties: 245, avg_price: 2500000000, views: 15420 },
    { location: 'Bandung', properties: 189, avg_price: 1200000000, views: 12340 },
    { location: 'Surabaya', properties: 156, avg_price: 1800000000, views: 10230 },
    { location: 'Bali', properties: 98, avg_price: 4500000000, views: 18750 },
    { location: 'Yogyakarta', properties: 87, avg_price: 950000000, views: 8950 }
  ];

  const priceRangeData = [
    { range: '< 500M', properties: 45, percentage: 15 },
    { range: '500M - 1B', properties: 78, percentage: 26 },
    { range: '1B - 2B', properties: 89, percentage: 30 },
    { range: '2B - 5B', properties: 64, percentage: 21 },
    { range: '> 5B', properties: 24, percentage: 8 }
  ];

  const performanceMetrics = {
    total_properties: 1250,
    active_listings: 1089,
    sold_this_month: 45,
    total_views: 125670,
    total_inquiries: 2340,
    conversion_rate: 1.86,
    avg_days_to_sell: 67,
    avg_price: 2250000000,
    top_performing_agent: 'Budi Santoso',
    most_viewed_property: 'Modern Villa in Seminyak'
  };

  const recentActivity = [
    { id: 1, type: 'view', property: 'Villa Seminyak', user: 'Anonymous', time: '2 minutes ago' },
    { id: 2, type: 'inquiry', property: 'Apartment Jakarta', user: 'John Doe', time: '5 minutes ago' },
    { id: 3, type: 'share', property: 'House Bandung', user: 'Jane Smith', time: '8 minutes ago' },
    { id: 4, type: 'favorite', property: 'Townhouse Surabaya', user: 'Mike Johnson', time: '12 minutes ago' },
    { id: 5, type: 'view', property: 'Land Bali', user: 'Anonymous', time: '15 minutes ago' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'inquiry': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'share': return <Share className="h-4 w-4 text-purple-500" />;
      case 'favorite': return <Heart className="h-4 w-4 text-red-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(0)}M`;
    }
    return `Rp ${amount.toLocaleString()}`;
  };

  const exportData = (type: string) => {
    // In real implementation, this would generate and download the report
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Property Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and insights for property performance
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportData('comprehensive')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Properties</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{performanceMetrics.total_properties.toLocaleString()}</div>
                    <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +12% from last month
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Total Views</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{performanceMetrics.total_views.toLocaleString()}</div>
                    <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +8% from last month
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Inquiries</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{performanceMetrics.total_inquiries.toLocaleString()}</div>
                    <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +15% from last month
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Conversion Rate</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{performanceMetrics.conversion_rate}%</div>
                    <div className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <TrendingDown className="h-3 w-3" />
                      -0.2% from last month
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Views and Engagement Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Views and Engagement Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="inquiries" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="shares" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Property Types Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={propertyTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {propertyTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{activity.property}</div>
                            <div className="text-sm text-muted-foreground">
                              {activity.user} • {activity.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Average Selling Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{performanceMetrics.avg_days_to_sell} days</div>
                    <Progress value={75} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-2">25% faster than market average</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Average Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(performanceMetrics.avg_price)}</div>
                    <div className="text-sm text-green-600 flex items-center gap-1 mt-2">
                      <TrendingUp className="h-3 w-3" />
                      +5.2% from last quarter
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sold This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{performanceMetrics.sold_this_month}</div>
                    <div className="text-sm text-green-600 flex items-center gap-1 mt-2">
                      <TrendingUp className="h-3 w-3" />
                      +18% from last month
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Price Range Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Range Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priceRangeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="properties" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Demographics & Preferences</CardTitle>
                  <CardDescription>
                    Insights about your property viewers and potential buyers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Age Groups</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>25-34 years</span>
                          <span>35%</span>
                        </div>
                        <Progress value={35} />
                        <div className="flex justify-between">
                          <span>35-44 years</span>
                          <span>28%</span>
                        </div>
                        <Progress value={28} />
                        <div className="flex justify-between">
                          <span>45-54 years</span>
                          <span>22%</span>
                        </div>
                        <Progress value={22} />
                        <div className="flex justify-between">
                          <span>55+ years</span>
                          <span>15%</span>
                        </div>
                        <Progress value={15} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">Preferred Property Types</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>House</span>
                          <span>40%</span>
                        </div>
                        <Progress value={40} />
                        <div className="flex justify-between">
                          <span>Apartment</span>
                          <span>32%</span>
                        </div>
                        <Progress value={32} />
                        <div className="flex justify-between">
                          <span>Villa</span>
                          <span>18%</span>
                        </div>
                        <Progress value={18} />
                        <div className="flex justify-between">
                          <span>Townhouse</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location Performance</CardTitle>
                  <CardDescription>
                    Property performance by geographic location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Location</th>
                          <th className="text-left p-2">Properties</th>
                          <th className="text-left p-2">Avg Price</th>
                          <th className="text-left p-2">Total Views</th>
                          <th className="text-left p-2">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {locationData.map((location, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{location.location}</td>
                            <td className="p-2">{location.properties}</td>
                            <td className="p-2">{formatCurrency(location.avg_price)}</td>
                            <td className="p-2">{location.views.toLocaleString()}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Progress value={(location.views / 20000) * 100} className="flex-1" />
                                <span className="text-sm text-muted-foreground">
                                  {((location.views / 20000) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Trends Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="inquiries" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Seasonal Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Q1 2024</span>
                        <Badge>+12% Growth</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Q4 2023</span>
                        <Badge variant="outline">+8% Growth</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Q3 2023</span>
                        <Badge variant="secondary">-2% Decline</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Peak Activity Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>9:00 - 11:00 AM</span>
                        <Progress value={85} className="flex-1 mx-2" />
                        <span className="text-sm">85%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>2:00 - 4:00 PM</span>
                        <Progress value={72} className="flex-1 mx-2" />
                        <span className="text-sm">72%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>7:00 - 9:00 PM</span>
                        <Progress value={68} className="flex-1 mx-2" />
                        <span className="text-sm">68%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Monthly Performance</h4>
                      <p className="text-sm text-muted-foreground">Detailed monthly analysis</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3" onClick={() => exportData('monthly')}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Growth Analysis</h4>
                      <p className="text-sm text-muted-foreground">Year-over-year comparison</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3" onClick={() => exportData('growth')}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Location Insights</h4>
                      <p className="text-sm text-muted-foreground">Geographic performance</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3" onClick={() => exportData('location')}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">User Behavior</h4>
                      <p className="text-sm text-muted-foreground">Visitor analytics</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3" onClick={() => exportData('behavior')}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Revenue Report</h4>
                      <p className="text-sm text-muted-foreground">Financial performance</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3" onClick={() => exportData('revenue')}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Custom Report</h4>
                      <p className="text-sm text-muted-foreground">Build your own report</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3" onClick={() => exportData('custom')}>
                    <Filter className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyAnalyticsDashboard;