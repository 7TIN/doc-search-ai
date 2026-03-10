import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SearchResult {
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

export function useDocsSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const search = async () => {
      try {
        setLoading(true);

        const res = await api.get("/search", {
          params: {
            q: query,
          },
          signal: controller.signal,
        });

        setResults(res.data.results || []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Search failed", error);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 250);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  return { results, loading };
}