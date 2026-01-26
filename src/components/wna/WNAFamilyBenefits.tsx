import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Heart, 
  GraduationCap, 
  Baby,
  Briefcase,
  Home,
  Hospital,
  Shield,
  CheckCircle,
  Clock,
  FileText,
  Plane,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Star,
  BookOpen,
  Stethoscope,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const WNAFamilyBenefits: React.FC = () => {
  const { language } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>('spouse');

  const copy = {
    en: {
      title: "Family Benefits for Foreign Investors",
      subtitle: "Your investment opens doors for your entire family to live, study, and thrive in Indonesia",
      
      importantNote: "As a primary investor with KITAS/KITAP, you can sponsor your spouse and dependent children for residence permits, giving your family full access to Indonesian life.",

      familyMembers: [
        {
          id: 'spouse',
          icon: Heart,
          title: "Spouse / Partner",
          color: "rose",
          visaType: "KITAS Dependent (Index 317)",
          duration: "Same as primary holder",
          description: "Your legally married spouse can obtain a dependent visa tied to your investor permit",
          requirements: [
            "Valid marriage certificate (apostilled/legalized)",
            "Primary investor must have active KITAS/KITAP",
            "Spouse's valid passport (18+ months validity)",
            "Health certificate from approved hospital",
            "Sponsor guarantee letter from primary holder",
            "Police clearance from home country"
          ],
          benefits: [
            "Legal residence in Indonesia with you",
            "Multiple entry/exit without separate visa",
            "Access to Indonesian banking services",
            "Can open local bank account in own name",
            "Access to healthcare and hospitals",
            "Can join social clubs and organizations",
            "Can apply for driver's license (SIM)",
            "Path to KITAP after 3 years on KITAS"
          ],
          restrictions: [
            "Cannot work without separate work permit (IMTA)",
            "Must renew when primary holder renews",
            "Must leave if primary holder's visa is revoked"
          ]
        },
        {
          id: 'children',
          icon: Baby,
          title: "Dependent Children",
          color: "blue",
          visaType: "KITAS Dependent (Index 317)",
          duration: "Same as primary holder (until age 18)",
          description: "Children under 18 can be included as dependents on your investor permit",
          requirements: [
            "Birth certificate (apostilled/legalized)",
            "Child's valid passport",
            "Proof of relationship to primary holder",
            "Health certificate for children",
            "School enrollment letter (if applicable)",
            "Both parents' consent if one parent not present"
          ],
          benefits: [
            "Legal residence in Indonesia with family",
            "Full access to education (see Education tab)",
            "Access to pediatric healthcare",
            "Can participate in sports and activities",
            "Indonesian language immersion opportunity",
            "Cultural integration from young age",
            "Path to own independent visa at age 18"
          ],
          restrictions: [
            "Dependents only until age 18",
            "Must apply for own visa when turning 18",
            "Tied to primary holder's visa status"
          ]
        },
        {
          id: 'education',
          icon: GraduationCap,
          title: "Children's Education in Indonesia",
          color: "green",
          visaType: "Student Visa or Dependent KITAS",
          duration: "Academic year aligned",
          description: "Indonesia offers excellent international and national schools for expat children",
          requirements: [
            "Valid dependent KITAS or student visa",
            "Previous school records/transcripts",
            "Health and immunization records",
            "School application and entrance tests",
            "Tuition fee payment (varies by school)",
            "Some schools require parent interview"
          ],
          benefits: [
            "Access to international schools (IB, Cambridge, American curriculum)",
            "National Plus schools (Indonesian + international)",
            "Islamic international schools available",
            "Montessori and alternative education options",
            "Multicultural environment and global friendships",
            "Many schools offer scholarships",
            "University pathway programs available",
            "Bahasa Indonesia language learning"
          ],
          schoolTypes: [
            { type: "International Schools", examples: "JIS, BSJ, AIS, GIS", fees: "IDR 150M - 500M/year" },
            { type: "National Plus", examples: "SPH, ACG, Binus", fees: "IDR 50M - 200M/year" },
            { type: "Local International", examples: "Various SPK schools", fees: "IDR 30M - 100M/year" },
            { type: "Public Schools", examples: "SD/SMP/SMA Negeri", fees: "Minimal (for residents)" }
          ]
        },
        {
          id: 'healthcare',
          icon: Stethoscope,
          title: "Family Healthcare Access",
          color: "purple",
          visaType: "All KITAS/KITAP holders",
          duration: "Duration of stay",
          description: "Quality healthcare is available for your entire family in Indonesia",
          requirements: [
            "Valid KITAS/KITAP for all family members",
            "Health insurance (mandatory for visa)",
            "NPWP for BPJS enrollment (optional)",
            "Hospital registration"
          ],
          benefits: [
            "Access to world-class private hospitals",
            "International standard healthcare in major cities",
            "English-speaking doctors and staff available",
            "BPJS Kesehatan enrollment possible for KITAP holders",
            "Affordable private healthcare compared to Western countries",
            "Specialist care and pediatric hospitals",
            "Dental and optical care widely available",
            "Medical tourism quality at local prices"
          ],
          hospitals: [
            "Siloam Hospitals (nationwide)",
            "RS Pondok Indah (Jakarta)",
            "BIMC Hospital (Bali)",
            "Raffles Medical (Jakarta)",
            "Mayapada Hospital (Jakarta)",
            "RSPI (Rumah Sakit Pertamina)"
          ]
        },
        {
          id: 'workrights',
          icon: Briefcase,
          title: "Spouse Work Rights",
          color: "amber",
          visaType: "Separate Work Permit Required",
          duration: "Per work permit terms",
          description: "While dependent visa doesn't include work rights, options exist for working spouses",
          requirements: [
            "Job offer from Indonesian company",
            "Employer sponsors IMTA (work permit)",
            "Educational qualifications proof",
            "Relevant work experience",
            "Health certificate",
            "Company registration with BKPM"
          ],
          benefits: [
            "Can work legally with proper IMTA",
            "Freelance/remote work for overseas clients (gray area)",
            "Can start own PT PMA business",
            "Teaching positions at international schools",
            "Can volunteer at NGOs and foundations",
            "Can be director of family PT PMA",
            "Online business opportunities"
          ],
          workOptions: [
            { option: "Corporate Employment", requirement: "IMTA + KITAS Kerja from employer" },
            { option: "Own Business (PT PMA)", requirement: "Minimum investment + business license" },
            { option: "Teaching/Education", requirement: "IMTA sponsored by school" },
            { option: "Remote Work", requirement: "For overseas clients only (tax considerations)" }
          ]
        }
      ],

      visaProcess: {
        title: "Family KITAS Application Process",
        steps: [
          { step: "1", title: "Primary Visa First", desc: "Investor obtains KITAS/KITAP as main applicant" },
          { step: "2", title: "Gather Documents", desc: "Collect family certificates, passports, photos" },
          { step: "3", title: "Immigration Application", desc: "Submit dependent applications to Imigrasi" },
          { step: "4", title: "Biometrics", desc: "All family members complete biometric registration" },
          { step: "5", title: "Approval & Cards", desc: "KITAS cards issued (1-2 weeks processing)" },
          { step: "6", title: "SKTT Registration", desc: "Local police registration for all members" }
        ]
      },

      costs: {
        title: "Family Visa Costs (Approximate)",
        items: [
          { item: "Spouse KITAS (1 year)", cost: "IDR 3-5 million" },
          { item: "Child KITAS (1 year, each)", cost: "IDR 2-4 million" },
          { item: "SKTT Registration (each)", cost: "IDR 200-500k" },
          { item: "STM (Exit Permit, each)", cost: "IDR 300k" },
          { item: "Agent/Consultant Fees", cost: "IDR 5-15 million (optional)" }
        ],
        note: "Fees subject to change. Using licensed immigration consultant recommended for smooth processing."
      },

      disclaimer: "Family visa regulations are governed by Indonesian Immigration Law (UU No. 6/2011) and may change. Individual circumstances vary. Consult with a licensed immigration consultant for personalized guidance."
    },
    id: {
      title: "Manfaat Keluarga untuk Investor Asing",
      subtitle: "Investasi Anda membuka pintu bagi seluruh keluarga untuk tinggal, belajar, dan berkembang di Indonesia",
      
      importantNote: "Sebagai investor utama dengan KITAS/KITAP, Anda dapat mensponsori pasangan dan anak-anak tanggungan untuk izin tinggal, memberikan akses penuh ke kehidupan di Indonesia.",

      familyMembers: [
        {
          id: 'spouse',
          icon: Heart,
          title: "Pasangan / Suami/Istri",
          color: "rose",
          visaType: "KITAS Tanggungan (Index 317)",
          duration: "Sama dengan pemegang utama",
          description: "Pasangan yang menikah sah dapat memperoleh visa tanggungan terkait izin investor Anda",
          requirements: [
            "Akta nikah yang sah (apostille/legalisir)",
            "Investor utama harus memiliki KITAS/KITAP aktif",
            "Paspor pasangan yang valid (18+ bulan)",
            "Sertifikat kesehatan dari rumah sakit yang disetujui",
            "Surat jaminan sponsor dari pemegang utama",
            "Surat keterangan bebas catatan kriminal"
          ],
          benefits: [
            "Tinggal legal di Indonesia bersama Anda",
            "Multiple entry/exit tanpa visa terpisah",
            "Akses layanan perbankan Indonesia",
            "Dapat membuka rekening bank atas nama sendiri",
            "Akses kesehatan dan rumah sakit",
            "Dapat bergabung klub sosial dan organisasi",
            "Dapat mengajukan SIM",
            "Jalur ke KITAP setelah 3 tahun KITAS"
          ],
          restrictions: [
            "Tidak dapat bekerja tanpa izin kerja terpisah (IMTA)",
            "Harus diperpanjang saat pemegang utama perpanjang",
            "Harus keluar jika visa pemegang utama dicabut"
          ]
        },
        {
          id: 'children',
          icon: Baby,
          title: "Anak Tanggungan",
          color: "blue",
          visaType: "KITAS Tanggungan (Index 317)",
          duration: "Sama dengan pemegang utama (hingga usia 18)",
          description: "Anak di bawah 18 tahun dapat dimasukkan sebagai tanggungan pada izin investor Anda",
          requirements: [
            "Akta kelahiran (apostille/legalisir)",
            "Paspor anak yang valid",
            "Bukti hubungan dengan pemegang utama",
            "Sertifikat kesehatan untuk anak",
            "Surat pendaftaran sekolah (jika ada)",
            "Persetujuan kedua orang tua jika salah satu tidak hadir"
          ],
          benefits: [
            "Tinggal legal di Indonesia bersama keluarga",
            "Akses penuh ke pendidikan (lihat tab Pendidikan)",
            "Akses kesehatan anak",
            "Dapat berpartisipasi dalam olahraga dan kegiatan",
            "Kesempatan imersi bahasa Indonesia",
            "Integrasi budaya sejak usia dini",
            "Jalur ke visa mandiri pada usia 18"
          ],
          restrictions: [
            "Tanggungan hanya sampai usia 18",
            "Harus mengajukan visa sendiri saat berusia 18",
            "Terikat status visa pemegang utama"
          ]
        },
        {
          id: 'education',
          icon: GraduationCap,
          title: "Pendidikan Anak di Indonesia",
          color: "green",
          visaType: "Visa Pelajar atau KITAS Tanggungan",
          duration: "Selaras tahun akademik",
          description: "Indonesia menawarkan sekolah internasional dan nasional yang sangat baik untuk anak ekspatriat",
          requirements: [
            "KITAS tanggungan atau visa pelajar yang valid",
            "Catatan/transkrip sekolah sebelumnya",
            "Catatan kesehatan dan imunisasi",
            "Aplikasi dan tes masuk sekolah",
            "Pembayaran biaya kuliah (bervariasi)",
            "Beberapa sekolah memerlukan wawancara orang tua"
          ],
          benefits: [
            "Akses ke sekolah internasional (IB, Cambridge, kurikulum Amerika)",
            "Sekolah National Plus (Indonesia + internasional)",
            "Sekolah internasional Islam tersedia",
            "Opsi pendidikan Montessori dan alternatif",
            "Lingkungan multikultural dan persahabatan global",
            "Banyak sekolah menawarkan beasiswa",
            "Program jalur universitas tersedia",
            "Pembelajaran Bahasa Indonesia"
          ],
          schoolTypes: [
            { type: "Sekolah Internasional", examples: "JIS, BSJ, AIS, GIS", fees: "IDR 150M - 500M/tahun" },
            { type: "National Plus", examples: "SPH, ACG, Binus", fees: "IDR 50M - 200M/tahun" },
            { type: "Lokal Internasional", examples: "Berbagai sekolah SPK", fees: "IDR 30M - 100M/tahun" },
            { type: "Sekolah Negeri", examples: "SD/SMP/SMA Negeri", fees: "Minimal (untuk penduduk)" }
          ]
        },
        {
          id: 'healthcare',
          icon: Stethoscope,
          title: "Akses Kesehatan Keluarga",
          color: "purple",
          visaType: "Semua pemegang KITAS/KITAP",
          duration: "Durasi tinggal",
          description: "Layanan kesehatan berkualitas tersedia untuk seluruh keluarga Anda di Indonesia",
          requirements: [
            "KITAS/KITAP valid untuk semua anggota keluarga",
            "Asuransi kesehatan (wajib untuk visa)",
            "NPWP untuk pendaftaran BPJS (opsional)",
            "Registrasi rumah sakit"
          ],
          benefits: [
            "Akses ke rumah sakit swasta kelas dunia",
            "Standar kesehatan internasional di kota besar",
            "Dokter dan staf berbahasa Inggris tersedia",
            "Pendaftaran BPJS Kesehatan untuk pemegang KITAP",
            "Biaya kesehatan swasta terjangkau dibanding negara Barat",
            "Perawatan spesialis dan rumah sakit anak",
            "Perawatan gigi dan mata tersedia luas",
            "Kualitas wisata medis dengan harga lokal"
          ],
          hospitals: [
            "Siloam Hospitals (nasional)",
            "RS Pondok Indah (Jakarta)",
            "BIMC Hospital (Bali)",
            "Raffles Medical (Jakarta)",
            "Mayapada Hospital (Jakarta)",
            "RSPI (Rumah Sakit Pertamina)"
          ]
        },
        {
          id: 'workrights',
          icon: Briefcase,
          title: "Hak Kerja Pasangan",
          color: "amber",
          visaType: "Izin Kerja Terpisah Diperlukan",
          duration: "Sesuai ketentuan izin kerja",
          description: "Meskipun visa tanggungan tidak termasuk hak kerja, ada opsi untuk pasangan yang ingin bekerja",
          requirements: [
            "Tawaran kerja dari perusahaan Indonesia",
            "Pemberi kerja mensponsori IMTA (izin kerja)",
            "Bukti kualifikasi pendidikan",
            "Pengalaman kerja yang relevan",
            "Sertifikat kesehatan",
            "Registrasi perusahaan dengan BKPM"
          ],
          benefits: [
            "Dapat bekerja secara legal dengan IMTA yang tepat",
            "Freelance/kerja remote untuk klien luar negeri",
            "Dapat memulai bisnis PT PMA sendiri",
            "Posisi mengajar di sekolah internasional",
            "Dapat menjadi sukarelawan di NGO dan yayasan",
            "Dapat menjadi direktur PT PMA keluarga",
            "Peluang bisnis online"
          ],
          workOptions: [
            { option: "Karyawan Perusahaan", requirement: "IMTA + KITAS Kerja dari pemberi kerja" },
            { option: "Bisnis Sendiri (PT PMA)", requirement: "Investasi minimum + izin usaha" },
            { option: "Mengajar/Pendidikan", requirement: "IMTA disponsori sekolah" },
            { option: "Kerja Remote", requirement: "Untuk klien luar negeri saja (pertimbangan pajak)" }
          ]
        }
      ],

      visaProcess: {
        title: "Proses Aplikasi KITAS Keluarga",
        steps: [
          { step: "1", title: "Visa Utama Dulu", desc: "Investor memperoleh KITAS/KITAP sebagai pemohon utama" },
          { step: "2", title: "Kumpulkan Dokumen", desc: "Kumpulkan sertifikat keluarga, paspor, foto" },
          { step: "3", title: "Aplikasi Imigrasi", desc: "Ajukan aplikasi tanggungan ke Imigrasi" },
          { step: "4", title: "Biometrik", desc: "Semua anggota keluarga lengkapi registrasi biometrik" },
          { step: "5", title: "Persetujuan & Kartu", desc: "Kartu KITAS diterbitkan (proses 1-2 minggu)" },
          { step: "6", title: "Registrasi SKTT", desc: "Registrasi polisi lokal untuk semua anggota" }
        ]
      },

      costs: {
        title: "Biaya Visa Keluarga (Perkiraan)",
        items: [
          { item: "KITAS Pasangan (1 tahun)", cost: "IDR 3-5 juta" },
          { item: "KITAS Anak (1 tahun, masing-masing)", cost: "IDR 2-4 juta" },
          { item: "Registrasi SKTT (masing-masing)", cost: "IDR 200-500rb" },
          { item: "STM (Izin Keluar, masing-masing)", cost: "IDR 300rb" },
          { item: "Biaya Agen/Konsultan", cost: "IDR 5-15 juta (opsional)" }
        ],
        note: "Biaya dapat berubah. Disarankan menggunakan konsultan imigrasi berlisensi untuk proses lancar."
      },

      disclaimer: "Regulasi visa keluarga diatur oleh Undang-Undang Imigrasi Indonesia (UU No. 6/2011) dan dapat berubah. Keadaan individual bervariasi. Konsultasikan dengan konsultan imigrasi berlisensi untuk panduan yang dipersonalisasi."
    }
  };

  const t = copy[language];

  const colorClasses = {
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400' }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Users className="h-5 w-5 text-accent" />
          <h3 className="text-sm sm:text-base font-bold text-foreground">{t.title}</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Important Note */}
      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-700">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">{t.importantNote}</p>
        </div>
      </div>

      {/* Family Members Sections */}
      <div className="space-y-2">
        {t.familyMembers.map((member) => {
          const Icon = member.icon;
          const colors = colorClasses[member.color as keyof typeof colorClasses];
          const isExpanded = expandedSection === member.id;

          return (
            <motion.div
              key={member.id}
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
                onClick={() => setExpandedSection(isExpanded ? null : member.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className={cn("p-2 rounded-lg", colors.bg)}>
                  <Icon className={cn("h-5 w-5", colors.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">{member.title}</h4>
                    <Badge variant="outline" className="text-[8px] px-1.5 py-0 shrink-0">
                      {member.visaType}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{member.description}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                    <div className="space-y-3 ml-12">
                      {/* Duration Badge */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{member.duration}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {/* Requirements */}
                        <div className="p-2.5 rounded-lg bg-muted/30">
                          <h5 className="text-[10px] sm:text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {language === 'en' ? 'Requirements' : 'Persyaratan'}
                          </h5>
                          <div className="space-y-1">
                            {member.requirements.map((req, i) => (
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
                            <Star className="h-3.5 w-3.5 text-amber-500" />
                            {language === 'en' ? 'Benefits' : 'Manfaat'}
                          </h5>
                          <div className="space-y-1">
                            {member.benefits.map((benefit, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <div className={cn("w-1 h-1 rounded-full mt-1.5 flex-shrink-0 bg-accent")} />
                                <span className="text-[9px] sm:text-[10px] text-foreground/80">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Restrictions if any */}
                      {member.restrictions && (
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                          <h5 className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {language === 'en' ? 'Limitations' : 'Batasan'}
                          </h5>
                          <div className="space-y-1">
                            {member.restrictions.map((restriction, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <span className="text-[9px] sm:text-[10px] text-amber-700 dark:text-amber-300">• {restriction}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* School Types for Education */}
                      {member.schoolTypes && (
                        <div className="p-2.5 rounded-lg bg-white/50 dark:bg-white/5 border border-border/50">
                          <h5 className="text-[10px] sm:text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {language === 'en' ? 'School Options & Fees' : 'Opsi Sekolah & Biaya'}
                          </h5>
                          <div className="space-y-1.5">
                            {member.schoolTypes.map((school, i) => (
                              <div key={i} className="flex items-center justify-between text-[9px] sm:text-[10px] p-1.5 rounded bg-muted/30">
                                <div>
                                  <span className="font-medium text-foreground">{school.type}</span>
                                  <span className="text-muted-foreground ml-1">({school.examples})</span>
                                </div>
                                <Badge variant="outline" className="text-[8px]">{school.fees}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hospitals for Healthcare */}
                      {member.hospitals && (
                        <div className="p-2.5 rounded-lg bg-white/50 dark:bg-white/5 border border-border/50">
                          <h5 className="text-[10px] sm:text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                            <Hospital className="h-3.5 w-3.5" />
                            {language === 'en' ? 'Recommended Hospitals' : 'Rumah Sakit Rekomendasi'}
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {member.hospitals.map((hospital, i) => (
                              <Badge key={i} variant="secondary" className="text-[8px]">{hospital}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Work Options for Work Rights */}
                      {member.workOptions && (
                        <div className="p-2.5 rounded-lg bg-white/50 dark:bg-white/5 border border-border/50">
                          <h5 className="text-[10px] sm:text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {language === 'en' ? 'Work Options' : 'Opsi Kerja'}
                          </h5>
                          <div className="space-y-1.5">
                            {member.workOptions.map((work, i) => (
                              <div key={i} className="flex items-center justify-between text-[9px] sm:text-[10px] p-1.5 rounded bg-muted/30">
                                <span className="font-medium text-foreground">{work.option}</span>
                                <span className="text-muted-foreground text-right">{work.requirement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Visa Process */}
      <div className={cn(
        "rounded-lg p-3",
        "bg-white/60 dark:bg-white/5",
        "border-2 border-accent/30"
      )}>
        <h4 className="text-xs sm:text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Plane className="h-4 w-4 text-accent" />
          {t.visaProcess.title}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {t.visaProcess.steps.map((step, idx) => (
            <div key={idx} className="text-center p-2 rounded-lg bg-muted/30 relative">
              <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                {step.step}
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold text-foreground">{step.title}</p>
              <p className="text-[8px] text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Costs */}
      <div className={cn(
        "rounded-lg p-3",
        "bg-white/60 dark:bg-white/5",
        "border-2 border-border/50"
      )}>
        <h4 className="text-xs sm:text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-accent" />
          {t.costs.title}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-2">
          {t.costs.items.map((item, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-muted/30 text-center">
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">{item.item}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-foreground">{item.cost}</p>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground italic">{t.costs.note}</p>
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
        <p className="text-[10px] sm:text-xs text-muted-foreground">{t.disclaimer}</p>
      </div>
    </div>
  );
};

export default WNAFamilyBenefits;
