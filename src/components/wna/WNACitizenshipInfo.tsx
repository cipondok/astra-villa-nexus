import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Flag, 
  Users, 
  Clock, 
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Globe,
  Building2,
  Heart,
  GraduationCap,
  Briefcase,
  Home,
  Baby
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const WNACitizenshipInfo: React.FC = () => {
  const { language } = useLanguage();
  const [expandedPath, setExpandedPath] = useState<string | null>('investment');

  const copy = {
    en: {
      title: "Citizenship & Permanent Residency in Indonesia",
      subtitle: "Understanding pathways to long-term stay and naturalization under Indonesian law",
      
      importantNote: "Indonesia does NOT grant citizenship through property investment alone. Property ownership provides residency pathways, but naturalization requires additional criteria.",

      pathways: [
        {
          id: 'investment',
          icon: Building2,
          title: "Investment Residency (KITAS Investor)",
          color: "blue",
          eligible: true,
          description: "Property investment qualifies you for investor visa/stay permit",
          requirements: [
            "Minimum property investment as per regulations",
            "Valid passport with 18+ months validity",
            "Clean criminal record from home country",
            "Health certificate",
            "Proof of funds/financial capability",
            "Investment documentation and property certificate"
          ],
          duration: "1-2 years initially, renewable",
          benefits: [
            "Legal long-term residence in Indonesia",
            "Multiple entry/exit without separate visa",
            "Can conduct business activities",
            "Path to KITAP (Permanent Stay Permit) after years of KITAS",
            "Family sponsorship for spouse and children"
          ]
        },
        {
          id: 'secondhome',
          icon: Home,
          title: "Second Home Visa",
          color: "green",
          eligible: true,
          description: "Long-term visa for property owners and high-net-worth individuals",
          requirements: [
            "Property ownership or rental agreement",
            "Proof of USD 130,000+ in liquid assets",
            "Health insurance valid in Indonesia",
            "Clean criminal background",
            "Property investment in designated areas"
          ],
          duration: "5-10 years, renewable",
          benefits: [
            "Extended stay without KITAS paperwork",
            "Multiple entries allowed",
            "Can bring family members",
            "Less bureaucracy than traditional work permits",
            "Access to banking and local services"
          ]
        },
        {
          id: 'marriage',
          icon: Heart,
          title: "Marriage to Indonesian Citizen",
          color: "rose",
          eligible: true,
          description: "Naturalization through marriage is a recognized pathway",
          requirements: [
            "Valid marriage to Indonesian citizen (5+ years)",
            "Continuous residence in Indonesia",
            "Indonesian language proficiency (Bahasa Indonesia)",
            "Knowledge of Pancasila and Constitution",
            "Renounce previous citizenship (Indonesia doesn't allow dual)",
            "No criminal record"
          ],
          duration: "5+ years of marriage required",
          benefits: [
            "Full Indonesian citizenship rights",
            "Can own Hak Milik (freehold) property",
            "Voting rights",
            "No visa/permit renewals needed",
            "Children born are automatic citizens"
          ]
        },
        {
          id: 'naturalization',
          icon: Flag,
          title: "General Naturalization",
          color: "purple",
          eligible: true,
          description: "Standard citizenship application for long-term residents",
          requirements: [
            "Minimum 5 consecutive years residence on KITAP",
            "Age 18+ years old",
            "Fluent in Bahasa Indonesia",
            "Knowledge of Indonesian history and Pancasila",
            "Stable income/employment in Indonesia",
            "Must renounce all other citizenships",
            "No criminal record",
            "Good physical and mental health"
          ],
          duration: "5+ years of permanent residency",
          benefits: [
            "Full citizen rights and protections",
            "Property ownership without restrictions",
            "Business ownership without foreign capital rules",
            "Social security and healthcare access",
            "Cannot be deported"
          ]
        },
        {
          id: 'exceptional',
          icon: GraduationCap,
          title: "Exceptional Merit",
          color: "amber",
          eligible: true,
          description: "Citizenship granted for extraordinary contributions to Indonesia",
          requirements: [
            "Exceptional contribution to science, technology, culture, sports",
            "Significant investment creating employment",
            "Presidential decree approval required",
            "Demonstrated commitment to Indonesia",
            "Case-by-case evaluation"
          ],
          duration: "Varies by case",
          benefits: [
            "Fast-track naturalization",
            "Recognition of contributions",
            "Full citizenship rights",
            "Some cases may allow dual citizenship (very rare)"
          ]
        }
      ],

      cannotObtain: {
        title: "What Property Investment Does NOT Provide",
        items: [
          "Automatic citizenship or passport",
          "Right to vote in elections",
          "Right to work without proper permits",
          "Ownership of Hak Milik (freehold) land",
          "Ability to keep dual citizenship (Indonesia requires renunciation)"
        ]
      },

      process: {
        title: "Naturalization Process Overview",
        steps: [
          { step: "1", title: "KITAS Application", desc: "Start with investor or other visa category" },
          { step: "2", title: "Maintain Residence", desc: "Live continuously for 5+ years" },
          { step: "3", title: "Apply for KITAP", desc: "Convert to Permanent Stay Permit" },
          { step: "4", title: "Citizenship Application", desc: "Submit to Ministry of Law & Human Rights" },
          { step: "5", title: "Interview & Testing", desc: "Language, history, Pancasila assessment" },
          { step: "6", title: "Presidential Decree", desc: "Final approval for naturalization" }
        ]
      },

      disclaimer: "Indonesian citizenship law is governed by UU No. 12/2006. Regulations may change, and individual cases vary. Consult an immigration lawyer for personalized advice."
    },
    id: {
      title: "Kewarganegaraan & Izin Tinggal Tetap di Indonesia",
      subtitle: "Memahami jalur tinggal jangka panjang dan naturalisasi berdasarkan hukum Indonesia",
      
      importantNote: "Indonesia TIDAK memberikan kewarganegaraan melalui investasi properti saja. Kepemilikan properti menyediakan jalur residensi, tetapi naturalisasi memerlukan kriteria tambahan.",

      pathways: [
        {
          id: 'investment',
          icon: Building2,
          title: "Residensi Investasi (KITAS Investor)",
          color: "blue",
          eligible: true,
          description: "Investasi properti memenuhi syarat untuk visa/izin tinggal investor",
          requirements: [
            "Investasi properti minimum sesuai regulasi",
            "Paspor valid dengan masa berlaku 18+ bulan",
            "Catatan kriminal bersih dari negara asal",
            "Sertifikat kesehatan",
            "Bukti dana/kemampuan finansial",
            "Dokumentasi investasi dan sertifikat properti"
          ],
          duration: "1-2 tahun awal, dapat diperpanjang",
          benefits: [
            "Residensi legal jangka panjang di Indonesia",
            "Multiple entry/exit tanpa visa terpisah",
            "Dapat melakukan aktivitas bisnis",
            "Jalur ke KITAP setelah bertahun-tahun KITAS",
            "Sponsor keluarga untuk pasangan dan anak"
          ]
        },
        {
          id: 'secondhome',
          icon: Home,
          title: "Visa Second Home",
          color: "green",
          eligible: true,
          description: "Visa jangka panjang untuk pemilik properti dan individu berkekayaan tinggi",
          requirements: [
            "Kepemilikan properti atau perjanjian sewa",
            "Bukti USD 130,000+ aset likuid",
            "Asuransi kesehatan valid di Indonesia",
            "Latar belakang kriminal bersih",
            "Investasi properti di area yang ditetapkan"
          ],
          duration: "5-10 tahun, dapat diperpanjang",
          benefits: [
            "Tinggal lama tanpa dokumen KITAS",
            "Multiple entry diperbolehkan",
            "Dapat membawa anggota keluarga",
            "Birokrasi lebih sedikit dari izin kerja tradisional",
            "Akses perbankan dan layanan lokal"
          ]
        },
        {
          id: 'marriage',
          icon: Heart,
          title: "Pernikahan dengan WNI",
          color: "rose",
          eligible: true,
          description: "Naturalisasi melalui pernikahan adalah jalur yang diakui",
          requirements: [
            "Pernikahan sah dengan WNI (5+ tahun)",
            "Tinggal terus-menerus di Indonesia",
            "Kemampuan Bahasa Indonesia",
            "Pengetahuan Pancasila dan Konstitusi",
            "Melepaskan kewarganegaraan sebelumnya",
            "Tidak ada catatan kriminal"
          ],
          duration: "5+ tahun pernikahan diperlukan",
          benefits: [
            "Hak kewarganegaraan Indonesia penuh",
            "Dapat memiliki properti Hak Milik",
            "Hak suara",
            "Tidak perlu perpanjangan visa/izin",
            "Anak yang lahir otomatis WNI"
          ]
        },
        {
          id: 'naturalization',
          icon: Flag,
          title: "Naturalisasi Umum",
          color: "purple",
          eligible: true,
          description: "Aplikasi kewarganegaraan standar untuk penduduk jangka panjang",
          requirements: [
            "Minimum 5 tahun berturut-turut tinggal dengan KITAP",
            "Usia 18+ tahun",
            "Fasih berbahasa Indonesia",
            "Pengetahuan sejarah Indonesia dan Pancasila",
            "Penghasilan/pekerjaan stabil di Indonesia",
            "Harus melepaskan semua kewarganegaraan lain",
            "Tidak ada catatan kriminal",
            "Kesehatan fisik dan mental baik"
          ],
          duration: "5+ tahun izin tinggal tetap",
          benefits: [
            "Hak warga negara penuh dan perlindungan",
            "Kepemilikan properti tanpa batasan",
            "Kepemilikan bisnis tanpa aturan modal asing",
            "Akses jaminan sosial dan kesehatan",
            "Tidak dapat dideportasi"
          ]
        },
        {
          id: 'exceptional',
          icon: GraduationCap,
          title: "Jasa Luar Biasa",
          color: "amber",
          eligible: true,
          description: "Kewarganegaraan diberikan untuk kontribusi luar biasa ke Indonesia",
          requirements: [
            "Kontribusi luar biasa untuk sains, teknologi, budaya, olahraga",
            "Investasi signifikan menciptakan lapangan kerja",
            "Persetujuan dekrit presiden diperlukan",
            "Komitmen yang ditunjukkan kepada Indonesia",
            "Evaluasi kasus per kasus"
          ],
          duration: "Bervariasi per kasus",
          benefits: [
            "Naturalisasi jalur cepat",
            "Pengakuan kontribusi",
            "Hak kewarganegaraan penuh",
            "Beberapa kasus mungkin mengizinkan dwi kewarganegaraan (sangat jarang)"
          ]
        }
      ],

      cannotObtain: {
        title: "Apa yang TIDAK Diberikan Investasi Properti",
        items: [
          "Kewarganegaraan atau paspor otomatis",
          "Hak suara dalam pemilu",
          "Hak bekerja tanpa izin yang tepat",
          "Kepemilikan tanah Hak Milik",
          "Kemampuan mempertahankan dwi kewarganegaraan"
        ]
      },

      process: {
        title: "Gambaran Proses Naturalisasi",
        steps: [
          { step: "1", title: "Aplikasi KITAS", desc: "Mulai dengan kategori visa investor atau lainnya" },
          { step: "2", title: "Pertahankan Residensi", desc: "Tinggal terus-menerus 5+ tahun" },
          { step: "3", title: "Ajukan KITAP", desc: "Konversi ke Izin Tinggal Tetap" },
          { step: "4", title: "Aplikasi Kewarganegaraan", desc: "Kirim ke Kemenkumham" },
          { step: "5", title: "Wawancara & Tes", desc: "Penilaian bahasa, sejarah, Pancasila" },
          { step: "6", title: "Keputusan Presiden", desc: "Persetujuan akhir naturalisasi" }
        ]
      },

      disclaimer: "Hukum kewarganegaraan Indonesia diatur oleh UU No. 12/2006. Regulasi dapat berubah, dan kasus individual bervariasi. Konsultasikan dengan pengacara imigrasi untuk saran yang dipersonalisasi."
    }
  };

  const t = copy[language];

  const colorClasses = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400' }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Flag className="h-5 w-5 text-accent" />
          <h3 className="text-sm sm:text-base font-bold text-foreground">{t.title}</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Important Note */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">{t.importantNote}</p>
        </div>
      </div>

      {/* Pathways */}
      <div className="space-y-2">
        {t.pathways.map((pathway) => {
          const Icon = pathway.icon;
          const colors = colorClasses[pathway.color as keyof typeof colorClasses];
          const isExpanded = expandedPath === pathway.id;

          return (
            <motion.div
              key={pathway.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-lg overflow-hidden transition-all duration-200",
                "bg-white/60 dark:bg-white/5",
                "border-2",
                isExpanded ? "border-accent/50 shadow-md" : "border-border/50"
              )}
            >
              <button
                onClick={() => setExpandedPath(isExpanded ? null : pathway.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className={cn("p-2 rounded-lg", colors.bg)}>
                  <Icon className={cn("h-5 w-5", colors.text)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">{pathway.title}</h4>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      {pathway.duration}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{pathway.description}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-3 pb-3"
                  >
                    <div className="grid md:grid-cols-2 gap-3 ml-12">
                      {/* Requirements */}
                      <div className="p-2.5 rounded-lg bg-muted/30">
                        <h5 className="text-[10px] sm:text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {language === 'en' ? 'Requirements' : 'Persyaratan'}
                        </h5>
                        <div className="space-y-1">
                          {pathway.requirements.map((req, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-[9px] sm:text-[10px] text-foreground/80">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className={cn("p-2.5 rounded-lg", colors.bg, "bg-opacity-30")}>
                        <h5 className="text-[10px] sm:text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          {language === 'en' ? 'Benefits' : 'Manfaat'}
                        </h5>
                        <div className="space-y-1">
                          {pathway.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <div className={cn("w-1 h-1 rounded-full mt-1.5 flex-shrink-0", colors.text.replace('text-', 'bg-'))} />
                              <span className="text-[9px] sm:text-[10px] text-foreground/80">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* What Investment Cannot Provide */}
      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
        <h4 className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          {t.cannotObtain.title}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {t.cannotObtain.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <XCircle className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-[10px] sm:text-xs text-red-700 dark:text-red-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Naturalization Process */}
      <div className={cn(
        "rounded-lg p-3",
        "bg-white/60 dark:bg-white/5",
        "border-2 border-accent/30"
      )}>
        <h4 className="text-xs sm:text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent" />
          {t.process.title}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {t.process.steps.map((step, idx) => (
            <div key={idx} className="text-center p-2 rounded-lg bg-muted/30 relative">
              <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                {step.step}
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold text-foreground">{step.title}</p>
              <p className="text-[8px] text-muted-foreground">{step.desc}</p>
              {idx < t.process.steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-1 w-2 h-0.5 bg-accent/50" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
        <p className="text-[10px] sm:text-xs text-muted-foreground">{t.disclaimer}</p>
      </div>
    </div>
  );
};

export default WNACitizenshipInfo;
