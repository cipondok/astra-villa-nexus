import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const WNAFaqHelp: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const copy = {
    en: {
      faqTitle: "Frequently Asked Questions",
      faqSubtitle: "Common questions about foreign property investment",
      helpTitle: "Need Help?",
      helpSubtitle: "Our team is ready to assist you",
      
      faqs: [
        {
          question: "Can foreigners legally own property in Indonesia?",
          answer: "Yes, under Government Regulation PP No. 18/2021, foreigners with valid stay permits (KITAS/KITAP) can own residential property through Hak Pakai (Right to Use) for up to 80 years (30+20+30). Apartments can be owned through Strata Title (SHMSRS). For commercial properties, foreigners can establish a PT PMA (foreign investment company) to hold Hak Guna Bangunan (Right to Build). Freehold ownership (Hak Milik) is reserved exclusively for Indonesian citizens."
        },
        {
          question: "What is Hak Pakai and how does it work?",
          answer: "Hak Pakai (Right to Use) is the legal ownership structure for foreigners under Indonesian law (UU Agraria No. 5/1960 and PP 18/2021). Initial term is 30 years, extendable by 20 years, then renewable for another 30 years (total 80 years). It's registered at the Land Office (BPN) with a certificate in your name. Hak Pakai can be inherited by your heirs and sold or transferred. You must maintain a valid KITAS/KITAP or convert to a company structure if you leave Indonesia."
        },
        {
          question: "What are the minimum investment thresholds?",
          answer: "Per PP No. 18/2021: Houses/villas require minimum IDR 5 billion (~USD 315,000) in most regions. Apartments start at IDR 1 billion (~USD 63,000) but vary by location - Jakarta IDR 3B, Bali IDR 2B, other areas IDR 1B. These are transaction values, not down payments. Premium zones like Seminyak, Sanur, or SCBD may have higher thresholds. Values are periodically updated by government regulation."
        },
        {
          question: "What visa/permit do I need to own property?",
          answer: "To hold Hak Pakai ownership, you need a valid stay permit: KITAS (Limited Stay Permit - 1-2 years), KITAP (Permanent Stay Permit - 5 years), Investor KITAS (for property investors), or Second Home Visa (5-10 years). Tourist visa holders can purchase property but must convert their visa before the certificate is issued in their name. Our team assists with visa applications including the popular Second Home Visa for property owners with USD 130,000+ in assets."
        },
        {
          question: "What is a PT PMA and when do I need one?",
          answer: "PT PMA (Penanaman Modal Asing) is a foreign-owned Indonesian limited liability company. You need a PT PMA to: own commercial property (offices, hotels, retail), hold Hak Guna Bangunan (Right to Build) which allows development, conduct business activities in Indonesia, or own multiple properties as business assets. Requirements include minimum IDR 10 billion investment, BKPM approval, NIB business license, and Indonesian directors. Processing takes 4-8 weeks."
        },
        {
          question: "Can I get Indonesian citizenship through property investment?",
          answer: "No, Indonesia does NOT grant citizenship through property investment alone. Property ownership qualifies you for residency permits (KITAS/KITAP) and Second Home Visa, but citizenship requires: 5+ years continuous residence on KITAP, Indonesian language fluency, Pancasila and constitution knowledge test, and must renounce all other citizenships (Indonesia doesn't allow dual citizenship). Marriage to Indonesian citizen for 5+ years is another pathway. See our Citizenship tab for full details."
        },
        {
          question: "Why are nominee arrangements dangerous?",
          answer: "Nominee arrangements (using an Indonesian's name to hold Hak Milik on your behalf) are ILLEGAL under Indonesian law and carry severe risks: Indonesian courts have consistently voided such agreements (Supreme Court precedents), you have no legal recourse if the nominee claims ownership, the nominee can sell or mortgage the property without your consent, inheritance is complicated, and you may face legal penalties. Always use proper structures like Hak Pakai or PT PMA which provide full legal protection."
        },
        {
          question: "What taxes do foreign property owners pay?",
          answer: "Key taxes include: BPHTB (Acquisition Tax) - 5% of transaction value above NJOPTKP threshold; PPN/VAT on new properties - 11%; Annual PBB (Property Tax) - approximately 0.1-0.3% of NJOP (government valuation); PPH on rental income - 10% for individuals, 2% for companies. Indonesia has double taxation treaties with 70+ countries which may reduce obligations. NPWP (tax ID) is required. Capital gains on sale are taxed as income."
        },
        {
          question: "Can I rent out my Indonesian property?",
          answer: "Yes, you can legally rent out your property for income. Requirements: Register with local tax office (NPWP), pay PPH rental income tax (10% individual/2% company), comply with local licensing (some areas require operating permits for short-term rentals), report to local RT/RW. For tourist rentals in Bali, additional Pondok Wisata permits may be required. Our property management team handles all compliance, marketing, and tenant management."
        },
        {
          question: "What happens if I want to sell my property?",
          answer: "Foreign owners can sell their Hak Pakai property freely. The buyer can be Indonesian (who can convert to Hak Milik) or another eligible foreigner. Seller pays PPH (income tax) of 2.5% on transaction value. Buyer pays BPHTB of 5%. Transaction must go through a licensed PPAT (notary) and registered at BPN for certificate transfer. Process takes 2-4 weeks. Capital gains are added to your taxable income for the year."
        },
        {
          question: "What due diligence should I conduct before buying?",
          answer: "Essential checks include: Verify certificate authenticity at BPN (Land Office), confirm seller's identity and ownership rights, check for encumbrances/mortgages/disputes, verify zoning and land use permits (IMB/PBG), confirm property is not on agricultural or protected land, review building permits and construction compliance, check for unpaid taxes or levies, verify property boundaries match certificate. Our legal team conducts comprehensive due diligence on every transaction."
        },
        {
          question: "What is the Second Home Visa and who qualifies?",
          answer: "The Second Home Visa (introduced 2022) is a long-term stay permit for high-net-worth individuals and property owners. Requirements: Proof of USD 130,000+ in liquid assets or property ownership in Indonesia, valid health insurance, clean criminal record. Benefits: 5-10 year stay without work permit paperwork, multiple entry, can bring family, access to banking and local services. Ideal for retirees, digital nomads, and investors who want simplified residency."
        }
      ],

      helpOptions: [
        { icon: MessageSquare, title: "Live Chat", desc: "Chat with our AI assistant 24/7", action: "chat" },
        { icon: Phone, title: "Call Us", desc: "+62 21 XXX XXXX", action: "phone" },
        { icon: Mail, title: "Email Support", desc: "invest@astravilla.com", action: "email" },
        { icon: FileText, title: "Investment Guide", desc: "Download our complete guide", action: "guide" }
      ],

      quickTips: {
        title: "Quick Tips for WNA Investors",
        tips: [
          "Always work with a licensed notary for all transactions",
          "Verify property certificates at BPN before purchase",
          "Keep copies of all documents in multiple locations",
          "Consider setting up a PT PMA for multiple properties",
          "Plan your visa strategy before making large investments"
        ]
      }
    },
    id: {
      faqTitle: "Pertanyaan yang Sering Diajukan",
      faqSubtitle: "Pertanyaan umum tentang investasi properti asing",
      helpTitle: "Butuh Bantuan?",
      helpSubtitle: "Tim kami siap membantu Anda",
      
      faqs: [
        {
          question: "Bisakah WNA memiliki properti secara legal di Indonesia?",
          answer: "Ya, berdasarkan PP No. 18/2021, WNA dengan izin tinggal valid (KITAS/KITAP) dapat memiliki properti residensial melalui Hak Pakai hingga 80 tahun (30+20+30). Apartemen dapat dimiliki melalui Strata Title (SHMSRS). Untuk properti komersial, WNA dapat mendirikan PT PMA untuk memegang Hak Guna Bangunan. Kepemilikan Hak Milik (freehold) khusus untuk WNI."
        },
        {
          question: "Apa itu Hak Pakai dan bagaimana cara kerjanya?",
          answer: "Hak Pakai adalah struktur kepemilikan legal untuk WNA berdasarkan UU Agraria No. 5/1960 dan PP 18/2021. Jangka waktu awal 30 tahun, dapat diperpanjang 20 tahun, lalu diperpanjang lagi 30 tahun (total 80 tahun). Terdaftar di BPN dengan sertifikat atas nama Anda. Hak Pakai dapat diwariskan dan dijual/dialihkan. Anda harus mempertahankan KITAS/KITAP valid atau konversi ke struktur perusahaan jika meninggalkan Indonesia."
        },
        {
          question: "Berapa batas investasi minimum?",
          answer: "Sesuai PP No. 18/2021: Rumah/villa minimum IDR 5 miliar (~USD 315.000) di sebagian besar wilayah. Apartemen mulai IDR 1 miliar (~USD 63.000) tapi bervariasi - Jakarta IDR 3M, Bali IDR 2M, wilayah lain IDR 1M. Ini adalah nilai transaksi, bukan uang muka. Zona premium seperti Seminyak, Sanur, atau SCBD mungkin lebih tinggi."
        },
        {
          question: "Visa/izin apa yang diperlukan untuk memiliki properti?",
          answer: "Untuk kepemilikan Hak Pakai, Anda perlu izin tinggal valid: KITAS (1-2 tahun), KITAP (5 tahun), KITAS Investor, atau Visa Second Home (5-10 tahun). Pemegang visa turis dapat membeli tetapi harus mengkonversi visa sebelum sertifikat diterbitkan. Tim kami membantu aplikasi visa termasuk Second Home Visa untuk pemilik properti dengan aset USD 130.000+."
        },
        {
          question: "Apa itu PT PMA dan kapan dibutuhkan?",
          answer: "PT PMA (Penanaman Modal Asing) adalah perseroan terbatas milik asing di Indonesia. Anda perlu PT PMA untuk: memiliki properti komersial, memegang HGB, melakukan aktivitas bisnis, atau memiliki multiple properti sebagai aset bisnis. Syarat termasuk investasi minimum IDR 10 miliar, persetujuan BKPM, NIB. Proses 4-8 minggu."
        },
        {
          question: "Bisakah mendapat kewarganegaraan Indonesia melalui investasi properti?",
          answer: "Tidak, Indonesia TIDAK memberikan kewarganegaraan melalui investasi properti saja. Kepemilikan properti memenuhi syarat untuk izin tinggal (KITAS/KITAP) dan Second Home Visa, tetapi kewarganegaraan memerlukan: 5+ tahun tinggal terus-menerus dengan KITAP, fasih bahasa Indonesia, tes Pancasila dan konstitusi, dan harus melepaskan semua kewarganegaraan lain (Indonesia tidak mengizinkan dwi kewarganegaraan)."
        },
        {
          question: "Mengapa pengaturan nominee berbahaya?",
          answer: "Pengaturan nominee (menggunakan nama WNI untuk memegang Hak Milik) ILEGAL berdasarkan hukum Indonesia dan berisiko tinggi: Pengadilan Indonesia secara konsisten membatalkan perjanjian tersebut, Anda tidak punya perlindungan hukum jika nominee mengklaim kepemilikan, nominee dapat menjual/menggadaikan tanpa persetujuan, warisan rumit, dan mungkin menghadapi sanksi hukum. Selalu gunakan Hak Pakai atau PT PMA."
        },
        {
          question: "Pajak apa yang dibayar pemilik properti asing?",
          answer: "Pajak utama meliputi: BPHTB (Pajak Perolehan) - 5% dari nilai transaksi; PPN properti baru - 11%; PBB tahunan - sekitar 0.1-0.3% dari NJOP; PPH pendapatan sewa - 10% individu, 2% perusahaan. Indonesia memiliki perjanjian pajak ganda dengan 70+ negara. NPWP diperlukan. Capital gains dikenakan pajak sebagai penghasilan."
        },
        {
          question: "Bisakah saya menyewakan properti Indonesia?",
          answer: "Ya, Anda dapat menyewakan properti secara legal. Syarat: Daftar ke kantor pajak (NPWP), bayar PPH sewa (10% individu/2% perusahaan), patuhi perizinan lokal, lapor ke RT/RW. Untuk rental wisata di Bali, izin Pondok Wisata mungkin diperlukan. Tim manajemen properti kami menangani semua kepatuhan, pemasaran, dan manajemen penyewa."
        },
        {
          question: "Bagaimana jika ingin menjual properti?",
          answer: "Pemilik WNA dapat menjual properti Hak Pakai secara bebas. Pembeli bisa WNI (dapat konversi ke Hak Milik) atau WNA eligible lainnya. Penjual bayar PPH 2.5% dari nilai transaksi. Pembeli bayar BPHTB 5%. Transaksi harus melalui PPAT berlisensi dan didaftarkan di BPN. Proses 2-4 minggu."
        },
        {
          question: "Due diligence apa yang harus dilakukan sebelum membeli?",
          answer: "Pemeriksaan penting: Verifikasi keaslian sertifikat di BPN, konfirmasi identitas dan hak kepemilikan penjual, periksa beban/hipotek/sengketa, verifikasi zonasi dan IMB/PBG, konfirmasi bukan tanah pertanian atau dilindungi, review izin bangunan, periksa pajak yang belum dibayar, verifikasi batas properti sesuai sertifikat. Tim legal kami melakukan due diligence komprehensif."
        },
        {
          question: "Apa itu Visa Second Home dan siapa yang memenuhi syarat?",
          answer: "Second Home Visa (diperkenalkan 2022) adalah izin tinggal jangka panjang untuk individu berkekayaan tinggi dan pemilik properti. Syarat: Bukti aset likuid USD 130.000+ atau kepemilikan properti, asuransi kesehatan valid, catatan kriminal bersih. Manfaat: Tinggal 5-10 tahun tanpa dokumen izin kerja, multiple entry, dapat membawa keluarga, akses perbankan. Ideal untuk pensiunan, digital nomad, dan investor."
        }
      ],

      helpOptions: [
        { icon: MessageSquare, title: "Live Chat", desc: "Chat dengan asisten AI kami 24/7", action: "chat" },
        { icon: Phone, title: "Hubungi Kami", desc: "+62 21 XXX XXXX", action: "phone" },
        { icon: Mail, title: "Email Support", desc: "invest@astravilla.com", action: "email" },
        { icon: FileText, title: "Panduan Investasi", desc: "Unduh panduan lengkap kami", action: "guide" }
      ],

      quickTips: {
        title: "Tips Cepat untuk Investor WNA",
        tips: [
          "Selalu bekerja dengan notaris berlisensi untuk semua transaksi",
          "Verifikasi sertifikat properti di BPN sebelum pembelian",
          "Simpan salinan semua dokumen di beberapa lokasi",
          "Pertimbangkan mendirikan PT PMA untuk beberapa properti",
          "Rencanakan strategi visa Anda sebelum melakukan investasi besar"
        ]
      }
    }
  };

  const t = copy[language];

  const openChat = () => {
    const event = new CustomEvent('openAIChat');
    window.dispatchEvent(event);
  };

  const handleHelpAction = (action: string) => {
    switch (action) {
      case 'chat':
        openChat();
        break;
      case 'phone':
        window.open('tel:+622112345678', '_self');
        break;
      case 'email':
        window.open('mailto:invest@astravilla.com', '_self');
        break;
      case 'guide':
        navigate('/contact');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* FAQ Section */}
      <div>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <HelpCircle className="h-5 w-5 text-accent" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">{t.faqTitle}</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{t.faqSubtitle}</p>
        </div>

        <div className="space-y-2">
          {t.faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  "rounded-lg overflow-hidden transition-all duration-200",
                  "bg-white/60 dark:bg-white/5",
                  "border-2",
                  isExpanded 
                    ? "border-accent/50 shadow-md" 
                    : "border-border/50 dark:border-white/10 hover:border-accent/30"
                )}
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 flex-shrink-0 mt-0.5">
                      Q{idx + 1}
                    </Badge>
                    <span className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-accent flex-shrink-0" />
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
                      className="px-3 sm:px-4 pb-3 sm:pb-4"
                    >
                      <div className="ml-10 sm:ml-12 p-3 rounded-lg bg-accent/5 border border-accent/20">
                        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Help Options */}
        <div className={cn(
          "rounded-lg p-4",
          "bg-white/60 dark:bg-white/5",
          "border-2 border-border/50 dark:border-white/10"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-5 w-5 text-accent" />
            <h4 className="text-sm sm:text-base font-bold text-foreground">{t.helpTitle}</h4>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">{t.helpSubtitle}</p>
          
          <div className="grid grid-cols-2 gap-2">
            {t.helpOptions.map((option, idx) => {
              const Icon = option.icon;
              return (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => handleHelpAction(option.action)}
                  className={cn(
                    "h-auto p-3 flex flex-col items-center text-center gap-1",
                    "border-2 border-border/50 hover:border-accent/50",
                    "hover:bg-accent/5 active:scale-95 transition-all"
                  )}
                >
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="text-xs font-semibold text-foreground">{option.title}</span>
                  <span className="text-[10px] text-muted-foreground">{option.desc}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Quick Tips */}
        <div className={cn(
          "rounded-lg p-4",
          "bg-amber-50/80 dark:bg-amber-900/20",
          "border-2 border-amber-200 dark:border-amber-800"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            <h4 className="text-sm sm:text-base font-bold text-foreground">{t.quickTips.title}</h4>
          </div>
          
          <div className="space-y-2">
            {t.quickTips.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-white flex-shrink-0">
                  {idx + 1}
                </Badge>
                <span className="text-xs sm:text-sm text-foreground/80">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WNAFaqHelp;
