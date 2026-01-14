
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useSystemInfo } from '@/hooks/useSystemInfo';
import { useBackupSettings } from '@/hooks/useBackupSettings';
import { useAlert } from '@/contexts/AlertContext';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';
import GeneralSettings from './settings/GeneralSettings';
import SecuritySettings from './settings/SecuritySettings';
import NotificationSettings from './settings/NotificationSettings';
import FileSettings from './settings/FileSettings';
import SystemMonitoring from './settings/SystemMonitoring';
import BackupSettings from './settings/BackupSettings';
import DiscountSettings from './settings/DiscountSettings';
import PropertyFilterSettings from './settings/PropertyFilterSettings';
import CentralizedFilterManager from './CentralizedFilterManager';
import AstraTokenSettingsWrapper from './settings/AstraTokenSettingsWrapper';
import BrandingSettings from './settings/BrandingSettings';
import LoadingPage from '../LoadingPage';

const SystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const { connectionStatus } = useDatabaseConnection();
  const { settings, loading, saveSettings, handleInputChange } = useSystemSettings();
  const { systemInfo } = useSystemInfo();
  const { 
    backupSettings, 
    loading: backupLoading, 
    saveBackupSettings, 
    handleBackupSettingChange, 
    createBackup 
  } = useBackupSettings();

  console.log('SystemSettings rendering, loading:', loading, 'settings:', settings);

  // Handle URL tab parameter for direct token settings access
  const [activeTab, setActiveTab] = React.useState('general');

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      console.log('Setting SystemSettings active tab from URL:', tab);
      setActiveTab(tab);
    }
  }, []);

  // Show loading screen when settings are being saved or initially loading
  if (loading && Object.keys(settings).length === 0) {
    return (
      <LoadingPage 
        message="Loading system settings..."
        showConnectionStatus={true}
        connectionStatus={connectionStatus}
      />
    );
  }

  const clearCache = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Cache Cleared', 'System cache has been cleared successfully');
    } catch (error) {
      showError('Error', 'Failed to clear cache');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-10 w-auto gap-1 bg-muted/40 p-1 rounded-lg border border-border/30">
            <TabsTrigger value="general">General & SEO</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="filters">Property Filters</TabsTrigger>
            <TabsTrigger value="centralized-filters">Centralized Filters</TabsTrigger>
            <TabsTrigger value="astra-tokens">ASTRA Tokens</TabsTrigger>
            <TabsTrigger value="system">System Monitor</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings 
            settings={settings}
            loading={loading}
            onInputChange={handleInputChange}
            onSave={saveSettings}
          />
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <BrandingSettings 
            settings={settings}
            loading={loading}
            onInputChange={handleInputChange}
            onSave={saveSettings}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettings 
            settings={settings}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings 
            settings={settings}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <FileSettings 
            settings={settings}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4">
          <DiscountSettings 
            settings={settings}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="filters">
          <PropertyFilterSettings />
        </TabsContent>
        
        <TabsContent value="centralized-filters">
          <CentralizedFilterManager />
        </TabsContent>

        <TabsContent value="astra-tokens" className="space-y-4">
          <AstraTokenSettingsWrapper 
            settings={settings}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemMonitoring systemInfo={systemInfo} />
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <BackupSettings 
            backupSettings={backupSettings}
            loading={backupLoading}
            onBackupSettingChange={handleBackupSettingChange}
            onSaveBackupSettings={saveBackupSettings}
            onCreateBackup={createBackup}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
