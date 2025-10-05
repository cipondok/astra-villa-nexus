/**
 * Generate a random captcha code with mixed alphanumeric characters
 */
export const generateCaptchaCode = (length: number = 6): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate user input against captcha code (case-insensitive)
 */
export const validateCaptcha = (userInput: string, captchaCode: string): boolean => {
  return userInput.toUpperCase() === captchaCode.toUpperCase();
};
