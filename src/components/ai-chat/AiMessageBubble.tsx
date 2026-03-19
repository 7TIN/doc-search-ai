import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiChatMessage } from "@/types/search";
import AiMessageContent from "./AiMessageContent";

interface AiMessageBubbleProps {
  message: AiChatMessage;
}

const AiMessageBubble = ({ message }: AiMessageBubbleProps) => {
  const isUser = message.role === "user";
  const [copiedResponse, setCopiedResponse] = useState(false);

  const onCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedResponse(true);
      window.setTimeout(() => setCopiedResponse(false), 1200);
    } catch {
      setCopiedResponse(false);
    }
  };

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[92%] space-y-2 md:max-w-[88%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm shadow-sm",
            isUser
              ? "rounded-br-sm bg-neutral-800 text-white"
              : "rounded-bl-sm border border-border/80 bg-background text-foreground"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <AiMessageContent content={message.content} />
          )}
        </div>

        {!isUser && (
          <div className="flex justify-end">
            <button
              onClick={onCopyResponse}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground transition-colors hover:text-foreground"
              aria-label={copiedResponse ? "Copied" : "Copy response"}
              title={copiedResponse ? "Copied" : "Copy response"}
            >
              {copiedResponse ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {message.sources.slice(0, 4).map((source) => {
              const label = source.heading || source.title || `Source ${source.id}`;

              if (!source.url) {
                return (
                  <span
                    key={`${source.id}-${label}`}
                    className="inline-flex items-center rounded-full border border-border/70 bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {label}
                  </span>
                );
              }

              return (
                <a
                  key={`${source.id}-${label}`}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-border/70 bg-background px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </a>
              );
            })}
          </div>
        )}

        {!isUser && (message.provider || message.model) && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            {message.provider ?? "AI"} {message.model ? `· ${message.model}` : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default AiMessageBubble;
