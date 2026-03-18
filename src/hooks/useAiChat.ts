import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import type {
  AiAnswerResponse,
  AiChatMessage,
  ChatTurn,
} from "@/types/search";

type ApiError = {
  error?: string;
};

const fallbackAssistantError =
  "I hit an issue while generating an answer. Please try again.";

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

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<AiChatMessage[]>([]);
  const isRespondingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isRespondingRef.current = isResponding;
  }, [isResponding]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (rawMessage: string) => {
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
    setError(null);
    setMessages((prev) => [...prev, userMessage]);
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

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (requestError) {
      if (controller.signal.aborted) {
        return;
      }

      const errorMessage = axios.isAxiosError<ApiError>(requestError)
        ? requestError.response?.data?.error ?? requestError.message
        : "AI answer failed";

      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
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
  }, []);

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setError(null);
    setIsResponding(false);
    isRespondingRef.current = false;
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
