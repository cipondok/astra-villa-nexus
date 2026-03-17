

## Smooth Alternating Section Backgrounds

### Current State
Sections already alternate between `bg-background` and `bg-muted/20`, but transitions are hard-edged — no visual blending between adjacent sections.

### Plan

**1. Create a reusable `SectionWrapper` component** (`src/components/ui/SectionWrapper.tsx`)
- Accepts `variant`: `"default"` | `"muted"` | `"accent"`
- Renders top/bottom gradient fade overlays (8-12px tall) that blend from one background into the next
- Accepts children and optional `id`, `className` props

Variant styles:
- `default` → `bg-background`
- `muted` → `bg-muted/30` with a very subtle warm tint
- `accent` → `bg-gradient-to-b from-primary/[0.03] to-background`

Each variant includes:
- Top edge: `h-3 bg-gradient-to-b from-transparent to-current-bg` (smooth fade-in)
- Bottom edge: `h-3 bg-gradient-to-b from-current-bg to-transparent` (smooth fade-out)

**2. Update `src/pages/Index.tsx`** — Replace raw `<div className="bg-background">` and `<div className="bg-muted/20">` wrappers with `<SectionWrapper variant="...">` for the 8 discovery sections:

| Section | Variant |
|---|---|
| Featured Properties | `default` |
| AI Opportunity Zone | `muted` |
| Smart Collections | `default` |
| Investor Path | `muted` |
| AI Tools Preview | `default` |
| Marketplace/Partners | `muted` |
| ASTRA Showcase | `accent` |
| Final CTA | `muted` |

The gradient edges create a smooth ~12px visual blend between sections instead of abrupt color changes, giving the page a polished, flowing rhythm.

### Technical Notes
- Gradient overlays use `pointer-events-none` and `aria-hidden` so they don't interfere with content
- No new dependencies — pure Tailwind CSS
- The ASTRA Showcase gets a distinct `accent` variant with a subtle primary tint to make it stand out

