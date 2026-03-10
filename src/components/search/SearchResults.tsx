import { CommandEmpty, CommandGroup } from "@/components/ui/command";
import SearchResultItem from "./SearchResultItem";

interface Result {
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

interface Props {
  results: Result[];
  loading: boolean;
}

const SearchResults = ({ results, loading }: Props) => {
  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Searching...
      </div>
    );
  }

  if (!results.length) {
    return (
      <CommandEmpty>
        <p className="text-sm text-muted-foreground py-8 text-center">
          No results found
        </p>
      </CommandEmpty>
    );
  }

  return (
    <CommandGroup heading="Documentation">
      {results.map((hit, i) => (
        <SearchResultItem
          key={i}
          title={hit.document.heading || hit.document.title}
          snippet={
            hit.highlight?.content?.snippet ||
            hit.highlight?.heading?.snippet
          }
          url={hit.document.url}
        />
      ))}
    </CommandGroup>
  );
};

export default SearchResults;