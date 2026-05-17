import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useArticles, useBookmarks } from "@/store/articlesStore";

function CardPlaceholder({ seed }: { seed: number }) {
  const palettes: [string, string][] = [
    ["#DDD9D0", "#EDE9E2"],
    ["#C8D4CE", "#DCE8E4"],
    ["#D0C8D4", "#E4DCE8"],
    ["#D4CEC8", "#E8E2DC"],
    ["#C8CCD4", "#DCE0E8"],
  ];
  const [c1, c2] = palettes[seed % palettes.length];
  return (
    <svg width="100%" height="100%" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="100" fill={c2} />
      <circle cx="130" cy="25" r="35" fill={c1} opacity="0.5" />
      <rect x="12" y="35" width="80" height="6" rx="3" fill={c1} />
      <rect x="12" y="49" width="60" height="6" rx="3" fill={c1} opacity="0.6" />
    </svg>
  );
}

export default function BookmarksPage() {
  const navigate = useNavigate();
  const articles = useArticles();
  const { bookmarks, toggle } = useBookmarks();
  const saved = articles.filter((a) => bookmarks.includes(a.id));

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos">
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E4DC]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
          >
            <Icon name="ArrowLeft" size={15} />
            <span>Назад</span>
          </button>
          <div className="w-px h-4 bg-[#E8E4DC]" />
          <span className="font-cormorant font-semibold text-lg text-[#1A1A1A]">Закладки</span>
          {saved.length > 0 && (
            <span className="text-sm text-[#9A9690]">· {saved.length}</span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
        {saved.length === 0 ? (
          <div className="text-center py-24">
            <Icon name="Bookmark" size={32} className="mx-auto mb-4 text-[#C8C4BC]" />
            <p className="font-cormorant text-2xl text-[#4A4A48] mb-1">Закладок пока нет</p>
            <p className="text-sm text-[#9A9690] mb-6">
              Нажмите «Сохранить» на странице статьи, чтобы добавить её сюда
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-[#1A1A1A] border border-[#E8E4DC] px-5 py-2 rounded-full hover:border-[#C8C4BC] transition-colors"
            >
              К статьям
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {saved.map((a, i) => (
              <div
                key={a.id}
                className="flex gap-4 group animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="w-28 shrink-0 rounded-xl overflow-hidden aspect-video cursor-pointer transition-transform group-hover:scale-[1.02]"
                  onClick={() => navigate(`/article/${a.id}`)}
                >
                  <CardPlaceholder seed={a.id} />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/article/${a.id}`)}>
                  <span className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{a.category}</span>
                  <h3 className="font-cormorant text-lg font-semibold text-[#1A1A1A] leading-snug mt-1 mb-1 line-clamp-2 group-hover:text-[#4A4A48] transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-xs text-[#9A9690]">{a.date} · {a.readTime} чтения</p>
                </div>
                <button
                  onClick={() => toggle(a.id)}
                  className="shrink-0 text-[#1A1A1A] hover:text-[#9A9690] transition-colors mt-1"
                  title="Убрать из закладок"
                >
                  <Icon name="BookmarkCheck" size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
