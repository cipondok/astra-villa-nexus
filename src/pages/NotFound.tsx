import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ErrorPage from "./ErrorPage";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log the error to console for immediate debugging
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Log the error to Supabase for admin tracking
    const logError = async () => {
      try {
        await supabase.rpc('log_page_error', {
          p_error_type: '404',
          p_error_page: location.pathname,
          p_referrer_url: document.referrer || null,
          p_user_agent: navigator.userAgent,
          p_metadata: {
            timestamp: new Date().toISOString(),
            search: location.search,
            hash: location.hash,
            errorType: 'page_not_found'
          }
        });
      } catch (error) {
        console.error('Failed to log 404 error:', error);
      }
    };

    logError();
  }, [location.pathname]);

  return (
    <ErrorPage 
      errorType="404" 
      title="Page Not Found" 
      description="The page you're looking for doesn't exist or has been moved." 
    />
  );
};

export default NotFound;
