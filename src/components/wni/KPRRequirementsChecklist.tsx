import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  FileText, 
  CreditCard, 
  Briefcase, 
  Building2,
  CheckCircle2,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Requirement {
  id: string;
  label: string;
  labelId: string;
  description: string;
  descriptionId: string;
  required: boolean;
  category: 'identity' | 'employment' | 'financial' | 'property';
}

const KPR_REQUIREMENTS: Requirement[] = [
  // Identity Documents
  {
    id: 'ktp',
    label: 'Valid KTP (Indonesian ID Card)',
    labelId: 'KTP yang Masih Berlaku',
    description: 'Original or notarized copy. Must not be expired.',
    descriptionId: 'Asli atau salinan yang dilegalisir. Tidak boleh kadaluarsa.',
    required: true,
    category: 'identity'
  },
  {
    id: 'passport',
    label: 'Valid Indonesian Passport',
    labelId: 'Paspor Indonesia yang Masih Berlaku',
    description: 'Minimum 12 months validity remaining.',
    descriptionId: 'Minimal 12 bulan masa berlaku tersisa.',
    required: true,
    category: 'identity'
  },
  {
    id: 'kk',
    label: 'Family Card (Kartu Keluarga)',
    labelId: 'Kartu Keluarga (KK)',
    description: 'Latest version showing current family status.',
    descriptionId: 'Versi terbaru yang menunjukkan status keluarga saat ini.',
    required: true,
    category: 'identity'
  },
  {
    id: 'npwp',
    label: 'Tax ID (NPWP)',
    labelId: 'NPWP',
    description: 'Indonesian tax identification number.',
    descriptionId: 'Nomor Pokok Wajib Pajak Indonesia.',
    required: true,
    category: 'identity'
  },
  {
    id: 'marriage_cert',
    label: 'Marriage Certificate (if applicable)',
    labelId: 'Akta Nikah (jika menikah)',
    description: 'Required if married. Divorce certificate if divorced.',
    descriptionId: 'Diperlukan jika menikah. Akta cerai jika bercerai.',
    required: false,
    category: 'identity'
  },
  
  // Employment Documents
  {
    id: 'work_permit',
    label: 'Valid Work Permit / Employment Pass',
    labelId: 'Izin Kerja / Employment Pass yang Berlaku',
    description: 'Official work authorization in country of employment.',
    descriptionId: 'Izin kerja resmi di negara tempat bekerja.',
    required: true,
    category: 'employment'
  },
  {
    id: 'work_contract',
    label: 'Employment Contract',
    labelId: 'Kontrak Kerja',
    description: 'Minimum 12 months remaining or permanent contract.',
    descriptionId: 'Minimal 12 bulan tersisa atau kontrak permanen.',
    required: true,
    category: 'employment'
  },
  {
    id: 'employer_letter',
    label: 'Employment Verification Letter',
    labelId: 'Surat Keterangan Kerja',
    description: 'Official letter from employer stating position and salary.',
    descriptionId: 'Surat resmi dari pemberi kerja yang menyatakan posisi dan gaji.',
    required: true,
    category: 'employment'
  },
  {
    id: 'payslips',
    label: 'Payslips (Last 6 Months)',
    labelId: 'Slip Gaji (6 Bulan Terakhir)',
    description: 'Consecutive monthly payslips from employer.',
    descriptionId: 'Slip gaji bulanan berturut-turut dari pemberi kerja.',
    required: true,
    category: 'employment'
  },
  
  // Financial Documents
  {
    id: 'bank_statements',
    label: 'Bank Statements (Last 6 Months)',
    labelId: 'Rekening Koran (6 Bulan Terakhir)',
    description: 'Primary salary account showing regular deposits.',
    descriptionId: 'Rekening utama gaji yang menunjukkan deposit rutin.',
    required: true,
    category: 'financial'
  },
  {
    id: 'slik_consent',
    label: 'SLIK/BI Checking Consent Form',
    labelId: 'Formulir Persetujuan SLIK/BI Checking',
    description: 'Authorization for credit history check via OJK.',
    descriptionId: 'Otorisasi untuk pemeriksaan riwayat kredit via OJK.',
    required: true,
    category: 'financial'
  },
  {
    id: 'dp_proof',
    label: 'Proof of Down Payment Funds',
    labelId: 'Bukti Dana Uang Muka',
    description: 'Evidence of available funds for minimum 20% down payment.',
    descriptionId: 'Bukti ketersediaan dana untuk uang muka minimal 20%.',
    required: true,
    category: 'financial'
  },
  {
    id: 'tax_returns',
    label: 'Tax Return / SPT',
    labelId: 'SPT Tahunan',
    description: 'Last 2 years tax returns (Indonesian or overseas).',
    descriptionId: 'SPT 2 tahun terakhir (Indonesia atau luar negeri).',
    required: false,
    category: 'financial'
  },
  
  // Property Documents
  {
    id: 'property_docs',
    label: 'Property Documents',
    labelId: 'Dokumen Properti',
    description: 'Sales agreement, property certificate (SHM/SHGB).',
    descriptionId: 'Perjanjian jual beli, sertifikat properti (SHM/SHGB).',
    required: true,
    category: 'property'
  },
  {
    id: 'power_of_attorney',
    label: 'Power of Attorney (Surat Kuasa)',
    labelId: 'Surat Kuasa',
    description: 'If using representative in Indonesia for signing.',
    descriptionId: 'Jika menggunakan perwakilan di Indonesia untuk penandatanganan.',
    required: false,
    category: 'property'
  }
];

