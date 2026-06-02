'use client';

import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';

export function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">
      {/* <SearchBar /> */}
      {/* <Button onClick={onCreateClick} className="ml-4">
        <Plus className="h-4 w-4" />
        Create Incident
      </Button> */}
    </header>
  );
}
