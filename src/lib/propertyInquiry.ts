/**
 * Property enquiry rules shared by the listing page and its tests.
 * Rows go to the existing `inquiries` table; its insert policy re-checks the
 * same rules (contact present, listing approved/live/non-demo) and the
 * on_inquiry_created trigger turns each enquiry into a lead for the owner/agent.
 */
export interface InquiryContact {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export type InquiryProblem = 'contactRequired' | 'messageRequired';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const digits = (v: string) => (v || '').replace(/\D/g, '');

export function validateInquiryContact(c: InquiryContact): InquiryProblem | null {
  if (!(c.message || '').trim()) return 'messageRequired';
  const emailOk = EMAIL_RE.test((c.email || '').trim());
  const phoneOk = digits(c.phone).length >= 8 && digits(c.phone).length <= 15;
  if (!emailOk && !phoneOk) return 'contactRequired';
  return null;
}

export function buildInquiryRow(input: {
  kind: 'message' | 'visit';
  propertyId: string;
  propertyTitle?: string | null;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const email = (input.email || '').trim();
  const phone = (input.phone || '').trim();
  const title = (input.propertyTitle || '').trim().slice(0, 150);
  return {
    inquiry_type: input.kind === 'visit' ? 'property_viewing' : 'property_inquiry',
    subject: `${input.kind === 'visit' ? 'Viewing request' : 'Enquiry'}${title ? `: ${title}` : ''}`,
    message: input.message.trim().slice(0, 5000),
    contact_name: (input.name || '').trim().slice(0, 200) || null,
    contact_email: EMAIL_RE.test(email) ? email : null,
    contact_phone: digits(phone).length >= 8 ? phone.slice(0, 30) : null,
    property_id: input.propertyId,
    user_id: input.userId,
  };
}
