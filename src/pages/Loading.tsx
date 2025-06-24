
import React from 'react';
import LoadingPage from '@/components/LoadingPage';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';

const Loading: React.FC = () => {
  const { connectionStatus } = useDatabaseConnection();

  return (
    <LoadingPage 
      message="Initializing ASTRA Villa..." 
      showConnectionStatus={true}
      connectionStatus={connectionStatus}
    />
  );
};

export default Loading;
