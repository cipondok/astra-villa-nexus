import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogIn, Home, Clock, ShieldAlert, RefreshCw, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface SessionExpirationModalProps {
  isOpen: boolean;
  onReLogin: () => void;
  onGoHome: () => void;
  onStayLoggedIn?: () => void;
  remainingTime?: number;
  errorMessage?: string;
  isGracePeriod?: boolean;
}

const SessionExpirationModal = ({
  isOpen,
  onReLogin,
  onGoHome,
  onStayLoggedIn,
  remainingTime,
  errorMessage,
  isGracePeriod,
}: SessionExpirationModalProps) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    onGoHome();
    navigate('/');
  };

  // ── Dynamic content based on state ──────────────────
  const isNetwork = errorMessage?.includes('network') || errorMessage?.includes('fetch');
  const isInvalid = errorMessage?.includes('invalid') || errorMessage?.includes('refresh');

  const getTitle = () => {
    if (isGracePeriod) return 'Are You Still There?';
    if (isNetwork) return 'Connection Lost';
    if (isInvalid) return 'Authentication Required';
    return 'Session Expired';
  };

  const getDescription = () => {
    if (isGracePeriod) {
      return 'You have been inactive. Your session will expire soon for security. Click below to stay logged in.';
    }
    if (isNetwork) return 'We lost connection to the server. Please check your internet and try again.';
    if (isInvalid) return 'Your authentication has become invalid. Please sign in again to continue.';
    return 'Your session has expired for security reasons. Please sign in again to continue working.';
  };

  const getIcon = () => {
    if (isGracePeriod) return <Timer className="h-7 w-7 text-chart-3" />;
    if (isNetwork) return <RefreshCw className="h-7 w-7 text-chart-4" />;
    if (isInvalid) return <ShieldAlert className="h-7 w-7 text-destructive" />;
    return <AlertTriangle className="h-7 w-7 text-chart-3" />;
  };

  const getIconBg = () => {
    if (isGracePeriod) return 'bg-chart-3/10';
    if (isNetwork) return 'bg-chart-4/10';
    if (isInvalid) return 'bg-destructive/10';
    return 'bg-chart-3/10';
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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

        {/* Countdown badge */}
        {remainingTime !== undefined && remainingTime > 0 && (
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-chart-3/5 rounded-lg border border-chart-3/20">
            <Clock className="h-4 w-4 text-chart-3" />
            <span className="text-sm font-medium text-chart-3">
              {isGracePeriod ? `Logging out in ${formatTime(remainingTime)}` : `Auto-redirect in ${remainingTime}s`}
            </span>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          {isGracePeriod && onStayLoggedIn ? (
            <>
              <Button variant="outline" onClick={handleGoHome} className="flex-1 gap-2 border-border hover:bg-muted">
                <Home className="h-4 w-4" />
                Log Out
              </Button>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onStayLoggedIn}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Stay Logged In
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleGoHome} className="flex-1 gap-2 border-border hover:bg-muted">
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpirationModal;
