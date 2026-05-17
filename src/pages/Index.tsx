import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useArticles } from "@/store/articlesStore";
import { useCategories } from "@/store/categoriesStore";
import { useAuth } from "@/store/authStore";
import { useUnreadCount } from "@/store/messagesStore";
import { useSEO } from "@/lib/useSEO";
import { useTheme } from "@/store/themeStore";
import IndexHeader from "@/components/home/IndexHeader";
import IndexHome from "@/components/home/IndexHome";
import IndexCategories from "@/components/home/IndexCategories";
import { ArticleCard } from "@/components/home/IndexShared";

const NAV_ITEMS = ["Главная", "Категории", "Статьи"];

const navParamToLabel: Record<string, string> = {
  home: "Главная",
  categories: "Категории",
  articles: "Статьи",
};
const labelToNavParam: Record<string, string> = {
  Главная: "home",
  Категории: "categories",
  Статьи: "articles",
};

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navParam = searchParams.get("nav") || "home";
  const categoryParam = searchParams.get("category");

  const [activeNav, setActiveNav] = useState<string>(
    navParamToLabel[navParam] || "Главная"
  );
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categoryParam
  );
  const navigate = useNavigate();
  const user = useAuth();
  const unread = useUnreadCount(user?.id);
  const CATEGORIES = useCategories();
  const theme = useTheme();
  useSEO({ type: "website" });

  // Sync URL → state
  useEffect(() => {
    setActiveNav(navParamToLabel[navParam] || "Главная");
    setActiveCategory(categoryParam);
  }, [navParam, categoryParam]);

  // Sync state → URL (preserves history correctly)
  const handleSetActiveNav = (label: string) => {
    const next = labelToNavParam[label] || "home";
    const params = new URLSearchParams();
    params.set("nav", next);
    setSearchParams(params, { replace: false });
  };
  const handleSetActiveCategory = (cat: string | null) => {
    const params = new URLSearchParams();
    // Если выбрана категория — переходим на «Статьи» с фильтром.
    // Если сбрасываем категорию — остаёмся в текущем разделе (например, «Категории»).
    if (cat) {
      params.set("nav", "articles");
      params.set("category", cat);
    } else {
      params.set("nav", labelToNavParam[activeNav] || "home");
    }
    setSearchParams(params, { replace: false });
  };

  const articles = useArticles();
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  const filtered =
    searchValue.trim().length > 0
      ? articles.filter(
          (a) =>
            a.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            a.category.toLowerCase().includes(searchValue.toLowerCase())
        )
      : null;

  const goArticle = (id: number) => navigate(`/article/${id}`);

  // When viewing "Статьи" with a category — filter
  const articlesForList = activeCategory
    ? articles.filter((a) => a.category === activeCategory)
    : articles;

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos">
      <IndexHeader
        navItems={NAV_ITEMS}
        activeNav={activeNav}
        setActiveNav={handleSetActiveNav}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        setActiveCategory={handleSetActiveCategory}
        user={user}
        unread={unread}
        theme={theme}
      />

      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
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
          <IndexHome
            featured={featured}
            rest={rest}
            goArticle={goArticle}
            setActiveNav={handleSetActiveNav}
          />

        ) : activeNav === "Категории" ? (
          <IndexCategories
            categories={CATEGORIES}
            articles={articles}
            activeCategory={activeCategory}
            setActiveCategory={handleSetActiveCategory}
            goArticle={goArticle}
          />

        ) : (
          <div className="animate-fade-in">
            <div className="flex items-baseline gap-3 mb-8 flex-wrap">
              <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">
                {activeCategory ? activeCategory : "Все статьи"}
              </h2>
              <span className="text-sm text-[#9A9690]">{articlesForList.length} материалов</span>
              {activeCategory && (
                <button
                  onClick={() => handleSetActiveCategory(null)}
                  className="ml-2 text-xs text-[#6A6660] hover:text-[#1A1A1A] flex items-center gap-1 border border-[#E8E4DC] rounded-full px-3 py-1 hover:bg-[#F5F3EF] transition-colors"
                >
                  <Icon name="X" size={11} />
                  Сбросить
                </button>
              )}
            </div>
            {articlesForList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articlesForList.map((a, i) => (
                  <ArticleCard key={a.id} article={a} delay={i * 60} onClick={() => goArticle(a.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <Icon name="Inbox" size={32} className="mx-auto mb-4 text-[#C8C4BC]" />
                <p className="font-cormorant text-2xl text-[#4A4A48] mb-1">В этой теме пока пусто</p>
                <p className="text-sm text-[#9A9690]">Загляните позже или выберите другую категорию</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}