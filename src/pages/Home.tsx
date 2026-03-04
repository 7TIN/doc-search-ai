
import { useEffect, useState,  } from "react";
import SearchCommand from "@/components/SearchCommand";
import SearchTrigger from "@/components/SearchTrigger";
import { FileText, Book, Code, Sparkles } from "lucide-react";

const Home = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Code className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Acme Docs</span>
          </div>
          <div className="flex-1 max-w-sm mx-8">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Guides</a>
            <a href="#" className="hover:text-foreground transition-colors">API</a>
            <a href="#" className="hover:text-foreground transition-colors">Blog</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            AI-powered search
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Find anything in<br />your documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Press <kbd className="search-kbd px-2 py-1 rounded-md text-xs font-mono border mx-1">⌘K</kbd> to search across all docs instantly, or ask AI for deeper understanding.
          </p>

          <div className="pt-4">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-2xl w-full">
          {[
            { icon: <FileText className="h-5 w-5" />, title: "Full-text Search", desc: "Search across all documentation pages instantly" },
            { icon: <Sparkles className="h-5 w-5" />, title: "Ask AI", desc: "Get contextual answers powered by AI" },
            { icon: <Book className="h-5 w-5" />, title: "Keyboard First", desc: "Navigate entirely with your keyboard" },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center p-5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
              <div className="text-muted-foreground mb-3">{f.icon}</div>
              <h3 className="text-sm font-medium mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default Home;
