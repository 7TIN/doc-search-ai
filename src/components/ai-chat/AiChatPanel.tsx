import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CornerDownLeft, Send, Sparkles } from "lucide-react";
import { useAiChat } from "@/hooks/useAiChat";
import { useMountEffect } from "@/hooks/useMountEffect";
import { cn } from "@/lib/utils";
import AiMessageBubble from "./AiMessageBubble";

interface AiChatPanelProps {
  onBack: () => void;
  initialQuestion?: string;
}

const starterPrompts = [
  "How do I get started quickly?",
  "Can you explain authentication setup?",
  "Show me an API request example.",
];

const AiChatPanel = ({ onBack, initialQuestion }: AiChatPanelProps) => {
  const [input, setInput] = useState("");
  const { messages, isResponding, error, sendMessage, clearError } = useAiChat();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isResponding]);

  useMountEffect(() => {
    if (initialQuestion?.trim()) {
      void sendMessage(initialQuestion);
    }
  });

  const handleSend = (value: string) => {
    const query = value.trim();

    if (!query || isResponding) {
      return;
    }

    if (error) {
      clearError();
    }

    setInput("");
    void sendMessage(query);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend(input);
  };

  return (
    <div className="flex h-[430px] flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="flex h-12 items-center gap-2 border-b border-border/70 px-3 sm:px-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to search
        </button>

        <div className="mr-10 ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          AI Chat
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isResponding && (
          <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-secondary/60">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Ask anything about your docs and I will answer using your indexed
              knowledge base.
            </p>

            <div className="grid w-full gap-2 text-left sm:grid-cols-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-lg border border-border/70 bg-background px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <AiMessageBubble key={message.id} message={message} />
        ))}

        {isResponding && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border/80 bg-muted/70 px-3.5 py-2 text-sm text-muted-foreground">
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-pulse"
                )}
              />
              Thinking...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-border/70 px-3 py-3">
        {error && (
          <p className="mb-2 rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">
            {error}
          </p>
        )}

        <form
          onSubmit={onSubmit}
          className="flex h-12 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => {
              if (error) {
                clearError();
              }
              setInput(event.target.value);
            }}
            placeholder="Ask AI a question about your docs..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />

          <button
            type="submit"
            disabled={!input.trim() || isResponding}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-end gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> Enter to send
          </span>
        </div>
      </div>
    </div>
  );
};

export default AiChatPanel;
