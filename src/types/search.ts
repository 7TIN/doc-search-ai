export interface DocsSearchResult {
  document: {
    title: string;
    heading: string;
    content: string;
    url: string;
  };
  highlight?: {
    heading?: { snippet: string };
    content?: { snippet: string };
  };
}

export interface DocsSearchResponse {
  query: string;
  found: number;
  page: number;
  results: DocsSearchResult[];
}

export interface AiAnswerSource {
  id: number;
  url?: string;
  title?: string;
  heading?: string;
  keywords?: string[];
  score?: number;
  rankScore?: number;
}

export interface AiAnswerContext {
  id: number;
  url?: string;
  title?: string;
  heading?: string;
  content?: string;
  code?: string;
  keywords?: string[];
  score?: number;
  rankScore?: number;
}

export interface AiAnswerResponse {
  query: string;
  answer: string;
  provider?: string;
  model?: string;
  sources: AiAnswerSource[];
  context?: AiAnswerContext[];
}

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export interface AiChatMessage extends ChatTurn {
  id: string;
  createdAt: number;
  sources?: AiAnswerSource[];
  provider?: string;
  model?: string;
}

export interface AiAnswerRequestOptions {
  limit: number;
  scoreThreshold: number;
  temperature: number;
  maxTokens: number;
  includeContext: boolean;
}
