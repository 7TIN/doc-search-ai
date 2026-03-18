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
}

export interface AiAnswerResponse {
  query: string;
  answer: string;
  provider?: string;
  model?: string;
  sources: AiAnswerSource[];
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
