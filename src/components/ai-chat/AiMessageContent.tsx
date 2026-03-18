import { useState } from "react";

type TextBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ordered-list"; items: string[] }
  | { type: "unordered-list"; items: string[] };

type ContentBlock = TextBlock | { type: "code"; language?: string; code: string };

interface AiMessageContentProps {
  content: string;
}

const inlineCitationPattern = /\s*\[(\d+(?:\s*,\s*\d+)*)\]/g;
const sourceLinePattern = /^\s*\[\d+\]\s+/;
const languageAliases = new Set([
  "bash",
  "sh",
  "shell",
  "zsh",
  "powershell",
  "pwsh",
  "cmd",
  "javascript",
  "js",
  "typescript",
  "ts",
  "tsx",
  "json",
  "yaml",
  "yml",
  "sql",
]);
const shellLanguages = new Set([
  "bash",
  "sh",
  "shell",
  "zsh",
  "powershell",
  "pwsh",
  "cmd",
]);

function cleanInlineText(text: string) {
  return text.replace(inlineCitationPattern, "").replace(/\s{2,}/g, " ").trimEnd();
}

function normalizeCode(code: string, language?: string) {
  const normalizedLanguage = language?.toLowerCase();
  let lines = code
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, "  ")
    .split("\n");

  while (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }

  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  if (shellLanguages.has(normalizedLanguage ?? "")) {
    lines = lines.map((line) => line.trimStart());
    return lines.join("\n");
  }

  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  const minIndent = nonEmpty.length
    ? Math.min(...nonEmpty.map((line) => (line.match(/^\s*/) ?? [""])[0].length))
    : 0;

  if (minIndent > 0) {
    lines = lines.map((line) => line.slice(minIndent));
  }

  return lines.join("\n");
}

function tryParsePseudoCodeBlock(lines: string[]): ContentBlock | null {
  if (lines.length < 2) {
    return null;
  }

  const language = lines[0].trim().toLowerCase();
  if (!languageAliases.has(language)) {
    return null;
  }

  let startIndex = 1;

  while (startIndex < lines.length && lines[startIndex].trim() === "") {
    startIndex += 1;
  }

  if (startIndex < lines.length && lines[startIndex].trim().toLowerCase() === "copy") {
    startIndex += 1;
  }

  const code = normalizeCode(lines.slice(startIndex).join("\n"), language);

  if (!code.trim()) {
    return null;
  }

  return {
    type: "code",
    language,
    code,
  };
}

function parseTextChunk(chunk: string): ContentBlock[] {
  const lines = chunk
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .filter((line) => line.trim().length > 0)
    .filter((line) => !sourceLinePattern.test(line));

  if (!lines.length) {
    return [];
  }

  const pseudoCode = tryParsePseudoCodeBlock(lines);
  if (pseudoCode) {
    return [pseudoCode];
  }

  if (lines.length === 1) {
    const headingMatch = lines[0].match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      return [
        {
          type: "heading",
          level: headingMatch[1].length,
          text: cleanInlineText(headingMatch[2]),
        },
      ];
    }
  }

  if (lines.every((line) => /^\s*\d+[.)]\s+/.test(line))) {
    return [
      {
        type: "ordered-list",
        items: lines.map((line) => cleanInlineText(line.replace(/^\s*\d+[.)]\s+/, ""))),
      },
    ];
  }

  if (/^\s*\d+[.)]\s+/.test(lines[0])) {
    return [
      {
        type: "ordered-list",
        items: [cleanInlineText(lines.join(" ").replace(/^\s*\d+[.)]\s+/, ""))],
      },
    ];
  }

  if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
    return [
      {
        type: "unordered-list",
        items: lines.map((line) => cleanInlineText(line.replace(/^\s*[-*]\s+/, ""))),
      },
    ];
  }

  return [
    {
      type: "paragraph",
      text: lines.map((line) => cleanInlineText(line)).join("\n"),
    },
  ];
}

function parseTextBlocks(raw: string): ContentBlock[] {
  const normalized = raw.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .flatMap(parseTextChunk);
}

function parseBlocks(content: string): ContentBlock[] {
  const normalized = content.replace(/\r\n/g, "\n");
  const blocks: ContentBlock[] = [];
  const fenceRegex = /```([a-zA-Z0-9_+-]+)?\s*([\s\S]*?)```/g;
  let lastIndex = 0;

  for (const match of normalized.matchAll(fenceRegex)) {
    const start = match.index ?? 0;
    const before = normalized.slice(lastIndex, start);

    blocks.push(...parseTextBlocks(before));
    blocks.push({
      type: "code",
      language: match[1]?.toLowerCase(),
      code: normalizeCode(match[2] ?? "", match[1]),
    });

    lastIndex = start + match[0].length;
  }

  blocks.push(...parseTextBlocks(normalized.slice(lastIndex)));

  if (blocks.length > 0) {
    return blocks;
  }

  const cleaned = cleanInlineText(content.trim());
  return cleaned ? [{ type: "paragraph", text: cleaned }] : [];
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (!part) {
      return null;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.9em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

const headingClassByLevel: Record<number, string> = {
  1: "text-lg font-semibold",
  2: "text-base font-semibold",
  3: "text-sm font-semibold",
  4: "text-sm font-semibold",
  5: "text-sm font-semibold",
  6: "text-sm font-semibold",
};

const AiCodeBlock = ({
  language,
  code,
}: {
  language?: string;
  code: string;
}) => {
  const [copied, setCopied] = useState(false);
  const cleanedCode = code || " ";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-300">
          {language || "text"}
        </span>

        <button
          onClick={onCopy}
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="max-h-80 overflow-auto p-3 text-[12px] leading-relaxed">
        <code className="font-mono">{cleanedCode}</code>
      </pre>
    </div>
  );
};

const AiMessageContent = ({ content }: AiMessageContentProps) => {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-3 text-left text-[14px] leading-7 text-foreground">
      {blocks.map((block, blockIndex) => {
        if (block.type === "code") {
          return (
            <AiCodeBlock
              key={`code-${blockIndex}`}
              language={block.language}
              code={block.code}
            />
          );
        }

        if (block.type === "heading") {
          return (
            <h4
              key={`h-${blockIndex}`}
              className={headingClassByLevel[block.level] || headingClassByLevel[3]}
            >
              {renderInlineFormatting(block.text)}
            </h4>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={`ol-${blockIndex}`} className="list-decimal space-y-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`oli-${itemIndex}`} className="leading-relaxed">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`ul-${blockIndex}`} className="list-disc space-y-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`uli-${itemIndex}`} className="leading-relaxed">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
        }

        const lines = block.text.split("\n");

        return (
          <p key={`p-${blockIndex}`} className="leading-relaxed">
            {lines.map((line, lineIndex) => (
              <span key={`line-${lineIndex}`}>
                {renderInlineFormatting(line)}
                {lineIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
};

export default AiMessageContent;