interface KPRRequirementsChecklistProps {
  className?: string;
}

export const KPRRequirementsChecklist: React.FC<KPRRequirementsChecklistProps> = ({ className }) => {
  const { language } = useLanguage();

  const copy = {
    en: {
      title: "KPR Document Requirements",
      subtitle: "Complete checklist for WNI overseas mortgage application",
      required: "Required",
      optional: "Optional",
      categories: {
        identity: "Identity Documents",
        employment: "Employment Documents",
        financial: "Financial Documents",
        property: "Property Documents"
      },
      downloadChecklist: "Download Checklist (PDF)",
      importantNote: "Important Note",
      noteText: "All foreign documents must be legalized/apostilled and translated to Bahasa Indonesia by a sworn translator."
    },
    id: {
      title: "Persyaratan Dokumen KPR",
      subtitle: "Checklist lengkap untuk pengajuan KPR WNI luar negeri",
      required: "Wajib",
      optional: "Opsional",
      categories: {
        identity: "Dokumen Identitas",
        employment: "Dokumen Pekerjaan",
        financial: "Dokumen Keuangan",
        property: "Dokumen Properti"
      },
      downloadChecklist: "Unduh Checklist (PDF)",
      importantNote: "Catatan Penting",
      noteText: "Semua dokumen luar negeri harus dilegalisir/apostille dan diterjemahkan ke Bahasa Indonesia oleh penerjemah tersumpah."
    }
  };

  const t = copy[language];

  const categoryIcons = {
    identity: FileText,
    employment: Briefcase,
    financial: CreditCard,
    property: Building2
  };

  const getRequirementsByCategory = (category: Requirement['category']) => {
    return KPR_REQUIREMENTS.filter(r => r.category === category);
  };

  return (
    <Card className={cn("border-0 bg-transparent shadow-none", className)}>
      <CardHeader className="pb-1.5 pt-0 px-0">
        <CardTitle className="flex items-center gap-1.5 text-[10px] sm:text-sm">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-primary/20 flex items-center justify-center">
            <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-600" />
          </div>
          {t.title}
        </CardTitle>
        <p className="text-[9px] sm:text-xs text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-2 px-0 pb-0">
        <Accordion type="multiple" className="space-y-1">
          {(['identity', 'employment', 'financial', 'property'] as const).map((category, idx) => {
            const Icon = categoryIcons[category];
            const requirements = getRequirementsByCategory(category);
            const requiredCount = requirements.filter(r => r.required).length;
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <AccordionItem 
                  value={category} 
                  className="border border-border/40 rounded-lg px-2 bg-background/50"
                >
                  <AccordionTrigger className="hover:no-underline py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center",
                        category === 'identity' && "bg-blue-500/20",
                        category === 'employment' && "bg-green-500/20",
                        category === 'financial' && "bg-orange-500/20",
                        category === 'property' && "bg-purple-500/20"
                      )}>
                        <Icon className={cn(
                          "h-2.5 w-2.5 sm:h-3 sm:w-3",
                          category === 'identity' && "text-blue-600",
                          category === 'employment' && "text-green-600",
                          category === 'financial' && "text-orange-600",
                          category === 'property' && "text-purple-600"
                        )} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] sm:text-xs font-semibold">{t.categories[category]}</p>
                        <p className="text-[7px] sm:text-[9px] text-muted-foreground">
                          {requiredCount} {t.required.toLowerCase()}, {requirements.length - requiredCount} {t.optional.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="space-y-1 mt-1">
                      {requirements.map((req) => (
                        <div 
                          key={req.id}
                          className={cn(
                            "p-1.5 rounded-md border",
                            req.required 
                              ? "bg-background border-border/40" 
                              : "bg-muted/30 border-dashed border-border/30"
                          )}
                        >
                          <div className="flex items-start gap-1">
                            {req.required ? (
                              <CheckCircle2 className="h-2.5 w-2.5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 flex-wrap">
                                <p className="text-[8px] sm:text-[10px] font-medium truncate">
                                  {language === 'id' ? req.labelId : req.label}
                                </p>
                                <Badge 
                                  variant={req.required ? "default" : "secondary"} 
                                  className={cn(
                                    "text-[6px] sm:text-[7px] px-0.5 py-0",
                                    req.required ? "bg-red-500/20 text-red-600 hover:bg-red-500/30" : ""
                                  )}
                                >
                                  {req.required ? t.required : t.optional}
                                </Badge>
                              </div>
                              <p className="text-[7px] sm:text-[8px] text-muted-foreground mt-0.5 line-clamp-1">
                                {language === 'id' ? req.descriptionId : req.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </Accordion>

        {/* Important Note */}
        <div className="flex items-start gap-1 p-2 bg-blue-500/10 border border-blue-500/20 rounded-md">
          <Info className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[9px] sm:text-xs font-medium text-blue-700 dark:text-blue-400">{t.importantNote}</p>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground">{t.noteText}</p>
          </div>
        </div>

        {/* Download Button */}
        <Button variant="outline" className="w-full gap-1 h-7 text-[9px] sm:text-xs active:scale-95">
          <Download className="h-3 w-3" />
          {t.downloadChecklist}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KPRRequirementsChecklist;
