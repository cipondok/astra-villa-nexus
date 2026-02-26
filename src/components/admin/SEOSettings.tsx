import React from 'react';
import SEOSettingsHub from './settings/SEOSettingsHub';
import { useSystemSettings } from '@/hooks/useSystemSettings';

const SEOSettings = () => {
  const { settings, loading, saveSettings, handleInputChange } = useSystemSettings();

  return (
    <div className="space-y-3">
      <SEOSettingsHub
        settings={settings}
        loading={loading}
        onInputChange={handleInputChange}
        onSave={saveSettings}
      />
    </div>
  );
};

export default SEOSettings;
