

## What's Been Built So Far

The recent conversation has focused on the KPR (mortgage) calculator ecosystem and property recommendations:

1. Amortization schedule chart (principal vs interest breakdown)
2. Bank comparison widget integrated into property detail
3. Affordability calculator with DTI ratio
4. Enhanced recommendation engine with user behavior signals
5. "Why this match?" score breakdown on recommendation cards
6. Tiered candidate queries for better recommendation results

## Suggested Next Steps

Here are logical next features to continue building on this foundation:

1. **Optimize property detail page load performance** — The testing revealed 15-20s load times due to excessive `system_settings` queries. Consolidating these into a single cached query would significantly improve UX.

2. **Add a mortgage pre-qualification flow** — Extend the affordability calculator into a step-by-step pre-qualification wizard that collects income documentation details and generates a shareable pre-qualification letter (PDF).

3. **Save and compare KPR scenarios** — Let users save multiple mortgage configurations (different down payments, terms, banks) and compare them side-by-side.

4. **User interaction tracking for recommendations** — The recommendation engine reads from `user_interactions` and `activity_logs`, but property views and searches may not be consistently logged. Adding tracking hooks would improve personalization accuracy.

5. **Real-time collaborative search recommendations** — The `useCollaborativeRecommendations` hook exists but the Edge Function `get-collaborative-recommendations` may need implementation or testing.

Pick any direction and I'll create a detailed implementation plan.

