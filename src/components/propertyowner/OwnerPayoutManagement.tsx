import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, CreditCard, Building2, CheckCircle2, AlertCircle, 
  Loader2, Shield, ArrowUpRight, ArrowDownLeft, Clock, 
  TrendingUp, Download, RefreshCw, BanknoteIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Price from "@/components/ui/Price";
import { getCurrencyFormatter } from "@/stores/currencyStore";
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const INDONESIAN_BANKS = [
  { code: 'bca', name: 'BCA' },
  { code: 'bni', name: 'BNI' },
  { code: 'bri', name: 'BRI' },
  { code: 'mandiri', name: 'Mandiri' },
  { code: 'cimb', name: 'CIMB Niaga' },
  { code: 'danamon', name: 'Danamon' },
  { code: 'permata', name: 'Permata' },
  { code: 'btn', name: 'BTN' },
  { code: 'bsi', name: 'BSI' },
  { code: 'jago', name: 'Bank Jago' },
  { code: 'jenius', name: 'Jenius (BTPN)' },
  { code: 'seabank', name: 'SeaBank' },
  { code: 'gopay', name: 'GoPay' },
  { code: 'ovo', name: 'OVO' },
  { code: 'dana', name: 'DANA' },
];

interface PayoutSettingsData {
  id?: string;
  bank_name: string;
  bank_code: string;
  bank_account_name: string;
  bank_account_number: string;
  preferred_payout_method: string;
  minimum_payout_amount: number;
  payout_schedule: string;
  npwp_number: string;
  tax_withholding_enabled: boolean;
}

interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  payout_method: string;
  status: string;
  reference_number: string | null;
  created_at: string;
  processed_at: string | null;
}

interface PayoutTransaction {
  id: string;
  amount: number;
  base_amount: number | null;
  booking_type: string;
  transaction_type: string;
  description: string | null;
  status: string | null;
  created_at: string;
}

const OwnerPayoutManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const [settings, setSettings] = useState<PayoutSettingsData>({
    bank_name: '', bank_code: '', bank_account_name: '', bank_account_number: '',
    preferred_payout_method: 'bank_transfer', minimum_payout_amount: 100000,
    payout_schedule: 'weekly', npwp_number: '', tax_withholding_enabled: true,
  });
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  const [requestAmount, setRequestAmount] = useState('');

  // Derived
  const availableBalance = transactions
    .filter(t => t.status === 'completed' && t.transaction_type === 'earning')
    .reduce((s, t) => s + t.amount, 0);
  const pendingBalance = transactions
    .filter(t => t.status === 'pending')
    .reduce((s, t) => s + t.amount, 0);
  const totalEarnings = transactions
    .filter(t => t.transaction_type === 'earning')
    .reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = requests
    .filter(r => r.status === 'completed')
    .reduce((s, r) => s + r.amount, 0);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [settingsRes, requestsRes, txRes] = await Promise.all([
        supabase.from('payout_settings').select('id, bank_name, bank_code, bank_account_name, bank_account_number, preferred_payout_method, minimum_payout_amount, payout_schedule, npwp_number, tax_withholding_enabled').eq('user_id', user.id).maybeSingle(),
        supabase.from('payout_requests').select('id, amount, currency, payout_method, status, reference_number, created_at, processed_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('payout_transactions').select('id, amount, base_amount, booking_type, transaction_type, description, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
      ]);

      if (settingsRes.data) {
        setSettings(prev => ({ ...prev, ...settingsRes.data }));
      }
      setRequests((requestsRes.data || []) as PayoutRequest[]);
      setTransactions((txRes.data || []) as PayoutTransaction[]);
    } catch (err) {
      console.error('Error loading payout data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveSettings = async () => {
    if (!user) return;
    if (!settings.bank_account_name || !settings.bank_account_number) {
      toast.error('Lengkapi nama dan nomor rekening');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('payout_settings').upsert({
        user_id: user.id,
        bank_name: settings.bank_name,
        bank_code: settings.bank_code,
        bank_account_name: settings.bank_account_name,
        bank_account_number: settings.bank_account_number,
        preferred_payout_method: settings.preferred_payout_method,
        minimum_payout_amount: settings.minimum_payout_amount,
        payout_schedule: settings.payout_schedule,
        npwp_number: settings.npwp_number,
        tax_withholding_enabled: settings.tax_withholding_enabled,
      });
      if (error) throw error;
      toast.success('Pengaturan payout tersimpan');
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!user) return;
    const amount = parseFloat(requestAmount);
    if (!amount || amount < settings.minimum_payout_amount) {
      toast.error(`Minimum payout ${getCurrencyFormatter()(settings.minimum_payout_amount)}`);
      return;
    }
    if (amount > availableBalance) {
      toast.error('Saldo tidak mencukupi');
      return;
    }
    setIsRequesting(true);
    try {
      const { error } = await supabase.from('payout_requests').insert({
        user_id: user.id,
        amount,
        payout_method: settings.preferred_payout_method,
        payout_details: {
          bank_name: settings.bank_name,
          bank_account_name: settings.bank_account_name,
          bank_account_number: settings.bank_account_number,
        },
      });
      if (error) throw error;
      toast.success('Permintaan payout berhasil diajukan');
      setRequestAmount('');
      fetchAll();
    } catch (err: any) {
      toast.error('Gagal: ' + err.message);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleBankChange = (code: string) => {
    const bank = INDONESIAN_BANKS.find(b => b.code === code);
    setSettings(p => ({ ...p, bank_code: code, bank_name: bank?.name || '' }));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Menunggu' },
      processing: { variant: 'outline', label: 'Diproses' },
      completed: { variant: 'default', label: 'Selesai' },
      failed: { variant: 'destructive', label: 'Gagal' },
      cancelled: { variant: 'destructive', label: 'Batal' },
    };
    const s = map[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={s.variant} className="text-[9px] sm:text-[10px] px-1.5 py-0.5 h-auto">{s.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Balance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Wallet, label: 'Tersedia', value: availableBalance, color: 'text-chart-1', bg: 'bg-chart-1/10' },
          { icon: Clock, label: 'Pending', value: pendingBalance, color: 'text-chart-5', bg: 'bg-chart-5/10' },
          { icon: TrendingUp, label: 'Total Pendapatan', value: totalEarnings, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: ArrowUpRight, label: 'Dicairkan', value: totalWithdrawn, color: 'text-chart-3', bg: 'bg-chart-3/10' },
        ].map((item, i) => (
          <Card key={i} className="p-2.5 sm:p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                <item.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${item.color}`} />
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground pl-0.5"><Price amount={item.value} short /></p>
          </Card>
        ))}
      </div>

      {/* Sub Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8 sm:h-9 w-full grid grid-cols-3 bg-muted/50 border border-border">
          <TabsTrigger value="overview" className="text-[10px] sm:text-xs gap-1 h-6 sm:h-7">
            <BanknoteIcon className="h-3 w-3" /> Cairkan
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[10px] sm:text-xs gap-1 h-6 sm:h-7">
            <ArrowDownLeft className="h-3 w-3" /> Riwayat
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-[10px] sm:text-xs gap-1 h-6 sm:h-7">
            <Building2 className="h-3 w-3" /> Rekening
          </TabsTrigger>
        </TabsList>

        {/* Request Payout Tab */}
        <TabsContent value="overview" className="space-y-3 mt-2">
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-primary" /> Ajukan Pencairan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Saldo tersedia</p>
                <p className="text-lg sm:text-xl font-bold text-chart-1"><Price amount={availableBalance} /></p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">Jumlah Pencairan</Label>
                <Input
                  type="number"
                  placeholder="Masukkan jumlah"
                  value={requestAmount}
                  onChange={e => setRequestAmount(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                  Min. {getCurrencyFormatter()(settings.minimum_payout_amount)} · Biaya transfer {getCurrencyFormatter()(6500)}
                </p>
              </div>

              <div className="flex gap-2">
                {[50, 100].map(pct => (
                  <Button key={pct} variant="outline" size="sm" className="flex-1 h-7 text-[10px] sm:text-xs"
                    onClick={() => setRequestAmount(String(Math.floor(availableBalance * pct / 100)))}
                  >
                    {pct === 100 ? 'Semua' : `${pct}%`}
                  </Button>
                ))}
              </div>

              {settings.bank_account_name && (
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Rekening tujuan</p>
                  <p className="text-xs sm:text-sm font-medium">{settings.bank_name} · {settings.bank_account_number}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{settings.bank_account_name}</p>
                </div>
              )}

              <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" disabled={isRequesting || availableBalance < settings.minimum_payout_amount} onClick={handleRequestPayout}>
                {isRequesting ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Memproses...</> : 'Ajukan Pencairan'}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Requests */}
          {requests.length > 0 && (
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1.5 px-0.5">Permintaan Terakhir</p>
              {requests.slice(0, 3).map(req => (
                <Card key={req.id} className="p-2.5 sm:p-3 mb-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium"><Price amount={req.amount} /></p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                          {format(new Date(req.created_at), 'dd MMM yyyy', { locale: idLocale })}
                        </p>
                      </div>
                    </div>
                    {statusBadge(req.status || 'pending')}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-2 mt-2">
          <div className="flex items-center justify-between px-0.5 mb-1">
            <p className="text-xs sm:text-sm font-semibold">Riwayat Transaksi</p>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] sm:text-xs gap-1" onClick={fetchAll}>
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>

          {/* Payout Requests Section */}
          {requests.length > 0 && (
            <>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground px-0.5">Pencairan</p>
              {requests.map(req => (
                <Card key={req.id} className="p-2.5 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                        <ArrowUpRight className="h-4 w-4 text-chart-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium"><Price amount={req.amount} /></p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                          {req.reference_number || req.payout_method} · {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: idLocale })}
                        </p>
                      </div>
                    </div>
                    {statusBadge(req.status || 'pending')}
                  </div>
                </Card>
              ))}
            </>
          )}

          {/* Earning Transactions */}
          {transactions.length > 0 && (
            <>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground px-0.5 mt-2">Pendapatan</p>
              {transactions.map(tx => (
                <Card key={tx.id} className="p-2.5 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-chart-1/10 flex items-center justify-center flex-shrink-0">
                        <ArrowDownLeft className="h-4 w-4 text-chart-1" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium"><Price amount={tx.amount} /></p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                          {tx.description || tx.booking_type} · {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true, locale: idLocale })}
                        </p>
                      </div>
                    </div>
                    {statusBadge(tx.status || 'completed')}
                  </div>
                </Card>
              ))}
            </>
          )}

          {requests.length === 0 && transactions.length === 0 && (
            <Card className="p-4">
              <div className="text-center py-4">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs font-medium">Belum ada riwayat</p>
                <p className="text-[9px] text-muted-foreground">Transaksi akan muncul di sini</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Bank Settings Tab */}
        <TabsContent value="settings" className="space-y-3 mt-2">
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> Rekening Bank
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">Bank / E-Wallet *</Label>
                <Select value={settings.bank_code} onValueChange={handleBankChange}>
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Pilih bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDONESIAN_BANKS.map(b => (
                      <SelectItem key={b.code} value={b.code} className="text-xs sm:text-sm">{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">Nomor Rekening *</Label>
                <Input className="h-9 sm:h-10 text-xs sm:text-sm" placeholder="Masukkan nomor rekening"
                  value={settings.bank_account_number} onChange={e => setSettings(p => ({ ...p, bank_account_number: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">Nama Pemilik Rekening *</Label>
                <Input className="h-9 sm:h-10 text-xs sm:text-sm" placeholder="Sesuai buku tabungan"
                  value={settings.bank_account_name} onChange={e => setSettings(p => ({ ...p, bank_account_name: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">NPWP (opsional)</Label>
                <Input className="h-9 sm:h-10 text-xs sm:text-sm" placeholder="XX.XXX.XXX.X-XXX.XXX"
                  value={settings.npwp_number} onChange={e => setSettings(p => ({ ...p, npwp_number: e.target.value }))} />
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">Jadwal Payout</Label>
                <Select value={settings.payout_schedule} onValueChange={v => setSettings(p => ({ ...p, payout_schedule: v }))}>
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily" className="text-xs">Harian</SelectItem>
                    <SelectItem value="weekly" className="text-xs">Mingguan</SelectItem>
                    <SelectItem value="biweekly" className="text-xs">2 Minggu</SelectItem>
                    <SelectItem value="monthly" className="text-xs">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">Minimum Pencairan</Label>
                <Select value={settings.minimum_payout_amount.toString()} onValueChange={v => setSettings(p => ({ ...p, minimum_payout_amount: parseInt(v) }))}>
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50000" className="text-xs">{getCurrencyFormatter()(50_000)}</SelectItem>
                    <SelectItem value="100000" className="text-xs">{getCurrencyFormatter()(100_000)}</SelectItem>
                    <SelectItem value="250000" className="text-xs">{getCurrencyFormatter()(250_000)}</SelectItem>
                    <SelectItem value="500000" className="text-xs">{getCurrencyFormatter()(500_000)}</SelectItem>
                    <SelectItem value="1000000" className="text-xs">{getCurrencyFormatter()(1_000_000)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[10px] sm:text-xs">Pemotongan Pajak</Label>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">Potong PPh otomatis</p>
                </div>
                <Switch checked={settings.tax_withholding_enabled}
                  onCheckedChange={c => setSettings(p => ({ ...p, tax_withholding_enabled: c }))} />
              </div>

              <div className="bg-muted/40 rounded-lg p-2.5 text-[10px] sm:text-xs">
                <p className="font-medium mb-0.5">Biaya Transfer</p>
                <p className="text-muted-foreground">{getCurrencyFormatter()(6500)} per transaksi (dipotong dari jumlah pencairan)</p>
              </div>

              <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Menyimpan...</> : 'Simpan Pengaturan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerPayoutManagement;
