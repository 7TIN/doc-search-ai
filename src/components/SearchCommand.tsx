import { useEffect, useState, useCallback } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
//   CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Search,
  Sparkles,
  FileText,
  ArrowRight,
  Clock,
  Book,
  Zap,
  Download,
  Settings,
  Database,
  Link,
  Filter,
  Edit,
  Shield,
  Lock,
  GitBranch,
  Cloud,
  CheckCircle,
  Code,
  Terminal,
  AlertTriangle,
  CornerDownLeft,
  Send,
  ChevronRight,
} from "lucide-react";
import { docsData, recentSearches } from "@/data/docs-data";

const iconMap: Record<string, React.ReactNode> = {
  book: <Book className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  link: <Link className="h-4 w-4" />,
  search: <Search className="h-4 w-4" />,
  edit: <Edit className="h-4 w-4" />,
  filter: <Filter className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  lock: <Lock className="h-4 w-4" />,
  "git-branch": <GitBranch className="h-4 w-4" />,
  cloud: <Cloud className="h-4 w-4" />,
  "check-circle": <CheckCircle className="h-4 w-4" />,
  code: <Code className="h-4 w-4" />,
  terminal: <Terminal className="h-4 w-4" />,
  "alert-triangle": <AlertTriangle className="h-4 w-4" />,
  "file-text": <FileText className="h-4 w-4" />,
};

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"search" | "ai">("search");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setMode("search");
      setAiResponse("");
      setIsAiTyping(false);
    }
  }, [open]);

  const handleAskAI = useCallback(() => {
    setMode("ai");
    setIsAiTyping(true);
    setAiResponse("");

    const response = `Based on your query "${query || "documentation"}", here's what I found:\n\nYou can get started by checking our **Quick Start Guide** which walks you through the initial setup. For more advanced topics, the **Core Concepts** section covers data modeling, relations, and queries in detail.\n\nWould you like me to explain any specific topic further?`;

    let i = 0;
    const interval = setInterval(() => {
      setAiResponse(response.slice(0, i + 1));
      i++;
      if (i >= response.length) {
        clearInterval(interval);
        setIsAiTyping(false);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [query]);

  const groupedResults = docsData.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof docsData>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="search-dialog-content overflow-hidden p-0 gap-0 max-w-[640px] rounded-xl border border-border bg-background shadow-2xl top-[20%] translate-y-0">
        <Command shouldFilter={mode === "search"} className="bg-transparent">
          {/* Search Input Area */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
            <CommandInput
              placeholder="Search documentation..."
              value={query}
              onValueChange={setQuery}
              className="h-12 border-0 focus:ring-0 text-sm bg-transparent placeholder:text-muted-foreground"
            />
            <kbd className="search-kbd hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border text-muted-foreground">
              esc
            </kbd>
          </div>

          {mode === "search" ? (
            <CommandList className="max-h-[400px] overflow-y-auto p-2">
              <CommandEmpty className="py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No results found.</p>
                  <button
                    onClick={handleAskAI}
                    className="search-ask-ai-link mt-1 text-sm font-medium flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Ask AI instead
                  </button>
                </div>
              </CommandEmpty>

              {/* Recent searches when no query */}
              {!query && (
                <CommandGroup heading="Recent">
                  {recentSearches.map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={() => setQuery(item)}
                      className="search-result-item flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">{item}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Grouped doc results */}
              {Object.entries(groupedResults).map(([section, items]) => (
                <CommandGroup key={section} heading={section}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.title} ${item.description}`}
                      className="search-result-item flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-left"
                    >
                      <div className="flex items-center justify-center h-7 w-7 rounded-md bg-secondary text-muted-foreground shrink-0 mt-0.5">
                        {iconMap[item.icon] || <FileText className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        {/* Breadcrumb path */}
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                          {item.breadcrumb.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-1">
                              {i > 0 && <ChevronRight className="h-2.5 w-2.5" />}
                              <span>{crumb}</span>
                            </span>
                          ))}
                        </div>
                        <p className="text-sm font-medium truncate text-left">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate text-left">{item.description}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-2" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          ) : (
            /* AI Mode */
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {!aiResponse && !isAiTyping ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="search-ai-icon-wrapper flex items-center justify-center h-12 w-12 rounded-xl">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-[280px]">
                    Ask anything about the documentation and AI will help you find the answer.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="search-ai-icon-wrapper flex items-center justify-center h-7 w-7 rounded-lg shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                      {isAiTyping && (
                        <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 rounded-sm" />
                      )}
                    </div>
                  </div>
                  {!isAiTyping && aiResponse && (
                    <button
                      onClick={() => setMode("search")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 ml-10"
                    >
                      ← Back to search results
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer with AI ask */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border">
            <button
              onClick={() => {
                if (mode === "ai" && query) {
                  handleAskAI();
                } else {
                  setMode(mode === "ai" ? "search" : "ai");
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === "ai"
                  ? "search-ai-toggle-active text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI
            </button>
            {mode === "ai" && (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && query) handleAskAI(); }}
                  placeholder="Ask AI a question..."
                  className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => query && handleAskAI()}
                  disabled={!query}
                  className="flex items-center justify-center h-7 w-7 rounded-md bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {mode === "search" && (
              <div className="flex-1 flex items-center justify-end gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" /> select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="search-kbd px-1 py-0.5 rounded text-[10px] font-mono border">↑↓</kbd> navigate
                </span>
              </div>
            )}
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default SearchCommand;
