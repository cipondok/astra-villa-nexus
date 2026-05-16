// Phone number validation with country detection

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  pattern: RegExp;
}

export const countries: CountryInfo[] = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62', pattern: /^(\+62|62|0)8[1-9][0-9]{7,10}$/ },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60', pattern: /^(\+60|60|0)1[0-9]{8,9}$/ },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65', pattern: /^(\+65|65)?[89][0-9]{7}$/ },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66', pattern: /^(\+66|66|0)[689][0-9]{8}$/ },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63', pattern: /^(\+63|63|0)9[0-9]{9}$/ },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84', pattern: /^(\+84|84|0)[35789][0-9]{8}$/ },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', pattern: /^(\+61|61|0)4[0-9]{8}$/ },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', pattern: /^(\+1|1)?[2-9][0-9]{9}$/ },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', pattern: /^(\+44|44|0)7[0-9]{9}$/ },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', pattern: /^(\+81|81|0)[789]0[0-9]{8}$/ },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82', pattern: /^(\+82|82|0)1[0-9]{8,9}$/ },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86', pattern: /^(\+86|86)?1[3-9][0-9]{9}$/ },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', pattern: /^(\+91|91|0)?[6-9][0-9]{9}$/ },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', dialCode: '+971', pattern: /^(\+971|971|0)?5[0-9]{8}$/ },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', pattern: /^(\+966|966|0)?5[0-9]{8}$/ },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', pattern: /^(\+49|49|0)1[5-7][0-9]{8,10}$/ },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', pattern: /^(\+33|33|0)[67][0-9]{8}$/ },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', pattern: /^(\+31|31|0)6[0-9]{8}$/ },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7', pattern: /^(\+7|7|8)?9[0-9]{9}$/ },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', pattern: /^(\+55|55)?[1-9][0-9]{10}$/ },
];

export interface PhoneValidationResult {
  isValid: boolean;
  country: CountryInfo | null;
  formatted: string;
}

export const validatePhoneNumber = (phone: string): PhoneValidationResult => {
  if (!phone) {
    return { isValid: false, country: null, formatted: '' };
  }

  // Clean the phone number (remove spaces, dashes, parentheses)
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Try to match against known country patterns
  for (const country of countries) {
    if (country.pattern.test(cleaned)) {
      return {
        isValid: true,
        country,
        formatted: cleaned
      };
    }
  }

  // Check for generic international format (starts with +)
  if (/^\+[1-9][0-9]{6,14}$/.test(cleaned)) {
    // Try to detect country from dial code
    for (const country of countries) {
      if (cleaned.startsWith(country.dialCode.replace('+', '')) || cleaned.startsWith(country.dialCode)) {
        return {
          isValid: true,
          country,
          formatted: cleaned
        };
      }
    }
    // Valid international format but unknown country
    return {
      isValid: true,
      country: { code: 'INT', name: 'International', flag: '🌍', dialCode: '', pattern: /.*/ },
      formatted: cleaned
    };
  }

  // Basic validation for minimum length
  if (cleaned.length >= 8 && cleaned.length <= 15 && /^[0-9+]+$/.test(cleaned)) {
    return {
      isValid: true,
      country: { code: 'INT', name: 'International', flag: '🌍', dialCode: '', pattern: /.*/ },
      formatted: cleaned
    };
  }

  return { isValid: false, country: null, formatted: cleaned };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

// Name validation (at least 2 characters, letters and spaces only)
export const validateName = (name: string): boolean => {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && /^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(trimmed);
};

/**
 * Validates Indonesian phone number format (legacy function)
 */
export function validateIndonesianPhone(phone: string): { isValid: boolean; message?: string } {
  const result = validatePhoneNumber(phone);
  if (result.isValid && result.country?.code === 'ID') {
    return { isValid: true };
  }
  if (result.isValid) {
    return { isValid: true };
  }
  return { 
    isValid: false, 
    message: 'Invalid phone number format' 
  };
}

/**
 * Formats Indonesian phone number for display
 */
export function formatIndonesianPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  if (cleanPhone.startsWith('+628')) {
    const number = cleanPhone.substring(3);
    return `+62 ${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}`;
  }
  
  if (cleanPhone.startsWith('08')) {
    return `${cleanPhone.substring(0, 4)}-${cleanPhone.substring(4, 8)}-${cleanPhone.substring(8)}`;
  }
  
  if (cleanPhone.startsWith('0')) {
    const areaCodeLength = cleanPhone.startsWith('021') ? 3 : 3;
    return `${cleanPhone.substring(0, areaCodeLength)}-${cleanPhone.substring(areaCodeLength, areaCodeLength + 4)}-${cleanPhone.substring(areaCodeLength + 4)}`;
  }
  
  return phone;
}
