# Captcha Security Setup Guide

This guide shows you how to add Google reCAPTCHA v3 protection to your forms.

## 🔐 What's Included

1. **CaptchaProvider** - Context provider for reCAPTCHA
2. **useCaptcha Hook** - Easy-to-use hook for forms
3. **verify-captcha Edge Function** - Backend verification
4. **captchaVerification Utility** - Helper for API calls

## 📋 Setup Steps

### Step 1: Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register a new site:
   - **Label**: Your site name
   - **reCAPTCHA type**: Choose "reCAPTCHA v3"
   - **Domains**: Add your domain(s)
3. Copy your **Site Key** and **Secret Key**

### Step 2: Configure Site Key

Open `src/contexts/CaptchaContext.tsx` and replace:

```typescript
const RECAPTCHA_SITE_KEY = "YOUR_RECAPTCHA_SITE_KEY_HERE";
```

With your actual site key:

```typescript
const RECAPTCHA_SITE_KEY = "6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
```

### Step 3: Add Secret Key to Supabase

The secret key must be stored securely in Supabase:

1. Go to your [Supabase Edge Functions Settings](https://supabase.com/dashboard/project/zymrajuuyyfkzdmptebl/settings/functions)
2. Add a new secret:
   - **Name**: `RECAPTCHA_SECRET_KEY`
   - **Value**: Your reCAPTCHA secret key

### Step 4: Wrap Your App with CaptchaProvider

Update `src/App.tsx`:

```typescript
import { CaptchaProvider } from '@/contexts/CaptchaContext';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="astra-villa-theme">
            <LanguageProvider>
              <CaptchaProvider>  {/* Add this */}
                <AlertProvider>
                  {/* ... rest of your providers */}
                </AlertProvider>
              </CaptchaProvider>  {/* Add this */}
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
}
```

## 🎯 How to Use in Forms

### Basic Integration

```typescript
import { useCaptcha } from '@/hooks/useCaptcha';
import { verifyCaptchaToken } from '@/utils/captchaVerification';

const MyForm = () => {
  const { executeRecaptcha, isAvailable } = useCaptcha();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Execute captcha
      if (isAvailable) {
        const token = await executeRecaptcha('form_submission');
        
        if (!token) {
          alert('Captcha failed');
          return;
        }

        // 2. Verify on backend
        const result = await verifyCaptchaToken(token, 'form_submission');
        
        if (!result.success) {
          alert('Security check failed');
          return;
        }
      }

      // 3. Submit your form
      await submitFormData();
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
};
```

## 📝 Apply to Existing Partner Forms

Check the example file: `src/pages/partners/PartnerNetworkWithCaptcha.example.tsx`

To add captcha to your partner forms:

1. Import the hooks:
```typescript
import { useCaptcha } from '@/hooks/useCaptcha';
import { verifyCaptchaToken } from '@/utils/captchaVerification';
```

2. Use in your component:
```typescript
const { executeRecaptcha, isAvailable } = useCaptcha();
```

3. Update handleSubmit to include captcha verification (see example file)

## 🔍 Action Names

Use descriptive action names for different forms:
- `'partner_network_form'` - Partner Network form
- `'become_partner_form'` - Become Partner form
- `'partner_benefits_form'` - Benefits inquiry form
- `'joint_ventures_form'` - Joint Ventures form
- `'contact_form'` - General contact forms

## 🛡️ Security Features

- ✅ Invisible reCAPTCHA v3 (no user interaction needed)
- ✅ Score-based verification (0.0 - 1.0)
- ✅ Action verification to prevent token reuse
- ✅ Server-side verification via Edge Function
- ✅ Minimum score threshold (0.5 by default)

## ⚙️ Configuration

### Adjust Score Threshold

In `supabase/functions/verify-captcha/index.ts`, change:

```typescript
const minimumScore = 0.5; // Adjust from 0.0 (bot) to 1.0 (human)
```

Lower scores = more strict (may block real users)
Higher scores = more lenient (may allow more bots)

## 🧪 Testing

1. **Development Mode**: Captcha is optional during development
2. **Production**: Add your production domain to reCAPTCHA admin
3. **Test Scores**: reCAPTCHA admin shows verification analytics

## 📚 Resources

- [reCAPTCHA v3 Docs](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
