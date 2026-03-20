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

const AI_ANSWER_DEBOUNCE_MS = 350;

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

  if (
    typeof options.limit === "number" &&
    Number.isInteger(options.limit) &&
    options.limit > 0
  ) {
    payload.limit = options.limit;
  }

  if (
    typeof options.scoreThreshold === "number" &&
    Number.isFinite(options.scoreThreshold)
  ) {
    payload.scoreThreshold = options.scoreThreshold;
  }

  if (
    typeof options.temperature === "number" &&
    Number.isFinite(options.temperature)
  ) {
    payload.temperature = options.temperature;
  }

  if (
    typeof options.maxTokens === "number" &&
    Number.isInteger(options.maxTokens) &&
    options.maxTokens > 0
  ) {
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
  const [conversationId, setConversationId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const sendTimeoutRef = useRef<number | null>(null);
  const messagesRef = useRef<AiChatMessage[]>([]);
  const isRespondingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  const defaultOptionsRef = useRef<PartialRequestOptions>({
    ...defaultRequestOptions,
    ...pickRequestOptions(defaultOptions),
  });

  const clearPendingSend = useCallback(() => {
    if (sendTimeoutRef.current !== null) {
      window.clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
  }, []);

  const setConversationIdAndRef = useCallback((next: string | null) => {
    conversationIdRef.current = next;
    setConversationId(next);
  }, []);

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
      clearPendingSend();
      abortRef.current?.abort();
      abortRef.current = null;
    };
  });

  const sendMessage = useCallback(
    (rawMessage: string, options?: PartialRequestOptions) => {
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
      const activeConversationId = conversationIdRef.current;

      setError(null);
      setMessagesAndRef((previous) => [...previous, userMessage]);
      setIsResponding(true);
      isRespondingRef.current = true;

      const controller = new AbortController();
      clearPendingSend();
      abortRef.current?.abort();
      abortRef.current = controller;

      sendTimeoutRef.current = window.setTimeout(async () => {
        try {
          if (controller.signal.aborted) {
            return;
          }

          const response = await api.post<AiAnswerResponse>(
            "/ai-answer",
            {
              query,
              history,
              ...requestOptions,
              ...(activeConversationId
                ? { conversationId: activeConversationId }
                : {}),
            },
            {
              signal: controller.signal,
              // AI answers can legitimately take longer than 10s.
              timeout: 0,
            }
          );

          const nextConversationId =
            typeof response.data.conversationId === "string"
              ? response.data.conversationId.trim()
              : "";

          if (nextConversationId && nextConversationId !== conversationIdRef.current) {
            setConversationIdAndRef(nextConversationId);
          }

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
        } finally {
          sendTimeoutRef.current = null;

          if (abortRef.current === controller) {
            abortRef.current = null;
          }

          setIsResponding(false);
          isRespondingRef.current = false;
        }
      }, AI_ANSWER_DEBOUNCE_MS);
    },
    [clearPendingSend, setConversationIdAndRef, setMessagesAndRef]
  );

  const resetChat = useCallback(() => {
    clearPendingSend();
    abortRef.current?.abort();
    abortRef.current = null;
    messagesRef.current = [];
    isRespondingRef.current = false;
    conversationIdRef.current = null;

    setMessages([]);
    setError(null);
    setIsResponding(false);
    setConversationId(null);
  }, [clearPendingSend]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isResponding,
    error,
    conversationId,
    sendMessage,
    resetChat,
    clearError,
  };
}
