import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHomeBackLink } from '@/hooks/useHomeBackLink';

interface BackToHomeLinkProps {
  sectionId?: string;
  className?: string;
  alwaysShow?: boolean;
}

const BackToHomeLink: React.FC<BackToHomeLinkProps> = ({ sectionId, className = '', alwaysShow = false }) => {
  const navigate = useNavigate();
  const { cameFromHome, handleBackToHome } = useHomeBackLink({ sectionId });

  const handleClick = () => {
    if (cameFromHome) {
      handleBackToHome();
    } else {
      navigate('/');
    }
  };

  if (!cameFromHome && !alwaysShow) return null;

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 text-xs md:text-sm text-muted-foreground hover:text-primary mb-2 md:mb-3 active:scale-95 transition-all duration-200 ${className}`}
    >
      {cameFromHome ? (
        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
      ) : (
        <Home className="w-3 h-3 md:w-4 md:h-4" />
      )}
      {cameFromHome ? 'Back to Home' : 'Go Home'}
    </button>
  );
};

export default BackToHomeLink;
