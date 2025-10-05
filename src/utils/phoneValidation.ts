/**
 * Validates Indonesian phone number format
 * Accepts formats:
 * - 08xx-xxxx-xxxx (mobile)
 * - +62 8xx-xxxx-xxxx (mobile with country code)
 * - 021-xxxx-xxxx (landline Jakarta)
 * - +62 21-xxxx-xxxx (landline with country code)
 */
export function validateIndonesianPhone(phone: string): { isValid: boolean; message?: string } {
  // Remove all spaces and dashes for validation
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Check if it starts with +62 (country code)
  if (cleanPhone.startsWith('+62')) {
    const withoutCountryCode = cleanPhone.substring(3);
    
    // Mobile number (should start with 8 and be 9-12 digits)
    if (withoutCountryCode.startsWith('8')) {
      if (withoutCountryCode.length >= 9 && withoutCountryCode.length <= 12) {
        return { isValid: true };
      }
      return { 
        isValid: false, 
        message: 'Mobile number should be 9-12 digits after +62' 
      };
    }
    
    // Landline (should start with area code like 21, 22, etc. and be 8-11 digits total)
    if (/^[2-9]/.test(withoutCountryCode)) {
      if (withoutCountryCode.length >= 8 && withoutCountryCode.length <= 11) {
        return { isValid: true };
      }
      return { 
        isValid: false, 
        message: 'Landline number should be 8-11 digits after +62' 
      };
    }
    
    return { 
      isValid: false, 
      message: 'Invalid Indonesian phone number format' 
    };
  }
  
  // Check if it starts with 0 (local format)
  if (cleanPhone.startsWith('0')) {
    // Mobile number (starts with 08)
    if (cleanPhone.startsWith('08')) {
      if (cleanPhone.length >= 10 && cleanPhone.length <= 13) {
        return { isValid: true };
      }
      return { 
        isValid: false, 
        message: 'Mobile number should be 10-13 digits starting with 08' 
      };
    }
    
    // Landline (starts with 0 followed by area code)
    if (/^0[2-9]/.test(cleanPhone)) {
      if (cleanPhone.length >= 9 && cleanPhone.length <= 12) {
        return { isValid: true };
      }
      return { 
        isValid: false, 
        message: 'Landline number should be 9-12 digits starting with 0' 
      };
    }
    
    return { 
      isValid: false, 
      message: 'Invalid Indonesian phone number format' 
    };
  }
  
  return { 
    isValid: false, 
    message: 'Phone number must start with +62 or 0' 
  };
}

/**
 * Formats Indonesian phone number for display
 */
export function formatIndonesianPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Format +62 8xx numbers
  if (cleanPhone.startsWith('+628')) {
    const number = cleanPhone.substring(3);
    return `+62 ${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}`;
  }
  
  // Format 08xx numbers
  if (cleanPhone.startsWith('08')) {
    return `${cleanPhone.substring(0, 4)}-${cleanPhone.substring(4, 8)}-${cleanPhone.substring(8)}`;
  }
  
  // Format landline numbers
  if (cleanPhone.startsWith('0')) {
    const areaCodeLength = cleanPhone.startsWith('021') ? 3 : 3;
    return `${cleanPhone.substring(0, areaCodeLength)}-${cleanPhone.substring(areaCodeLength, areaCodeLength + 4)}-${cleanPhone.substring(areaCodeLength + 4)}`;
  }
  
  return phone;
}
