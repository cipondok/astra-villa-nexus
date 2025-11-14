# Table Style Dialog Component Guide

## Overview

The `TableStyleDialog` component provides a consistent, professional table-style layout for all dialogs and modals across the ASTRA Villa application. It follows the design system defined in `index.css` and `tailwind.config.ts`.

## Features

- ✅ Consistent header with icon and title
- ✅ Table-style content layout with sections
- ✅ Optional progress indicator
- ✅ Flexible footer section
- ✅ Responsive design (mobile-friendly)
- ✅ Built-in animations (macos-window-in)
- ✅ Semantic color tokens from design system
- ✅ HSL-based colors for proper theming

## Basic Usage

```tsx
import { TableStyleDialog } from "@/components/ui/TableStyleDialog";
import { Bot } from "lucide-react";

<TableStyleDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Dialog Title"
  description="Optional description"
  icon={Bot}
  maxWidth="2xl"
  sections={[
    {
      title: "Section Title",
      rows: [
        { label: "Label", value: "Value" },
        { label: "Another", value: <CustomComponent /> }
      ]
    }
  ]}
  footer={<p>Footer content</p>}
/>
```

## Props Reference

### TableStyleDialogProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | boolean | ✅ | - | Controls dialog visibility |
| `onOpenChange` | (open: boolean) => void | ✅ | - | Callback for open state changes |
| `title` | string | ✅ | - | Dialog title |
| `description` | string | ❌ | - | Optional subtitle |
| `icon` | LucideIcon | ❌ | - | Icon shown in header |
| `iconClassName` | string | ❌ | - | Custom icon container classes |
| `sections` | TableSection[] | ❌ | [] | Array of table sections |
| `children` | ReactNode | ❌ | - | Custom content below sections |
| `footer` | ReactNode | ❌ | - | Footer content |
| `maxWidth` | "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "4xl" | ❌ | "2xl" | Maximum dialog width |
| `showProgress` | { value: number, label?: string } | ❌ | - | Progress indicator |

### TableSection

```typescript
interface TableSection {
  title?: string;           // Section header title
  icon?: LucideIcon;       // Icon for section header
  rows: TableRow[];        // Array of rows
  columns?: 1 | 2;         // Column layout (default: 1)
}
```

### TableRow

```typescript
interface TableRow {
  label: string;           // Row label (left column)
  value: ReactNode;        // Row value (right column)
  icon?: LucideIcon;       // Optional icon for label
  className?: string;      // Custom row classes
}
```

## Utility Components

### TableFormField

For form inputs in table style:

```tsx
import { TableFormField } from "@/components/ui/TableStyleDialog";
import { User } from "lucide-react";

<TableFormField label="Full Name" icon={User} description="Enter your name">
  <Input value={name} onChange={e => setName(e.target.value)} />
</TableFormField>
```

### TableStats

For displaying metrics/statistics:

```tsx
import { TableStats } from "@/components/ui/TableStyleDialog";

<TableStats
  stats={[
    { label: "Total Users", value: <span className="text-2xl font-bold">1,234</span> },
    { label: "Active", value: <span className="text-2xl font-bold text-green-600">856</span> }
  ]}
/>
```

## Real-World Examples

### Example 1: WhatsApp Inquiry Dialog

```tsx
<TableStyleDialog
  open={open}
  onOpenChange={onOpenChange}
  title="WhatsApp Inquiry"
  description="Connect with us instantly"
  icon={MessageCircle}
  sections={[
    {
      title: "Property Details",
      rows: [
        { label: "Title", value: property.title },
        { label: "Price", value: <span className="font-bold text-primary">Rp {price}</span> },
        { label: "Type", value: <Badge>{property.type}</Badge> }
      ]
    }
  ]}
  footer={<p className="text-xs text-center">Message will be sent via WhatsApp</p>}
>
  <form onSubmit={handleSubmit}>
    <TableFormField label="Name" icon={User}>
      <Input value={name} onChange={e => setName(e.target.value)} />
    </TableFormField>
    {/* More form fields */}
  </form>
</TableStyleDialog>
```

