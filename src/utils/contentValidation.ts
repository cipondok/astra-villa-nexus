import { z } from 'zod';

/**
 * Content validation utilities to prevent contact information and code injection
 */

// Patterns to detect prohibited content
const PHONE_PATTERN = /(\+?62|0)\s?8\d{2,3}[\s-]?\d{3,4}[\s-]?\d{3,4}|\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_PATTERN = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|id|co\.id)[^\s]*)/g;
const WHATSAPP_PATTERN = /wa\.me|whatsapp/gi;
const CODE_PATTERN = /<script|<iframe|javascript:|on\w+\s*=|<\?php|eval\(|exec\(/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ContentValidator {
  /**
   * Validates description text for prohibited content
   */
  static validateDescription(text: string, language: 'en' | 'id' = 'en'): ValidationResult {
    const errors: string[] = [];
    
    const messages = {
      en: {
        phone: 'Phone numbers are not allowed in description',
        email: 'Email addresses are not allowed in description',
        url: 'URLs and website links are not allowed in description',
        whatsapp: 'WhatsApp links are not allowed in description',
        code: 'Code or scripts are not allowed in description',
        htmlTags: 'HTML tags are not allowed in description',
      },
      id: {
        phone: 'Nomor telepon tidak diperbolehkan dalam deskripsi',
        email: 'Alamat email tidak diperbolehkan dalam deskripsi',
        url: 'URL dan tautan website tidak diperbolehkan dalam deskripsi',
        whatsapp: 'Tautan WhatsApp tidak diperbolehkan dalam deskripsi',
        code: 'Kode atau script tidak diperbolehkan dalam deskripsi',
        htmlTags: 'Tag HTML tidak diperbolehkan dalam deskripsi',
      }
    };

    const t = messages[language];

    // Check for phone numbers
    if (PHONE_PATTERN.test(text)) {
      errors.push(t.phone);
    }

    // Check for email addresses
    if (EMAIL_PATTERN.test(text)) {
      errors.push(t.email);
    }

    // Check for URLs
    if (URL_PATTERN.test(text)) {
      errors.push(t.url);
    }

    // Check for WhatsApp
    if (WHATSAPP_PATTERN.test(text)) {
      errors.push(t.whatsapp);
    }

    // Check for code injection
    if (CODE_PATTERN.test(text)) {
      errors.push(t.code);
    }

    // Check for HTML tags
    if (HTML_TAG_PATTERN.test(text)) {
      errors.push(t.htmlTags);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Creates a Zod schema for description validation
   */
  static createDescriptionSchema(language: 'en' | 'id' = 'en') {
    return z.string()
      .trim()
      .min(50, language === 'en' ? 'Description must be at least 50 characters' : 'Deskripsi minimal 50 karakter')
      .max(2000, language === 'en' ? 'Description must be less than 2000 characters' : 'Deskripsi maksimal 2000 karakter')
      .refine(
        (text) => this.validateDescription(text, language).isValid,
        (text) => ({
          message: this.validateDescription(text, language).errors[0] || 'Invalid content'
        })
      );
  }
}
