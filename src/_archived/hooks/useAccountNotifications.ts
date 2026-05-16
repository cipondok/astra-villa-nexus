import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AccountNotificationType = 
  | 'password_changed'
  | 'email_changed'
  | 'email_change_requested'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_modified'
  | 'device_added'
  | 'device_removed'
  | 'device_trusted'
  | 'device_untrusted'
  | 'profile_updated'
  | 'security_alert'
  | 'login_new_device'
  | 'preferences_updated';

interface NotificationConfig {
  title: string;
  message: string;
  icon?: string;
}

const NOTIFICATION_CONFIGS: Record<AccountNotificationType, NotificationConfig> = {
  password_changed: {
    title: '🔐 Password Changed',
    message: 'Your password has been successfully updated. If you did not make this change, please contact support immediately.',
  },
  email_changed: {
    title: '📧 Email Updated',
    message: 'Your email address has been successfully changed.',
  },
  email_change_requested: {
    title: '📧 Email Change Requested',
    message: 'A verification email has been sent to confirm your email change. Please check both your old and new email.',
  },
  '2fa_enabled': {
    title: '🛡️ Two-Factor Authentication Enabled',
    message: 'Your account is now protected with two-factor authentication for enhanced security.',
  },
  '2fa_disabled': {
    title: '⚠️ Two-Factor Authentication Disabled',
    message: 'Two-factor authentication has been turned off. Your account may be less secure.',
  },
  '2fa_modified': {
    title: '🛡️ 2FA Settings Modified',
    message: 'Your two-factor authentication settings have been updated.',
  },
  device_added: {
    title: '💻 New Device Added',
    message: 'A new device has been added to your account.',
  },
  device_removed: {
    title: '🗑️ Device Removed',
    message: 'A device has been removed from your trusted devices list.',
  },
  device_trusted: {
    title: '✅ Device Trusted',
    message: 'A device has been marked as trusted. It will no longer require additional verification.',
  },
  device_untrusted: {
    title: '🔒 Device Untrusted',
    message: 'A device has been removed from trusted status. It will require verification on next login.',
  },
  profile_updated: {
    title: '👤 Profile Updated',
    message: 'Your profile information has been successfully updated.',
  },
  security_alert: {
    title: '🚨 Security Alert',
    message: 'A security-related change was made to your account.',
  },
  login_new_device: {
    title: '🔔 New Login Detected',
    message: 'Your account was accessed from a new device or location.',
  },
  preferences_updated: {
    title: '⚙️ Preferences Updated',
    message: 'Your account preferences have been saved.',
  },
};

export const useAccountNotifications = () => {
  const { user } = useAuth();

  const sendAccountNotification = useCallback(async (
    type: AccountNotificationType,
    customMessage?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user?.id) {
      console.warn('Cannot send notification: No user logged in');
      return false;
    }

    try {
      const config = NOTIFICATION_CONFIGS[type];
      
      const { error } = await supabase
        .from('in_app_notifications')
        .insert({
          user_id: user.id,
          type: 'system',
          title: config.title,
          message: customMessage || config.message,
          metadata: {
            notification_type: type,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
          is_read: false,
        });

      if (error) {
        console.error('Failed to send account notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending account notification:', error);
      return false;
    }
  }, [user?.id]);

  const sendPasswordChangedNotification = useCallback(() => {
    return sendAccountNotification('password_changed');
  }, [sendAccountNotification]);

  const sendEmailChangeRequestedNotification = useCallback((newEmail: string) => {
    return sendAccountNotification(
      'email_change_requested',
      `A verification email has been sent to ${newEmail}. Please verify to complete the change.`,
      { new_email: newEmail }
    );
  }, [sendAccountNotification]);

  const send2FANotification = useCallback((action: 'enabled' | 'disabled' | 'modified', method?: string) => {
    const type = action === 'enabled' ? '2fa_enabled' : action === 'disabled' ? '2fa_disabled' : '2fa_modified';
    return sendAccountNotification(type, undefined, { method });
  }, [sendAccountNotification]);

  const sendDeviceNotification = useCallback((action: 'added' | 'removed' | 'trusted' | 'untrusted', deviceName?: string) => {
    const typeMap = {
      added: 'device_added',
      removed: 'device_removed',
      trusted: 'device_trusted',
      untrusted: 'device_untrusted',
    } as const;
    
    const customMessage = deviceName 
      ? NOTIFICATION_CONFIGS[typeMap[action]].message.replace('A device', `"${deviceName}"`)
      : undefined;
    
    return sendAccountNotification(typeMap[action], customMessage, { device_name: deviceName });
  }, [sendAccountNotification]);

  const sendProfileUpdatedNotification = useCallback((fieldsChanged?: string[]) => {
    const customMessage = fieldsChanged?.length 
      ? `Your ${fieldsChanged.join(', ')} ${fieldsChanged.length > 1 ? 'have' : 'has'} been updated.`
      : undefined;
    
    return sendAccountNotification('profile_updated', customMessage, { fields_changed: fieldsChanged });
  }, [sendAccountNotification]);

  const sendPreferencesUpdatedNotification = useCallback(() => {
    return sendAccountNotification('preferences_updated');
  }, [sendAccountNotification]);

  return {
    sendAccountNotification,
    sendPasswordChangedNotification,
    sendEmailChangeRequestedNotification,
    send2FANotification,
    sendDeviceNotification,
    sendProfileUpdatedNotification,
    sendPreferencesUpdatedNotification,
  };
};
