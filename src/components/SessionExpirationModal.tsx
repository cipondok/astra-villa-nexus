import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogIn, Home, Clock, ShieldAlert, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface SessionExpirationModalProps {
  isOpen: boolean;
  onReLogin: () => void;
  onGoHome: () => void;
  remainingTime?: number;
  errorMessage?: string;
}

const SessionExpirationModal = ({ 
  isOpen, 
  onReLogin, 
  onGoHome,
  remainingTime,
  errorMessage 
}: SessionExpirationModalProps) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    onGoHome();
    navigate('/');
  };

  const getTitle = () => {
    if (errorMessage?.includes('network') || errorMessage?.includes('fetch')) {
      return 'Connection Lost';
    }
    if (errorMessage?.includes('invalid') || errorMessage?.includes('refresh')) {
      return 'Authentication Required';
    }
    return 'Session Expired';
  };

  const getDescription = () => {
    if (errorMessage?.includes('network') || errorMessage?.includes('fetch')) {
      return 'We lost connection to the server. Please check your internet and try again.';
    }
    if (errorMessage?.includes('invalid') || errorMessage?.includes('refresh')) {
      return 'Your authentication has become invalid. Please sign in again to continue.';
    }
    return 'Your session has expired for security reasons. Please sign in again to continue working.';
  };

  const getIcon = () => {
    if (errorMessage?.includes('network') || errorMessage?.includes('fetch')) {
      return <RefreshCw className="h-7 w-7 text-blue-600 dark:text-blue-400" />;
    }
    if (errorMessage?.includes('invalid') || errorMessage?.includes('refresh')) {
      return <ShieldAlert className="h-7 w-7 text-red-600 dark:text-red-400" />;
    }
    return <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400" />;
  };

  const getIconBg = () => {
    if (errorMessage?.includes('network') || errorMessage?.includes('fetch')) {
      return 'bg-blue-100 dark:bg-blue-900/30';
    }
    if (errorMessage?.includes('invalid') || errorMessage?.includes('refresh')) {
      return 'bg-red-100 dark:bg-red-900/30';
    }
    return 'bg-amber-100 dark:bg-amber-900/30';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[420px] bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl" hideCloseButton>
        <DialogHeader className="text-center">
          <motion.div 
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${getIconBg()}`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {getIcon()}
          </motion.div>
          <DialogTitle className="text-xl text-center">{getTitle()}</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {remainingTime !== undefined && remainingTime > 0 && (
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
              Auto-redirect in {remainingTime} seconds
            </span>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="flex-1 gap-2 border-border hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onReLogin}
              className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg"
            >
              <LogIn className="h-4 w-4" />
              Sign In Again
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpirationModal;
