# AGENTS.md

- Theme colors live only in the `:root` / `.dark` token blocks of `src/index.css` (HSL triplets) plus Tailwind aliases in `tailwind.config.ts`; why: one palette change must reach every route.
- REOS marketing surfaces (shell, homepage) read their CSS vars from the single `reosTokens` string exported by `src/components/reos/ReosShell.tsx`; why: duplicated per-page palettes drifted apart.
- The "matte finish" layer at the end of `src/index.css` neutralizes legacy glow/shimmer/glossy classes globally and must stay last in the file; why: legacy effect classes are spread across many pages.
- RLS helper functions that only gate policies live in the `private` schema (not exposed through the API); why: keeps internal access checks from being callable directly.
- On phones the REOS header shows only logo/wordmark plus round search, notifications and menu buttons; sign-in, account, navigation, language and theme live in the ReosHeader drawer (also opened by the bottom bar "Ecosystem" tab via `REOS_OPEN_MENU_EVENT`) and the bottom tab bar; why: one mobile menu avoids clipped header controls.
- Every sign-up, password-change and reset form validates through `src/lib/passwordPolicy.ts` (also enforced in `AuthContext.signUp`) and shows `PasswordStrengthBar`; why: one weak-password list and rule set instead of per-form checks.
