import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Home, 
  Building, 
  Landmark, 
  Hotel,
  Trees,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const WNAPropertyTypes: React.FC = () => {
  const { language } = useLanguage();

  const copy = {
    en: {
      title: "Eligible Property Types for Foreign Investors",
      subtitle: "Indonesian law (PP No. 18/2021 & Permen ATR/BPN No. 18/2021) defines which properties foreigners can own",
      
      propertyTypes: [
        {
          icon: Building,
          name: "Apartments / Condominiums",
          ownership: "Hak Pakai (Right to Use)",
          duration: "30 + 20 + 30 = 80 years",
          minValue: "IDR 1 Billion",
          status: "allowed",
          color: "blue",
          details: [
            "Strata title ownership available",
            "Must be in designated areas (PPJB zones)",
            "SHMSRS (Strata Certificate) provided",
            "Can be inherited by family",
            "Popular in Jakarta, Bali, Surabaya"
          ]
        },
        {
          icon: Home,
          name: "Landed Houses / Villas",
          ownership: "Hak Pakai (Right to Use)",
          duration: "30 + 20 + 30 = 80 years",
          minValue: "IDR 5 Billion (varies by region)",
          status: "allowed",
          color: "green",
          details: [
            "Must hold valid KITAS/KITAP or stay permit",
            "Building on Hak Pakai land only",
            "Cannot be on agricultural land (Hak Milik)",
            "Bali minimum: IDR 5B, Jakarta: varies",
            "Subject to location zone approval"
          ]
        },
        {
          icon: Hotel,
          name: "Commercial Property (via PT PMA)",
          ownership: "Hak Guna Bangunan (Right to Build)",
          duration: "30 + 20 + 20 = 70 years",
          minValue: "Minimum IDR 10 Billion investment",
          status: "allowed",
          color: "purple",
          details: [
            "Requires PT PMA (Foreign Investment Company)",
            "Minimum paid-up capital requirements",
            "Hotels, offices, retail allowed",
            "BKPM approval required",
            "NIB/Business license mandatory"
          ]
        },
        {
          icon: Building2,
          name: "Industrial / Warehouse",
          ownership: "Hak Guna Bangunan (via PT PMA)",
          duration: "30 + 20 + 20 = 70 years",
          minValue: "Subject to investment plan",
          status: "allowed",
          color: "amber",
          details: [
            "Must operate through PT PMA",
            "Industrial zones (Kawasan Industri) available",
            "Special Economic Zones (KEK) offer incentives",
            "Environmental permits (AMDAL) may be required",
            "Suitable for manufacturing operations"
          ]
        },
        {
          icon: Landmark,
          name: "Freehold Land (Hak Milik)",
          ownership: "Not Allowed for Foreigners",
          duration: "N/A",
          minValue: "N/A",
          status: "prohibited",
          color: "red",
          details: [
            "Indonesian law prohibits foreign freehold ownership",
            "Only Indonesian citizens can hold Hak Milik",
            "Nominee arrangements are illegal & risky",
            "Courts have voided nominee agreements",
            "Use Hak Pakai or PT PMA structures instead"
          ]
        },
        {
          icon: Trees,
          name: "Agricultural Land (Hak Milik)",
          ownership: "Not Allowed for Foreigners",
          duration: "N/A",
          minValue: "N/A",
          status: "prohibited",
          color: "red",
          details: [
            "Rice fields, plantations protected by law",
            "Foreigners cannot own or lease agricultural land",
            "PT PMA can engage in agribusiness on HGU land",
            "Hak Guna Usaha (Right to Cultivate) available for companies",
            "Requires government allocation"
          ]
        }
      ],

      minimumValues: {
        title: "Regional Minimum Investment Values",
        subtitle: "Per Government Regulation (PP No. 18/2021)",
        regions: [
          { region: "Jakarta", house: "IDR 5B", apartment: "IDR 3B" },
          { region: "Bali", house: "IDR 5B", apartment: "IDR 2B" },
          { region: "Surabaya", house: "IDR 5B", apartment: "IDR 1.5B" },
          { region: "Bandung", house: "IDR 5B", apartment: "IDR 1B" },
          { region: "Other Regions", house: "IDR 5B", apartment: "IDR 1B" }
        ]
      },

      legalNote: "Property ownership rights and minimum values are subject to Indonesian government regulations which may be updated. Always verify current requirements with a licensed notary or legal professional."
    },
    id: {
      title: "Jenis Properti yang Memenuhi Syarat untuk Investor Asing",
      subtitle: "Hukum Indonesia (PP No. 18/2021 & Permen ATR/BPN No. 18/2021) menentukan properti yang dapat dimiliki WNA",
      
      propertyTypes: [
        {
          icon: Building,
          name: "Apartemen / Kondominium",
          ownership: "Hak Pakai",
          duration: "30 + 20 + 30 = 80 tahun",
          minValue: "IDR 1 Miliar",
          status: "allowed",
          color: "blue",
          details: [
            "Kepemilikan strata title tersedia",
            "Harus di area yang ditetapkan (zona PPJB)",
            "SHMSRS (Sertifikat Strata) disediakan",
            "Dapat diwariskan kepada keluarga",
            "Populer di Jakarta, Bali, Surabaya"
          ]
        },
        {
          icon: Home,
          name: "Rumah Landed / Villa",
          ownership: "Hak Pakai",
          duration: "30 + 20 + 30 = 80 tahun",
          minValue: "IDR 5 Miliar (bervariasi per wilayah)",
          status: "allowed",
          color: "green",
          details: [
            "Harus memiliki KITAS/KITAP atau izin tinggal valid",
            "Bangunan di atas tanah Hak Pakai saja",
            "Tidak bisa di tanah pertanian (Hak Milik)",
            "Minimum Bali: IDR 5M, Jakarta: bervariasi",
            "Tunduk pada persetujuan zona lokasi"
          ]
        },
        {
          icon: Hotel,
          name: "Properti Komersial (via PT PMA)",
          ownership: "Hak Guna Bangunan",
          duration: "30 + 20 + 20 = 70 tahun",
          minValue: "Minimum investasi IDR 10 Miliar",
          status: "allowed",
          color: "purple",
          details: [
            "Memerlukan PT PMA (Perusahaan Penanaman Modal Asing)",
            "Persyaratan modal disetor minimum",
            "Hotel, kantor, ritel diperbolehkan",
            "Persetujuan BKPM diperlukan",
            "NIB/Izin usaha wajib"
          ]
        },
        {
          icon: Building2,
          name: "Industri / Gudang",
          ownership: "Hak Guna Bangunan (via PT PMA)",
          duration: "30 + 20 + 20 = 70 tahun",
          minValue: "Sesuai rencana investasi",
          status: "allowed",
          color: "amber",
          details: [
            "Harus beroperasi melalui PT PMA",
            "Zona industri (Kawasan Industri) tersedia",
            "Kawasan Ekonomi Khusus (KEK) menawarkan insentif",
            "Izin lingkungan (AMDAL) mungkin diperlukan",
            "Cocok untuk operasi manufaktur"
          ]
        },
        {
          icon: Landmark,
          name: "Tanah Hak Milik (Freehold)",
          ownership: "Tidak Diizinkan untuk WNA",
          duration: "N/A",
          minValue: "N/A",
          status: "prohibited",
          color: "red",
          details: [
            "Hukum Indonesia melarang kepemilikan freehold WNA",
            "Hanya WNI dapat memegang Hak Milik",
            "Pengaturan nominee ilegal & berisiko",
            "Pengadilan telah membatalkan perjanjian nominee",
            "Gunakan struktur Hak Pakai atau PT PMA"
          ]
        },
        {
          icon: Trees,
          name: "Tanah Pertanian (Hak Milik)",
          ownership: "Tidak Diizinkan untuk WNA",
          duration: "N/A",
          minValue: "N/A",
          status: "prohibited",
          color: "red",
          details: [
            "Sawah, perkebunan dilindungi undang-undang",
            "WNA tidak dapat memiliki atau menyewa tanah pertanian",
            "PT PMA dapat bergerak di agribisnis di tanah HGU",
            "Hak Guna Usaha tersedia untuk perusahaan",
            "Memerlukan alokasi pemerintah"
          ]
        }
      ],

      minimumValues: {
        title: "Nilai Investasi Minimum Regional",
        subtitle: "Sesuai Peraturan Pemerintah (PP No. 18/2021)",
        regions: [
          { region: "Jakarta", house: "IDR 5M", apartment: "IDR 3M" },
          { region: "Bali", house: "IDR 5M", apartment: "IDR 2M" },
          { region: "Surabaya", house: "IDR 5M", apartment: "IDR 1.5M" },
          { region: "Bandung", house: "IDR 5M", apartment: "IDR 1M" },
          { region: "Wilayah Lain", house: "IDR 5M", apartment: "IDR 1M" }
        ]
      },

      legalNote: "Hak kepemilikan properti dan nilai minimum tunduk pada peraturan pemerintah Indonesia yang dapat diperbarui. Selalu verifikasi persyaratan saat ini dengan notaris atau profesional hukum berlisensi."
    }
  };

  const t = copy[language];

  const colorClasses = {
    blue: { bg: 'bg-chart-4/10', text: 'text-chart-4', border: 'border-chart-4/20' },
    green: { bg: 'bg-chart-1/10', text: 'text-chart-1', border: 'border-chart-1/20' },
    purple: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
    amber: { bg: 'bg-chart-3/10', text: 'text-chart-3', border: 'border-chart-3/20' },
    red: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-accent" />
          <h3 className="text-sm sm:text-base font-bold text-foreground">{t.title}</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Property Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {t.propertyTypes.map((property, idx) => {
          const Icon = property.icon;
          const colors = colorClasses[property.color as keyof typeof colorClasses];
          const isProhibited = property.status === 'prohibited';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "rounded-lg p-3 transition-all duration-200",
                "bg-card/60 dark:bg-muted/10",
                "border-2",
                isProhibited 
                  ? "border-destructive/30" 
                  : "border-border/50 hover:border-accent/40"
              )}
            >
              {/* Header */}
              <div className="flex items-start gap-2 mb-2">
                <div className={cn("p-2 rounded-lg", colors.bg)}>
                  <Icon className={cn("h-5 w-5", colors.text)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">{property.name}</h4>
                    {isProhibited ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-chart-1" />
                    )}
                  </div>
                  <p className={cn("text-[10px] sm:text-xs", colors.text)}>{property.ownership}</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 gap-1">
                  <Info className="h-2.5 w-2.5" />
                  {property.duration}
                </Badge>
                {!isProhibited && (
                  <Badge className={cn("text-[9px] px-1.5 py-0.5 gap-1", colors.bg, colors.text, "border-0")}>
                    <DollarSign className="h-2.5 w-2.5" />
                    {property.minValue}
                  </Badge>
                )}
              </div>

              {/* Details List */}
              <div className="space-y-1">
                {property.details.map((detail, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <div className={cn("w-1 h-1 rounded-full mt-1.5 flex-shrink-0", isProhibited ? "bg-destructive" : "bg-accent")} />
                    <span className="text-[9px] sm:text-[10px] text-foreground/80">{detail}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Minimum Values Table */}
      <div className={cn(
        "rounded-lg p-3",
        "bg-card/60 dark:bg-muted/10",
        "border-2 border-accent/30"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-accent" />
          <h4 className="text-xs sm:text-sm font-bold text-foreground">{t.minimumValues.title}</h4>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">{t.minimumValues.subtitle}</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-1.5 px-2 text-[10px] font-semibold text-foreground">{language === 'en' ? 'Region' : 'Wilayah'}</th>
                <th className="text-center py-1.5 px-2 text-[10px] font-semibold text-foreground">{language === 'en' ? 'House/Villa' : 'Rumah/Villa'}</th>
                <th className="text-center py-1.5 px-2 text-[10px] font-semibold text-foreground">{language === 'en' ? 'Apartment' : 'Apartemen'}</th>
              </tr>
            </thead>
            <tbody>
              {t.minimumValues.regions.map((row, idx) => (
                <tr key={idx} className="border-b border-border/30 last:border-0">
                  <td className="py-1.5 px-2 text-[10px] font-medium text-foreground">{row.region}</td>
                  <td className="py-1.5 px-2 text-[10px] text-center text-muted-foreground">{row.house}</td>
                  <td className="py-1.5 px-2 text-[10px] text-center text-muted-foreground">{row.apartment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal Note */}
      <div className="p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-chart-3 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-xs text-chart-3">{t.legalNote}</p>
        </div>
      </div>
    </div>
  );
};

export default WNAPropertyTypes;
