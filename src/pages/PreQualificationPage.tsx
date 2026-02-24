import React from 'react';
import PreQualificationWizard from '@/components/mortgage/PreQualificationWizard';

const PreQualificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mortgage Pre-Qualification</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Check your eligibility and download a pre-qualification summary in minutes
        </p>
      </div>
      <PreQualificationWizard />
    </div>
  );
};

export default PreQualificationPage;
