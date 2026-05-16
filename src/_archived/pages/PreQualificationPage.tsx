import React from 'react';
import PreQualificationWizard from '@/components/mortgage/PreQualificationWizard';
import { useTranslation } from '@/i18n/useTranslation';

const PreQualificationPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('preQualification.title')}</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          {t('preQualification.subtitle')}
        </p>
      </div>
      <PreQualificationWizard />
    </div>
  );
};

export default PreQualificationPage;
