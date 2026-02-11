import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, Search, CheckCircle, XCircle, Clock, 
  Shield, Loader2, RefreshCw, User, MapPin, FileText, Phone, Mail,
  Hash, PenLine, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

const AHUCompanyChecker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [manualCompany, setManualCompany] = useState('');
  const [manualNpwp, setManualNpwp] = useState('');
  const [manualSK, setManualSK] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualUserId, setManualUserId] = useState('');

  const { data: companyProfiles, isLoading, refetch } = useQuery({
    queryKey: ['company-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_name, company_verified, company_verified_at, company_registration_number, business_address, npwp_number, phone')
        .not('company_name', 'is', null)
        .not('company_name', 'eq', '')
        .order('company_verified', { ascending: true })
        .order('company_name');
      if (error) throw error;
      return data || [];
    },
  });

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      toast.error('Minimal 2 karakter untuk pencarian');
      return;
    }
    setSearching(true);
    try {
      const cleanDigits = query.replace(/\D/g, '');
      const results: any[] = [];

      // Search profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_name, company_verified, company_registration_number, business_address, npwp_number, phone')
        .or(`company_name.ilike.%${query}%,npwp_number.ilike.%${cleanDigits || query}%,company_registration_number.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .not('company_name', 'is', null)
        .limit(30);

      profiles?.forEach((p: any) => results.push({ ...p, source: 'profile' }));

      // Search vendors
      const { data: vendors } = await supabase
        .from('vendor_business_profiles')
        .select('id, vendor_id, business_name, business_address, tax_id, business_license_number, is_verified, business_phone, business_email, city, province')
        .or(`business_name.ilike.%${query}%,tax_id.ilike.%${cleanDigits || query}%,business_license_number.ilike.%${query}%`)
        .limit(20);

      vendors?.forEach((v: any) => results.push({
        id: v.vendor_id || v.id,
        full_name: v.business_name,
        email: v.business_email,
        company_name: v.business_name,
        company_verified: v.is_verified,
        npwp_number: v.tax_id,
        company_registration_number: v.business_license_number,
        business_address: [v.business_address, v.city, v.province].filter(Boolean).join(', '),
        phone: v.business_phone,
        source: 'vendor',
      }));

      // Search agents
      const { data: agents } = await supabase
        .from('agent_registration_requests')
        .select('id, user_id, full_name, email, phone, company_name, license_number, status')
        .or(`company_name.ilike.%${query}%,full_name.ilike.%${query}%,license_number.ilike.%${query}%`)
        .limit(10);

      agents?.forEach((a: any) => results.push({
        id: a.user_id || a.id,
        full_name: a.full_name,
        email: a.email,
        company_name: a.company_name,
        company_verified: a.status === 'approved',
        company_registration_number: a.license_number,
        phone: a.phone,
        source: 'agent',
        status: a.status,
      }));

      setSearchResults(results);
      toast[results.length ? 'success' : 'info'](
        results.length ? `${results.length} hasil ditemukan` : 'Tidak ada hasil — coba kata kunci lain'
      );
    } catch (err: any) {
      toast.error('Search error: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleApprove = async (profileId: string, companyName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_verified: true, company_verified_at: new Date().toISOString() })
        .eq('id', profileId);
      if (error) throw error;

      await supabase.from('in_app_notifications').insert({
        user_id: profileId,
        title: '✅ Perusahaan Terverifikasi',
        message: `Perusahaan "${companyName}" telah diverifikasi oleh admin.`,
        type: 'verification',
        priority: 'high',
        action_url: '/settings',
      });

      toast.success(`${companyName} approved`);
      refetch();
      setSearchResults(prev => prev.map(r => r.id === profileId ? { ...r, company_verified: true } : r));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeny = async (profileId: string, companyName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_verified: false })
        .eq('id', profileId);
      if (error) throw error;

      await supabase.from('in_app_notifications').insert({
        user_id: profileId,
        title: '❌ Verifikasi Ditolak',
        message: `Verifikasi perusahaan "${companyName}" ditolak. Silakan periksa kembali data Anda.`,
        type: 'verification',
        priority: 'high',
        action_url: '/settings',
      });

      toast.success(`${companyName} denied`);
      refetch();
      setSearchResults(prev => prev.map(r => r.id === profileId ? { ...r, company_verified: false } : r));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleManualVerify = async () => {
    if (!manualUserId) {
      toast.error('Pilih user dari daftar di bawah terlebih dahulu');
      return;
    }
    try {
      const updateData: any = {
        company_verified: true,
        company_verified_at: new Date().toISOString(),
      };
      if (manualCompany.trim()) updateData.company_name = manualCompany.trim().toUpperCase();
      if (manualNpwp.trim()) updateData.npwp_number = manualNpwp.trim();
      if (manualSK.trim()) updateData.company_registration_number = manualSK.trim();
      if (manualAddress.trim()) updateData.business_address = manualAddress.trim();

      const { error } = await supabase.from('profiles').update(updateData).eq('id', manualUserId);
      if (error) throw error;

      // Create admin alert for audit trail
      await supabase.from('admin_alerts').insert({
        type: 'company_verification',
        title: `Manual Verification: ${manualCompany || 'Company'}`,
        message: `Admin manually verified company. Notes: ${manualNotes || 'None'}`,
        priority: 'low',
        action_required: false,
        reference_type: 'manual_verification',
        reference_id: manualUserId,
        metadata: {
          user_id: manualUserId,
          company_name: manualCompany,
          npwp: manualNpwp,
          sk_number: manualSK,
          address: manualAddress,
          admin_notes: manualNotes,
          verified_at: new Date().toISOString(),
        },
      });

      await supabase.from('in_app_notifications').insert({
        user_id: manualUserId,
        title: '✅ Perusahaan Terverifikasi',
        message: `Perusahaan Anda telah diverifikasi oleh admin.`,
        type: 'verification',
        priority: 'high',
        action_url: '/settings',
      });

      toast.success('Company verified manually');
      setManualCompany('');
      setManualNpwp('');
      setManualSK('');
      setManualAddress('');
      setManualNotes('');
      setManualUserId('');
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const verifiedCount = companyProfiles?.filter(p => p.company_verified).length || 0;
  const pendingCount = (companyProfiles?.length || 0) - verifiedCount;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{companyProfiles?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Companies</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{verifiedCount}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-accent-foreground" />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Unverified</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verification Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search" className="gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Cari & Verifikasi
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-1.5">
                <PenLine className="h-3.5 w-3.5" />
                Manual Input
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cari berdasarkan <strong>nama perusahaan, NPWP, SK, nama user, atau email</strong> di database internal.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Cari: PT EXAMPLE / 01.234.567.8-xxx / nama / email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={searching} className="gap-2">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Cari
                </Button>
              </div>

              {searchResults.length > 0 && (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-2">
                    {searchResults.map((r, i) => (
                      <div key={`${r.source}-${r.id}-${i}`} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <Building2 className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-medium text-sm uppercase truncate">{r.company_name || r.full_name}</span>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {r.source === 'vendor' ? 'Vendor' : r.source === 'agent' ? 'Agent' : 'User'}
                            </Badge>
                            {r.company_verified ? (
                              <Badge variant="default" className="text-xs shrink-0"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs shrink-0"><Clock className="h-3 w-3 mr-1" />Unverified</Badge>
                            )}
                          </div>
                          {r.source === 'profile' && (
                            <div className="flex gap-1.5 shrink-0">
                              {r.company_verified ? (
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleDeny(r.id, r.company_name)}>
                                  Revoke
                                </Button>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={() => handleDeny(r.id, r.company_name)}>
                                    <XCircle className="h-3 w-3 mr-1" />Deny
                                  </Button>
                                  <Button size="sm" className="h-7 text-xs" onClick={() => handleApprove(r.id, r.company_name)}>
                                    <CheckCircle className="h-3 w-3 mr-1" />Approve
                                  </Button>
                                  <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => {
                                    setManualUserId(r.id);
                                    setManualCompany(r.company_name || '');
                                    setManualNpwp(r.npwp_number || '');
                                    setManualSK(r.company_registration_number || '');
                                    setManualAddress(typeof r.business_address === 'string' ? r.business_address : '');
                                    toast.info('User dipilih — pindah ke tab "Manual Input" untuk isi data');
                                  }}>
                                    <PenLine className="h-3 w-3 mr-1" />Edit & Verify
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {r.full_name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{r.full_name}</span>}
                          {r.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>}
                          {r.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
                          {r.npwp_number && <span className="flex items-center gap-1"><Hash className="h-3 w-3" />NPWP: <span className="font-mono">{r.npwp_number}</span></span>}
                          {r.company_registration_number && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />SK: {r.company_registration_number}</span>}
                          {r.business_address && typeof r.business_address === 'string' && (
                            <span className="flex items-center gap-1 truncate max-w-[300px]"><MapPin className="h-3 w-3" />{r.business_address}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Manual Input Tab */}
            <TabsContent value="manual" className="space-y-4">
              <div className="p-3 rounded-lg border border-border bg-muted/50 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Gunakan ini untuk verifikasi manual — isi data perusahaan dan approve langsung. 
                  {manualUserId ? (
                    <span className="text-primary font-medium"> User terpilih: {manualUserId.slice(0, 8)}...</span>
                  ) : (
                    <span className="text-destructive"> Cari user terlebih dahulu di tab "Cari & Verifikasi", lalu klik "Edit & Verify".</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nama Perusahaan (PT)</label>
                  <Input placeholder="PT CONTOH INDONESIA" value={manualCompany} onChange={e => setManualCompany(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">NPWP</label>
                  <Input placeholder="01.234.567.8-012.000" value={manualNpwp} onChange={e => setManualNpwp(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">SK / Nomor Registrasi</label>
                  <Input placeholder="AHU-XXXXX.AH.01.01.TAHUN XXXX" value={manualSK} onChange={e => setManualSK(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Alamat Perusahaan</label>
                  <Input placeholder="Jl. Contoh No.1, Jakarta" value={manualAddress} onChange={e => setManualAddress(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Catatan Admin (opsional)</label>
                <Textarea placeholder="Catatan verifikasi..." value={manualNotes} onChange={e => setManualNotes(e.target.value)} rows={2} />
              </div>
              <Button onClick={handleManualVerify} disabled={!manualUserId} className="gap-2 w-full sm:w-auto">
                <CheckCircle className="h-4 w-4" />
                Verify & Update Profile
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* All Companies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              All Registered Companies
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" />Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {companyProfiles?.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm uppercase truncate">{p.company_name}</span>
                        {p.company_verified ? (
                          <Badge variant="default" className="text-xs shrink-0"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs shrink-0">Unverified</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{p.full_name || p.email}</span>
                        {p.npwp_number && <span className="font-mono">{p.npwp_number}</span>}
                        {p.company_registration_number && <span className="font-mono">{p.company_registration_number}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.company_verified ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDeny(p.id, p.company_name)}>
                          Revoke
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDeny(p.id, p.company_name)}>
                            <XCircle className="h-3 w-3 mr-1" />Deny
                          </Button>
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleApprove(p.id, p.company_name)}>
                            <CheckCircle className="h-3 w-3 mr-1" />Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {(!companyProfiles || companyProfiles.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No companies registered yet</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AHUCompanyChecker;
