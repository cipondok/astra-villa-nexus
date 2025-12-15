import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Globe, Users, Monitor, Smartphone, Clock, MapPin, Ban, Shield, 
  Eye, RefreshCw, Search, Download, AlertTriangle, CheckCircle, XCircle,
  Laptop, Tablet, Chrome, Activity, TrendingUp, Flag
} from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';

interface VisitorData {
  id: string;
  visitor_id: string;
  user_id: string | null;
  page_path: string;
  referrer: string | null;
  user_agent: string;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_type: string;
  browser: string;
  os: string;
  session_id: string;
  visit_duration: number;
  is_bounce: boolean;
  created_at: string;
}

interface IPBlock {
  id: string;
  ip_address: string;
  reason: string | null;
  blocked_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  block_count: number;
}

interface CountryBlock {
  id: string;
  country_code: string;
  country_name: string;
  reason: string | null;
  is_active: boolean;
  blocked_at: string;
}

const VisitorAnalytics = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [ipBlocks, setIPBlocks] = useState<IPBlock[]>([]);
  const [countryBlocks, setCountryBlocks] = useState<CountryBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchIP, setSearchIP] = useState('');
  const [dateFilter, setDateFilter] = useState('24h');
  const [stats, setStats] = useState({
    totalVisitors: 0,
    uniqueVisitors: 0,
    blockedIPs: 0,
    blockedCountries: 0,
    avgDuration: 0,
    bounceRate: 0
  });

  // Block IP dialog state
  const [blockIPDialog, setBlockIPDialog] = useState(false);
  const [newBlockIP, setNewBlockIP] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [blockDuration, setBlockDuration] = useState('24h');

  // Block Country dialog state
  const [blockCountryDialog, setBlockCountryDialog] = useState(false);
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [countryBlockReason, setCountryBlockReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      let startDate: Date;
      switch (dateFilter) {
        case '1h': startDate = subHours(new Date(), 1); break;
        case '24h': startDate = subDays(new Date(), 1); break;
        case '7d': startDate = subDays(new Date(), 7); break;
        case '30d': startDate = subDays(new Date(), 30); break;
        default: startDate = subDays(new Date(), 1);
      }

      // Fetch visitors
      const { data: visitorsData, error: visitorsError } = await supabase
        .from('web_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (visitorsError) throw visitorsError;
      setVisitors((visitorsData || []) as VisitorData[]);

      // Fetch IP blocks
      const { data: ipBlocksData, error: ipBlocksError } = await supabase
        .from('ip_blocks')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (ipBlocksError) throw ipBlocksError;
      setIPBlocks((ipBlocksData || []) as IPBlock[]);

      // Fetch country blocks
      const { data: countryBlocksData, error: countryBlocksError } = await supabase
        .from('country_blocks')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (countryBlocksError) throw countryBlocksError;
      setCountryBlocks((countryBlocksData || []) as CountryBlock[]);

      // Calculate stats
      const uniqueIPs = new Set(visitorsData?.map(v => v.ip_address).filter(Boolean));
      const uniqueVisitorIds = new Set(visitorsData?.map(v => v.visitor_id));
      const totalDuration = visitorsData?.reduce((acc, v) => acc + (v.visit_duration || 0), 0) || 0;
      const bounces = visitorsData?.filter(v => v.is_bounce).length || 0;

      setStats({
        totalVisitors: visitorsData?.length || 0,
        uniqueVisitors: uniqueVisitorIds.size,
        blockedIPs: ipBlocksData?.length || 0,
        blockedCountries: countryBlocksData?.filter(c => c.is_active).length || 0,
        avgDuration: visitorsData?.length ? Math.round(totalDuration / visitorsData.length) : 0,
        bounceRate: visitorsData?.length ? Math.round((bounces / visitorsData.length) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Error', 'Failed to fetch visitor data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async () => {
    if (!newBlockIP.trim()) {
      showError('Error', 'Please enter an IP address');
      return;
    }

    try {
      const expiresAt = isPermanent ? null : 
        blockDuration === '1h' ? new Date(Date.now() + 60 * 60 * 1000) :
        blockDuration === '24h' ? new Date(Date.now() + 24 * 60 * 60 * 1000) :
        blockDuration === '7d' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) :
        blockDuration === '30d' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) :
        null;

      const { error } = await supabase
        .from('ip_blocks')
        .upsert({
          ip_address: newBlockIP.trim(),
          reason: blockReason || null,
          blocked_by: user?.id,
          is_permanent: isPermanent,
          expires_at: expiresAt?.toISOString() || null
        }, { onConflict: 'ip_address' });

      if (error) throw error;

      showSuccess('Success', `IP ${newBlockIP} has been blocked`);
      setBlockIPDialog(false);
      setNewBlockIP('');
      setBlockReason('');
      setIsPermanent(false);
      fetchData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to block IP');
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      const { error } = await supabase
        .from('ip_blocks')
        .delete()
        .eq('ip_address', ip);

      if (error) throw error;
      showSuccess('Success', `IP ${ip} has been unblocked`);
      fetchData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to unblock IP');
    }
  };

  const handleBlockCountry = async () => {
    if (!newCountryCode.trim() || !newCountryName.trim()) {
      showError('Error', 'Please enter country code and name');
      return;
    }

    try {
      const { error } = await supabase
        .from('country_blocks')
        .upsert({
          country_code: newCountryCode.toUpperCase().trim(),
          country_name: newCountryName.trim(),
          reason: countryBlockReason || null,
          blocked_by: user?.id,
          is_active: true
        }, { onConflict: 'country_code' });

      if (error) throw error;

      showSuccess('Success', `Country ${newCountryName} has been blocked`);
      setBlockCountryDialog(false);
      setNewCountryCode('');
      setNewCountryName('');
      setCountryBlockReason('');
      fetchData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to block country');
    }
  };

  const handleToggleCountryBlock = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('country_blocks')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      showSuccess('Success', `Country block ${isActive ? 'disabled' : 'enabled'}`);
      fetchData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to update country block');
    }
  };

  const handleDeleteCountryBlock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('country_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccess('Success', 'Country block removed');
      fetchData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to remove country block');
    }
  };

  const quickBlockIP = async (ip: string) => {
    if (!ip) return;
    try {
      const { error } = await supabase
        .from('ip_blocks')
        .upsert({
          ip_address: ip,
          reason: 'Quick blocked from visitor list',
          blocked_by: user?.id,
          is_permanent: false,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }, { onConflict: 'ip_address' });

      if (error) throw error;
      showSuccess('Success', `IP ${ip} blocked for 24 hours`);
      fetchData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to block IP');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-3 w-3" />;
      case 'tablet': return <Tablet className="h-3 w-3" />;
      default: return <Laptop className="h-3 w-3" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const filteredVisitors = visitors.filter(v => 
    !searchIP || v.ip_address?.includes(searchIP) || v.country?.toLowerCase().includes(searchIP.toLowerCase())
  );

  // Country stats
  const countryStats = visitors.reduce((acc, v) => {
    const country = v.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCountries = Object.entries(countryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">Visitor Analytics & Access Control</h2>
          <p className="text-xs text-muted-foreground">Monitor visitors, block IPs, and manage country access</p>
        </div>
        <div className="flex gap-1.5">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={fetchData} className="h-7 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10">
              <Eye className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Visits</p>
              <p className="text-sm font-bold">{stats.totalVisitors}</p>
            </div>
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-green-500/10">
              <Users className="h-3.5 w-3.5 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Unique Visitors</p>
              <p className="text-sm font-bold">{stats.uniqueVisitors}</p>
            </div>
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-500/10">
              <Ban className="h-3.5 w-3.5 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Blocked IPs</p>
              <p className="text-sm font-bold">{stats.blockedIPs}</p>
            </div>
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-500/10">
              <Flag className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Blocked Countries</p>
              <p className="text-sm font-bold">{stats.blockedCountries}</p>
            </div>
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10">
              <Clock className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Avg Duration</p>
              <p className="text-sm font-bold">{formatDuration(stats.avgDuration)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-yellow-500/10">
              <TrendingUp className="h-3.5 w-3.5 text-yellow-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Bounce Rate</p>
              <p className="text-sm font-bold">{stats.bounceRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visitors" className="space-y-2">
        <TabsList className="h-8 p-0.5 gap-0.5">
          <TabsTrigger value="visitors" className="text-xs h-7 px-2">
            <Eye className="h-3 w-3 mr-1" /> Visitors
          </TabsTrigger>
          <TabsTrigger value="ip-blocks" className="text-xs h-7 px-2">
            <Ban className="h-3 w-3 mr-1" /> IP Blocks
          </TabsTrigger>
          <TabsTrigger value="country-blocks" className="text-xs h-7 px-2">
            <Globe className="h-3 w-3 mr-1" /> Country Blocks
          </TabsTrigger>
          <TabsTrigger value="geo-stats" className="text-xs h-7 px-2">
            <MapPin className="h-3 w-3 mr-1" /> Geo Stats
          </TabsTrigger>
        </TabsList>

        {/* Visitors Tab */}
        <TabsContent value="visitors" className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input 
                placeholder="Search by IP or country..." 
                value={searchIP}
                onChange={(e) => setSearchIP(e.target.value)}
                className="pl-7 h-7 text-xs"
              />
            </div>
            <Dialog open={blockIPDialog} onOpenChange={setBlockIPDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" className="h-7 text-xs">
                  <Ban className="h-3 w-3 mr-1" /> Block IP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-sm">Block IP Address</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">IP Address</Label>
                    <Input 
                      placeholder="e.g., 192.168.1.100" 
                      value={newBlockIP}
                      onChange={(e) => setNewBlockIP(e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Reason (optional)</Label>
                    <Textarea 
                      placeholder="Why is this IP being blocked?" 
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="text-xs mt-1 min-h-[60px]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Permanent Block</Label>
                    <Switch checked={isPermanent} onCheckedChange={setIsPermanent} />
                  </div>
                  {!isPermanent && (
                    <div>
                      <Label className="text-xs">Duration</Label>
                      <Select value={blockDuration} onValueChange={setBlockDuration}>
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="24h">24 Hours</SelectItem>
                          <SelectItem value="7d">7 Days</SelectItem>
                          <SelectItem value="30d">30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button onClick={handleBlockIP} className="w-full h-8 text-xs">
                    <Ban className="h-3 w-3 mr-1" /> Block IP
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[10px]">
                      <TableHead className="p-1.5">IP</TableHead>
                      <TableHead className="p-1.5">Location</TableHead>
                      <TableHead className="p-1.5">Page</TableHead>
                      <TableHead className="p-1.5">Device</TableHead>
                      <TableHead className="p-1.5">Browser/OS</TableHead>
                      <TableHead className="p-1.5">Time</TableHead>
                      <TableHead className="p-1.5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-xs">Loading...</TableCell>
                      </TableRow>
                    ) : filteredVisitors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-xs text-muted-foreground">No visitors found</TableCell>
                      </TableRow>
                    ) : filteredVisitors.slice(0, 50).map((visitor) => (
                      <TableRow key={visitor.id} className="text-[10px]">
                        <TableCell className="p-1.5 font-mono">
                          {visitor.ip_address || '-'}
                        </TableCell>
                        <TableCell className="p-1.5">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {visitor.city && visitor.country ? `${visitor.city}, ${visitor.country}` : visitor.country || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="p-1.5 max-w-[100px] truncate">{visitor.page_path}</TableCell>
                        <TableCell className="p-1.5">
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(visitor.device_type)}
                            <span className="capitalize">{visitor.device_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="p-1.5">
                          {visitor.browser} / {visitor.os}
                        </TableCell>
                        <TableCell className="p-1.5">
                          {format(new Date(visitor.created_at), 'MMM d, HH:mm')}
                        </TableCell>
                        <TableCell className="p-1.5">
                          {visitor.ip_address && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-5 w-5 p-0"
                              onClick={() => quickBlockIP(visitor.ip_address!)}
                            >
                              <Ban className="h-3 w-3 text-red-500" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Blocks Tab */}
        <TabsContent value="ip-blocks" className="space-y-2">
          <Card>
            <CardHeader className="p-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Blocked IP Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-[10px]">
                    <TableHead className="p-1.5">IP Address</TableHead>
                    <TableHead className="p-1.5">Reason</TableHead>
                    <TableHead className="p-1.5">Blocked At</TableHead>
                    <TableHead className="p-1.5">Expires</TableHead>
                    <TableHead className="p-1.5">Status</TableHead>
                    <TableHead className="p-1.5">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipBlocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-xs text-muted-foreground">No blocked IPs</TableCell>
                    </TableRow>
                  ) : ipBlocks.map((block) => (
                    <TableRow key={block.id} className="text-[10px]">
                      <TableCell className="p-1.5 font-mono">{block.ip_address}</TableCell>
                      <TableCell className="p-1.5 max-w-[150px] truncate">{block.reason || '-'}</TableCell>
                      <TableCell className="p-1.5">{format(new Date(block.blocked_at), 'MMM d, HH:mm')}</TableCell>
                      <TableCell className="p-1.5">
                        {block.is_permanent ? 'Never' : block.expires_at ? format(new Date(block.expires_at), 'MMM d, HH:mm') : '-'}
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Badge variant={block.is_permanent ? 'destructive' : 'secondary'} className="text-[9px] px-1 py-0">
                          {block.is_permanent ? 'Permanent' : 'Temporary'}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-5 text-[10px] px-1.5"
                          onClick={() => handleUnblockIP(block.ip_address)}
                        >
                          <CheckCircle className="h-3 w-3 mr-0.5" /> Unblock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Country Blocks Tab */}
        <TabsContent value="country-blocks" className="space-y-2">
          <div className="flex justify-end">
            <Dialog open={blockCountryDialog} onOpenChange={setBlockCountryDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" className="h-7 text-xs">
                  <Globe className="h-3 w-3 mr-1" /> Block Country
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-sm">Block Country Access</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Country Code (2 letters)</Label>
                    <Input 
                      placeholder="e.g., CN, RU, KP" 
                      value={newCountryCode}
                      onChange={(e) => setNewCountryCode(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Country Name</Label>
                    <Input 
                      placeholder="e.g., China, Russia" 
                      value={newCountryName}
                      onChange={(e) => setNewCountryName(e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Reason (optional)</Label>
                    <Textarea 
                      placeholder="Why is this country being blocked?" 
                      value={countryBlockReason}
                      onChange={(e) => setCountryBlockReason(e.target.value)}
                      className="text-xs mt-1 min-h-[60px]"
                    />
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                    <p className="text-[10px] text-yellow-700 dark:text-yellow-400">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Blocking a country will prevent all visitors from that region from accessing the website.
                    </p>
                  </div>
                  <Button onClick={handleBlockCountry} className="w-full h-8 text-xs">
                    <Globe className="h-3 w-3 mr-1" /> Block Country
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader className="p-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <Flag className="h-3.5 w-3.5" /> Blocked Countries
                <Badge variant="outline" className="ml-1 text-[9px]">Indonesian Base Website</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-[10px]">
                    <TableHead className="p-1.5">Country</TableHead>
                    <TableHead className="p-1.5">Code</TableHead>
                    <TableHead className="p-1.5">Reason</TableHead>
                    <TableHead className="p-1.5">Blocked At</TableHead>
                    <TableHead className="p-1.5">Status</TableHead>
                    <TableHead className="p-1.5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryBlocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-xs text-muted-foreground">No blocked countries</TableCell>
                    </TableRow>
                  ) : countryBlocks.map((block) => (
                    <TableRow key={block.id} className="text-[10px]">
                      <TableCell className="p-1.5 font-medium">{block.country_name}</TableCell>
                      <TableCell className="p-1.5 font-mono">{block.country_code}</TableCell>
                      <TableCell className="p-1.5 max-w-[150px] truncate">{block.reason || '-'}</TableCell>
                      <TableCell className="p-1.5">{format(new Date(block.blocked_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="p-1.5">
                        <Badge variant={block.is_active ? 'destructive' : 'secondary'} className="text-[9px] px-1 py-0">
                          {block.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-1.5">
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-5 w-5 p-0"
                            onClick={() => handleToggleCountryBlock(block.id, block.is_active)}
                          >
                            {block.is_active ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-5 w-5 p-0 text-red-500"
                            onClick={() => handleDeleteCountryBlock(block.id)}
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geo Stats Tab */}
        <TabsContent value="geo-stats" className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Card>
              <CardHeader className="p-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1.5">
                  {sortedCountries.map(([country, count], index) => (
                    <div key={country} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-4">{index + 1}.</span>
                        <span className="text-xs font-medium">{country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(count / stats.totalVisitors) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Monitor className="h-3.5 w-3.5" /> Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1.5">
                  {['desktop', 'mobile', 'tablet'].map((device) => {
                    const count = visitors.filter(v => v.device_type?.toLowerCase() === device).length;
                    const percentage = stats.totalVisitors > 0 ? Math.round((count / stats.totalVisitors) * 100) : 0;
                    return (
                      <div key={device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device)}
                          <span className="text-xs font-medium capitalize">{device}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-12 text-right">{percentage}% ({count})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VisitorAnalytics;
