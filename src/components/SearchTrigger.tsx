import { Search } from "lucide-react";

interface SearchTriggerProps {
  onClick: () => void;
}

const SearchTrigger = ({ onClick }: SearchTriggerProps) => {
  return (
    <button
      onClick={onClick}
      className="search-trigger group flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 transition-colors hover:bg-secondary"
    >
      <Search className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="flex-1 text-left text-xs text-muted-foreground">
        Search docs...
      </span>
      <kbd className="search-kbd hidden items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
        <span>Ctrl</span>
        <span>K</span>
      </kbd>
    </button>
  );
};

export default SearchTrigger;
