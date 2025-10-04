import React, { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { navigationSections, sectionTitles } from './navigationSections';
import { Search } from 'lucide-react';

interface AdminCommandPaletteProps {
  onSectionChange: (section: string) => void;
}

export function AdminCommandPalette({ onSectionChange }: AdminCommandPaletteProps) {
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

  const handleSelect = (key: string) => {
    onSectionChange(key);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-muted/50 hover:bg-muted transition-all
          border border-border text-sm text-muted-foreground
          hover:text-foreground
        "
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search sections...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a section name to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(navigationSections).map(([category, sections], index) => (
            <div key={category}>
              <CommandGroup heading={sectionTitles[category as keyof typeof sectionTitles]}>
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <CommandItem
                      key={section.key}
                      onSelect={() => handleSelect(section.key)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{section.label}</span>
                      {section.badge && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {section.badge}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {index < Object.entries(navigationSections).length - 1 && <CommandSeparator />}
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
