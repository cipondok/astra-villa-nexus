import { useNavigate, useSearchParams } from 'react-router-dom';

interface UseHomeBackLinkOptions {
  sectionId?: string;
}

export const useHomeBackLink = (options: UseHomeBackLinkOptions = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cameFromHome = searchParams.get('from') === 'home';
  const sectionId = options.sectionId || searchParams.get('section') || 'hero-section';

  const handleBackToHome = () => {
    sessionStorage.setItem('scrollToSection', sectionId);
    navigate('/');
  };

  return {
    cameFromHome,
    handleBackToHome,
    sectionId
  };
};

// Hook to handle scroll restoration when returning to home page
export const useScrollToSection = () => {
  const scrollToSavedSection = () => {
    const sectionId = sessionStorage.getItem('scrollToSection');
    if (sectionId) {
      sessionStorage.removeItem('scrollToSection');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return { scrollToSavedSection };
};
