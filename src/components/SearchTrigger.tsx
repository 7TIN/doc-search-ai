import { Search } from "lucide-react";

interface SearchTriggerProps {
  onClick: () => void;
}

const SearchTrigger = ({ onClick }: SearchTriggerProps) => {
  return (
    <button
      onClick={onClick}
      className="search-trigger flex items-center gap-2 w-full max-w-sm px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
    >
      <Search className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground flex-1 text-left">Search docs...</span>
      <kbd className="search-kbd hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border text-muted-foreground">
        <span>⌘</span><span>K</span>
      </kbd>
    </button>
  );
};

export default SearchTrigger;
