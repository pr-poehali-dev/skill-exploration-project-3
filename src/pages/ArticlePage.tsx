import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useArticles, useBookmarks } from "@/store/articlesStore";
import type { EditorData } from "@/data/articles";
import Icon from "@/components/ui/icon";

function renderEditorBlocks(data: EditorData) {
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

function renderContent(content: string) {
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

function CardPlaceholder({ seed }: { seed: number }) {
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

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articles = useArticles();
  const { bookmarks, toggle } = useBookmarks();
  const article = articles.find((a) => a.id === Number(id));
  const isBookmarked = article ? bookmarks.includes(article.id) : false;

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const related = articles.filter((a) => a.id !== article?.id).slice(0, 3);

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] font-golos flex items-center justify-center">
        <div className="text-center">
          <p className="font-cormorant text-3xl text-[#1A1A1A] mb-2">Статья не найдена</p>
          <button onClick={() => navigate("/")} className="text-sm text-[#9A9690] hover:text-[#1A1A1A] transition-colors">
            ← Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E4DC]">
        <div
          className="absolute bottom-0 left-0 h-[1.5px] transition-all duration-150 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #555 0%, #1A1A1A 80%, #1A1A1A 100%)",
            boxShadow: progress > 1 ? "2px 0 8px 1px rgba(26,26,26,0.18)" : "none",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
          >
            <Icon name="ArrowLeft" size={15} />
            <span>Назад</span>
          </button>
          <div className="w-px h-4 bg-[#E8E4DC]" />
          <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
              <span className="text-white font-cormorant font-semibold text-sm leading-none select-none">М</span>
            </div>
            <span className="font-cormorant font-semibold text-lg text-[#1A1A1A] hidden sm:block tracking-tight">
              Медиум
            </span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/article/${article.id}/edit`)}
              className="flex items-center gap-1.5 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
              title="Редактировать"
            >
              <Icon name="PenLine" size={15} />
              <span className="hidden sm:inline">Редактировать</span>
            </button>
            <button
              onClick={() => toggle(article.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${isBookmarked ? "text-[#1A1A1A]" : "text-[#6A6660] hover:text-[#1A1A1A]"}`}
            >
              <Icon name={isBookmarked ? "BookmarkCheck" : "Bookmark"} size={15} />
              <span className="hidden sm:inline">{isBookmarked ? "Сохранено" : "Сохранить"}</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: article.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="flex items-center gap-1.5 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
            >
              <Icon name="Share2" size={15} />
              <span className="hidden sm:inline">Поделиться</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <div className="max-w-2xl mx-auto px-6 pt-14 pb-10 animate-fade-in">
          <span className="inline-block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-5 border border-[#E0DDD8] px-3 py-1 rounded-full">
            {article.category}
          </span>
          <h1 className="font-cormorant text-4xl sm:text-5xl font-semibold text-[#1A1A1A] leading-[1.15] mb-6">
            {article.title}
          </h1>
          <p className="text-[#6A6660] text-lg leading-relaxed mb-8">{article.excerpt}</p>

          {/* Author + meta */}
          <div className="flex items-center gap-4 pb-8 border-b border-[#E8E4DC]">
            <div className="w-10 h-10 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
              <span className="font-cormorant font-semibold text-[#4A4A48] text-lg leading-none">
                {article.author[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">{article.author}</p>
              <p className="text-xs text-[#9A9690]">{article.authorRole}</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs text-[#9A9690]">
              <span>{article.date}</span>
              <span className="w-1 h-1 rounded-full bg-[#C8C4BC]" />
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={12} />
                {article.readTime} чтения
              </span>
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="rounded-2xl overflow-hidden aspect-[16/7]">
            <CardPlaceholder seed={article.id} />
          </div>
        </div>

        {/* Article body */}
        <div className="max-w-2xl mx-auto px-6 pb-16">
          {article.editorData?.blocks?.length
            ? renderEditorBlocks(article.editorData)
            : renderContent(article.content)}
        </div>

        {/* Divider */}
        <div className="max-w-2xl mx-auto px-6">
          <div className="border-t border-[#E8E4DC] mb-12" />
        </div>

        {/* Related articles */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-7">Читайте также</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((a, i) => (
              <button
                key={a.id}
                onClick={() => {
                  navigate(`/article/${a.id}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-left group animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="rounded-xl overflow-hidden aspect-video mb-3 transition-transform group-hover:scale-[1.02]">
                  <CardPlaceholder seed={a.id} />
                </div>
                <span className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{a.category}</span>
                <h3 className="font-cormorant text-lg font-semibold text-[#1A1A1A] leading-snug mt-1.5 group-hover:text-[#4A4A48] transition-colors line-clamp-2">
                  {a.title}
                </h3>
                <p className="text-xs text-[#9A9690] mt-2">{a.date} · {a.readTime} чтения</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}