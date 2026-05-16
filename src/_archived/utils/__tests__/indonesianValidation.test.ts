import { describe, it, expect } from 'vitest';
import { IndonesianValidator, PROVINCE_MINIMUM_WAGES } from '../indonesianValidation';

describe('IndonesianValidator.validateKTP', () => {
  it('validates correct 16-digit KTP', () => {
    expect(IndonesianValidator.validateKTP('3171012345678901').isValid).toBe(true);
  });

  it('rejects short KTP', () => {
    expect(IndonesianValidator.validateKTP('12345').isValid).toBe(false);
  });

  it('rejects KTP with letters', () => {
    expect(IndonesianValidator.validateKTP('317101ABCD678901').isValid).toBe(false);
  });
});

describe('IndonesianValidator.validatePhoneNumber', () => {
  it('validates +62 format', () => {
    expect(IndonesianValidator.validatePhoneNumber('+6281234567890').isValid).toBe(true);
  });

  it('validates 08 format', () => {
    expect(IndonesianValidator.validatePhoneNumber('081234567890').isValid).toBe(true);
  });

  it('rejects invalid phone', () => {
    expect(IndonesianValidator.validatePhoneNumber('12345').isValid).toBe(false);
  });
});

describe('IndonesianValidator.validateDocument', () => {
  it('validates correct NPWP format', () => {
    const result = IndonesianValidator.validateDocument('nomor_npwp', '12.345.678.9-012.345');
    expect(result.isValid).toBe(true);
  });

  it('rejects invalid NPWP', () => {
    const result = IndonesianValidator.validateDocument('nomor_npwp', 'invalid');
    expect(result.isValid).toBe(false);
  });

  it('returns error for unknown document type', () => {
    const result = IndonesianValidator.validateDocument('unknown_doc', 'value');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Unknown');
  });
});

describe('IndonesianValidator.validateDailyRate', () => {
  it('passes when rate meets minimum wage', () => {
    const dki = PROVINCE_MINIMUM_WAGES.find(p => p.code === 'DKI')!;
    const result = IndonesianValidator.validateDailyRate(dki.minimumWage, 'DKI');
    expect(result.isValid).toBe(true);
  });

  it('fails when rate is below minimum wage', () => {
    const result = IndonesianValidator.validateDailyRate(100000, 'DKI');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('UMP');
  });

  it('fails for unknown province', () => {
    const result = IndonesianValidator.validateDailyRate(5000000, 'XX');
    expect(result.isValid).toBe(false);
  });
});

describe('IndonesianValidator.getMinimumWage', () => {
  it('returns wage for known province', () => {
    const wage = IndonesianValidator.getMinimumWage('DKI');
    expect(wage).not.toBeNull();
    expect(wage!.minimumWage).toBeGreaterThan(0);
  });

  it('returns null for unknown province', () => {
    expect(IndonesianValidator.getMinimumWage('ZZ')).toBeNull();
  });
});

describe('IndonesianValidator.formatIDR', () => {
  it('formats number as IDR currency', () => {
    const formatted = IndonesianValidator.formatIDR(1000000);
    expect(formatted).toContain('1.000.000');
  });
});

describe('IndonesianValidator.validateBusinessRegistration', () => {
  it('passes when all docs provided', () => {
    const result = IndonesianValidator.validateBusinessRegistration('cleaning_commercial', {
      siup: 'SIUP-123', npwp: '12.345', asuransi: 'INS-456',
    });
    expect(result.isValid).toBe(true);
    expect(result.missingDocs).toHaveLength(0);
  });

  it('fails with missing docs', () => {
    const result = IndonesianValidator.validateBusinessRegistration('cleaning_commercial', {});
    expect(result.isValid).toBe(false);
    expect(result.missingDocs.length).toBeGreaterThan(0);
  });

  it('falls back to siup+npwp for unknown category', () => {
    const result = IndonesianValidator.validateBusinessRegistration('unknown_cat', {});
    expect(result.missingDocs).toContain('siup');
    expect(result.missingDocs).toContain('npwp');
  });
});

describe('IndonesianValidator.validateFile', () => {
  it('passes valid file', () => {
    const file = new File(['test'], 'doc.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
    expect(IndonesianValidator.validateFile(file).isValid).toBe(true);
  });

  it('rejects file exceeding max size', () => {
    const file = new File(['test'], 'big.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB
    expect(IndonesianValidator.validateFile(file).isValid).toBe(false);
  });

  it('rejects unsupported file type', () => {
    const file = new File(['test'], 'doc.exe', { type: 'application/x-msdownload' });
    Object.defineProperty(file, 'size', { value: 1024 });
    expect(IndonesianValidator.validateFile(file).isValid).toBe(false);
  });
});
