

## Plan: Compact System Health Widget with Expand/Collapse

**Problem**: The System Health zone takes up too much vertical space with two full cards (System Health + AI Systems) always expanded.

**Solution**: Merge both cards into a single compact card with a mini summary view (status dot + key metrics inline) that expands to show full details on click.

### Design

**Collapsed (default)**: Single row showing:
- Status dot (green/yellow/red) + "All Systems OK" or "Issues Detected"
- 3 inline mini metrics: DB response, SEO score, Job queue health
- Chevron toggle

**Expanded (on click)**: Reveals the full health bars + AI Systems service rows below the summary row, using Radix Collapsible for smooth animation.

### Technical Changes

1. **`src/components/admin/AdminOverview.tsx`** (lines 553-612):
   - Replace the two separate cards (System Health + AI Systems) with a single `<Card>` using `<Collapsible>`
   - Collapsed state: compact single-row summary with status badge + 3 mini metric pills
   - Expanded state: existing HealthBar rows + ServiceRow list
   - Default collapsed, toggle on header click

2. **No new files needed** — uses existing `Collapsible` component from `src/components/ui/collapsible.tsx`

### Visual Layout

```text
┌─────────────────────────────────────────┐
│ 🟢 System Health    DB·OK  SEO·72  ▼   │  ← Collapsed (default)
├─────────────────────────────────────────┤
│  Database     ████████████████░░  100%  │  ← Expanded on click
│  SEO Engine   █████████████░░░░░   72%  │
│  Job Queue    ████████████████░░  100%  │
│ ─────────────────────────────────────── │
│  SEO Engine   ● operational   72% avg   │
│  Job Worker   ● operational   0 running │
│  Valuations   ● operational   5 total   │
│  Database     ● operational   0 errors  │
│  Auth         ● operational             │
└─────────────────────────────────────────┘
```

