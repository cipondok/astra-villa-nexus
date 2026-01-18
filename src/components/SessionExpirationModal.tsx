import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogIn, Home, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SessionExpirationModalProps {
  isOpen: boolean;
  onReLogin: () => void;
  onGoHome: () => void;
  remainingTime?: number;
}

const SessionExpirationModal = ({ 
  isOpen, 
  onReLogin, 
  onGoHome,
  remainingTime 
}: SessionExpirationModalProps) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    onGoHome();
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[420px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl" hideCloseButton>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-xl text-center">Session Expired</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Your session has expired for security reasons. Please sign in again to continue working.
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
          <Button
            onClick={onReLogin}
            className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg"
          >
            <LogIn className="h-4 w-4" />
            Sign In Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpirationModal;
