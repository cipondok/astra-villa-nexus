/**
 * Indonesian-specific validation rules for vendor registration
 */

export interface ValidationRule {
  field: string;
  rule: RegExp | ((value: any) => boolean);
  errorMessage: string;
  errorMessageId: string;
}

export interface ProvinceWage {
  code: string;
  name: string;
  minimumWage: number; // in IDR
  lastUpdated: string;
}

// Indonesian minimum wages by province (2024 data)
export const PROVINCE_MINIMUM_WAGES: ProvinceWage[] = [
  { code: 'DKI', name: 'DKI Jakarta', minimumWage: 5067381, lastUpdated: '2024-01-01' },
  { code: 'JB', name: 'Jawa Barat', minimumWage: 1986670, lastUpdated: '2024-01-01' },
  { code: 'JT', name: 'Jawa Tengah', minimumWage: 2018671, lastUpdated: '2024-01-01' },
  { code: 'JI', name: 'Jawa Timur', minimumWage: 2040000, lastUpdated: '2024-01-01' },
  { code: 'YG', name: 'DI Yogyakarta', minimumWage: 2002260, lastUpdated: '2024-01-01' },
  { code: 'BT', name: 'Banten', minimumWage: 2661532, lastUpdated: '2024-01-01' },
  { code: 'SU', name: 'Sumatera Utara', minimumWage: 2701522, lastUpdated: '2024-01-01' },
  { code: 'SB', name: 'Sumatera Barat', minimumWage: 2742476, lastUpdated: '2024-01-01' },
  { code: 'RI', name: 'Riau', minimumWage: 3191662, lastUpdated: '2024-01-01' },
  { code: 'JA', name: 'Jambi', minimumWage: 2943035, lastUpdated: '2024-01-01' }
];

// Indonesian validation rules
export const INDONESIAN_VALIDATION_RULES: ValidationRule[] = [
  {
    field: 'nomor_iujk',
    rule: /^IUJK-[A-Z]{2}\/\d{6}\/KBLI$/,
    errorMessage: 'Invalid IUJK number format',
    errorMessageId: 'Nomor IUJK tidak valid'
  },
  {
    field: 'nomor_skk',
    rule: /^SKK-[A-Z]{2}\/\d{6}\/LPJK$/,
    errorMessage: 'Invalid SKK number format',
    errorMessageId: 'Nomor SKK tidak valid'
  },
  {
    field: 'nomor_npwp',
    rule: /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/,
    errorMessage: 'Invalid NPWP format (XX.XXX.XXX.X-XXX.XXX)',
    errorMessageId: 'Format NPWP tidak valid (XX.XXX.XXX.X-XXX.XXX)'
  },
  {
    field: 'nomor_siup',
    rule: /^SIUP\/\d{4}\/\d{2}\/[A-Z]{2}\/\d{4}$/,
    errorMessage: 'Invalid SIUP format',
    errorMessageId: 'Format SIUP tidak valid'
  },
  {
    field: 'nomor_tdp',
    rule: /^TDP\/\d{13}$/,
    errorMessage: 'Invalid TDP format',
    errorMessageId: 'Format TDP tidak valid'
  }
];

export class IndonesianValidator {
  /**
   * Validate Indonesian business document numbers
   */
  static validateDocument(field: string, value: string): { isValid: boolean; message: string } {
    const rule = INDONESIAN_VALIDATION_RULES.find(r => r.field === field);
    
    if (!rule) {
      return { isValid: false, message: 'Unknown document type' };
    }
    
    if (rule.rule instanceof RegExp) {
      const isValid = rule.rule.test(value);
      return {
        isValid,
        message: isValid ? '' : rule.errorMessageId
      };
    }
    
    return { isValid: false, message: 'Invalid validation rule' };
  }

  /**
   * Validate file upload (KTP, certificates, etc.)
   */
  static validateFile(file: File, maxSizeMB: number = 5, allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']): { isValid: boolean; message: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        message: `Upload file (max ${maxSizeMB}MB)`
      };
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: 'Format file tidak didukung'
      };
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * Validate daily rate against provincial minimum wage
   */
  static validateDailyRate(rate: number, provinceCode: string): { isValid: boolean; message: string; minimumRequired: number } {
    const province = PROVINCE_MINIMUM_WAGES.find(p => p.code === provinceCode);
    
    if (!province) {
      return {
        isValid: false,
        message: 'Provinsi tidak ditemukan',
        minimumRequired: 0
      };
    }
    
    // Daily rate should be at least minimum wage
    const isValid = rate >= province.minimumWage;
    
    return {
      isValid,
      message: isValid ? '' : `Tarif di bawah UMP ${province.name} (Rp ${province.minimumWage.toLocaleString('id-ID')})`,
      minimumRequired: province.minimumWage
    };
  }

  /**
   * Validate KTP number (16 digits)
   */
  static validateKTP(ktpNumber: string): { isValid: boolean; message: string } {
    const ktpRegex = /^\d{16}$/;
    const isValid = ktpRegex.test(ktpNumber);
    
    return {
      isValid,
      message: isValid ? '' : 'Nomor KTP harus 16 digit'
    };
  }

  /**
   * Validate phone number (Indonesian format)
   */
  static validatePhoneNumber(phone: string): { isValid: boolean; message: string } {
    // Indonesian phone formats: +62xxx, 08xxx, 62xxx
    const phoneRegex = /^(\+62|62|0)8\d{8,11}$/;
    const isValid = phoneRegex.test(phone.replace(/[\s-]/g, ''));
    
    return {
      isValid,
      message: isValid ? '' : 'Format nomor telepon tidak valid'
    };
  }

  /**
   * Get minimum wage for province
   */
  static getMinimumWage(provinceCode: string): ProvinceWage | null {
    return PROVINCE_MINIMUM_WAGES.find(p => p.code === provinceCode) || null;
  }

  /**
   * Format currency in Indonesian Rupiah
   */
  static formatIDR(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Validate business registration based on category
   */
  static validateBusinessRegistration(category: string, documents: {[key: string]: string}): { isValid: boolean; missingDocs: string[]; messages: string[] } {
    const requirements: {[key: string]: string[]} = {
      'ac_repair': ['nomor_skk', 'sertifikat_teknisi', 'asuransi'],
      'cleaning_commercial': ['siup', 'npwp', 'asuransi'],
      'shifting_services': ['iujk', 'sim_b2', 'stnk_truck'],
      'car_rentals': ['siup', 'stnk', 'asuransi_kendaraan'],
      'furniture': ['siup', 'npwp', 'sertifikat_kayu']
    };

    const required = requirements[category] || ['siup', 'npwp'];
    const missingDocs: string[] = [];
    const messages: string[] = [];

    required.forEach(doc => {
      if (!documents[doc] || documents[doc].trim() === '') {
        missingDocs.push(doc);
        messages.push(`${doc.replace('_', ' ').toUpperCase()} diperlukan untuk kategori ini`);
      }
    });

    return {
      isValid: missingDocs.length === 0,
      missingDocs,
      messages
    };
  }
}

export default IndonesianValidator;