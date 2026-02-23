

# Fix: User Icon -- Single Function Popup + Hover Smart Info

## Problem
The user icon dropdown uses Radix's `DropdownMenu` which defaults to `modal={true}`. This triggers Radix's internal scroll-locking (`react-remove-scroll`), which adds/removes `data-scroll-locked` and `padding-right` on the body -- causing the visible "page dancing" layout shift on desktop.

## Solution

### 1. Set `modal={false}` on user DropdownMenu components

When `modal={false}`, Radix does NOT activate its scroll-lock mechanism, so no `data-scroll-locked`, no `padding-right` injection, and no page shift. The dropdown is small and doesn't need scroll prevention.

**Files affected:**
- `src/components/navigation/AuthenticatedNavigation.tsx` (line 263)
- `src/components/RoleBasedNavigation.tsx` (line 194)
- `src/components/admin/AdminHeader.tsx` (line 196)

Change: `<DropdownMenu>` becomes `<DropdownMenu modal={false}>`

### 2. Add HoverCard for "smart user info" on mouseover

Wrap the user Avatar button with a Radix `HoverCard` that shows user details (name, role, email, membership status) on hover -- without requiring a click.

**Files affected:**
- `src/components/navigation/AuthenticatedNavigation.tsx` -- wrap the avatar trigger with `HoverCard` + `HoverCardContent`
- `src/components/RoleBasedNavigation.tsx` -- same treatment

The HoverCard will display:
- User name and avatar initial
- Email address
- Role badge
- A "View Profile" shortcut link

### 3. Also set `modal={false}` on filter Popovers in AstraSearchPanel

The same `modal` scroll-lock issue likely affects the color filter and other popovers. Adding `modal={false}` to those Popover components will prevent the dancing there too.

## Technical Details

### Changes per file

| File | Change |
|------|--------|
| `src/components/navigation/AuthenticatedNavigation.tsx` | Add `modal={false}` to user DropdownMenu; wrap avatar with HoverCard showing user info |
| `src/components/RoleBasedNavigation.tsx` | Add `modal={false}` to user DropdownMenu; wrap avatar with HoverCard |
| `src/components/admin/AdminHeader.tsx` | Add `modal={false}` to profile DropdownMenu |
| `src/components/ui/dropdown-menu.tsx` | No changes needed -- `modal` is already a supported prop on `DropdownMenu` (it's `DropdownMenuPrimitive.Root`) |

### HoverCard content structure

```text
+---------------------------+
|  [A]  Full Name           |
|        user@email.com     |
|        [Role Badge]       |
|                           |
|  View Profile ->          |
+---------------------------+
```

The HoverCard uses the existing `@radix-ui/react-hover-card` already installed and the existing `HoverCard`, `HoverCardTrigger`, `HoverCardContent` components from `src/components/ui/hover-card.tsx`.
