

# Fix: Page Dancing -- All Remaining DropdownMenu Components Missing `modal={false}`

## Problem

Several `DropdownMenu` components still use the default `modal={true}`, which triggers Radix's internal scroll-locking (`react-remove-scroll`). This adds/removes `data-scroll-locked` and `padding-right` on the body, causing the visible horizontal "jump" on desktop.

The previous fix only applied `modal={false}` to 3 components, but missed others that are actively used on the current pages.

## Root Cause Components

| Component | File | Issue |
|-----------|------|-------|
| UserIconWithBadge (main user icon) | `src/components/ui/UserIconWithBadge.tsx` line 111 | `<DropdownMenu>` without `modal={false}` |
| Notifications dropdown | `src/components/admin/AdminHeader.tsx` line 105 | `<DropdownMenu>` without `modal={false}` |
| `scrollbar-gutter: stable both-edges` | `src/index.css` line 60 | `both-edges` reserves space on BOTH sides of viewport -- unusual and causes extra shifting |

## Solution

### 1. Add `modal={false}` to UserIconWithBadge

This is the **main** user icon component used across the site (including the `/foreign-investment` page). It was missed in the previous fix.

**File:** `src/components/ui/UserIconWithBadge.tsx`
**Line 111:** Change `<DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>` to `<DropdownMenu modal={false} open={isOpen} onOpenChange={handleOpenChange}>`

### 2. Add `modal={false}` to AdminHeader notifications dropdown

**File:** `src/components/admin/AdminHeader.tsx`
**Line 105:** Change `<DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>` to `<DropdownMenu modal={false} open={notificationsOpen} onOpenChange={setNotificationsOpen}>`

### 3. Fix `scrollbar-gutter` value

Change `scrollbar-gutter: stable both-edges` to just `scrollbar-gutter: stable`. The `both-edges` modifier reserves equal space on the left side too, which causes unnecessary layout asymmetry and contributes to the perceived "jumping."

**File:** `src/index.css`
**Line 60:** Change `scrollbar-gutter: stable both-edges;` to `scrollbar-gutter: stable;`

## Files to Change

| File | Change |
|------|--------|
| `src/components/ui/UserIconWithBadge.tsx` | Add `modal={false}` to DropdownMenu |
| `src/components/admin/AdminHeader.tsx` | Add `modal={false}` to notifications DropdownMenu |
| `src/index.css` | Change `stable both-edges` to `stable` |

