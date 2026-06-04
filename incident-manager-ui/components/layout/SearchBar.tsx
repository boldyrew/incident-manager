import { useState } from 'react';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [search, setSearch] = useState('');

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Search incidents..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-9 bg-background"
      />
    </div>
  );
}
