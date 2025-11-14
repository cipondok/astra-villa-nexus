# Updated Modals Status

This document tracks the migration status of all dialogs/modals to the new TableStyleDialog component.

## ✅ Completed Migrations

### 1. SearchLoadingDialog
- **Location**: `src/components/SearchLoadingDialog.tsx`
- **Status**: ✅ Fully migrated
- **Features**: Progress tracking, search stats, table-style layout
- **Notes**: Uses TableStats utility component

### 2. WhatsAppInquiryDialog
- **Location**: `src/components/property/WhatsAppInquiryDialog.tsx`
- **Status**: ✅ Fully migrated
- **Features**: Property details table, form fields with TableFormField
- **Notes**: Multi-section layout with property info and contact form

### 3. ImageSearchModal (Partial)
- **Location**: `src/components/ai/ImageSearchModal.tsx`
- **Status**: ⚠️ Imports updated, full migration pending
- **Notes**: Complex component with tabs and comparison view

## 📋 Pending Migrations

### High Priority (Common User-Facing)

1. **EnhancedAuthModal**
   - Location: `src/components/auth/EnhancedAuthModal.tsx`
   - Usage: Login/Registration
   - Complexity: Medium
   - Notes: Needs form validation integration

2. **PropertyDetailModal**
   - Location: `src/components/property/PropertyDetailModal.tsx`
   - Usage: Property details view
   - Complexity: High
   - Notes: Has image carousel, complex layout

3. **Property3DViewModal**
   - Location: `src/components/property/Property3DViewModal.tsx`
   - Usage: 3D property viewing
   - Complexity: Medium
   - Notes: Canvas-based, special fullscreen mode

### Medium Priority (Admin/Agent)

4. **AgentRegistrationModal**
   - Location: `src/components/agent/AgentRegistrationModal.tsx`
   - Usage: Agent registration
   - Complexity: Medium
   - Notes: Multi-field form

5. **RoleUpgradeModal**
   - Location: `src/components/RoleUpgradeModal.tsx`
   - Usage: Role upgrade requests
   - Complexity: Low
   - Notes: Simple card-based layout

6. **ScheduleSurveyModal**
   - Location: `src/components/ScheduleSurveyModal.tsx`
   - Usage: Schedule property surveys
   - Complexity: Low
   - Notes: Date/time picker integration

### Low Priority (Specialized)

7. **ForeignInvestmentContactDialog**
   - Location: `src/components/ForeignInvestmentContactDialog.tsx`
   - Usage: Foreign investment inquiries
   - Complexity: Medium

8. **LoadingPopup**
   - Location: `src/components/LoadingPopup.tsx`
   - Usage: Generic loading state
   - Complexity: Low

9. **RoleBasedAuthModal**
   - Location: `src/components/RoleBasedAuthModal.tsx`
   - Usage: Role-specific authentication
   - Complexity: Low

10. **PropertyViewer3D**
    - Location: `src/components/PropertyViewer3D.tsx`
    - Usage: 3D property visualization
    - Complexity: High
    - Notes: Three.js integration

## Migration Priority Guidelines

### Immediate (Do First)
- User authentication flows
- Core property browsing features
- High-traffic user interactions

### Soon (Do Second)
- Agent/Admin features
- Specialized property features
- Secondary user flows

### Later (Do Last)
- Rarely used features
- Complex specialized components
- Legacy components pending removal

## Migration Template

For each modal migration:

```typescript
// Before
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="custom-classes">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>

// After
import { TableStyleDialog, TableFormField } from "@/components/ui/TableStyleDialog";
import { Icon } from "lucide-react";

<TableStyleDialog
  open={open}
  onOpenChange={setOpen}
  title="Title"
  description="Description"
  icon={Icon}
  maxWidth="2xl"
  sections={[
    {
      title: "Section",
      rows: [
        { label: "Field", value: "Value" }
      ]
    }
  ]}
>
  {/* Custom content */}
</TableStyleDialog>
```

## Testing Checklist

After migration, verify:

- [ ] Modal opens/closes correctly
- [ ] All data displays properly
- [ ] Forms submit successfully
- [ ] Styling matches design system
- [ ] Dark mode works correctly
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] No console errors
- [ ] Accessibility maintained

## Style Consistency Rules

All migrated modals must follow:

1. **Header**: Icon + Title + Description
2. **Content**: Table-style sections with rows
3. **Footer**: Centered text or action buttons
4. **Colors**: Only semantic tokens (primary, muted, border)
5. **Spacing**: px-6 for horizontal, py-4/py-6 for vertical
6. **Borders**: border-border/50 with rounded-lg
7. **Backgrounds**: bg-muted/30 for sections
8. **Hover**: hover:bg-muted/10 for interactive rows

## Notes

- Always test in both light and dark modes
- Ensure mobile viewport works (< 640px)
- Use existing TableFormField for form inputs
- Use TableStats for metrics/statistics
- Check z-index doesn't conflict with other UI
- Verify keyboard navigation still works
- Test with screen readers when possible

## Quick Reference

- Base Component: `src/components/ui/TableStyleDialog.tsx`
- Documentation: `docs/TABLE_STYLE_DIALOG_GUIDE.md`
- Design System: `src/index.css`
- Theme Config: `tailwind.config.ts`
- Examples: See completed migrations above
