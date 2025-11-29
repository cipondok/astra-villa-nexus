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
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
          bg-muted/50 hover:bg-muted transition-all
          border border-border/50 text-xs text-muted-foreground
          hover:text-foreground h-8
        "
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex h-4 items-center gap-0.5 rounded border bg-background px-1 text-[9px] font-medium text-muted-foreground ml-1">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a section name to search..." className="text-sm" />
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
                      className="flex items-center gap-2 cursor-pointer text-sm py-2"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{section.label}</span>
                      {section.badge && (
                        <span className="ml-auto text-[10px] text-muted-foreground">
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
