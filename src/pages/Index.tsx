import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ARTICLES, CATEGORIES, type Article } from "@/data/articles";

const NAV_ITEMS = ["Главная", "Категории", "Статьи"];
const PROFILE_MENU = ["Мой профиль", "Закладки", "Настройки", "Выйти"];

export default function Index() {
  const [activeNav, setActiveNav] = useState("Главная");
  const [searchValue, setSearchValue] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const featured = ARTICLES.find((a) => a.featured);
  const rest = ARTICLES.filter((a) => !a.featured);

  const filtered =
    searchValue.trim().length > 0
      ? ARTICLES.filter(
          (a) =>
            a.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            a.category.toLowerCase().includes(searchValue.toLowerCase())
        )
      : null;

  const goArticle = (id: number) => navigate(`/article/${id}`);

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E4DC]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <a href="#" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-cormorant font-semibold text-lg leading-none select-none">М</span>
            </div>
            <span className="font-cormorant font-semibold text-xl text-[#1A1A1A] hidden sm:block tracking-tight">
              Медиум
            </span>
          </a>

          <div className="flex-1 mx-2 relative">
            <div
              className={`flex items-center gap-2 bg-white border rounded-full px-4 py-2 transition-all duration-200 ${
                searchFocused
                  ? "border-[#1A1A1A] shadow-[0_0_0_3px_rgba(26,26,26,0.06)]"
                  : "border-[#E8E4DC] hover:border-[#C8C4BC]"
              }`}
            >
              <Icon name="Search" size={15} className="text-[#9A9690] shrink-0" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Поиск статей, тем, авторов..."
                className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#B8B4AC] outline-none min-w-0"
              />
              {searchValue && (
                <button onClick={() => setSearchValue("")} className="text-[#9A9690] hover:text-[#1A1A1A] transition-colors">
                  <Icon name="X" size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors whitespace-nowrap hidden sm:block">
              Подписаться
            </button>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                  profileOpen ? "border-[#1A1A1A] bg-[#1A1A1A]" : "border-[#E8E4DC] bg-white hover:border-[#C8C4BC]"
                }`}
              >
                <Icon name="User" size={16} className={profileOpen ? "text-white" : "text-[#6A6660]"} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-[#E8E4DC] rounded-xl shadow-lg py-1 animate-slide-down z-50">
                  {PROFILE_MENU.map((item, i) => (
                    <button
                      key={item}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F5F3EF] ${
                        i === PROFILE_MENU.length - 1
                          ? "text-red-500 hover:text-red-600 mt-1 border-t border-[#F0EDE8]"
                          : "text-[#1A1A1A]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => { setActiveNav(item); setSearchValue(""); }}
              className={`relative text-sm font-medium px-3 py-3 transition-colors ${
                activeNav === item ? "text-[#1A1A1A]" : "text-[#9A9690] hover:text-[#4A4A48]"
              }`}
            >
              {item}
              {activeNav === item && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#1A1A1A] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {filtered !== null ? (
          <div>
            <p className="text-sm text-[#9A9690] mb-8">
              Найдено: <span className="text-[#1A1A1A] font-medium">{filtered.length}</span> статей по запросу «{searchValue}»
            </p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((a, i) => (
                  <ArticleCard key={a.id} article={a} delay={i * 60} onClick={() => goArticle(a.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <Icon name="SearchX" size={32} className="mx-auto mb-4 text-[#C8C4BC]" />
                <p className="font-cormorant text-2xl text-[#4A4A48] mb-1">Ничего не найдено</p>
                <p className="text-sm text-[#9A9690]">Попробуйте другой запрос</p>
              </div>
            )}
          </div>

        ) : activeNav === "Главная" ? (
          <div className="animate-fade-in">
            {featured && (
              <div className="mb-14">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <span className="inline-block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-5 border border-[#E0DDD8] px-3 py-1 rounded-full">
                      {featured.category}
                    </span>
                    <h1 className="font-cormorant text-4xl lg:text-5xl font-semibold text-[#1A1A1A] leading-[1.15] mb-5">
                      {featured.title}
                    </h1>
                    <p className="text-[#6A6660] leading-relaxed mb-6 text-[15px]">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-[#9A9690] mb-6">
                      <span>{featured.date}</span>
                      <span className="w-1 h-1 rounded-full bg-[#C8C4BC]" />
                      <span>{featured.readTime} чтения</span>
                    </div>
                    <button
                      onClick={() => goArticle(featured.id)}
                      className="bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#333] transition-colors"
                    >
                      Читать статью
                    </button>
                  </div>
                  <div className="bg-[#EDE9E2] rounded-2xl aspect-[4/3] flex items-center justify-center overflow-hidden">
                    <FeaturedPlaceholder />
                  </div>
                </div>
                <div className="mt-12 border-t border-[#E8E4DC]" />
              </div>
            )}

            <div>
              <div className="flex items-baseline justify-between mb-7">
                <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A]">Последние статьи</h2>
                <button onClick={() => setActiveNav("Статьи")} className="text-xs text-[#9A9690] hover:text-[#1A1A1A] transition-colors">
                  Все статьи →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rest.map((a, i) => (
                  <ArticleCard key={a.id} article={a} delay={i * 80} onClick={() => goArticle(a.id)} />
                ))}
              </div>
            </div>
          </div>

        ) : activeNav === "Категории" ? (
          <div className="animate-fade-in">
            <div className="flex items-baseline gap-3 mb-8">
              <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Категории</h2>
              <span className="text-sm text-[#9A9690]">{CATEGORIES.length} разделов</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.name}
                  className="group text-left p-7 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in"
                  style={{ background: cat.color, animationDelay: `${i * 60}ms` }}
                >
                  <p className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-1.5">{cat.name}</p>
                  <p className="text-sm text-[#6A6660]">{cat.count} статей</p>
                </button>
              ))}
            </div>
          </div>

        ) : (
          <div className="animate-fade-in">
            <div className="flex items-baseline gap-3 mb-8">
              <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Все статьи</h2>
              <span className="text-sm text-[#9A9690]">{ARTICLES.length} материалов</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ARTICLES.map((a, i) => (
                <ArticleCard key={a.id} article={a} delay={i * 60} onClick={() => goArticle(a.id)} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ArticleCard({
  article,
  delay = 0,
  onClick,
}: {
  article: Article;
  delay?: number;
  onClick: () => void;
}) {
  return (
    <article
      className="group cursor-pointer animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="rounded-xl aspect-video mb-4 overflow-hidden transition-transform group-hover:scale-[1.02]">
        <CardPlaceholder seed={article.id} />
      </div>
      <span className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{article.category}</span>
      <h3 className="font-cormorant text-xl font-semibold text-[#1A1A1A] leading-snug mt-1.5 mb-2 group-hover:text-[#4A4A48] transition-colors line-clamp-2">
        {article.title}
      </h3>
      <p className="text-sm text-[#7A7670] leading-relaxed mb-3 line-clamp-2">{article.excerpt}</p>
      <div className="flex items-center gap-3 text-xs text-[#B8B4AC]">
        <span>{article.date}</span>
        <span className="w-1 h-1 rounded-full bg-[#D8D4CC]" />
        <span>{article.readTime} чтения</span>
      </div>
    </article>
  );
}

function FeaturedPlaceholder() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" fill="none">
      <rect x="24" y="28" width="160" height="12" rx="6" fill="#D4CFC6" />
      <rect x="24" y="50" width="120" height="12" rx="6" fill="#DDD9D0" />
      <rect x="24" y="76" width="140" height="9" rx="4.5" fill="#E4E0D8" />
      <rect x="24" y="93" width="100" height="9" rx="4.5" fill="#E4E0D8" />
      <rect x="24" y="118" width="64" height="8" rx="4" fill="#CCC8C0" />
      <circle cx="178" cy="122" r="18" fill="#D4CFC6" opacity="0.6" />
    </svg>
  );
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
    <svg width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill={c2} />
      <circle cx="270" cy="40" r="55" fill={c1} opacity="0.5" />
      <rect x="28" y="56" width="150" height="9" rx="4.5" fill={c1} />
      <rect x="28" y="74" width="110" height="9" rx="4.5" fill={c1} opacity="0.7" />
      <rect x="28" y="92" width="130" height="9" rx="4.5" fill={c1} opacity="0.45" />
      <rect x="28" y="118" width="55" height="7" rx="3.5" fill={c3} opacity="0.6" />
    </svg>
  );
}
