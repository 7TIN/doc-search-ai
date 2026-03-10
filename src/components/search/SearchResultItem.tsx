import { CommandItem } from "@/components/ui/command";
import { ArrowRight, FileText } from "lucide-react";

interface Props {
  title: string;
  snippet?: string;
  url: string;
}

const SearchResultItem = ({ title, snippet, url }: Props) => {
  return (
    <CommandItem
      value={title}
      onSelect={() => window.open(url, "_blank")}
      className="flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
    >
      <div className="flex items-center justify-center h-7 w-7 rounded-md bg-secondary text-muted-foreground shrink-0 mt-0.5">
        <FileText className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium truncate">{title}</p>

        {snippet && (
          <p
            className="text-xs text-muted-foreground line-clamp-2"
            dangerouslySetInnerHTML={{ __html: snippet }}
          />
        )}
      </div>

      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-2" />
    </CommandItem>
  );
};

export default SearchResultItem;