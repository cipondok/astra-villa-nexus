import React, { useState } from 'react';
import { useEscrow, CreateEscrowParams } from '@/lib/blockchain/hooks/useEscrow';
import { useWallet } from '@/lib/blockchain/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { EscrowStatus } from '@/lib/blockchain/contracts/EscrowABI';

interface EscrowDashboardProps {
  propertyId?: string;
  propertyTitle?: string;
}

export const EscrowDashboard: React.FC<EscrowDashboardProps> = ({ 
  propertyId = '',
  propertyTitle = 'Property Transaction' 
}) => {
  const { address, isConnected, isPolygon } = useWallet();
  const { 
    createEscrow, 
    fundEscrow, 
    releaseEscrow,
    useGetUserEscrows,
    useGetEscrow,
    isWritePending, 
    isConfirming, 
    isConfirmed,
    formatAmount 
  } = useEscrow();

  const [formData, setFormData] = useState<Partial<CreateEscrowParams>>({
    propertyId,
    amount: '',
    commissionRate: 5,
    deadlineDays: 30,
    seller: '' as `0x${string}`,
    agent: '' as `0x${string}`,
  });

  const [selectedEscrowId, setSelectedEscrowId] = useState<`0x${string}` | undefined>();
  
  const { escrowIds = [], isLoading: loadingEscrows } = useGetUserEscrows(address);
  const { escrowData, isLoading: loadingEscrow } = useGetEscrow(selectedEscrowId);

  const handleCreateEscrow = async () => {
    if (!formData.seller || !formData.agent || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createEscrow(formData as CreateEscrowParams);
      toast.success('Escrow creation initiated');
    } catch (error) {
      toast.error('Failed to create escrow');
    }
  };

  const handleFundEscrow = async () => {
    if (!selectedEscrowId || !escrowData) return;
    
    try {
      await fundEscrow(selectedEscrowId, formatAmount(escrowData.amount));
      toast.success('Escrow funding initiated');
    } catch (error) {
      toast.error('Failed to fund escrow');
    }
  };

  const handleReleaseEscrow = async () => {
    if (!selectedEscrowId) return;
    
    try {
      await releaseEscrow(selectedEscrowId);
      toast.success('Escrow release initiated');
    } catch (error) {
      toast.error('Failed to release escrow');
    }
  };

  const getStatusIcon = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.Created: return <Clock className="h-4 w-4" />;
      case EscrowStatus.Funded: return <Lock className="h-4 w-4" />;
      case EscrowStatus.Released: return <CheckCircle2 className="h-4 w-4" />;
      case EscrowStatus.Refunded: return <Unlock className="h-4 w-4" />;
      case EscrowStatus.Disputed: return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.Created: return 'bg-yellow-500/20 text-yellow-700';
      case EscrowStatus.Funded: return 'bg-blue-500/20 text-blue-700';
      case EscrowStatus.Released: return 'bg-green-500/20 text-green-700';
      case EscrowStatus.Refunded: return 'bg-gray-500/20 text-gray-700';
      case EscrowStatus.Disputed: return 'bg-red-500/20 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Connect your wallet to access escrow features
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isPolygon) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <p className="text-muted-foreground text-center">
            Please switch to Polygon network to use escrow features
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Smart Escrow
        </CardTitle>
        <CardDescription>
          Secure blockchain-based escrow for {propertyTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Escrow</TabsTrigger>
            <TabsTrigger value="manage">
              My Escrows ({escrowIds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="propertyId">Property ID</Label>
                <Input
                  id="propertyId"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  placeholder="Enter property ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (MATIC)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="commission">Commission (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seller">Seller Wallet Address</Label>
                <Input
                  id="seller"
                  value={formData.seller}
                  onChange={(e) => setFormData({ ...formData, seller: e.target.value as `0x${string}` })}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="agent">Agent Wallet Address</Label>
                <Input
                  id="agent"
                  value={formData.agent}
                  onChange={(e) => setFormData({ ...formData, agent: e.target.value as `0x${string}` })}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline (Days)</Label>
                <Input
                  id="deadline"
                  type="number"
                  value={formData.deadlineDays}
                  onChange={(e) => setFormData({ ...formData, deadlineDays: Number(e.target.value) })}
                  min={1}
                  max={365}
                />
              </div>

              <Button 
                onClick={handleCreateEscrow}
                disabled={isWritePending || isConfirming}
                className="w-full"
              >
                {(isWritePending || isConfirming) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isConfirming ? 'Confirming...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Create Escrow
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="mt-4">
            {loadingEscrows ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : escrowIds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No escrows found
              </div>
            ) : (
              <div className="space-y-3">
                {escrowIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => setSelectedEscrowId(id)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedEscrowId === id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm truncate max-w-[200px]">
                        {id.slice(0, 10)}...{id.slice(-8)}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}

                {selectedEscrowId && escrowData && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Escrow Details</CardTitle>
                        <Badge className={getStatusColor(escrowData.status)}>
                          {getStatusIcon(escrowData.status)}
                          <span className="ml-1">{escrowData.statusLabel}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Property:</span>
                          <p className="font-medium">{escrowData.propertyId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-medium">{formatAmount(escrowData.amount)} MATIC</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {escrowData.status === EscrowStatus.Created && (
                          <Button 
                            onClick={handleFundEscrow}
                            disabled={isWritePending}
                            className="flex-1"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Fund Escrow
                          </Button>
                        )}
                        {escrowData.status === EscrowStatus.Funded && (
                          <Button 
                            onClick={handleReleaseEscrow}
                            disabled={isWritePending}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Release Funds
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EscrowDashboard;
