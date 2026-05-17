import type { EditorData } from "@/data/articles";

export function formatViews(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1).replace(".0", "")}K`;
  if (n < 1000000) return `${Math.round(n / 1000)}K`;
  return `${(n / 1000000).toFixed(1).replace(".0", "")}M`;
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function renderEditorBlocks(data: EditorData) {
  return data.blocks.map((block, idx) => {
    const d = block.data as {
      text?: string;
      level?: number;
      items?: string[];
      style?: "ordered" | "unordered";
      caption?: string;
    };
    const key = block.id || `b-${idx}`;

    switch (block.type) {
      case "header": {
        const Tag = (d.level === 3 ? "h3" : "h2") as "h2" | "h3";
        const cls = d.level === 3
          ? "font-cormorant text-2xl font-semibold text-[#1A1A1A] mt-8 mb-3 leading-tight"
          : "font-cormorant text-3xl font-semibold text-[#1A1A1A] mt-10 mb-4 leading-tight";
        return <Tag key={key} className={cls} dangerouslySetInnerHTML={{ __html: d.text || "" }} />;
      }
      case "paragraph":
        return (
          <p
            key={key}
            className="text-[#4A4A48] leading-[1.85] text-[17px] mb-5 article-prose"
            dangerouslySetInnerHTML={{ __html: d.text || "" }}
          />
        );
      case "quote":
        return (
          <blockquote key={key} className="border-l-2 border-[#1A1A1A] pl-6 my-8">
            <p
              className="font-cormorant text-xl italic text-[#4A4A48] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: d.text || "" }}
            />
            {d.caption && (
              <p
                className="mt-2 text-sm text-[#9A9690] font-golos"
                dangerouslySetInnerHTML={{ __html: "— " + d.caption }}
              />
            )}
          </blockquote>
        );
      case "list": {
        const ListTag = (d.style === "ordered" ? "ol" : "ul") as "ol" | "ul";
        const cls = d.style === "ordered"
          ? "list-decimal pl-6 space-y-2 mb-6 text-[#4A4A48] text-[17px] leading-relaxed"
          : "list-disc pl-6 space-y-2 mb-6 text-[#4A4A48] text-[17px] leading-relaxed";
        return (
          <ListTag key={key} className={cls}>
            {(d.items || []).map((it, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
            ))}
          </ListTag>
        );
      }
      case "delimiter":
        return (
          <div key={key} className="flex justify-center my-10 text-[#C8C4BC] tracking-[0.6em] text-lg select-none">
            * * *
          </div>
        );
      default:
        return null;
    }
  });
}

export function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="font-cormorant text-3xl font-semibold text-[#1A1A1A] mt-10 mb-4 leading-tight">
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("> ")) {
      const quoteLines = [line.replace("> ", "")];
      while (i + 1 < lines.length && lines[i + 1].startsWith("> ")) {
        i++;
        quoteLines.push(lines[i].replace("> ", ""));
      }
      elements.push(
        <blockquote key={key++} className="border-l-2 border-[#1A1A1A] pl-6 my-8">
          {quoteLines.map((l, li) => (
            <p key={li} className={`font-cormorant text-xl italic text-[#4A4A48] leading-relaxed ${li > 0 ? "mt-1 text-sm not-italic text-[#9A9690] font-golos" : ""}`}>
              {l}
            </p>
          ))}
        </blockquote>
      );
    } else if (line.trim() === "") {
      // skip empty lines between paragraphs
    } else {
      // Parse inline bold **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const parsed = parts.map((part, pi) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pi} className="font-semibold text-[#1A1A1A]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      elements.push(
        <p key={key++} className="text-[#4A4A48] leading-[1.85] text-[17px] mb-5">
          {parsed}
        </p>
      );
    }
  }
  return elements;
}

export function CardPlaceholder({ seed }: { seed: number }) {
  const palettes: [string, string, string][] = [
    ["#DDD9D0", "#EDE9E2", "#CFCAC1"],
    ["#C8D4CE", "#DCE8E4", "#BACEC6"],
    ["#D0C8D4", "#E4DCE8", "#C2BAC6"],
    ["#D4CEC8", "#E8E2DC", "#C6C0BA"],
    ["#C8CCD4", "#DCE0E8", "#BAC0C6"],
  ];
  const [c1, c2, c3] = palettes[seed % palettes.length];
  return (
    <svg width="100%" height="100%" viewBox="0 0 900 400" preserveAspectRatio="xMidYMid slice">
      <rect width="900" height="400" fill={c2} />
      <circle cx="750" cy="80" r="160" fill={c1} opacity="0.4" />
      <circle cx="100" cy="350" r="80" fill={c1} opacity="0.25" />
      <rect x="60" y="140" width="300" height="16" rx="8" fill={c1} opacity="0.6" />
      <rect x="60" y="170" width="220" height="16" rx="8" fill={c1} opacity="0.4" />
      <rect x="60" y="200" width="260" height="16" rx="8" fill={c1} opacity="0.3" />
      <rect x="60" y="248" width="100" height="12" rx="6" fill={c3} opacity="0.5" />
    </svg>
  );
}
