interface AiMessageContentProps {
  content: string;
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

const AiMessageContent = ({ content }: AiMessageContentProps) => {
  const blocks = content.trim().split(/\n{2,}/);

  return (
    <div className="space-y-2 text-left">
      {blocks.map((block, blockIndex) => {
        const lines = block
          .split("\n")
          .map((line) => line.trimEnd())
          .filter((line) => line.trim().length > 0);

        const isUnorderedList = lines.every((line) => /^\s*[-*]\s+/.test(line));
        const isOrderedList = lines.every((line) => /^\s*\d+\.\s+/.test(line));

        if (isUnorderedList) {
          return (
            <ul key={`ul-${blockIndex}`} className="list-disc space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={`uli-${lineIndex}`}>
                  {renderInlineFormatting(line.replace(/^\s*[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        if (isOrderedList) {
          return (
            <ol key={`ol-${blockIndex}`} className="list-decimal space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={`oli-${lineIndex}`}>
                  {renderInlineFormatting(line.replace(/^\s*\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`p-${blockIndex}`} className="leading-relaxed">
            {renderInlineFormatting(block)}
          </p>
        );
      })}
    </div>
  );
};

export default AiMessageContent;
