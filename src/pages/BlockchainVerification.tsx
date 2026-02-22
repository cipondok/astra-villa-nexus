import React from 'react';
import { motion } from 'framer-motion';
import { BlockchainProvider } from '@/contexts/BlockchainProvider';
import { WalletConnect, EscrowDashboard, FractionalOwnershipCard, TransactionHistory } from '@/components/blockchain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  FileText, 
  Coins, 
  Users, 
  Link as LinkIcon,
  ArrowLeft,
  ExternalLink,
  Code2,
  CheckCircle2,
  Zap,
  Lock,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';

const BlockchainVerification = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const text = {
    en: {
      title: 'Blockchain Property Verification',
      subtitle: 'Secure, transparent, and immutable property transactions powered by Polygon',
      backToHome: 'Back to Home',
      features: 'Key Features',
      escrow: 'Smart Escrow',
      escrowDesc: 'Automated escrow payments with multi-party approval and dispute resolution',
      deeds: 'Digital Deeds',
      deedsDesc: 'NFT-based property deeds with full ownership history on-chain',
      tokenization: 'Fractional Ownership',
      tokenizationDesc: 'Invest in properties with tokenized shares and earn dividends',
      commission: 'Transparent Commissions',
      commissionDesc: 'Automated commission distribution with immutable records',
      benefits: [
        'Zero intermediary fees',
        'Instant settlement',
        'Full transparency',
        'Immutable records',
        'Global accessibility',
        'Smart contract security'
      ],
      network: 'Polygon Network',
      networkDesc: 'Low fees, fast transactions, eco-friendly',
      walletRequired: 'Connect MetaMask to interact with blockchain features',
    },
    id: {
      title: 'Verifikasi Properti Blockchain',
      subtitle: 'Transaksi properti yang aman, transparan, dan tidak dapat diubah dengan Polygon',
      backToHome: 'Kembali ke Beranda',
      features: 'Fitur Utama',
      escrow: 'Escrow Pintar',
      escrowDesc: 'Pembayaran escrow otomatis dengan persetujuan multi-pihak dan penyelesaian sengketa',
      deeds: 'Sertifikat Digital',
      deedsDesc: 'Sertifikat properti berbasis NFT dengan riwayat kepemilikan lengkap on-chain',
      tokenization: 'Kepemilikan Fraksional',
      tokenizationDesc: 'Investasi properti dengan token dan dapatkan dividen',
      commission: 'Komisi Transparan',
      commissionDesc: 'Distribusi komisi otomatis dengan catatan permanen',
      benefits: [
        'Tanpa biaya perantara',
        'Penyelesaian instan',
        'Transparansi penuh',
        'Catatan permanen',
        'Akses global',
        'Keamanan smart contract'
      ],
      network: 'Jaringan Polygon',
      networkDesc: 'Biaya rendah, transaksi cepat, ramah lingkungan',
      walletRequired: 'Hubungkan MetaMask untuk berinteraksi dengan fitur blockchain',
    }
  };

  const t = text[language] || text.en;

  const featureCards = [
    {
      icon: Shield,
      title: t.escrow,
      description: t.escrowDesc,
      color: 'from-chart-4 to-chart-4/80',
    },
    {
      icon: FileText,
      title: t.deeds,
      description: t.deedsDesc,
      color: 'from-accent to-accent/80',
    },
    {
      icon: Coins,
      title: t.tokenization,
      description: t.tokenizationDesc,
      color: 'from-chart-1 to-chart-1/80',
    },
    {
      icon: LinkIcon,
      title: t.commission,
      description: t.commissionDesc,
      color: 'from-chart-3 to-chart-3/80',
    },
  ];

  return (
    <BlockchainProvider>
      <div className="min-h-screen bg-background">
        <EnhancedNavigation 
          language={language}
          onLanguageToggle={() => {}}
          onLoginClick={() => navigate('/?auth=true')}
        />

        {/* Hero Section */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhoLTEydjJoMTJ6bTAtOFYyMGgtMTJ2Mmgxel0iLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToHome}
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-primary">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent-foreground">
                  {t.network}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {t.subtitle}
              </p>

              <div className="flex flex-wrap gap-3">
                <WalletConnect />
                <Button variant="outline" onClick={() => window.open('https://polygonscan.com', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  PolygonScan
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">{t.features}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featureCards.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                        <feature.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Banner */}
        <section className="py-8 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {t.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-chart-1" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Dashboard */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="escrow" className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
                <TabsTrigger value="escrow" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Escrow</span>
                </TabsTrigger>
                <TabsTrigger value="tokenization" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span className="hidden sm:inline">Tokens</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
                <TabsTrigger value="contracts" className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Contracts</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="escrow">
                <div className="max-w-2xl mx-auto">
                  <EscrowDashboard />
                </div>
              </TabsContent>

              <TabsContent value="tokenization">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  <FractionalOwnershipCard
                    propertyId="PROP-2024-001"
                    propertyTitle="Luxury Villa Bali"
                    tokenId={BigInt(1)}
                  />
                  <FractionalOwnershipCard
                    propertyId="PROP-2024-002"
                    propertyTitle="Jakarta Apartment"
                    tokenId={BigInt(2)}
                  />
                  <FractionalOwnershipCard
                    propertyId="PROP-2024-003"
                    propertyTitle="Bandung Residence"
                  />
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="max-w-3xl mx-auto">
                  <TransactionHistory />
                </div>
              </TabsContent>

              <TabsContent value="contracts">
                <div className="max-w-3xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="h-5 w-5" />
                        Smart Contracts
                      </CardTitle>
                      <CardDescription>
                        Custom Polygon smart contracts for real estate operations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'PropertyEscrow', desc: 'Automated escrow with multi-sig approval', icon: Shield },
                        { name: 'PropertyDeed', desc: 'ERC-721 NFT for digital property deeds', icon: FileText },
                        { name: 'PropertyToken', desc: 'ERC-1155 for fractional ownership', icon: Coins },
                        { name: 'CommissionDistributor', desc: 'Transparent commission splitting', icon: Users },
                      ].map((contract) => (
                        <div
                          key={contract.name}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              <contract.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{contract.name}</p>
                              <p className="text-sm text-muted-foreground">{contract.desc}</p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            <Lock className="h-3 w-3 mr-1" />
                            Audited
                          </Badge>
                        </div>
                      ))}

                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          <span>Deployed on Polygon Mainnet & Amoy Testnet</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-12 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold mb-6">Powered By</h3>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {[
                { name: 'Polygon', icon: '🔷' },
                { name: 'MetaMask', icon: '🦊' },
                { name: 'Wagmi', icon: '⚡' },
                { name: 'Solidity', icon: '📜' },
                { name: 'OpenZeppelin', icon: '🛡️' },
              ].map((tech) => (
                <div key={tech.name} className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-2xl">{tech.icon}</span>
                  <span className="font-medium">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProfessionalFooter language={language} />
      </div>
    </BlockchainProvider>
  );
};

export default BlockchainVerification;
