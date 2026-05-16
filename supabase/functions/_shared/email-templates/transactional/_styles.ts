// Shared styles for all transactional email templates — Astra Villa brand
export const brand = {
  primary: '#00A3F5',
  foreground: '#0d1f2d',
  muted: '#5c6e7f',
  lightBg: '#f0f9ff',
  radius: '10px',
  siteName: 'Astra Villa Realty',
  tagline: 'Your gateway to premium Indonesian property.',
}

export const main = { backgroundColor: '#f6f9fc', fontFamily: "'Inter', Arial, sans-serif" }
export const wrapper = { backgroundColor: '#ffffff', borderRadius: '12px', margin: '40px auto', maxWidth: '560px', overflow: 'hidden' as const }
export const header = { backgroundColor: brand.primary, padding: '24px 28px', textAlign: 'center' as const }
export const logoText = { fontSize: '20px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0', fontFamily: "'Playfair Display', Georgia, serif" }
export const content = { padding: '32px 28px' }
export const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: brand.foreground, margin: '0 0 18px' }
export const text = { fontSize: '14px', color: brand.muted, lineHeight: '1.6', margin: '0 0 16px' }
export const button = { backgroundColor: brand.primary, color: '#ffffff', fontSize: '14px', borderRadius: brand.radius, padding: '12px 24px', textDecoration: 'none', fontWeight: '600' as const, display: 'inline-block' }
export const detailsBox = { backgroundColor: brand.lightBg, borderRadius: brand.radius, padding: '20px', margin: '0 0 20px' }
export const detailLabel = { fontSize: '11px', color: brand.muted, textTransform: 'uppercase' as const, margin: '0 0 2px', fontWeight: '600' as const, letterSpacing: '0.5px' }
export const detailValue = { fontSize: '15px', color: brand.foreground, margin: '0 0 14px', fontWeight: '500' as const }
export const quoteBox = { backgroundColor: brand.lightBg, borderLeft: `3px solid ${brand.primary}`, borderRadius: `0 ${brand.radius} ${brand.radius} 0`, padding: '16px 20px', margin: '0 0 20px' }
export const quoteText = { fontSize: '14px', color: brand.foreground, lineHeight: '1.6', margin: '0', fontStyle: 'italic' as const }
export const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
export const footerWrap = { padding: '0 28px 28px' }
export const footer = { fontSize: '12px', color: '#999999', margin: '0', textAlign: 'center' as const }
