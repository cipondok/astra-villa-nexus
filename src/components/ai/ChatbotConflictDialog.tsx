import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, Laptop, AlertCircle } from "lucide-react";

interface ConflictData {
  local: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    viewMode: string;
    lastModified: Date;
  };
  cloud: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    viewMode: string;
    lastModified: Date;
  };
}

interface ChatbotConflictDialogProps {
  open: boolean;
  conflictData: ConflictData | null;
  onResolve: (choice: 'local' | 'cloud') => void;
  onCancel: () => void;
}

export const ChatbotConflictDialog = ({ open, conflictData, onResolve, onCancel }: ChatbotConflictDialogProps) => {
  if (!conflictData) return null;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Sync Conflict Detected
          </DialogTitle>
          <DialogDescription>
            Your chatbot preferences differ between this device and the cloud. Choose which version to keep.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          {/* Local Version */}
          <div className="border border-border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Laptop className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">This Device</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Position:</span>
                <span className="ml-2">({Math.round(conflictData.local.position.x)}, {Math.round(conflictData.local.position.y)})</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2">{conflictData.local.size.width}x{conflictData.local.size.height}</span>
              </div>
              <div>
                <span className="text-muted-foreground">View:</span>
                <span className="ml-2 capitalize">{conflictData.local.viewMode}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Modified: {conflictData.local.lastModified.toLocaleString()}
                </span>
              </div>
            </div>
            <Button
              onClick={() => onResolve('local')}
              className="w-full mt-4"
              variant="default"
            >
              Keep This Device
            </Button>
          </div>

          {/* Cloud Version */}
          <div className="border border-border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold">Cloud</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Position:</span>
                <span className="ml-2">({Math.round(conflictData.cloud.position.x)}, {Math.round(conflictData.cloud.position.y)})</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2">{conflictData.cloud.size.width}x{conflictData.cloud.size.height}</span>
              </div>
              <div>
                <span className="text-muted-foreground">View:</span>
                <span className="ml-2 capitalize">{conflictData.cloud.viewMode}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Modified: {conflictData.cloud.lastModified.toLocaleString()}
                </span>
              </div>
            </div>
            <Button
              onClick={() => onResolve('cloud')}
              className="w-full mt-4"
              variant="default"
            >
              Keep Cloud
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your choice will update both this device and the cloud. The other version will be overwritten.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onCancel} variant="ghost" size="sm">
            Decide Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
