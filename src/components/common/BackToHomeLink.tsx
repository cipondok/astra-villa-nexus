import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useHomeBackLink } from '@/hooks/useHomeBackLink';

interface BackToHomeLinkProps {
  sectionId?: string;
  className?: string;
}

const BackToHomeLink: React.FC<BackToHomeLinkProps> = ({ sectionId, className = '' }) => {
  const { cameFromHome, handleBackToHome } = useHomeBackLink({ sectionId });

  if (!cameFromHome) return null;

  return (
    <button
      onClick={handleBackToHome}
      className={`flex items-center gap-1 text-xs md:text-sm text-muted-foreground hover:text-primary mb-2 md:mb-3 active:scale-95 transition-transform ${className}`}
    >
      <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
      Back to Home
    </button>
  );
};

export default BackToHomeLink;
