import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Price from '@/components/ui/Price';
import {
  Wallet, ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, Lock,
  Shield, Clock, CheckCircle2, XCircle, Loader2, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet, useWalletTransactions, useCreateTopup, useRequestPayout } from '@/hooks/useWallet';

const QUICK_AMOUNTS = [500000, 1000000, 5000000, 10000000, 50000000];
const PAYMENT_METHODS = [
  { value: 'bank_transfer_bca', label: 'BCA Transfer' },
  { value: 'bank_transfer_bni', label: 'BNI Transfer' },
  { value: 'bank_transfer_bri', label: 'BRI Transfer' },
  { value: 'bank_transfer_mandiri', label: 'Mandiri Transfer' },
  { value: 'gopay', label: 'GoPay' },
  { value: 'qris', label: 'QRIS' },
];

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  confirmed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  pending: { icon: <Clock className="h-3.5 w-3.5" />, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  failed: { icon: <XCircle className="h-3.5 w-3.5" />, color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const typeLabels: Record<string, string> = {
  deposit: 'Deposit',
  escrow_lock: 'Escrow Lock',
  escrow_release: 'Escrow Release',
  withdrawal: 'Withdrawal',
  payout: 'Payout',
  refund: 'Refund',
};

const WalletPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: txData, isLoading: txLoading } = useWalletTransactions(20);
  const createTopup = useCreateTopup();
  const requestPayout = useRequestPayout();

  const [topupAmount, setTopupAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [topupOpen, setTopupOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [payoutOpen, setPayoutOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-border">
          <CardContent className="p-6 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please log in to access your wallet</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableBalance = wallet?.available_balance ?? 0;
  const lockedBalance = wallet?.locked_balance ?? 0;
  const totalBalance = availableBalance + lockedBalance;
  const transactions = txData?.transactions ?? [];

  const handleTopup = () => {
    const amount = parseInt(topupAmount);
    if (!amount || amount < 10000) return;
    createTopup.mutate(
      { amount, payment_type: paymentMethod || undefined },
      { onSuccess: () => { setTopupOpen(false); setTopupAmount(''); setPaymentMethod(''); } }
    );
  };

  const handlePayout = () => {
    const amount = parseInt(payoutAmount);
    if (!amount || amount < 50000 || !payoutMethod) return;
    requestPayout.mutate(
      { amount, payout_method: payoutMethod },
      { onSuccess: () => { setPayoutOpen(false); setPayoutAmount(''); setPayoutMethod(''); } }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Investor Wallet</h1>
              <p className="text-sm text-muted-foreground">Secure fund management for property investments</p>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Total Balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-bold text-foreground">
                  <Price amount={totalBalance} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-semibold text-foreground">
                  <Price amount={availableBalance} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-500" />
                Locked in Escrow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-semibold text-foreground">
                  <Price amount={lockedBalance} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Fund Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Fund Your Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Amount (IDR)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount (min Rp 10,000)"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    min={10000}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {QUICK_AMOUNTS.map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        size="sm"
                        onClick={() => setTopupAmount(String(amt))}
                        className="text-xs"
                      >
                        <Price amount={amt} />
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Funds are securely processed via regulated payment partners and protected by ASTRA escrow infrastructure.
                  </p>
                </div>
                <Button
                  onClick={handleTopup}
                  disabled={!topupAmount || parseInt(topupAmount) < 10000 || createTopup.isPending}
                  className="w-full"
                >
                  {createTopup.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Proceed to Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  Available: <Price amount={availableBalance} />
                </p>
                <Input
                  type="number"
                  placeholder="Amount (min Rp 50,000)"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  min={50000}
                />
                <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Withdrawal method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handlePayout}
                  disabled={!payoutAmount || parseInt(payoutAmount) < 50000 || !payoutMethod || requestPayout.isPending}
                  className="w-full"
                >
                  {requestPayout.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Withdrawal Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transaction History */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
            <CardDescription>All wallet deposits, escrow locks, and withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Fund your wallet to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const isCredit = ['deposit', 'escrow_release', 'refund'].includes(tx.transaction_type);
                  const config = statusConfig[tx.status] || statusConfig.pending;
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isCredit ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                          {isCredit ? (
                            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {typeLabels[tx.transaction_type] || tx.transaction_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          {tx.metadata?.original_currency && (
                            <p className="text-[10px] text-muted-foreground/70">
                              {tx.metadata.original_currency} {Number(tx.metadata.original_amount).toLocaleString()} → IDR (rate: {tx.metadata.fx_rate})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] gap-1 ${config.color}`}>
                          {config.icon}
                          {tx.status}
                        </Badge>
                        <span className={`text-sm font-semibold tabular-nums ${isCredit ? 'text-emerald-600' : 'text-foreground'}`}>
                          {isCredit ? '+' : '-'}<Price amount={tx.amount} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* IDR Base Currency Notice */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Funds secured via regulated payment partners and protected by ASTRA escrow workflow
          </div>
          <p className="text-center text-[10px] text-muted-foreground/60">
            All balances and transactions are denominated in Indonesian Rupiah (IDR). 
            Foreign currency deposits are converted at the live FX rate at the time of deposit. 
            Final settlement for all property transactions is in IDR.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
