

## Add Gold Hover Micro-Interactions to Property Cards

### Current State
- **PropertyCard** — Already has gold hover: `hover:border-gold-primary/40`, `hover:shadow-[0_8px_30px_-8px_hsl(var(--gold-primary)/0.2)]`, `hover:-translate-y-1`
- **CompactPropertyCard** — Uses generic `hover:shadow-primary/10`, no gold-specific border glow
- **ASTRAVillaPropertyCard** — Uses generic `hover:border-primary/40`, `hover:shadow-primary/10`, no gold-specific styling

### Plan

**1. CompactPropertyCard (`src/components/property/CompactPropertyCard.tsx`)**
- Replace `hover:shadow-xl hover:shadow-primary/10` with `hover:shadow-[0_8px_30px_-8px_hsl(var(--gold-primary)/0.2)]`
- Replace `border border-border` with `border border-border hover:border-gold-primary/40`
- Keep existing `hover:-translate-y-1` lift effect

**2. ASTRAVillaPropertyCard (`src/components/property/ASTRAVillaPropertyCard.tsx`)**
- Replace `hover:border-primary/40` with `hover:border-gold-primary/40`
- Replace `hover:shadow-xl hover:shadow-primary/10` with `hover:shadow-[0_8px_30px_-8px_hsl(var(--gold-primary)/0.2)]`
- Keep existing `hover:-translate-y-1` lift effect

**3. SimilarProperties cards** — Already uses ASTRAVillaPropertyCard, so changes propagate automatically.

### Scope
Three class string updates across two files. No new CSS or keyframes needed — leverages the existing `--gold-primary` CSS variable.

