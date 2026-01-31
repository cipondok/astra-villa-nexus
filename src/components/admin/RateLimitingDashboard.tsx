import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Ban, 
  Key, 
  BarChart3, 
  AlertTriangle,
  Check,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  Globe,
  Users,
  Activity,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const RateLimitingDashboard: React.FC = () => {
  const {
    configs,
    blockedIPs,
    whitelistedIPs,
    apiKeys,
    violations,
    analytics,
    isLoading,
    updateConfig,
    blockIP,
    unblockIP,
    whitelistIP,
    removeWhitelist,
    createAPIKey,
    revokeAPIKey,
  } = useRateLimiting();

  const [newBlockIP, setNewBlockIP] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [newWhitelistIP, setNewWhitelistIP] = useState('');
  const [newWhitelistDesc, setNewWhitelistDesc] = useState('');
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // Stats calculation
  const totalViolations = violations.length;
  const activeBlocks = blockedIPs.filter(b => !b.expires_at || new Date(b.expires_at) > new Date()).length;
  const totalRequests = analytics.reduce((sum, a) => sum + a.total_requests, 0);
  const blockedRequests = analytics.reduce((sum, a) => sum + a.blocked_requests, 0);

  const handleBlockIP = () => {
    if (!newBlockIP || !newBlockReason) return;
    blockIP({ ip_address: newBlockIP, reason: newBlockReason });
    setNewBlockIP('');
    setNewBlockReason('');
  };

  const handleWhitelistIP = () => {
    if (!newWhitelistIP) return;
    whitelistIP({ ip_address: newWhitelistIP, description: newWhitelistDesc });
    setNewWhitelistIP('');
    setNewWhitelistDesc('');
  };

  const handleCreateAPIKey = async () => {
    if (!newPartnerName || !newPartnerEmail) return;
    const key = await createAPIKey({ partner_name: newPartnerName, partner_email: newPartnerEmail });
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
    setNewPartnerName('');
    setNewPartnerEmail('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Requests (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Ban className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{blockedRequests.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Blocked Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalViolations}</p>
                <p className="text-xs text-muted-foreground">Violations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBlocks}</p>
                <p className="text-xs text-muted-foreground">Active Blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="config" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Limits
          </TabsTrigger>
          <TabsTrigger value="blocked" className="text-xs">
            <Ban className="h-3 w-3 mr-1" />
            Blocked
          </TabsTrigger>
          <TabsTrigger value="whitelist" className="text-xs">
            <Check className="h-3 w-3 mr-1" />
            Whitelist
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="text-xs">
            <Key className="h-3 w-3 mr-1" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="violations" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Violations
          </TabsTrigger>
        </TabsList>

        {/* Rate Limit Configurations */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Endpoint Rate Limits</CardTitle>
              <CardDescription className="text-xs">
                Configure rate limits per endpoint type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Endpoint</TableHead>
                    <TableHead className="text-xs">Requests/Window</TableHead>
                    <TableHead className="text-xs">Window (sec)</TableHead>
                    <TableHead className="text-xs">Burst</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{config.endpoint_name}</p>
                          <p className="text-xs text-muted-foreground">{config.endpoint_pattern}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={config.requests_per_window}
                          onChange={(e) => updateConfig({ 
                            id: config.id, 
                            requests_per_window: parseInt(e.target.value) 
                          })}
                          className="w-20 h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={config.window_seconds}
                          onChange={(e) => updateConfig({ 
                            id: config.id, 
                            window_seconds: parseInt(e.target.value) 
                          })}
                          className="w-16 h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={config.burst_limit || ''}
                          onChange={(e) => updateConfig({ 
                            id: config.id, 
                            burst_limit: e.target.value ? parseInt(e.target.value) : null 
                          })}
                          className="w-16 h-8 text-xs"
                          placeholder="-"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={(checked) => updateConfig({ 
                            id: config.id, 
                            is_active: checked 
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {config.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked IPs */}
        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Blocked IPs</CardTitle>
                  <CardDescription className="text-xs">
                    IPs automatically blocked after 5 violations or manually blocked
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8">
                      <Plus className="h-3 w-3 mr-1" />
                      Block IP
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Block IP Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>IP Address</Label>
                        <Input
                          value={newBlockIP}
                          onChange={(e) => setNewBlockIP(e.target.value)}
                          placeholder="192.168.1.1"
                        />
                      </div>
                      <div>
                        <Label>Reason</Label>
                        <Input
                          value={newBlockReason}
                          onChange={(e) => setNewBlockReason(e.target.value)}
                          placeholder="Suspicious activity"
                        />
                      </div>
                      <Button onClick={handleBlockIP} className="w-full">
                        Block IP
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">IP Address</TableHead>
                      <TableHead className="text-xs">Reason</TableHead>
                      <TableHead className="text-xs">Violations</TableHead>
                      <TableHead className="text-xs">Blocked</TableHead>
                      <TableHead className="text-xs">Expires</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedIPs.map((ip) => (
                      <TableRow key={ip.id}>
                        <TableCell className="font-mono text-xs">{ip.ip_address}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{ip.reason}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-[10px]">
                            {ip.violation_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(ip.blocked_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-xs">
                          {ip.is_permanent ? (
                            <Badge variant="destructive" className="text-[10px]">Permanent</Badge>
                          ) : ip.expires_at ? (
                            formatDistanceToNow(new Date(ip.expires_at), { addSuffix: true })
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">Permanent</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => unblockIP(ip.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {blockedIPs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No blocked IPs
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Whitelisted IPs */}
        <TabsContent value="whitelist" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Whitelisted IPs</CardTitle>
                  <CardDescription className="text-xs">
                    IPs that bypass rate limiting
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8">
                      <Plus className="h-3 w-3 mr-1" />
                      Whitelist IP
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Whitelist IP Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>IP Address</Label>
                        <Input
                          value={newWhitelistIP}
                          onChange={(e) => setNewWhitelistIP(e.target.value)}
                          placeholder="192.168.1.1"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={newWhitelistDesc}
                          onChange={(e) => setNewWhitelistDesc(e.target.value)}
                          placeholder="Office network"
                        />
                      </div>
                      <Button onClick={handleWhitelistIP} className="w-full">
                        Add to Whitelist
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">IP Address</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Added</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whitelistedIPs.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-mono text-xs">{ip.ip_address}</TableCell>
                      <TableCell className="text-xs">{ip.description || '-'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ip.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={() => removeWhitelist(ip.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {whitelistedIPs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No whitelisted IPs
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partner API Keys */}
        <TabsContent value="apikeys" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Partner API Keys</CardTitle>
                  <CardDescription className="text-xs">
                    API keys for trusted partners with custom rate limits
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8">
                      <Plus className="h-3 w-3 mr-1" />
                      Create Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Partner API Key</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Partner Name</Label>
                        <Input
                          value={newPartnerName}
                          onChange={(e) => setNewPartnerName(e.target.value)}
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div>
                        <Label>Partner Email</Label>
                        <Input
                          type="email"
                          value={newPartnerEmail}
                          onChange={(e) => setNewPartnerEmail(e.target.value)}
                          placeholder="api@acme.com"
                        />
                      </div>
                      <Button onClick={handleCreateAPIKey} className="w-full">
                        Create & Copy Key
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Partner</TableHead>
                      <TableHead className="text-xs">API Key</TableHead>
                      <TableHead className="text-xs">Requests</TableHead>
                      <TableHead className="text-xs">Multiplier</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{key.partner_name}</p>
                            <p className="text-xs text-muted-foreground">{key.partner_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {showApiKeys[key.id] ? key.api_key : `${key.api_key.substring(0, 12)}...`}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setShowApiKeys(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                            >
                              {showApiKeys[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(key.api_key)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {key.total_requests.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {key.rate_limit_multiplier}x
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {key.is_whitelisted ? (
                            <Badge className="text-[10px] bg-green-500">Whitelisted</Badge>
                          ) : key.is_active ? (
                            <Badge className="text-[10px]">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Revoked</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {key.is_active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive"
                              onClick={() => revokeAPIKey(key.id)}
                            >
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {apiKeys.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No API keys created
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Log */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Violations</CardTitle>
              <CardDescription className="text-xs">
                Rate limit violations in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Identifier</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Endpoint</TableHead>
                      <TableHead className="text-xs">Count</TableHead>
                      <TableHead className="text-xs">Last Violation</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {violations.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-xs max-w-[150px] truncate">
                          {v.identifier}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {v.identifier_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{v.endpoint_pattern}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-[10px]">
                            {v.violation_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(v.last_violation_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {v.identifier_type === 'ip' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => blockIP({ 
                                ip_address: v.identifier, 
                                reason: `Blocked from violations log - ${v.violation_count} violations` 
                              })}
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              Block
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {violations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No violations recorded
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RateLimitingDashboard;