
import React from 'react';

interface ShellProps {
  children: React.ReactNode;
}

const Shell = ({ children }: ShellProps) => {
  return (
    <div className="min-h-stable md:min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
        {children}
      </div>
    </div>
  );
};

export default Shell;
