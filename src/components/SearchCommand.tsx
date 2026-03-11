import { useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  // CommandGroup,
  CommandInput,
  // CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { docsData, recentSearches } from "@/data/docs-data";
// import {
//   AlertTriangle,
//   ArrowLeft,
//   ArrowRight,
//   Book,
//   CheckCircle,
//   ChevronRight,
//   Clock,
//   Cloud,
//   Code,
//   CornerDownLeft,
//   Database,
//   Download,
//   Edit,
//   FileText,
//   Filter,
//   GitBranch,
//   Link,
//   Lock,
//   Search,
//   Send,
//   Settings,
//   Shield,
//   Sparkles,
//   Terminal,
//   Zap,
// } from "lucide-react";
import { useDocsSearch } from "@/hooks/useDocsSearch";
import SearchResults from "./search/SearchResults";
import { ArrowLeft, CornerDownLeft, Search, Send, Sparkles } from "lucide-react";

// const iconMap: Record<string, React.ReactNode> = {
//   book: <Book className="h-4 w-4" />,
//   zap: <Zap className="h-4 w-4" />,
//   download: <Download className="h-4 w-4" />,
//   settings: <Settings className="h-4 w-4" />,
//   database: <Database className="h-4 w-4" />,
//   link: <Link className="h-4 w-4" />,
//   search: <Search className="h-4 w-4" />,
//   edit: <Edit className="h-4 w-4" />,
//   filter: <Filter className="h-4 w-4" />,
//   shield: <Shield className="h-4 w-4" />,
//   lock: <Lock className="h-4 w-4" />,
//   "git-branch": <GitBranch className="h-4 w-4" />,
//   cloud: <Cloud className="h-4 w-4" />,
//   "check-circle": <CheckCircle className="h-4 w-4" />,
//   code: <Code className="h-4 w-4" />,
//   terminal: <Terminal className="h-4 w-4" />,
//   "alert-triangle": <AlertTriangle className="h-4 w-4" />,
//   "file-text": <FileText className="h-4 w-4" />,
// };

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const renderInlineFormatting = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

const renderAiMessage = (content: string) => {
  const blocks = content.trim().split(/\n{2,}/);

  return (
    <div className="space-y-2 text-left">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").filter((line) => line.trim().length > 0);
        const isUnorderedList = lines.every((line) => /^\s*[-*]\s+/.test(line));
        const isOrderedList = lines.every((line) => /^\s*\d+\.\s+/.test(line));

        if (isUnorderedList) {
          return (
            <ul key={`ul-${blockIndex}`} className="list-disc space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={`uli-${lineIndex}`}>
                  {renderInlineFormatting(line.replace(/^\s*[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        if (isOrderedList) {
          return (
            <ol key={`ol-${blockIndex}`} className="list-decimal space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={`oli-${lineIndex}`}>
                  {renderInlineFormatting(line.replace(/^\s*\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`p-${blockIndex}`} className="leading-relaxed">
            {renderInlineFormatting(block)}
          </p>
        );
      })}
    </div>
  );
};

const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const [query, setQuery] = useState("");
  const { results, loading } = useDocsSearch(query);
  const [mode, setMode] = useState<"search" | "ai">("search");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAiChat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setChatMessages([]);
    setIsAiTyping(false);
    setAiInput("");
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setMode("search");
      resetAiChat();
    }
  }, [open, resetAiChat]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  const sendAiMessage = useCallback((message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: trimmedMessage },
    ]);
    setAiInput("");
    setIsAiTyping(true);

    const response = `Based on your query "${trimmedMessage}", here's what I found:\n\nYou can get started by checking our **Quick Start Guide** which walks you through the initial setup. For more advanced topics, the **Core Concepts** section covers data modeling, relations, and queries in detail.\n\nWould you like me to explain any specific topic further?`;

    let i = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = setInterval(() => {
      i++;
      if (i >= response.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setChatMessages((prev) => [...prev, { role: "ai", content: response }]);
        setIsAiTyping(false);
      }
    }, 12);
  }, []);

  const handleAskAI = useCallback(() => {
    const messageToSend = query.trim();
    resetAiChat();
    setMode("ai");
    setQuery("");
    if (messageToSend) {
      // Delay slightly so mode switch renders first
      window.setTimeout(() => sendAiMessage(messageToSend), 50);
    }
  }, [query, resetAiChat, sendAiMessage]);

  const handleBackToSearch = useCallback(() => {
    resetAiChat();
    setMode("search");
  }, [resetAiChat]);

  // const groupedResults = docsData.reduce(
  //   (acc, item) => {
  //     if (!acc[item.section]) acc[item.section] = [];
  //     acc[item.section].push(item);
  //     return acc;
  //   },
  //   {} as Record<string, typeof docsData>,
  // );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="search-dialog-content overflow-hidden p-0 gap-0 max-w-[760px] rounded-xl border border-border bg-background shadow-2xl top-[20%] translate-y-0 [&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3">
        <Command shouldFilter={mode === "search"} className="bg-transparent">
          {/* Search Input Area - only in search mode */}
          {mode === "search" && (
            <CommandInput
              placeholder="Search documentation..."
              value={query}
              onValueChange={setQuery}
              wrapperClassName="h-12 gap-2 px-3 sm:px-4 pr-12"
              className="h-12 border-0 bg-transparent py-0 pr-2 text-sm focus:ring-0 placeholder:text-muted-foreground"
              hideIcon
              startAdornment={
                query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Back to full search results"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                ) : undefined
              }
            />
          )}

          {mode === "search" ? (
            <CommandList className="max-h-[400px] overflow-y-auto p-2">
              <CommandEmpty className="py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No results found.
                  </p>
                  <button
                    onClick={handleAskAI}
                    className="search-ask-ai-link mt-1 text-sm font-medium inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-current" />
                    Ask AI instead
                  </button>
                </div>
              </CommandEmpty>

              {/* Recent searches when no query */}
              {/* {!query && (
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
              )} */}

              {/* Grouped doc results */}
            <SearchResults results={results} loading={loading} />
            </CommandList>
          ) : (
            /* AI Chat Mode */
            <div className="flex flex-col h-[400px]">
              {/* Chat header */}
              <div className="flex h-12 items-center gap-2 px-3 sm:px-4 border-b border-border">
                <button
                  onClick={handleBackToSearch}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to search results
                </button>

                {/* Spacer pushes AI Chat to the right */}
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground mr-10">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  AI Chat
                </div>
              </div>

              {/* Chat messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && !isAiTyping && (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center max-w-[280px]">
                      Ask anything about the documentation and AI will help you
                      find the answer.
                    </p>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "search-user-bubble rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.role === "ai" ? (
                        renderAiMessage(msg.content)
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl rounded-bl-sm px-3.5 py-2.5">
                      <span className="text-sm text-muted-foreground">
                        Thinking ...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input at bottom */}
              <div className="border-t border-border px-3 py-3">
                <div className="flex h-12 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && aiInput.trim())
                        sendAiMessage(aiInput);
                    }}
                    placeholder="Ask AI a question..."
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                  <button
                    onClick={() => aiInput.trim() && sendAiMessage(aiInput)}
                    disabled={!aiInput.trim() || isAiTyping}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer - only in search mode */}
          {mode === "search" && (
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border">
              <button
                onClick={handleAskAI}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors bg-secondary text-primary hover:text-primary/80"
              >
                <Sparkles className="h-3.5 w-3.5 text-current" />
                Ask AI
              </button>
              <div className="flex-1 flex items-center justify-end gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" /> select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="search-kbd px-1 py-0.5 rounded text-[10px] font-mono border">
                    up/down
                  </kbd>{" "}
                  navigate
                </span>
              </div>
            </div>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default SearchCommand;
