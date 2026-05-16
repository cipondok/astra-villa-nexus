// WhatsApp Business Configuration
export const WHATSAPP_BUSINESS_NUMBER = "6285716008080";

export type InquiryType = 
  | 'general'
  | 'wna-investment'
  | 'wni-investment'
  | 'property'
  | 'legal'
  | 'visa'
  | 'family-benefits'
  | 'citizenship'
  | 'taxation';

interface InquiryContext {
  type: InquiryType;
  propertyTitle?: string;
  propertyId?: string;
  userName?: string;
  language?: string;
  customMessage?: string;
}

const messageTemplates: Record<InquiryType, { en: string; id: string }> = {
  'general': {
    en: `Hello ASTRA Villa! 👋

I would like to inquire about your services.

Please assist me with more information.

Thank you!`,
    id: `Halo ASTRA Villa! 👋

Saya ingin menanyakan tentang layanan Anda.

Mohon bantu saya dengan informasi lebih lanjut.

Terima kasih!`
  },
  'wna-investment': {
    en: `Hello ASTRA Villa! 👋

I'm interested in *Foreign Investment (WNA)* opportunities in Indonesia.

📋 I would like to know about:
• Eligible property types for foreigners
• Hak Pakai & Hak Guna Bangunan options
• Investment requirements & process
• Legal documentation needed

Please provide detailed information.

Thank you!`,
    id: `Halo ASTRA Villa! 👋

Saya tertarik dengan peluang *Investasi Asing (WNA)* di Indonesia.

📋 Saya ingin mengetahui tentang:
• Jenis properti yang memenuhi syarat untuk WNA
• Pilihan Hak Pakai & Hak Guna Bangunan
• Persyaratan & proses investasi
• Dokumentasi hukum yang diperlukan

Mohon berikan informasi lengkap.

Terima kasih!`
  },
  'wni-investment': {
    en: `Hello ASTRA Villa! 👋

I'm interested in *Indonesian Citizen (WNI) Investment* opportunities.

📋 I would like to know about:
• Available property options
• KPR financing options
• Investment process
• Required documents

Please provide detailed information.

Thank you!`,
    id: `Halo ASTRA Villa! 👋

Saya tertarik dengan peluang *Investasi WNI* (Warga Negara Indonesia).

📋 Saya ingin mengetahui tentang:
• Pilihan properti yang tersedia
• Opsi pembiayaan KPR
• Proses investasi
• Dokumen yang diperlukan

Mohon berikan informasi lengkap.

Terima kasih!`
  },
  'property': {
    en: `Hello ASTRA Villa! 👋

I'm interested in a specific property on your platform.

📍 Property Details:
{propertyInfo}

Please provide more information about this property.

Thank you!`,
    id: `Halo ASTRA Villa! 👋

Saya tertarik dengan properti tertentu di platform Anda.

📍 Detail Properti:
{propertyInfo}

Mohon berikan informasi lebih lanjut tentang properti ini.

Terima kasih!`
  },
  'legal': {
    en: `Hello ASTRA Villa! 👋

I need *Legal Consultation* regarding property investment in Indonesia.

⚖️ Topics I'm interested in:
• Property ownership regulations (PP No. 18/2021)
• Foreign ownership restrictions
• Legal documentation requirements
• PT PMA establishment process

Please connect me with your legal team.

Thank you!`,
    id: `Halo ASTRA Villa! 👋

Saya membutuhkan *Konsultasi Hukum* mengenai investasi properti di Indonesia.

⚖️ Topik yang saya minati:
• Peraturan kepemilikan properti (PP No. 18/2021)
• Pembatasan kepemilikan asing
• Persyaratan dokumentasi hukum
• Proses pendirian PT PMA

Mohon hubungkan saya dengan tim legal Anda.

Terima kasih!`
  },
  'visa': {
    en: `Hello ASTRA Villa! 👋

I need information about *Investor Visa* options in Indonesia.

🛂 I'm interested in:
• Investor KITAS requirements
• Second Home Visa program
• KITAP permanent residency
• Visa application process

Please provide detailed visa guidance.

Thank you!`,
    id: `Halo ASTRA Villa! 👋

Saya membutuhkan informasi tentang pilihan *Visa Investor* di Indonesia.

🛂 Saya tertarik dengan:
• Persyaratan Investor KITAS
• Program Second Home Visa
• KITAP tinggal permanen
• Proses aplikasi visa

Mohon berikan panduan visa yang lengkap.

Terima kasih!`
  },
  'family-benefits': {
    en: `Hello ASTRA Villa! 👋

I'm interested in *Family Benefits* for investor dependents.

👨‍👩‍👧‍👦 I would like to know about:
• Spouse/dependent KITAS options
• Children's education access
• Healthcare benefits
• Family visa process & costs

Please provide family-related information.

Thank you!`,
    id: `Halo ASTRA Villa! 👋

Saya tertarik dengan *Manfaat Keluarga* untuk tanggungan investor.

👨‍👩‍👧‍👦 Saya ingin mengetahui tentang:
• Pilihan KITAS pasangan/tanggungan
• Akses pendidikan anak
• Manfaat kesehatan
• Proses & biaya visa keluarga

Mohon berikan informasi terkait keluarga.

Terima kasih!`
  },
  'citizenship': {
    en: `Hello ASTRA Villa! 👋

I'm interested in *Citizenship & Residency* pathways in Indonesia.

🇮🇩 I would like to know about:
• Naturalization requirements
• KITAP permanent residency
• Long-term residency options
• Investment-based residency

Please provide citizenship guidance.

Thank you!`,
    id: `Halo ASTRA Villa! 👋

Saya tertarik dengan jalur *Kewarganegaraan & Residensi* di Indonesia.

🇮🇩 Saya ingin mengetahui tentang:
• Persyaratan naturalisasi
• KITAP tinggal permanen
• Opsi residensi jangka panjang
• Residensi berbasis investasi

Mohon berikan panduan kewarganegaraan.

Terima kasih!`
  },
  'taxation': {
    en: `Hello ASTRA Villa! 👋

I need information about *Property Taxation* in Indonesia.

💰 I'm interested in:
• BPHTB (acquisition tax)
• Annual property taxes (PBB)
• Capital gains tax
• Rental income taxation

Please provide tax guidance.

Thank you!`,
    id: `Halo ASTRA Villa! 👋

Saya membutuhkan informasi tentang *Perpajakan Properti* di Indonesia.

💰 Saya tertarik dengan:
• BPHTB (pajak perolehan)
• Pajak properti tahunan (PBB)
• Pajak capital gains
• Perpajakan pendapatan sewa

Mohon berikan panduan perpajakan.

Terima kasih!`
  }
};

