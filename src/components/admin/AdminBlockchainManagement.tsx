
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Wallet, 
  FileCheck, 
  Coins, 
  Activity, 
  Settings, 
  Shield,
  ExternalLink,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Building2,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

const AdminBlockchainManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for demonstration
  const escrowTransactions = [
    { id: 'ESC-001', property: 'Luxury Villa Bali', amount: '500,000 MATIC', status: 'active', buyer: '0x1234...5678', seller: '0xabcd...efgh', created: '2025-01-28' },
    { id: 'ESC-002', property: 'Penthouse Jakarta', amount: '750,000 MATIC', status: 'completed', buyer: '0x9876...5432', seller: '0xfedc...ba98', created: '2025-01-25' },
    { id: 'ESC-003', property: 'Beach House Lombok', amount: '320,000 MATIC', status: 'disputed', buyer: '0x1111...2222', seller: '0x3333...4444', created: '2025-01-20' },
  ];

  const propertyTokens = [
    { id: 'TKN-001', property: 'Villa Seminyak', totalShares: 1000, soldShares: 750, pricePerShare: '100 MATIC', owners: 12 },
    { id: 'TKN-002', property: 'Apartment Sudirman', totalShares: 500, soldShares: 500, pricePerShare: '200 MATIC', owners: 8 },
    { id: 'TKN-003', property: 'Resort Nusa Dua', totalShares: 2000, soldShares: 450, pricePerShare: '50 MATIC', owners: 25 },
  ];

  const recentTransactions = [
    { hash: '0xabc123...', type: 'Escrow Created', amount: '500,000 MATIC', timestamp: '2 hours ago', status: 'confirmed' },
    { hash: '0xdef456...', type: 'Token Purchase', amount: '5,000 MATIC', timestamp: '4 hours ago', status: 'confirmed' },
    { hash: '0xghi789...', type: 'Commission Paid', amount: '15,000 MATIC', timestamp: '6 hours ago', status: 'confirmed' },
    { hash: '0xjkl012...', type: 'Escrow Released', amount: '320,000 MATIC', timestamp: '1 day ago', status: 'confirmed' },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success('Blockchain data refreshed');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30"><Clock className="h-3 w-3 mr-1" />Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'disputed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Disputed</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Confirmed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-1 md:p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-lg border border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Blockchain Management</h2>
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30 text-[10px] px-1.5">
                  Polygon
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Manage smart contracts, escrow, tokenization, and blockchain transactions</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Escrows</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">+2 this week</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Value Locked</p>
                <p className="text-2xl font-bold text-foreground">1.57M</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">MATIC</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tokenized Properties</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Building2 className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">45 token holders</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Transactions (24h)</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +15%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-1 shadow-sm">
          <TabsList className="flex w-full bg-muted/50 gap-0.5 h-9 p-0.5">
            <TabsTrigger 
              value="overview" 
              className="flex-1 flex items-center gap-1.5 text-xs px-3 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Activity className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="escrow" 
              className="flex-1 flex items-center gap-1.5 text-xs px-3 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-3.5 w-3.5" />
              Escrow
            </TabsTrigger>
            <TabsTrigger 
              value="tokens" 
              className="flex-1 flex items-center gap-1.5 text-xs px-3 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Coins className="h-3.5 w-3.5" />
              Property Tokens
            </TabsTrigger>
            <TabsTrigger 
              value="deeds" 
              className="flex-1 flex items-center gap-1.5 text-xs px-3 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileCheck className="h-3.5 w-3.5" />
              Digital Deeds
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex-1 flex items-center gap-1.5 text-xs px-3 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Blockchain Transactions
              </CardTitle>
              <CardDescription className="text-xs">Latest on-chain activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Hash</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Time</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{tx.hash}</TableCell>
                      <TableCell className="text-xs">{tx.type}</TableCell>
                      <TableCell className="text-xs font-medium">{tx.amount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.timestamp}</TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => copyToClipboard(tx.hash)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <ExternalLink className="h-3 w-3" />
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

        {/* Escrow Tab */}
        <TabsContent value="escrow" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Active Escrow Contracts
              </CardTitle>
              <CardDescription className="text-xs">Manage property escrow transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Property</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Buyer</TableHead>
                    <TableHead className="text-xs">Seller</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escrowTransactions.map((escrow) => (
                    <TableRow key={escrow.id}>
                      <TableCell className="font-mono text-xs">{escrow.id}</TableCell>
                      <TableCell className="text-xs font-medium">{escrow.property}</TableCell>
                      <TableCell className="text-xs">{escrow.amount}</TableCell>
                      <TableCell className="font-mono text-xs">{escrow.buyer}</TableCell>
                      <TableCell className="font-mono text-xs">{escrow.seller}</TableCell>
                      <TableCell>{getStatusBadge(escrow.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            View
                          </Button>
                          {escrow.status === 'disputed' && (
                            <Button variant="destructive" size="sm" className="h-7 text-xs">
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Tokens Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Tokenized Properties (ERC-1155)
              </CardTitle>
              <CardDescription className="text-xs">Fractional ownership tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Token ID</TableHead>
                    <TableHead className="text-xs">Property</TableHead>
                    <TableHead className="text-xs">Total Shares</TableHead>
                    <TableHead className="text-xs">Sold</TableHead>
                    <TableHead className="text-xs">Price/Share</TableHead>
                    <TableHead className="text-xs">Owners</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyTokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell className="font-mono text-xs">{token.id}</TableCell>
                      <TableCell className="text-xs font-medium">{token.property}</TableCell>
                      <TableCell className="text-xs">{token.totalShares.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <span>{token.soldShares.toLocaleString()}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {Math.round((token.soldShares / token.totalShares) * 100)}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{token.pricePerShare}</TableCell>
                      <TableCell className="text-xs flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {token.owners}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Digital Deeds Tab */}
        <TabsContent value="deeds" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Digital Property Deeds (ERC-721 NFTs)
              </CardTitle>
              <CardDescription className="text-xs">Immutable property ownership records on blockchain</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Digital deeds will appear here once properties are registered on-chain
              </p>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Mint Property Deed
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Smart Contract Addresses</CardTitle>
                <CardDescription className="text-xs">Polygon Mainnet contract addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Escrow Contract</Label>
                  <div className="flex gap-2">
                    <Input 
                      value="0x0000000000000000000000000000000000000000" 
                      readOnly 
                      className="font-mono text-xs h-8"
                    />
                    <Button variant="outline" size="sm" className="h-8">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Property Deed (ERC-721)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value="0x0000000000000000000000000000000000000000" 
                      readOnly 
                      className="font-mono text-xs h-8"
                    />
                    <Button variant="outline" size="sm" className="h-8">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Property Token (ERC-1155)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value="0x0000000000000000000000000000000000000000" 
                      readOnly 
                      className="font-mono text-xs h-8"
                    />
                    <Button variant="outline" size="sm" className="h-8">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Commission Contract</Label>
                  <div className="flex gap-2">
                    <Input 
                      value="0x0000000000000000000000000000000000000000" 
                      readOnly 
                      className="font-mono text-xs h-8"
                    />
                    <Button variant="outline" size="sm" className="h-8">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Blockchain Settings</CardTitle>
                <CardDescription className="text-xs">Configure blockchain integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Enable Blockchain Features</Label>
                    <p className="text-xs text-muted-foreground">Allow users to use blockchain features</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Testnet Mode</Label>
                    <p className="text-xs text-muted-foreground">Use Polygon Amoy testnet</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Auto-approve Escrow</Label>
                    <p className="text-xs text-muted-foreground">Auto-release escrow after conditions met</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Fractional Ownership</Label>
                    <p className="text-xs text-muted-foreground">Enable property tokenization</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Import for the PlusCircle icon used in the Deeds tab
import { PlusCircle } from "lucide-react";

export default AdminBlockchainManagement;
