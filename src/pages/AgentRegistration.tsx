import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  UserPlus, Building2, FileText, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, Shield, Award 
} from 'lucide-react';

type Step = 'info' | 'business' | 'documents' | 'review';

const AgentRegistration = () => {
  const { user, profile } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    business_type: '',
    company_name: '',
    license_number: '',
    experience_years: '',
    specialization: '',
    service_areas: '',
    bio: ''
  });

  const steps: { key: Step; title: string; icon: React.ReactNode }[] = [
    { key: 'info', title: 'Info Pribadi', icon: <UserPlus className="h-5 w-5" /> },
    { key: 'business', title: 'Info Bisnis', icon: <Building2 className="h-5 w-5" /> },
    { key: 'documents', title: 'Dokumen', icon: <FileText className="h-5 w-5" /> },
    { key: 'review', title: 'Review', icon: <CheckCircle className="h-5 w-5" /> }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      showError('Error', 'Anda harus login terlebih dahulu');
      navigate('/auth?redirect=/agent-registration');
      return;
    }

    if (!agreeToTerms) {
      showError('Error', 'Anda harus menyetujui syarat dan ketentuan');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert agent registration request
      const { error } = await supabase
        .from('agent_registration_requests')
        .insert({
          user_id: user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          business_type: formData.business_type,
          company_name: formData.company_name || null,
          license_number: formData.license_number || null,
          status: 'pending',
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;

      showSuccess(
        'Pendaftaran Berhasil!', 
        'Pengajuan Anda sedang diproses. Kami akan menghubungi Anda dalam 1-2 hari kerja.'
      );
      
      navigate('/');
    } catch (error: any) {
      showError('Error', error.message || 'Gagal mengirim pendaftaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <Award className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Daftar Sebagai Agen
          </h1>
          <p className="text-muted-foreground">
            Bergabung dengan jaringan agen properti profesional kami
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full 
                ${index <= currentStepIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'}
                transition-colors
              `}>
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-12 sm:w-20 h-1 mx-2
                  ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}
                  transition-colors
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStepIndex].icon}
              {steps[currentStepIndex].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 'info' && 'Lengkapi informasi pribadi Anda'}
              {currentStep === 'business' && 'Informasi bisnis dan pengalaman Anda'}
              {currentStep === 'documents' && 'Upload dokumen pendukung (opsional)'}
              {currentStep === 'review' && 'Periksa kembali data Anda sebelum mengirim'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 'info' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Nama lengkap Anda"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+62 xxx xxxx xxxx"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Business Info */}
            {currentStep === 'business' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipe Bisnis *</Label>
                    <Select 
                      value={formData.business_type} 
                      onValueChange={(v) => handleSelectChange('business_type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe bisnis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Agen Individu</SelectItem>
                        <SelectItem value="agency">Agen Perusahaan</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nama Perusahaan</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="Nama perusahaan (jika ada)"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license_number">Nomor Lisensi</Label>
                    <Input
                      id="license_number"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleChange}
                      placeholder="Nomor lisensi agen (jika ada)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pengalaman</Label>
                    <Select 
                      value={formData.experience_years} 
                      onValueChange={(v) => handleSelectChange('experience_years', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pengalaman kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 tahun</SelectItem>
                        <SelectItem value="1-3">1-3 tahun</SelectItem>
                        <SelectItem value="3-5">3-5 tahun</SelectItem>
                        <SelectItem value="5-10">5-10 tahun</SelectItem>
                        <SelectItem value="10+">10+ tahun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_areas">Area Layanan</Label>
                  <Input
                    id="service_areas"
                    name="service_areas"
                    value={formData.service_areas}
                    onChange={handleChange}
                    placeholder="Jakarta, Bandung, Surabaya..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Tentang Anda</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Ceritakan tentang pengalaman dan keahlian Anda..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 'documents' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Upload Dokumen Pendukung</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    KTP, NPWP, Sertifikat Lisensi, dll. (Opsional, bisa diupload nanti)
                  </p>
                  <Button variant="outline">
                    Pilih File
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  * Dokumen dapat diupload setelah pendaftaran melalui dashboard agen
                </p>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Data Pribadi</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Nama:</span>
                    <span>{formData.full_name}</span>
                    <span className="text-muted-foreground">Email:</span>
                    <span>{formData.email}</span>
                    <span className="text-muted-foreground">Telepon:</span>
                    <span>{formData.phone}</span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Data Bisnis</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Tipe:</span>
                    <span>{formData.business_type || '-'}</span>
                    <span className="text-muted-foreground">Perusahaan:</span>
                    <span>{formData.company_name || '-'}</span>
                    <span className="text-muted-foreground">Pengalaman:</span>
                    <span>{formData.experience_years || '-'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    Saya menyetujui <a href="/terms" className="text-primary underline">Syarat dan Ketentuan</a> serta 
                    <a href="/privacy" className="text-primary underline"> Kebijakan Privasi</a> yang berlaku.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              {currentStepIndex > 0 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              ) : (
                <div />
              )}

              {currentStep === 'review' ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !agreeToTerms}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Pendaftaran
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Lanjut
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentRegistration;
