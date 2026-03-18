import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { DocsSearchResponse } from "@/types/search";

type ApiError = {
  error?: string;
};

export function useDocsSearch(query: string) {
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, 250);
  const hasQuery = normalizedQuery.length > 0;
  const isDebouncing = hasQuery && normalizedQuery !== debouncedQuery;

  const searchQuery = useQuery({
    queryKey: ["docs-search", debouncedQuery],
    queryFn: async ({ signal }) => {
      const response = await api.post<DocsSearchResponse>(
        "/search",
        {
          query: debouncedQuery,
          page: 1,
          perPage: 10,
        },
        {
          signal,
        }
      );

      return response.data;
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 30_000,
  });

  const error = searchQuery.error
    ? axios.isAxiosError<ApiError>(searchQuery.error)
      ? searchQuery.error.response?.data?.error ?? "Search failed"
      : "Search failed"
    : null;

  const loading =
    hasQuery && (isDebouncing || searchQuery.isPending || searchQuery.isFetching);

  return {
    results: searchQuery.data?.results ?? [],
    loading,
    error,
    hasQuery,
  };
}
