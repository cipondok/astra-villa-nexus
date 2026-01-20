import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  ExternalLink,
  FileSearch,
  Clock
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SLIKCreditCheckerProps {
  className?: string;
}

export const SLIKCreditChecker: React.FC<SLIKCreditCheckerProps> = ({ className }) => {
  const { language } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  const copy = {
    en: {
      title: "SLIK/BI Checking Credit History",
      subtitle: "Understanding your credit score for KPR eligibility in Indonesia",
      whatIsSLIK: "What is SLIK/BI Checking?",
      slikDesc: "SLIK (Sistem Layanan Informasi Keuangan) is Indonesia's credit reporting system managed by OJK (Financial Services Authority). It replaced the old BI Checking system. All Indonesian financial institutions check SLIK before approving loans.",
      collectabilityTitle: "Credit Collectability Status",
      collectabilitySubtitle: "Your credit is rated from 1 (best) to 5 (worst)",
      statuses: [
        { 
          level: 1, 
          label: "Collectability 1 (Lancar)", 
          desc: "Current - All payments on time",
          eligible: true,
          color: "green"
        },
        { 
          level: 2, 
          label: "Collectability 2 (DPK)", 
          desc: "Special Mention - 1-90 days overdue",
          eligible: true,
          color: "yellow"
        },
        { 
          level: 3, 
          label: "Collectability 3 (Kurang Lancar)", 
          desc: "Substandard - 91-120 days overdue",
          eligible: false,
          color: "orange"
        },
        { 
          level: 4, 
          label: "Collectability 4 (Diragukan)", 
          desc: "Doubtful - 121-180 days overdue",
          eligible: false,
          color: "red"
        },
        { 
          level: 5, 
          label: "Collectability 5 (Macet)", 
          desc: "Loss/Bad Debt - 180+ days overdue",
          eligible: false,
          color: "red"
        }
      ],
      howToCheck: "How to Check Your SLIK Status",
      checkMethods: [
        {
          title: "Online via iDebku OJK",
          steps: [
            "Visit idebku.ojk.go.id",
            "Register using your NIK (KTP number)",
            "Upload required documents (KTP, selfie)",
            "Receive your SLIK report within 1-2 working days"
          ]
        },
        {
          title: "Offline at OJK Office",
          steps: [
            "Visit nearest OJK representative office",
            "Bring original KTP and photocopy",
            "Fill out application form",
            "Report issued same day"
          ]
        },
        {
          title: "Through Authorized Bank",
          steps: [
            "Visit your bank branch",
            "Request SLIK/credit report",
            "Bank will process on your behalf",
            "Usually available within 3 working days"
          ]
        }
      ],
      forOverseasWNI: "For WNI Overseas",
      overseasSteps: [
        "Apply online through iDebku.ojk.go.id (recommended)",
        "Request through authorized family member with notarized power of attorney",
        "Contact Indonesian embassy/consulate for assistance",
        "ASTRA Villa can assist with the process"
      ],
      cleaningCredit: "How to Clean Bad Credit Record",
      cleaningSteps: [
        "Pay off all outstanding debts in full",
        "Request debt settlement letter from creditor",
        "Creditor reports updated status to OJK",
        "SLIK record updates within 30-60 days",
        "Note: Records remain for 24 months after settlement"
      ],
      checkNow: "Check SLIK Online",
      eligible: "Eligible for KPR",
      notEligible: "May face difficulties",
      disclaimer: "Disclaimer: SLIK status is one of many factors banks consider. Final approval depends on overall assessment."
    },
    id: {
      title: "Riwayat Kredit SLIK/BI Checking",
      subtitle: "Memahami skor kredit Anda untuk kelayakan KPR di Indonesia",
      whatIsSLIK: "Apa itu SLIK/BI Checking?",
      slikDesc: "SLIK (Sistem Layanan Informasi Keuangan) adalah sistem pelaporan kredit Indonesia yang dikelola OJK. Sistem ini menggantikan BI Checking lama. Semua lembaga keuangan Indonesia memeriksa SLIK sebelum menyetujui pinjaman.",
      collectabilityTitle: "Status Kolektibilitas Kredit",
      collectabilitySubtitle: "Kredit Anda dinilai dari 1 (terbaik) hingga 5 (terburuk)",
      statuses: [
        { 
          level: 1, 
          label: "Kolektibilitas 1 (Lancar)", 
          desc: "Lancar - Semua pembayaran tepat waktu",
          eligible: true,
          color: "green"
        },
        { 
          level: 2, 
          label: "Kolektibilitas 2 (DPK)", 
          desc: "Dalam Perhatian Khusus - Tunggakan 1-90 hari",
          eligible: true,
          color: "yellow"
        },
        { 
          level: 3, 
          label: "Kolektibilitas 3 (Kurang Lancar)", 
          desc: "Kurang Lancar - Tunggakan 91-120 hari",
          eligible: false,
          color: "orange"
        },
        { 
          level: 4, 
          label: "Kolektibilitas 4 (Diragukan)", 
          desc: "Diragukan - Tunggakan 121-180 hari",
          eligible: false,
          color: "red"
        },
        { 
          level: 5, 
          label: "Kolektibilitas 5 (Macet)", 
          desc: "Macet - Tunggakan 180+ hari",
          eligible: false,
          color: "red"
        }
      ],
      howToCheck: "Cara Cek Status SLIK Anda",
      checkMethods: [
        {
          title: "Online melalui iDebku OJK",
          steps: [
            "Kunjungi idebku.ojk.go.id",
            "Daftar menggunakan NIK (nomor KTP)",
            "Upload dokumen (KTP, foto selfie)",
            "Terima laporan SLIK dalam 1-2 hari kerja"
          ]
        },
        {
          title: "Offline di Kantor OJK",
          steps: [
            "Kunjungi kantor perwakilan OJK terdekat",
            "Bawa KTP asli dan fotokopi",
            "Isi formulir permohonan",
            "Laporan diterbitkan hari yang sama"
          ]
        },
        {
          title: "Melalui Bank Resmi",
          steps: [
            "Kunjungi cabang bank Anda",
            "Minta laporan SLIK/kredit",
            "Bank akan memproses atas nama Anda",
            "Biasanya tersedia dalam 3 hari kerja"
          ]
        }
      ],
      forOverseasWNI: "Untuk WNI di Luar Negeri",
      overseasSteps: [
        "Ajukan online melalui iDebku.ojk.go.id (direkomendasikan)",
        "Minta melalui anggota keluarga dengan surat kuasa notaris",
        "Hubungi kedutaan/konsulat Indonesia untuk bantuan",
        "ASTRA Villa dapat membantu prosesnya"
      ],
      cleaningCredit: "Cara Membersihkan Catatan Kredit Buruk",
      cleaningSteps: [
        "Lunasi semua hutang yang tertunggak",
        "Minta surat pelunasan dari kreditur",
        "Kreditur melaporkan status terbaru ke OJK",
        "Catatan SLIK diperbarui dalam 30-60 hari",
        "Catatan: Riwayat tetap ada selama 24 bulan setelah pelunasan"
      ],
      checkNow: "Cek SLIK Online",
      eligible: "Layak untuk KPR",
      notEligible: "Mungkin menghadapi kesulitan",
      disclaimer: "Disclaimer: Status SLIK adalah salah satu faktor yang dipertimbangkan bank. Persetujuan akhir tergantung penilaian keseluruhan."
    }
  };

  const t = copy[language];

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500/20 border-green-500/30 text-green-600';
      case 'yellow': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-600';
      case 'orange': return 'bg-orange-500/20 border-orange-500/30 text-orange-600';
      case 'red': return 'bg-red-500/20 border-red-500/30 text-red-600';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className={cn("border border-primary/10 bg-transparent dark:bg-white/5 backdrop-blur-xl shadow-sm", className)}>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-primary/20 flex items-center justify-center">
            <FileSearch className="h-4 w-4 text-amber-600" />
          </div>
          {t.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* What is SLIK */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-600">{t.whatIsSLIK}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t.slikDesc}</p>
            </div>
          </div>
        </div>

        {/* Collectability Statuses */}
        <div>
          <h3 className="text-sm font-semibold mb-1">{t.collectabilityTitle}</h3>
          <p className="text-[10px] text-muted-foreground mb-3">{t.collectabilitySubtitle}</p>
          
          <div className="space-y-2">
            {t.statuses.map((status) => (
              <button
                key={status.level}
                onClick={() => setSelectedStatus(selectedStatus === status.level ? null : status.level)}
                className={cn(
                  "w-full p-3 rounded-xl border text-left transition-all",
                  getStatusColor(status.color),
                  selectedStatus === status.level && "ring-2 ring-primary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={cn(
                        "text-xs font-bold",
                        status.color === 'green' && "bg-green-500",
                        status.color === 'yellow' && "bg-yellow-500",
                        status.color === 'orange' && "bg-orange-500",
                        status.color === 'red' && "bg-red-500"
                      )}
                    >
                      {status.level}
                    </Badge>
                    <div>
                      <p className="text-xs font-medium">{status.label}</p>
                      <p className="text-[10px] opacity-80">{status.desc}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={status.eligible ? "default" : "destructive"}
                    className={cn(
                      "text-[9px]",
                      status.eligible ? "bg-green-500" : "bg-red-500"
                    )}
                  >
                    {status.eligible ? (
                      <><CheckCircle className="h-3 w-3 mr-1" />{t.eligible}</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" />{t.notEligible}</>
                    )}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {/* How to Check */}
          <AccordionItem value="how-to-check" className="border border-border/50 rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{t.howToCheck}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3">
                {t.checkMethods.map((method, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs font-semibold mb-2">{method.title}</p>
                    <ol className="space-y-1">
                      {method.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-[9px] font-medium">
                            {stepIdx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* For Overseas WNI */}
          <AccordionItem value="overseas" className="border border-border/50 rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{t.forOverseasWNI}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ul className="space-y-2">
                {t.overseasSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    {step}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Cleaning Credit */}
          <AccordionItem value="cleaning" className="border border-border/50 rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">{t.cleaningCredit}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ol className="space-y-2">
                {t.cleaningSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0 text-[10px] font-medium">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* CTA Button */}
        <Button 
          className="w-full gap-2"
          onClick={() => window.open('https://idebku.ojk.go.id', '_blank')}
        >
          {t.checkNow}
          <ExternalLink className="h-4 w-4" />
        </Button>

        {/* Disclaimer */}
        <p className="text-[10px] text-center text-muted-foreground">
          {t.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
};

export default SLIKCreditChecker;
