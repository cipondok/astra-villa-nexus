

# Email/Push Notifications for Critical Alerts + Confirmation Dialog

## Feature 1: Confirmation Dialog Before Category Delete

Add an AlertDialog confirmation step before executing "Delete All [Category]" and "Clear All" actions.

### Changes to `src/components/admin/AdminNotificationsCenter.tsx`
- Import `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger` from `@/components/ui/alert-dialog`
- Add state: `pendingDeleteCategory` to track which category delete was requested
- Wrap the "Delete All [Category]" button and "Clear All" button with `AlertDialog` components
- The dialog shows the category name and warns about irreversible deletion
- On confirm, triggers the existing `clearCategoryMutation` or `clearAllMutation`

---

## Feature 2: Email Notifications for Critical Admin Alerts

When a critical/high-priority alert is created, automatically send an email to admin users.

### Changes

**New database trigger + function (migration file)**
- Create a Postgres trigger `on_critical_admin_alert` on `admin_alerts` table
- When a new row is inserted with `priority = 'critical'` or `priority = 'high'`, call an edge function to notify admins via email
- Alternatively, use `pg_net` to invoke the `send-email` edge function directly from the trigger

**SQL Migration:**
```sql
CREATE OR REPLACE FUNCTION public.notify_admins_critical_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  admin_emails text[];
BEGIN
  -- Only for critical/high priority
  IF NEW.priority NOT IN ('critical', 'high') THEN
    RETURN NEW;
  END IF;

  -- Get admin emails
  SELECT array_agg(au.email)
  INTO admin_emails
  FROM auth.users au
  JOIN profiles p ON p.id = au.id
  WHERE p.role = 'admin' AND au.email IS NOT NULL;

  IF admin_emails IS NULL OR array_length(admin_emails, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  -- Use pg_net to call send-email edge function
  PERFORM net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body := jsonb_build_object(
      'to', admin_emails,
      'template', 'general',
      'variables', jsonb_build_object('message',
        'CRITICAL ALERT: ' || NEW.title || E'\n\n' || NEW.message || E'\n\nPriority: ' || NEW.priority || E'\nCategory: ' || COALESCE(NEW.alert_category, 'unknown')
      ),
      'subject', '[URGENT] ' || NEW.title,
      'skipAuth', true
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_admins_critical_alert
  AFTER INSERT ON admin_alerts
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_critical_alert();
```

This approach leverages the existing `send-email` edge function and SMTP configuration already set up, requiring no new edge functions.

### Changes to `src/utils/adminNotifications.ts`
- No changes needed -- the trigger fires automatically on insert

---

## Feature 3: Push Notification for Critical Alerts

Use the existing `push-notifications` edge function to send push notifications to admin users when critical alerts arrive.

### Additional logic in the same DB trigger
- After sending email, also call the `push-notifications` edge function with `action: 'send_bulk'` targeting admin user IDs
- This uses the existing push subscription infrastructure

### Alternative: Client-side approach in `AlertMonitoringProvider.tsx`
- When a real-time critical alert is received, call the push-notifications edge function from the client
- Simpler and avoids complex DB trigger setup for push

**Recommended approach:** Use the DB trigger for email (reliable, server-side) and enhance `AlertMonitoringProvider.tsx` to show browser Notification API alerts for critical items received in real-time (no edge function needed for the logged-in admin).

---

## Summary of Files to Change

| File | Change |
|------|--------|
| `src/components/admin/AdminNotificationsCenter.tsx` | Add AlertDialog confirmation for Delete All actions |
| New migration SQL | Add trigger for emailing admins on critical alerts |
| `src/components/admin/AlertMonitoringProvider.tsx` | Add browser Notification API for critical real-time alerts |

