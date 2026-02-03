import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, CheckCircle, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AgentRegistrationCTA = () => {
  const { user } = useAuth();

  const benefits = [
    {
      icon: Users,
      title: 'Jangkau Lebih Banyak Klien',
      description: 'Akses ke ribuan pencari properti aktif setiap hari'
    },
    {
      icon: TrendingUp,
      title: 'Tingkatkan Penjualan',
      description: 'Tools & analytics untuk meningkatkan performa penjualan'
    },
    {
      icon: Award,
      title: 'Dapatkan Penghargaan',
      description: 'Kesempatan memenangkan Agent Award dan badge eksklusif'
    },
    {
      icon: CheckCircle,
      title: 'Verifikasi Profesional',
      description: 'Badge terverifikasi untuk meningkatkan kepercayaan klien'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-primary">Bergabung Sekarang</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Jadilah Agen Properti Profesional
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Bergabunglah dengan jaringan agen properti terbesar di Indonesia. 
              Dapatkan akses ke tools, klien, dan kesempatan untuk mengembangkan karir Anda.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to={user ? "/agent-registration" : "/auth?redirect=/agent-registration"}>
                <Button size="lg" className="gap-2">
                  <UserPlus className="h-5 w-5" />
                  Daftar Sebagai Agen
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline" size="lg">
                  Pelajari Selengkapnya
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Visual Card */}
          <div className="relative">
            <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center text-white">
                  <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Award className="h-10 w-10" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">Gratis Pendaftaran!</h3>
                  <p className="text-white/90 mb-6">
                    Tidak ada biaya pendaftaran. Mulai jual properti hari ini.
                  </p>

                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">5000+</div>
                      <div className="text-sm text-white/80">Agen Aktif</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">50K+</div>
                      <div className="text-sm text-white/80">Properti</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">98%</div>
                      <div className="text-sm text-white/80">Puas</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-white/90">
                    <CheckCircle className="h-4 w-4" />
                    <span>Proses verifikasi cepat 1-2 hari kerja</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentRegistrationCTA;
