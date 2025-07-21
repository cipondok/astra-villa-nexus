import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ErrorPageProps {
  errorType?: string;
  title?: string;
  description?: string;
}

const ErrorPage = ({ 
  errorType = "404", 
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist."
}: ErrorPageProps) => {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Log the error
    const logError = async () => {
      try {
        await supabase.rpc('log_page_error', {
          p_error_type: errorType,
          p_error_page: location.pathname,
          p_referrer_url: document.referrer || null,
          p_user_agent: navigator.userAgent,
          p_metadata: {
            timestamp: new Date().toISOString(),
            search: location.search,
            hash: location.hash
          }
        });
      } catch (error) {
        console.error('Failed to log error:', error);
      }
    };

    logError();
  }, [errorType, location]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleHomeRedirect = () => {
    navigate('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <div className="text-6xl font-bold text-primary opacity-50 mb-2">
            {errorType}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {description}
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Redirecting to home page in:
            </p>
            <div className="text-3xl font-bold text-primary">
              {countdown}s
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleHomeRedirect}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home Now
            </Button>
            
            {errorType !== "404" && (
              <Button 
                variant="outline"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>Error ID: {Date.now()}</p>
            <p>Time: {new Date().toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;