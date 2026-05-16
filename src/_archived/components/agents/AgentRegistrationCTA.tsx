import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, CheckCircle, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const AgentRegistrationCTA = () => {
  const { user } = useAuth();

  const benefits = [
    { icon: Users, title: 'Jangkau Lebih Banyak Klien', description: 'Akses ke ribuan pencari properti aktif setiap hari' },
    { icon: TrendingUp, title: 'Tingkatkan Penjualan', description: 'Tools & analytics untuk meningkatkan performa' },
    { icon: Award, title: 'Dapatkan Penghargaan', description: 'Kesempatan memenangkan Agent Award eksklusif' },
    { icon: CheckCircle, title: 'Verifikasi Profesional', description: 'Badge terverifikasi meningkatkan kepercayaan' },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-gold-primary/3 via-background to-gold-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gold-primary/15 flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-gold-primary" />
              </div>
              <span className="text-sm font-medium text-gold-primary">Bergabung Sekarang</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Jadilah Agen Properti <span className="text-gold-primary">Profesional</span>
            </h2>
            
            <p className="text-base text-muted-foreground mb-8">
              Bergabunglah dengan jaringan agen properti terbesar di Indonesia. 
              Dapatkan akses ke tools, klien, dan kesempatan untuk mengembangkan karir Anda.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-primary/10 flex items-center justify-center flex-shrink-0 border border-gold-primary/10">
                    <benefit.icon className="h-5 w-5 text-gold-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={user ? "/agent-registration" : "/auth?redirect=/agent-registration"}>
                <Button size="lg" className="gap-2 bg-gradient-to-r from-gold-primary to-gold-primary/80 text-background hover:from-gold-primary/90 hover:to-gold-primary/70 shadow-md shadow-gold-primary/20">
                  <UserPlus className="h-5 w-5" />
                  Daftar Sebagai Agen
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline" size="lg" className="border-gold-primary/20 hover:bg-gold-primary/5 hover:border-gold-primary/40">
                  Pelajari Selengkapnya
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <Card className="bg-gradient-to-br from-gold-primary/10 via-card to-gold-primary/5 border-gold-primary/20 overflow-hidden backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-5 bg-gold-primary/15 rounded-2xl flex items-center justify-center border border-gold-primary/20">
                    <Award className="h-8 w-8 text-gold-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-2">Gratis Pendaftaran!</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Tidak ada biaya pendaftaran. Mulai jual properti hari ini.
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { value: '5000+', label: 'Agen Aktif' },
                      { value: '50K+', label: 'Properti' },
                      { value: '98%', label: 'Puas' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-gold-primary/8 rounded-xl p-3 border border-gold-primary/10">
                        <div className="text-xl font-bold text-gold-primary">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-gold-primary" />
                    <span>Proses verifikasi cepat 1-2 hari kerja</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decorative */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gold-primary/8 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AgentRegistrationCTA;
