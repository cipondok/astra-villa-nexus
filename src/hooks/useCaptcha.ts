import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

/**
 * Custom hook for reCAPTCHA v3 integration
 * 
 * @example
 * ```typescript
 * const { executeRecaptcha } = useCaptcha();
 * 
 * const handleSubmit = async (e) => {
 *   e.preventDefault();
 *   const token = await executeRecaptcha('form_submission');
 *   if (!token) return;
 *   
 *   // Send token to backend for verification
 *   await fetch('/api/submit', {
 *     method: 'POST',
 *     body: JSON.stringify({ ...formData, captchaToken: token })
 *   });
 * };
 * ```
 */
export const useCaptcha = () => {
  const { executeRecaptcha: googleExecuteRecaptcha } = useGoogleReCaptcha();

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!googleExecuteRecaptcha) {
        console.warn('reCAPTCHA not available. Skipping captcha verification.');
        return null;
      }

      try {
        const token = await googleExecuteRecaptcha(action);
        return token;
      } catch (error) {
        console.error('Error executing reCAPTCHA:', error);
        return null;
      }
    },
    [googleExecuteRecaptcha]
  );

  return {
    executeRecaptcha,
    isAvailable: !!googleExecuteRecaptcha,
  };
};