export const generateWhatsAppMessage = (context: InquiryContext): string => {
  const lang = context.language || 'en';
  let template = messageTemplates[context.type][lang];

  // Add user name if available
  if (context.userName) {
    const greeting = lang === 'en' ? `My name is ${context.userName}.` : `Nama saya ${context.userName}.`;
    template = template.replace('👋\n\n', `👋\n\n${greeting}\n\n`);
  }

  // Add property info if available
  if (context.propertyTitle || context.propertyId) {
    const propertyInfo = context.propertyTitle 
      ? `• ${context.propertyTitle}${context.propertyId ? ` (ID: ${context.propertyId})` : ''}`
      : `• Property ID: ${context.propertyId}`;
    template = template.replace('{propertyInfo}', propertyInfo);
  }

  // Add custom message if provided
  if (context.customMessage) {
    const additionalNote = lang === 'en' 
      ? `\n\n📝 Additional Note:\n${context.customMessage}`
      : `\n\n📝 Catatan Tambahan:\n${context.customMessage}`;
    template = template.replace('Thank you!', `${additionalNote}\n\nThank you!`);
    template = template.replace('Terima kasih!', `${additionalNote}\n\nTerima kasih!`);
  }

  return template;
};

export const openWhatsAppChat = (context: InquiryContext): void => {
  const message = generateWhatsAppMessage(context);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

export const getWhatsAppLink = (context: InquiryContext): string => {
  const message = generateWhatsAppMessage(context);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`;
};
