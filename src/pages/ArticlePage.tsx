import { useParams, useNavigate } from "react-router-dom";
import { ARTICLES } from "@/data/articles";
import Icon from "@/components/ui/icon";

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
  const article = ARTICLES.find((a) => a.id === Number(id));

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const related = ARTICLES.filter((a) => a.id !== article?.id).slice(0, 3);

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
            <button className="flex items-center gap-1.5 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors">
              <Icon name="Bookmark" size={15} />
              <span className="hidden sm:inline">Сохранить</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors">
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
          {renderContent(article.content)}
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