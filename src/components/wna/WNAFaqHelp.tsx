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
          question: "Can foreigners own property in Indonesia?",
          answer: "Yes, foreigners can legally own property in Indonesia through specific ownership structures. The most common options are Hak Pakai (Right to Use) for residential properties, which can be held for up to 80 years, or through a PT PMA (foreign-owned company) which can hold Hak Guna Bangunan (Right to Build). Apartments and condominiums can be owned directly through strata title."
        },
        {
          question: "What is the minimum investment amount?",
          answer: "Minimum investment thresholds vary by property type and location. Generally, houses/villas require a minimum of IDR 5 billion (~USD 315,000), while apartments start at IDR 1 billion (~USD 63,000). Premium locations like Bali may have higher minimums. These thresholds are set by government regulation and may be updated periodically."
        },
        {
          question: "Do I need a visa to buy property?",
          answer: "You don't need a specific visa to purchase property, but to hold Hak Pakai ownership, you'll need a valid KITAS (Limited Stay Permit), KITAP (Permanent Stay Permit), or other valid stay permit. Tourist visa holders can purchase but should plan for visa conversion. Our team can guide you through visa options including Investor KITAS and Second Home Visa."
        },
        {
          question: "How long does the buying process take?",
          answer: "The complete process typically takes 30-60 days for standard service, or 14-30 days with our express VIP service. This includes consultation (1-3 days), property selection (3-14 days), due diligence (7-14 days), agreement signing (3-7 days), and certificate transfer at BPN (14-21 days)."
        },
        {
          question: "What are the taxes and fees involved?",
          answer: "Key costs include: BPHTB (Acquisition Tax) at 5% of transaction value, VAT on new properties at 11%, notary fees of 0.5-1%, and annual PBB (Property Tax) at ~0.1-0.3% of assessed value. Many countries have double taxation treaties with Indonesia that may reduce your tax obligations."
        },
        {
          question: "Can I rent out my property?",
          answer: "Yes, you can rent out your property for additional income. Properties must comply with local regulations, and rental income is subject to Indonesian tax. Our property management team can handle everything from marketing to tenant management, providing a hassle-free investment experience."
        },
        {
          question: "What happens to my property if I leave Indonesia?",
          answer: "Your ownership rights remain valid even if you leave Indonesia. For Hak Pakai, you should maintain a valid stay permit or transfer to a company structure. We recommend setting up property management and having local legal representation for ongoing compliance and maintenance."
        },
        {
          question: "Is nominee ownership safe?",
          answer: "Nominee arrangements (using an Indonesian name to hold property) carry significant legal risks and are not recommended. Such arrangements can be voided by courts, and you may lose your investment. We strongly advise using proper legal structures like Hak Pakai or PT PMA which provide full legal protection."
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
          question: "Bisakah orang asing memiliki properti di Indonesia?",
          answer: "Ya, orang asing dapat memiliki properti secara legal di Indonesia melalui struktur kepemilikan tertentu. Opsi paling umum adalah Hak Pakai untuk properti residensial yang dapat dipegang hingga 80 tahun, atau melalui PT PMA (perusahaan milik asing) yang dapat memegang Hak Guna Bangunan. Apartemen dan kondominium dapat dimiliki langsung melalui strata title."
        },
        {
          question: "Berapa jumlah investasi minimum?",
          answer: "Batas investasi minimum bervariasi berdasarkan jenis properti dan lokasi. Umumnya, rumah/villa memerlukan minimum IDR 5 miliar (~USD 315.000), sementara apartemen mulai dari IDR 1 miliar (~USD 63.000). Lokasi premium seperti Bali mungkin memiliki minimum lebih tinggi. Batas ini ditetapkan oleh peraturan pemerintah dan dapat diperbarui secara berkala."
        },
        {
          question: "Apakah saya perlu visa untuk membeli properti?",
          answer: "Anda tidak memerlukan visa khusus untuk membeli properti, tetapi untuk memegang kepemilikan Hak Pakai, Anda memerlukan KITAS (Izin Tinggal Terbatas), KITAP (Izin Tinggal Tetap), atau izin tinggal valid lainnya. Pemegang visa turis dapat membeli tetapi harus merencanakan konversi visa. Tim kami dapat memandu Anda melalui opsi visa termasuk KITAS Investor dan Visa Second Home."
        },
        {
          question: "Berapa lama proses pembelian?",
          answer: "Proses lengkap biasanya memakan waktu 30-60 hari untuk layanan standar, atau 14-30 hari dengan layanan VIP ekspres kami. Ini termasuk konsultasi (1-3 hari), pemilihan properti (3-14 hari), due diligence (7-14 hari), penandatanganan perjanjian (3-7 hari), dan transfer sertifikat di BPN (14-21 hari)."
        },
        {
          question: "Apa saja pajak dan biaya yang terlibat?",
          answer: "Biaya utama meliputi: BPHTB (Pajak Perolehan) 5% dari nilai transaksi, PPN pada properti baru 11%, biaya notaris 0.5-1%, dan PBB tahunan (Pajak Properti) ~0.1-0.3% dari nilai taksiran. Banyak negara memiliki perjanjian pajak ganda dengan Indonesia yang dapat mengurangi kewajiban pajak Anda."
        },
        {
          question: "Bisakah saya menyewakan properti saya?",
          answer: "Ya, Anda dapat menyewakan properti untuk pendapatan tambahan. Properti harus mematuhi peraturan lokal, dan pendapatan sewa dikenakan pajak Indonesia. Tim manajemen properti kami dapat menangani segalanya dari pemasaran hingga manajemen penyewa, memberikan pengalaman investasi tanpa repot."
        },
        {
          question: "Apa yang terjadi dengan properti saya jika saya meninggalkan Indonesia?",
          answer: "Hak kepemilikan Anda tetap valid meskipun Anda meninggalkan Indonesia. Untuk Hak Pakai, Anda harus mempertahankan izin tinggal yang valid atau transfer ke struktur perusahaan. Kami merekomendasikan menyiapkan manajemen properti dan memiliki perwakilan hukum lokal untuk kepatuhan dan pemeliharaan berkelanjutan."
        },
        {
          question: "Apakah kepemilikan nominee aman?",
          answer: "Pengaturan nominee (menggunakan nama Indonesia untuk memegang properti) membawa risiko hukum signifikan dan tidak direkomendasikan. Pengaturan semacam itu dapat dibatalkan oleh pengadilan, dan Anda mungkin kehilangan investasi. Kami sangat menyarankan menggunakan struktur hukum yang tepat seperti Hak Pakai atau PT PMA yang memberikan perlindungan hukum penuh."
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
