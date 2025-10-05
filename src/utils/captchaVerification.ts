import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies a reCAPTCHA token on the server
 * 
 * @param token - The reCAPTCHA token from executeRecaptcha
 * @param action - The action name used when generating the token
 * @returns Promise with verification result
 */
export async function verifyCaptchaToken(
  token: string, 
  action: string
): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-captcha', {
      body: { token, action }
    });

    if (error) {
      console.error('Captcha verification error:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Error calling verify-captcha function:', error);
    return { success: false, error: 'Failed to verify captcha' };
  }
}
