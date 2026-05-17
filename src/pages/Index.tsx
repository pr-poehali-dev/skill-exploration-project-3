import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Index() {
  const [activeNav, setActiveNav] = useState("Главная");
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = useAuth();
  const unread = useUnreadCount(user?.id);
  const CATEGORIES = useCategories();
  const theme = useTheme();
  useSEO({ type: "website" });

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

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos">
      <IndexHeader
        navItems={NAV_ITEMS}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        setActiveCategory={setActiveCategory}
        user={user}
        unread={unread}
        theme={theme}
      />

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
          <IndexHome
            featured={featured}
            rest={rest}
            goArticle={goArticle}
            setActiveNav={setActiveNav}
          />

        ) : activeNav === "Категории" ? (
          <IndexCategories
            categories={CATEGORIES}
            articles={articles}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            goArticle={goArticle}
          />

        ) : (
          <div className="animate-fade-in">
            <div className="flex items-baseline gap-3 mb-8">
              <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Все статьи</h2>
              <span className="text-sm text-[#9A9690]">{articles.length} материалов</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a, i) => (
                <ArticleCard key={a.id} article={a} delay={i * 60} onClick={() => goArticle(a.id)} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
