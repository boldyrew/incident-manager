'use client';

import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

export function Topbar({ search, onSearchChange, onCreateClick }: TopbarProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search incidents..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>
      <Button onClick={onCreateClick} className="ml-4">
        <Plus className="h-4 w-4" />
        Create Incident
      </Button>
    </header>
  );
}
