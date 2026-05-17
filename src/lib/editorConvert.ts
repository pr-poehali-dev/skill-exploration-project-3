import type { EditorBlock, EditorData } from "@/data/articles";

// Parse inline **bold** to <b>bold</b>
function inlineFormat(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}

// Convert old markdown-like string content to Editor.js blocks
export function markdownToEditor(content: string): EditorData {
  const lines = content.split("\n");
  const blocks: EditorBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;

    if (line.startsWith("## ")) {
      blocks.push({
        type: "header",
        data: { text: inlineFormat(line.replace("## ", "")), level: 2 },
      });
    } else if (line.startsWith("> ")) {
      const quoteLines = [line.replace("> ", "")];
      while (i + 1 < lines.length && lines[i + 1].startsWith("> ")) {
        i++;
        quoteLines.push(lines[i].replace("> ", ""));
      }
      blocks.push({
        type: "quote",
        data: {
          text: inlineFormat(quoteLines[0]),
          caption: quoteLines.length > 1 ? inlineFormat(quoteLines.slice(1).join(" ")) : "",
          alignment: "left",
        },
      });
    } else {
      blocks.push({
        type: "paragraph",
        data: { text: inlineFormat(line) },
      });
    }
  }

  return { time: Date.now(), blocks, version: "2.31.6" };
}

// Plain text excerpt from EditorData for previews
export function editorToPlainText(data: EditorData | undefined, max = 500): string {
  if (!data?.blocks) return "";
  const text = data.blocks
    .map((b) => {
      const d = b.data as { text?: string; items?: string[] };
      if (d.text) return d.text.replace(/<[^>]+>/g, "");
      if (Array.isArray(d.items)) return d.items.join(" ").replace(/<[^>]+>/g, "");
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function estimateReadTimeFromEditor(data: EditorData | undefined): string {
  const plain = editorToPlainText(data, 100000);
  const words = plain.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} мин`;
}
