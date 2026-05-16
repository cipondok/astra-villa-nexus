
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[999998] bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300 overscroll-none",
      className
    )}
    style={{
      position: "fixed",
      touchAction: "none",
    }}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  autoClose?: boolean;
  autoCloseTimeout?: number;
  showCountdown?: boolean;
  hideCloseButton?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, autoClose = true, autoCloseTimeout = 5000, showCountdown = true, hideCloseButton = false, ...props }, ref) => {
  const [hasInteraction, setHasInteraction] = React.useState(false);
  const [countdown, setCountdown] = React.useState(Math.ceil(autoCloseTimeout / 1000));
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!autoClose || hasInteraction) return;

    // Reset countdown when dialog opens
    setCountdown(Math.ceil(autoCloseTimeout / 1000));

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto close timer
    const closeTimer = setTimeout(() => {
      if (closeRef.current) {
        closeRef.current.click();
      }
    }, autoCloseTimeout);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(closeTimer);
    };
  }, [autoClose, autoCloseTimeout, hasInteraction]);

  const handleInteraction = () => {
    setHasInteraction(true);
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        onClick={handleInteraction}
        onKeyDown={handleInteraction}
        onFocus={handleInteraction}
        className={cn(
          "fixed left-[50%] top-[50%] z-[999999] grid w-[90vw] max-w-[340px] md:max-w-[400px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-gradient-to-b from-background to-background/95 backdrop-blur-2xl border border-border/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-5 md:p-6 duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[49%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[49%] rounded-2xl ring-1 ring-white/10 overscroll-contain",
          className
        )}
        style={{ 
          position: 'fixed',
          touchAction: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
        {...props}
      >
        {children}
        {/* Countdown Timer */}
        {autoClose && showCountdown && !hasInteraction && countdown > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1">
            <div className="relative h-5 w-5">
              <svg className="h-5 w-5 -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted/30"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={62.83}
                  strokeDashoffset={62.83 - (62.83 * countdown) / Math.ceil(autoCloseTimeout / 1000)}
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-medium text-foreground">
                {countdown}
              </span>
            </div>
          </div>
        )}
        {!hideCloseButton && (
          <DialogPrimitive.Close 
            ref={closeRef}
            className="absolute right-4 top-4 rounded-full p-1.5 opacity-60 ring-offset-background transition-all duration-200 hover:opacity-100 hover:bg-muted/80 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 disabled:pointer-events-none active:scale-95"
          >
            <X className="h-4 w-4 text-foreground" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-1.5",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-base md:text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
