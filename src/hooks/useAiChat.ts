import { useCallback, useRef, useState } from "react";
import type { SetStateAction } from "react";
import axios from "axios";
import { useMountEffect } from "@/hooks/useMountEffect";
import { api } from "@/lib/api";
import type {
  AiAnswerRequestOptions,
  AiAnswerResponse,
  AiChatMessage,
  ChatTurn,
} from "@/types/search";

type ApiError = {
  error?: string;
};

type PartialRequestOptions = Partial<AiAnswerRequestOptions>;

const fallbackAssistantError =
  "I hit an issue while generating an answer. Please try again.";

const defaultRequestOptions: PartialRequestOptions = {
  limit: 5,
  includeContext: false,
};

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toHistory(messages: AiChatMessage[]): ChatTurn[] {
  return messages
    .map(({ role, content }) => ({
      role,
      content: content.trim(),
    }))
    .filter((turn) => turn.content.length > 0);
}

function pickRequestOptions(
  options?: PartialRequestOptions
): PartialRequestOptions {
  if (!options) {
    return {};
  }

  const payload: PartialRequestOptions = {};

  if (typeof options.limit === "number" && Number.isInteger(options.limit) && options.limit > 0) {
    payload.limit = options.limit;
  }

  if (typeof options.scoreThreshold === "number" && Number.isFinite(options.scoreThreshold)) {
    payload.scoreThreshold = options.scoreThreshold;
  }

  if (typeof options.temperature === "number" && Number.isFinite(options.temperature)) {
    payload.temperature = options.temperature;
  }

  if (typeof options.maxTokens === "number" && Number.isInteger(options.maxTokens) && options.maxTokens > 0) {
    payload.maxTokens = options.maxTokens;
  }

  if (typeof options.includeContext === "boolean") {
    payload.includeContext = options.includeContext;
  }

  return payload;
}

export function useAiChat(defaultOptions?: PartialRequestOptions) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<AiChatMessage[]>([]);
  const isRespondingRef = useRef(false);
  const defaultOptionsRef = useRef<PartialRequestOptions>({
    ...defaultRequestOptions,
    ...pickRequestOptions(defaultOptions),
  });

  const setMessagesAndRef = useCallback(
    (next: SetStateAction<AiChatMessage[]>) => {
      setMessages((previous) => {
        const resolved =
          typeof next === "function"
            ? (next as (value: AiChatMessage[]) => AiChatMessage[])(previous)
            : next;

        messagesRef.current = resolved;
        return resolved;
      });
    },
    []
  );

  useMountEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  });

  const sendMessage = useCallback(
    async (rawMessage: string, options?: PartialRequestOptions) => {
      const query = rawMessage.trim();

      if (!query || isRespondingRef.current) {
        return;
      }

      const userMessage: AiChatMessage = {
        id: createMessageId(),
        role: "user",
        content: query,
        createdAt: Date.now(),
      };

      const history = toHistory(messagesRef.current);
      const requestOptions = {
        ...defaultOptionsRef.current,
        ...pickRequestOptions(options),
      };

      setError(null);
      setMessagesAndRef((previous) => [...previous, userMessage]);
      setIsResponding(true);
      isRespondingRef.current = true;

      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;

      try {
        const response = await api.post<AiAnswerResponse>(
          "/ai-answer",
          {
            query,
            history,
            ...requestOptions,
          },
          {
            signal: controller.signal,
          }
        );

        const assistantMessage: AiChatMessage = {
          id: createMessageId(),
          role: "assistant",
          content:
            response.data.answer?.trim() ||
            "I couldn't generate an answer for that yet.",
          createdAt: Date.now(),
          sources: response.data.sources ?? [],
          provider: response.data.provider,
          model: response.data.model,
        };

        setMessagesAndRef((previous) => [...previous, assistantMessage]);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        const errorMessage = axios.isAxiosError<ApiError>(requestError)
          ? requestError.response?.data?.error ?? requestError.message
          : "AI answer failed";

        setError(errorMessage);
        setMessagesAndRef((previous) => [
          ...previous,
          {
            id: createMessageId(),
            role: "assistant",
            content: fallbackAssistantError,
            createdAt: Date.now(),
          },
        ]);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }

        setIsResponding(false);
        isRespondingRef.current = false;
      }
    },
    [setMessagesAndRef]
  );

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    messagesRef.current = [];
    isRespondingRef.current = false;

    setMessages([]);
    setError(null);
    setIsResponding(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isResponding,
    error,
    sendMessage,
    resetChat,
    clearError,
  };
}
