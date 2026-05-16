/**
 * Content censoring utilities to automatically mask prohibited content
 */

const PHONE_PATTERN = /(\+?62|0)\s?8\d{2,3}[\s-]?\d{3,4}[\s-]?\d{3,4}|\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_PATTERN = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|id|co\.id)[^\s]*)/g;
const WHATSAPP_PATTERN = /wa\.me\/[\d]+|whatsapp\.com\/[\d]+/gi;

export class ContentCensor {
  /**
   * Censors phone numbers, emails, and URLs by replacing them with 'x' characters
   */
  static censorContent(text: string): string {
    let censored = text;
    
    // Censor phone numbers
    censored = censored.replace(PHONE_PATTERN, (match) => 'x'.repeat(match.length));
    
    // Censor email addresses
    censored = censored.replace(EMAIL_PATTERN, (match) => 'x'.repeat(match.length));
    
    // Censor URLs
    censored = censored.replace(URL_PATTERN, (match) => 'x'.repeat(match.length));
    
    // Censor WhatsApp links
    censored = censored.replace(WHATSAPP_PATTERN, (match) => 'x'.repeat(match.length));
    
    return censored;
  }

  /**
   * Checks if content contains prohibited information
   */
  static containsProhibitedContent(text: string): boolean {
    return PHONE_PATTERN.test(text) || 
           EMAIL_PATTERN.test(text) || 
           URL_PATTERN.test(text) ||
           WHATSAPP_PATTERN.test(text);
  }
}
