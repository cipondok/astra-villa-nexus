import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Search, ExternalLink, CheckCircle, XCircle, Clock, 
  Shield, Loader2, RefreshCw, User, MapPin, FileText, Phone, Mail,
  Hash, Globe
} from "lucide-react";
import { toast } from "sonner";

const AHUCompanyChecker = () => {
  const [searchName, setSearchName] = useState('');
  const [npwpSearch, setNpwpSearch] = useState('');
  const [npwpResults, setNpwpResults] = useState<any[]>([]);
  const [npwpSearching, setNpwpSearching] = useState(false);

  const { data: verificationAlerts, isLoading, refetch } = useQuery({
    queryKey: ['ahu-verification-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .in('type', ['company_verification', 'verification_request'])
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: companyProfiles, refetch: refetchProfiles } = useQuery({
    queryKey: ['company-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_name, company_verified, company_verified_at, company_registration_number, business_address, npwp_number')
        .not('company_name', 'is', null)
        .not('company_name', 'eq', '')
        .order('company_name');
      if (error) throw error;
      return data || [];
    },
  });

  // Format NPWP: XX.XXX.XXX.X-XXX.XXX
  const formatNPWP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 15);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0,2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5)}`;
    if (digits.length <= 9) return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}.${digits.slice(8)}`;
    if (digits.length <= 12) return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}.${digits.slice(8,9)}-${digits.slice(9)}`;
    return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}.${digits.slice(8,9)}-${digits.slice(9,12)}.${digits.slice(12)}`;
  };

  const handleNPWPSearch = async () => {
    const cleanNpwp = npwpSearch.replace(/\D/g, '');
    if (cleanNpwp.length < 5) {
      toast.error('Masukkan minimal 5 digit NPWP');
      return;
    }
    setNpwpSearching(true);
    try {
      // Search in profiles by npwp_number
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_name, company_verified, company_registration_number, business_address, npwp_number')
        .or(`npwp_number.ilike.%${cleanNpwp}%`)
        .limit(20);
      
      if (error) throw error;

      const results: any[] = [];
      
      if (data?.length) {
        data.forEach((p: any) => results.push({
          type: 'user',
          id: p.id,
          name: p.full_name || p.email,
          company: p.company_name,
          npwp: p.npwp_number,
          verified: p.company_verified,
          address: p.business_address,
          regNumber: p.company_registration_number,
        }));
      }

      setNpwpResults(results);
      if (results.length === 0) {
        toast.info('Tidak ada data ditemukan dengan NPWP tersebut');
      } else {
        toast.success(`Ditemukan ${results.length} hasil`);
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setNpwpSearching(false);
    }
  };

  const handleApproveCompany = async (profileId: string, companyName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_verified: true,
          company_verified_at: new Date().toISOString(),
        })
        .eq('id', profileId);
      if (error) throw error;

      await supabase.from('in_app_notifications').insert({
        user_id: profileId,
        title: '✅ Company Verification Approved',
        message: `Your company "${companyName}" has been verified by admin.`,
        type: 'verification',
        priority: 'high',
        action_url: '/settings',
      });

      toast.success(`${companyName} verified successfully`);
      refetch();
      refetchProfiles();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const handleDenyCompany = async (profileId: string, companyName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_verified: false })
        .eq('id', profileId);
      if (error) throw error;

      await supabase.from('in_app_notifications').insert({
        user_id: profileId,
        title: '❌ Company Verification Denied',
        message: `Your company "${companyName}" verification was not approved. Please recheck your details.`,
        type: 'verification',
        priority: 'high',
        action_url: '/settings',
      });

      toast.success(`${companyName} verification denied`);
      refetch();
      refetchProfiles();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const verifiedCount = companyProfiles?.filter(p => p.company_verified).length || 0;
  const pendingCount = companyProfiles?.filter(p => !p.company_verified && p.company_registration_number).length || 0;
  const totalCount = companyProfiles?.length || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
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
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{totalCount - verifiedCount - pendingCount}</p>
              <p className="text-xs text-muted-foreground">Not Submitted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Tools - Tabbed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Company Verification Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="npwp" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="npwp" className="gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                NPWP Lookup
              </TabsTrigger>
              <TabsTrigger value="ahu" className="gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                AHU Check
              </TabsTrigger>
              <TabsTrigger value="djp" className="gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                DJP / External
              </TabsTrigger>
            </TabsList>

            {/* NPWP Lookup Tab */}
            <TabsContent value="npwp" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cari perusahaan berdasarkan nomor NPWP di database internal (profiles & vendors).
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan NPWP (e.g., 01.234.567.8-901.234)"
                  value={npwpSearch}
                  onChange={(e) => setNpwpSearch(formatNPWP(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && handleNPWPSearch()}
                  className="flex-1 font-mono"
                  maxLength={20}
                />
                <Button onClick={handleNPWPSearch} disabled={npwpSearching} className="gap-2">
                  {npwpSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Cari NPWP
                </Button>
              </div>

              {npwpResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{npwpResults.length} hasil ditemukan:</p>
                  {npwpResults.map((r, i) => (
                    <div key={`${r.type}-${r.id}-${i}`} className="p-3 border rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm uppercase">{r.company || r.name}</span>
                          <Badge variant="outline" className="text-xs">{r.type === 'vendor' ? 'Vendor' : 'User'}</Badge>
                          {r.verified && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />Verified
                            </Badge>
                          )}
                        </div>
                        {r.type === 'user' && !r.verified && (
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 text-xs text-destructive"
                              onClick={() => handleDenyCompany(r.id, r.company)}>
                              <XCircle className="h-3 w-3 mr-1" />Deny
                            </Button>
                            <Button size="sm" className="h-7 text-xs"
                              onClick={() => handleApproveCompany(r.id, r.company)}>
                              <CheckCircle className="h-3 w-3 mr-1" />Approve
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {r.npwp && (
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />NPWP: <span className="font-mono">{r.npwp}</span>
                          </span>
                        )}
                        {r.name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{r.name}</span>}
                        {r.regNumber && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />SK: {r.regNumber}</span>}
                        {r.address && (
                          <span className="flex items-center gap-1 truncate max-w-[300px]">
                            <MapPin className="h-3 w-3" />{typeof r.address === 'string' ? r.address : 'Set'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* AHU Check Tab */}
            <TabsContent value="ahu" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                AHU menggunakan reCAPTCHA Enterprise — buka situs AHU di tab baru untuk verifikasi manual.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan nama perusahaan (e.g., PT TELKOM INDONESIA)"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="flex-1"
                />
                <Button asChild className="gap-2">
                  <a 
                    href={`https://ahu.go.id/pencarian/profil-pt${searchName.trim() ? `?q=${encodeURIComponent(searchName.trim())}` : ''}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka AHU
                  </a>
                </Button>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50 border-border">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium">Cara Verifikasi Manual:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Klik <strong>"Buka AHU"</strong> untuk membuka situs AHU di tab baru</li>
                      <li>Masukkan nama perusahaan, lalu klik <strong>"Cari"</strong></li>
                      <li>Klik <strong>"Profil Lengkap"</strong> pada hasil</li>
                      <li>Periksa data perusahaan (alamat, SK, NPWP, Notaris)</li>
                      <li>Kembali ke sini dan <strong>Approve/Deny</strong> pada daftar di bawah</li>
                    </ol>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* DJP / External Tab */}
            <TabsContent value="djp" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gunakan layanan eksternal untuk verifikasi NPWP dan data perusahaan Indonesia.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="https://ereg.pajak.go.id/ceknpwp" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">DJP Online (ereg.pajak.go.id)</p>
                    <p className="text-xs text-muted-foreground">Cek NPWP via NIK & KK — situs resmi Dirjen Pajak</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                </a>
                <a href="https://lookuptax.com/validate/indonesia/npwp" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Globe className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">LookupTax NPWP Validator</p>
                    <p className="text-xs text-muted-foreground">Validasi format & cek NPWP online (gratis)</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                </a>
                <a href="https://oss.go.id" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">OSS (Online Single Submission)</p>
                    <p className="text-xs text-muted-foreground">Cek NIB & izin usaha perusahaan</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                </a>
                <a href="https://ahu.go.id/pencarian/profil-pt" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">AHU Online</p>
                    <p className="text-xs text-muted-foreground">Pencarian profil PT — Administrasi Hukum Umum</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                </a>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Verification Requests */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Verification Requests
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : verificationAlerts?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No verification requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {verificationAlerts?.map((alert: any) => (
                  <div key={alert.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{alert.metadata?.company_name || 'Unknown'}</span>
                        {alert.metadata?.user_found_in_ahu && (
                          <Badge variant="default" className="text-xs">Found in AHU</Badge>
                        )}
                        {alert.metadata?.user_found_in_ahu === false && (
                          <Badge variant="destructive" className="text-xs">Not Found</Badge>
                        )}
                      </div>
                      <Badge variant={alert.action_required ? 'destructive' : 'secondary'} className="text-xs">
                        {alert.action_required ? 'Pending' : alert.metadata?.resolution || 'Resolved'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>

                    {alert.metadata?.ahu_data && (
                      <div className="p-2 rounded bg-muted/50 space-y-1 text-xs">
                        {alert.metadata.ahu_data.sk_number && (
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">SK:</span>
                            <span className="font-mono">{alert.metadata.ahu_data.sk_number}</span>
                          </div>
                        )}
                        {alert.metadata.ahu_data.company_address && (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <span className="text-muted-foreground">Alamat:</span>
                            <span>{alert.metadata.ahu_data.company_address}</span>
                          </div>
                        )}
                        {alert.metadata.ahu_data.npwp && (
                          <div className="flex items-center gap-1.5">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">NPWP:</span>
                            <span className="font-mono">{alert.metadata.ahu_data.npwp}</span>
                          </div>
                        )}
                        {alert.metadata.ahu_data.notary_name && (
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Notaris:</span>
                            <span>{alert.metadata.ahu_data.notary_name}</span>
                          </div>
                        )}
                        {(alert.metadata.ahu_data.company_phone || alert.metadata.ahu_data.company_email) && (
                          <div className="flex items-center gap-3">
                            {alert.metadata.ahu_data.company_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {alert.metadata.ahu_data.company_phone}
                              </span>
                            )}
                            {alert.metadata.ahu_data.company_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {alert.metadata.ahu_data.company_email}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                      {alert.metadata?.ahu_search_url && (
                        <a href={alert.metadata.ahu_search_url} target="_blank" rel="noopener noreferrer"
                          className="text-primary flex items-center gap-1 hover:underline">
                          <ExternalLink className="h-3 w-3" />
                          Verify on AHU
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* All Companies List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            All Registered Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {companyProfiles?.map((profile: any) => (
                <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm uppercase truncate">{profile.company_name}</span>
                      {profile.company_verified ? (
                        <Badge variant="default" className="text-xs shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />Verified
                        </Badge>
                      ) : profile.company_registration_number ? (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          <Clock className="h-3 w-3 mr-1" />Pending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs shrink-0">Unverified</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {profile.full_name || profile.email}
                      </span>
                      {profile.npwp_number && (
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span className="font-mono">{profile.npwp_number}</span>
                        </span>
                      )}
                      {profile.company_registration_number && (
                        <span className="font-mono">{profile.company_registration_number}</span>
                      )}
                      {profile.business_address && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="h-3 w-3" />
                          {typeof profile.business_address === 'string' ? profile.business_address : 'Set'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {!profile.company_verified && (
                      <>
                        <Button variant="outline" size="sm" className="h-7 text-xs text-destructive border-destructive/30"
                          onClick={() => handleDenyCompany(profile.id, profile.company_name)}>
                          <XCircle className="h-3 w-3 mr-1" />Deny
                        </Button>
                        <Button variant="default" size="sm" className="h-7 text-xs"
                          onClick={() => handleApproveCompany(profile.id, profile.company_name)}>
                          <CheckCircle className="h-3 w-3 mr-1" />Approve
                        </Button>
                      </>
                    )}
                    {profile.company_verified && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive"
                        onClick={() => handleDenyCompany(profile.id, profile.company_name)}>
                        Revoke
                      </Button>
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
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AHUCompanyChecker;
