
import React, { createContext, useContext } from 'react';

interface Web3ModalContextType {
  // Add any Web3Modal specific context properties here if needed
}

const Web3ModalContext = createContext<Web3ModalContextType | undefined>(undefined);

export const Web3ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = {
    // Web3Modal context values
  };

  return (
    <Web3ModalContext.Provider value={value}>
      {children}
    </Web3ModalContext.Provider>
  );
};

export const useWeb3Modal = () => {
  const context = useContext(Web3ModalContext);
  if (context === undefined) {
    throw new Error('useWeb3Modal must be used within a Web3ModalProvider');
  }
  return context;
};
