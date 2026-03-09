
# Plan: Edge Function Consolidation

## Status: ✅ COMPLETE

Consolidated **82 standalone Edge Functions → 6 unified routers**.

## Final Architecture

| Router | Modes/Responsibilities |
|--------|----------------------|
| `ai-engine` | generate_description, generate_image, nlp_search, match_property, seo_generate, recommendations, transcribe_audio, virtual_staging, market_report, property_assistant, smart_pricing, lead_scoring, etc. (25+ modes) |
| `auth-engine` | Auth, KYC, device registration, session heartbeat, verification requests, OTP, 2FA |
| `core-engine` | Diagnostics, algorithms, location sync, Astra tokens, health checks, analytics, auto_tune_ai_weights, investment_score, ai_brain, deal_detector, etc. (25+ modes) |
| `notification-engine` | Emails, inquiry notifications, campaign emails, push notifications |
| `payment-engine` | Midtrans, PayPal, invoices, booking payments, mortgages, refunds, subscriptions |
| `vendor-engine` | Vendor services, validation, function generation, Indonesian vendor onboarding |

## AI Model Auto-Tuning
- `ai_model_weights` table with 6 factors (location, price, feature, investment, popularity, collaborative)
- `ai_recommendation_events` table for conversion tracking
- Daily pg_cron job runs `auto_tune_ai_weights` mode
- Guardrails: ±3 max change, minimum 5 per factor, sum=100
