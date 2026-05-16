import { SITE } from "@/config/site";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function defaultInquiryMessage(propertyTitle?: string): string {
  if (propertyTitle) {
    return `Halo ASTRA Villa, saya tertarik dengan properti "${propertyTitle}". Mohon info lebih lanjut.`;
  }
  return `Halo ASTRA Villa, saya tertarik dengan layanan properti Anda.`;
}