### Example 2: Search Progress Dialog

```tsx
<TableStyleDialog
  open={isSearching}
  onOpenChange={setIsSearching}
  title="ASTRA AI Search"
  description="Intelligent Property Discovery"
  icon={Bot}
  maxWidth="2xl"
  showProgress={{ value: progress, label: "Searching..." }}
  sections={searchQuery ? [
    {
      rows: [
        { label: "Query", value: searchQuery, icon: Search }
      ]
    }
  ] : []}
>
  {/* Custom progress content */}
  <div className="bg-muted/30 rounded-lg">
    <Progress value={progress} />
  </div>
  
  <TableStats
    stats={[
      { label: "Properties Scanned", value: <span className="text-2xl">{count}</span> },
      { label: "Confidence", value: <span className="text-2xl">{progress}%</span> }
    ]}
  />
</TableStyleDialog>
```

## Design System Integration

The component automatically uses:

- **Colors**: `primary`, `muted`, `border`, `card`, `foreground` from `index.css`
- **Typography**: System font stack with SF Pro Display
- **Animations**: `macos-window-in` from `tailwind.config.ts`
- **Borders**: HSL-based border colors with opacity
- **Spacing**: Consistent padding (px-6, py-4, etc.)

## Migration Checklist

When migrating an existing dialog:

- [ ] Import `TableStyleDialog` instead of `Dialog`
- [ ] Move header content to `title`, `description`, `icon` props
- [ ] Convert content to `sections` array format
- [ ] Move footer content to `footer` prop
- [ ] Replace inline styles with semantic tokens
- [ ] Test dark mode appearance
- [ ] Verify mobile responsiveness
- [ ] Check animations work properly

## Best Practices

1. **Use semantic tokens**: Never hardcode colors like `#000` or `rgb()`
2. **Keep sections focused**: Each section should represent a logical grouping
3. **Provide clear labels**: Row labels should be concise and descriptive
4. **Use icons sparingly**: Only for important sections/rows
5. **Mobile-first**: Test on small screens first
6. **Consistent spacing**: Use the built-in spacing, don't override
7. **Accessible**: Use proper labels and ARIA attributes

## Common Patterns

### Two-Column Layout

```tsx
sections={[
  {
    title: "Statistics",
    columns: 2,
    rows: [
      { label: "Metric 1", value: "100" },
      { label: "Metric 2", value: "200" }
    ]
  }
]}
```

### Progress with Status

```tsx
<TableStyleDialog
  showProgress={{ value: 75, label: "Processing..." }}
>
  <div className="bg-muted/30 rounded-lg border overflow-hidden">
    <table className="w-full">
      <tr>
        <td className="px-4 py-3">
          <Progress value={75} />
          <p className="text-center text-sm mt-2">Step 3 of 4</p>
        </td>
      </tr>
    </table>
  </div>
</TableStyleDialog>
```

### Custom Actions in Footer

```tsx
footer={
  <div className="flex justify-between items-center w-full">
    <Button variant="outline" onClick={onCancel}>Cancel</Button>
    <Button onClick={onConfirm}>Confirm</Button>
  </div>
}
```

## Troubleshooting

### Dialog not showing

- Check `open` prop is `true`
- Verify `z-index` is not conflicting
- Ensure no CSS is hiding the dialog

### Styling issues

- Always use HSL colors from design system
- Check `tailwind.config.ts` for available tokens
- Use `bg-card`, `bg-muted`, not `bg-white`

### Mobile issues

- Test on small screens (< 640px)
- Use `ScrollArea` for long content
- Ensure touch targets are >= 44px

## Support

For questions or issues with the TableStyleDialog component, check:
- This documentation
- Design system in `index.css`
- Theme tokens in `tailwind.config.ts`
- Example implementations in `/src/components`
