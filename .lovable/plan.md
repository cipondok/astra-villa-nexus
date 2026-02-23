
# Notifications Center Upgrade

## What's Changing

### 1. Accurate Category Counts (Total, not just unread)
- Tab counts will show **total notifications** per category, not just unread
- The bell badge continues to show unread count
- Each tab shows: `All (12)`, `System (3)`, `Property (5)`, `User (4)`

### 2. Bulk Selection and Delete
- Add a **checkbox** on each notification item for multi-select
- Add a **"Select All"** toggle in the header area
- Show a **bulk action bar** when items are selected: "X selected -- Delete Selected"
- Add `bulkDelete` function to the NotificationContext

### 3. Action Button: Copy Error to Chat
- Add a small **action button** (clipboard/paste icon) on each notification
- When clicked, it **copies the notification title + message** to clipboard so you can paste it into the chat for fixing
- Shows a toast: "Copied to clipboard -- paste in chat to fix"

---

## Technical Details

### Files to Modify

**`src/contexts/NotificationContext.tsx`**
- Add `bulkDelete(ids: string[])` function to remove multiple notifications at once
- Export it in the context type

**`src/components/NotificationDropdown.tsx`**
- Add `selectedIds` state (`Set<string>`) for tracking selected notifications
- Add checkboxes to each notification row
- Add "Select All" / "Deselect All" toggle button in header
- Show bulk action bar when `selectedIds.size > 0` with delete button
- Update tab counts to show **total** count per category (not just unread)
- Add a "Copy to chat" action button per notification that copies `"[notification.title]: notification.message"` to clipboard
- Reset selection when tab changes

### UI Layout Changes

**Header area** (when items selected):
```
[x] 3 selected  |  [Delete Selected]  |  [Cancel]
```

**Each notification row** gets:
- A checkbox on the left side
- A copy/paste icon button in the hover actions

**Tab counts** change from unread-only to total:
```
All (12)  |  System (3)  |  Property (5)  |  User (4)
```
