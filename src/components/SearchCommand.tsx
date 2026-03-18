import { useCallback, useState } from "react";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDocsSearch } from "@/hooks/useDocsSearch";
import { ArrowLeft, CornerDownLeft, Search, Sparkles } from "lucide-react";
import AiChatPanel from "./ai-chat/AiChatPanel";
import SearchResults from "./search/SearchResults";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"search" | "ai">("search");
  const [aiSessionKey, setAiSessionKey] = useState(0);
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>();

  const { results, loading, error, hasQuery } = useDocsSearch(query);

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);

      if (!nextOpen) {
        setQuery("");
        setMode("search");
        setInitialQuestion(undefined);
        setAiSessionKey((prev) => prev + 1);
      }
    },
    [onOpenChange]
  );

  const openAiChat = useCallback((seed?: string) => {
    const nextSeed = seed?.trim();

    setInitialQuestion(nextSeed ? nextSeed : undefined);
    setAiSessionKey((prev) => prev + 1);
    setMode("ai");
    setQuery("");
  }, []);

  const handleAskAI = useCallback(() => {
    openAiChat(query);
  }, [openAiChat, query]);

  const handleBackToSearch = useCallback(() => {
    setMode("search");
    setInitialQuestion(undefined);
  }, []);

  const showHint = !hasQuery && !loading;
  const showError = Boolean(error) && !loading;
  const showNoResults = hasQuery && !loading && !error && results.length === 0;
  const showResults = !loading && !error && results.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="search-dialog-content top-[18%] max-w-[820px] translate-y-0 gap-0 overflow-hidden rounded-2xl border border-border/80 bg-background p-0 shadow-2xl [&_[data-slot=dialog-close]]:right-3 [&_[data-slot=dialog-close]]:top-3">
        <Command shouldFilter={false} className="bg-transparent">
          {mode === "search" ? (
            <>
              <CommandInput
                placeholder="Search docs, APIs, guides..."
                value={query}
                onValueChange={setQuery}
                wrapperClassName="h-12 gap-2 px-3 pr-12 sm:px-4"
                className="h-12 border-0 bg-transparent py-0 pr-2 text-sm focus:ring-0 placeholder:text-muted-foreground"
                hideIcon
                startAdornment={
                  query ? (
                    <button
                      onClick={() => setQuery("")}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Clear search query"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                  ) : undefined
                }
              />

              <CommandList className="max-h-[430px] overflow-y-auto p-2">
                {showHint && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Type to search across documentation.
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="flex min-h-[220px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                )}

                {showError && (
                  <div className="flex min-h-[220px] items-center justify-center px-4 text-center">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {showNoResults && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No results found.</p>
                    <button
                      onClick={handleAskAI}
                      className="search-ask-ai-link mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-current" />
                      Ask AI instead
                    </button>
                  </div>
                )}

                {showResults && <SearchResults results={results} />}
              </CommandList>

              <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
                <button
                  onClick={handleAskAI}
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  <Sparkles className="h-3.5 w-3.5 text-current" />
                  Ask AI
                </button>

                <div className="flex flex-1 items-center justify-end gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="h-3 w-3" /> select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="search-kbd rounded border px-1 py-0.5 font-mono text-[10px]">
                      up/down
                    </kbd>
                    navigate
                  </span>
                </div>
              </div>
            </>
          ) : (
            <AiChatPanel
              key={aiSessionKey}
              onBack={handleBackToSearch}
              initialQuestion={initialQuestion}
            />
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default SearchCommand;
