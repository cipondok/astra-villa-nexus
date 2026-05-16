
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    uptime: '0 days',
    memoryUsage: '65%',
    diskSpace: '78%',
    activeUsers: 0,
    totalProperties: 0
  });

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const { data: userCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });
      
      const { data: propertyCount } = await supabase
        .from('properties')
        .select('id', { count: 'exact' });

      setSystemInfo(prev => ({
        ...prev,
        activeUsers: userCount?.length || 0,
        totalProperties: propertyCount?.length || 0
      }));
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  return { systemInfo };
};
