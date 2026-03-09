

# Add Pagination & Total Count to Admin Alerts

## Changes to `src/components/admin/AdminAlertSystem.tsx`

### 1. Pagination State
Add `currentPage` state (default 1), reset to 1 when category changes. Define `PAGE_SIZE = 50`.

### 2. Paginated Display
Instead of rendering all `filteredAlerts`, slice to show only the current page:
```
const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
const totalPages = Math.ceil(filteredAlerts.length / PAGE_SIZE);
```

### 3. Total All-Time Count in Header
Replace the simple "X total" span with a more prominent display showing:
- **All-time total**: total alerts count
- **Unread**: unread count  
- **Read**: read count

### 4. Pagination Controls
Add pagination bar below the ScrollArea with:
- "Showing 1-50 of 234" text
- Previous / Next buttons
- Page number indicators
- Import `ChevronLeft`, `ChevronRight` from lucide-react

### File
- **Edit**: `src/components/admin/AdminAlertSystem.tsx` — add state, slice logic, pagination UI, total count header

