import { Fragment, type ReactNode } from "react";

type Block =
  | { kind: "heading"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "para"; text: string }
  | { kind: "rule" };

/** Splits model output into blocks. Supports headings, bullet/numbered lists, rules and paragraphs. */
export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "para", text: para.join("\n") });
    para = [];
  };

  for (const raw of source.split("\n")) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const item = bullet?.[1] ?? numbered?.[1];

    if (!line.trim()) {
      flush();
    } else if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flush();
      blocks.push({ kind: "rule" });
    } else if (heading) {
      flush();
      blocks.push({ kind: "heading", text: heading[1] });
    } else if (item !== undefined) {
      flush();
      const ordered = Boolean(numbered);
      const last = blocks.at(-1);
      if (last?.kind === "list" && last.ordered === ordered) last.items.push(item);
      else blocks.push({ kind: "list", ordered, items: [item] });
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

/** Renders **bold** spans as React nodes (no HTML injection). */
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
}

export function SimpleMarkdown({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-3 leading-relaxed">
      {parseBlocks(text).map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <p key={i} className="text-lg font-bold">
                {inline(block.text)}
              </p>
            );
          case "rule":
            return <hr key={i} className="border-border" />;
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List key={i} className={`flex flex-col gap-1 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </List>
            );
          }
          default:
            return (
              <p key={i} className="whitespace-pre-wrap">
                {inline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
