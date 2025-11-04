import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  Home, 
  MessageSquare, 
  ImagePlus, 
  ArrowUp, 
  Search,
  Keyboard,
  MapPin,
  Heart,
  User,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface CommandPaletteProps {
  onOpenChat?: () => void;
  onOpenImageSearch?: () => void;
  onScrollToTop?: () => void;
  onShowShortcuts?: () => void;
}

interface Command {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
}

export function CommandPalette({
  onOpenChat,
  onOpenImageSearch,
  onScrollToTop,
  onShowShortcuts,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (action: () => void) => {
    action();
    setOpen(false);
  };

  const navigationCommands: Command[] = [
    {
      label: 'Home',
      icon: Home,
      action: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      keywords: ['home', 'start', 'top'],
    },
    {
      label: 'Search Properties',
      icon: Search,
      action: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      },
      keywords: ['search', 'find', 'properties', 'homes'],
    },
  ];

  const actionCommands: Command[] = [
    {
      label: 'Open AI Assistant',
      icon: MessageSquare,
      action: () => onOpenChat?.(),
      keywords: ['chat', 'ai', 'assistant', 'help', 'bot'],
      shortcut: 'C',
    },
    {
      label: 'Search by Image',
      icon: ImagePlus,
      action: () => onOpenImageSearch?.(),
      keywords: ['image', 'photo', 'upload', 'visual', 'picture'],
      shortcut: 'I',
    },
    {
      label: 'Scroll to Top',
      icon: ArrowUp,
      action: () => onScrollToTop?.(),
      keywords: ['scroll', 'top', 'up', 'beginning'],
      shortcut: 'T',
    },
    {
      label: 'View Keyboard Shortcuts',
      icon: Keyboard,
      action: () => onShowShortcuts?.(),
      keywords: ['shortcuts', 'keys', 'keyboard', 'commands', 'help'],
      shortcut: '?',
    },
  ];

  const quickLinksCommands: Command[] = [
    {
      label: 'Featured Properties',
      icon: MapPin,
      action: () => {
        const featuredSection = document.querySelector('[data-section="featured"]');
        if (featuredSection) {
          featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      keywords: ['featured', 'popular', 'trending'],
    },
    {
      label: 'My Favorites',
      icon: Heart,
      action: () => {
        // Navigate to favorites section if exists
        const favoritesSection = document.querySelector('[data-section="favorites"]');
        if (favoritesSection) {
          favoritesSection.scrollIntoView({ behavior: 'smooth' });
        }
      },
      keywords: ['favorites', 'saved', 'liked', 'bookmarks'],
    },
  ];

  const helpCommands: Command[] = [
    {
      label: 'Help & Support',
      icon: HelpCircle,
      action: () => onOpenChat?.(),
      keywords: ['help', 'support', 'faq', 'contact'],
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationCommands.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => handleSelect(cmd.action)}
              className="flex items-center gap-3 cursor-pointer"
              keywords={cmd.keywords}
            >
              <cmd.icon className="h-4 w-4 text-muted-foreground" />
              <span>{cmd.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionCommands.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => handleSelect(cmd.action)}
              className="flex items-center gap-3 cursor-pointer"
              keywords={cmd.keywords}
            >
              <cmd.icon className="h-4 w-4 text-muted-foreground" />
              <span>{cmd.label}</span>
              {cmd.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {cmd.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Links">
          {quickLinksCommands.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => handleSelect(cmd.action)}
              className="flex items-center gap-3 cursor-pointer"
              keywords={cmd.keywords}
            >
              <cmd.icon className="h-4 w-4 text-muted-foreground" />
              <span>{cmd.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          {helpCommands.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => handleSelect(cmd.action)}
              className="flex items-center gap-3 cursor-pointer"
              keywords={cmd.keywords}
            >
              <cmd.icon className="h-4 w-4 text-muted-foreground" />
              <span>{cmd.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
