import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, Search, ExternalLink, CheckCircle, XCircle, Clock, 
  Shield, Loader2, RefreshCw, User, MapPin, FileText, Phone, Mail 
} from "lucide-react";
import { toast } from "sonner";

const AHUCompanyChecker = () => {
  const [searchName, setSearchName] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);

  // Fetch all company verification alerts
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

  // Fetch profiles with company verification status
  const { data: companyProfiles } = useQuery({
    queryKey: ['company-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_name, company_verified, company_verified_at, company_registration_number, business_address')
        .not('company_name', 'is', null)
        .not('company_name', 'eq', '')
        .order('company_name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleCheckAHU = async () => {
    if (!searchName.trim()) {
      toast.error('Masukkan nama perusahaan');
      return;
    }

    setChecking(true);
    setCheckResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('verify-ahu-company', {
        body: { company_name: searchName.trim(), user_id: 'admin-check' },
      });

      if (error) throw error;
      setCheckResult(data);
      
      if (data?.status === 'captcha_blocked') {
        toast.info('AHU dilindungi CAPTCHA. Silakan cek manual via link.', { duration: 5000 });
      }
    } catch (err: any) {
      toast.error('Error checking AHU: ' + (err.message || 'Unknown error'));
    } finally {
      setChecking(false);
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

      // Notify user
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
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              <p className="text-xs text-muted-foreground">AHU Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
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

      {/* AHU Manual Check Tool */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            AHU Company Verification
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            AHU menggunakan reCAPTCHA Enterprise sehingga pengecekan otomatis tidak dapat dilakukan. 
            Gunakan tombol di bawah untuk membuka situs AHU dan verifikasi manual.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
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
                Buka AHU & Cari
              </a>
            </Button>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50 border-border">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1.5 text-sm">
                <p className="font-medium">Cara Verifikasi Manual:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Klik <strong>"Buka AHU & Cari"</strong> untuk membuka situs AHU di tab baru</li>
                  <li>Masukkan nama perusahaan di halaman AHU, lalu klik <strong>"Cari"</strong></li>
                  <li>Klik <strong>"Profil Lengkap"</strong> pada hasil yang ditemukan</li>
                  <li>Periksa data perusahaan (alamat, SK, NPWP, Notaris)</li>
                  <li>Kembali ke sini dan <strong>Approve/Deny</strong> perusahaan pada daftar di bawah</li>
                </ol>
              </div>
            </div>
          </div>
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
                          <Badge variant="default" className="text-xs bg-green-600">User Found in AHU</Badge>
                        )}
                        {alert.metadata?.user_found_in_ahu === false && (
                          <Badge variant="destructive" className="text-xs">Not Found in AHU</Badge>
                        )}
                      </div>
                      <Badge variant={alert.action_required ? 'destructive' : 'secondary'} className="text-xs">
                        {alert.action_required ? 'Pending' : alert.metadata?.resolution || 'Resolved'}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">{alert.message}</p>

                    {/* AHU Data if available */}
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
                            <FileText className="h-3 w-3 text-muted-foreground" />
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
                        <Badge variant="default" className="text-xs bg-green-600 shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : profile.company_registration_number ? (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs shrink-0">Unverified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {profile.full_name || profile.email}
                      </span>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-destructive border-destructive/30"
                          onClick={() => handleDenyCompany(profile.id, profile.company_name)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Deny
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveCompany(profile.id, profile.company_name)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                    {profile.company_verified && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive"
                        onClick={() => handleDenyCompany(profile.id, profile.company_name)}
                      >
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
