# AGENTS.md

- Theme colors live only in the `:root` / `.dark` token blocks of `src/index.css` (HSL triplets) plus Tailwind aliases in `tailwind.config.ts`; why: one palette change must reach every route.
- REOS marketing surfaces (shell, homepage) read their CSS vars from the single `reosTokens` string exported by `src/components/reos/ReosShell.tsx`; why: duplicated per-page palettes drifted apart.
- The "matte finish" layer at the end of `src/index.css` neutralizes legacy glow/shimmer/glossy classes globally and must stay last in the file; why: legacy effect classes are spread across many pages.
