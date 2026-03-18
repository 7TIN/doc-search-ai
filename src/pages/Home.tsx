import { useState } from "react";
import { Book, Code, FileText, Sparkles } from "lucide-react";
import SearchCommand from "@/components/SearchCommand";
import SearchTrigger from "@/components/SearchTrigger";
import { useMountEffect } from "@/hooks/useMountEffect";

const Home = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  useMountEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Code className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Acme Docs</span>
          </div>

          <div className="mx-8 flex-1 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#" className="transition-colors hover:text-foreground">
              Guides
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              API
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Blog
            </a>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3 w-3" />
            AI-powered search
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Find anything in
            <br />
            your documentation
          </h1>

          <p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
            Press
            <kbd className="search-kbd mx-1 rounded-md border px-2 py-1 font-mono text-xs">
              Ctrl+K
            </kbd>
            to search docs instantly, or ask AI for deeper answers.
          </p>

          <div className="pt-4">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
        </div>

        <div className="mt-16 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: <FileText className="h-5 w-5" />,
              title: "Full-text Search",
              desc: "Search across all documentation pages instantly",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: "Ask AI",
              desc: "Get contextual answers powered by AI",
            },
            {
              icon: <Book className="h-5 w-5" />,
              title: "Keyboard First",
              desc: "Navigate entirely with your keyboard",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center transition-colors hover:bg-secondary/50"
            >
              <div className="mb-3 text-muted-foreground">{feature.icon}</div>
              <h3 className="mb-1 text-sm font-medium">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default Home;
