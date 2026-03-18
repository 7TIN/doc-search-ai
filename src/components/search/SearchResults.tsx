import { CommandGroup } from "@/components/ui/command";
import type { DocsSearchResult } from "@/types/search";
import SearchResultItem from "./SearchResultItem";

interface SearchResultsProps {
  results: DocsSearchResult[];
}

const SearchResults = ({ results }: SearchResultsProps) => {
  if (!results.length) {
    return null;
  }

  return (
    <CommandGroup heading="Documentation">
      {results.map((hit) => {
        const key = `${hit.document.url}-${hit.document.heading || hit.document.title}`;

        return (
          <SearchResultItem
            key={key}
            title={hit.document.heading || hit.document.title}
            snippet={
              hit.highlight?.content?.snippet || hit.highlight?.heading?.snippet
            }
            url={hit.document.url}
          />
        );
      })}
    </CommandGroup>
  );
};

export default SearchResults;
