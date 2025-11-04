import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const KeyboardShortcutsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ? key (Shift + /) or Cmd/Ctrl + /
      if (e.key === '?' || ((e.metaKey || e.ctrlKey) && e.key === '/')) {
        e.preventDefault();
        setIsOpen(true);
        console.log('⌨️ Keyboard Shortcuts: Help modal opened');
        toast({
          title: "Keyboard Shortcuts",
          description: "Press ? or Cmd/Ctrl + / to view shortcuts",
          duration: 2000,
        });
      }
      
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  const shortcuts = [
    {
      category: 'Debug Panel',
      items: [
        { keys: ['⌘/Ctrl', 'D'], description: 'Toggle debug panel open/closed' },
        { keys: ['⌘/Ctrl', 'A'], description: 'Toggle animations on/off' },
        { keys: ['⌘/Ctrl', 'R'], description: 'Reset to system settings' },
      ]
    },
    {
      category: 'Help',
      items: [
        { keys: ['?'], description: 'Show this shortcuts help modal' },
        { keys: ['⌘/Ctrl', '/'], description: 'Show this shortcuts help modal' },
        { keys: ['Esc'], description: 'Close modal' },
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick keyboard shortcuts for developer tools
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold mb-3 text-foreground">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>💡 These shortcuts only work in development mode</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;
