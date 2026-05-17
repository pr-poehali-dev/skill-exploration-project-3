import Icon from "@/components/ui/icon";
import { type Article } from "@/data/articles";
import { type Category } from "@/store/categoriesStore";
import { ArticleCard } from "./IndexShared";

interface Props {
  categories: Category[];
  articles: Article[];
  activeCategory: string | null;
  setActiveCategory: (v: string | null) => void;
  goArticle: (id: number) => void;
}

export default function IndexCategories({
  categories,
  articles,
  activeCategory,
  setActiveCategory,
  goArticle,
}: Props) {
  return (
    <div className="animate-fade-in">
      {activeCategory ? (
        (() => {
          const inCategory = articles.filter((a) => a.category === activeCategory);
          return (
            <div>
              <button
                onClick={() => setActiveCategory(null)}
                className="flex items-center gap-2 text-sm text-[#9A9690] hover:text-[#1A1A1A] transition-colors mb-6"
              >
                <Icon name="ArrowLeft" size={14} />
                Все категории
              </button>
              <div className="flex items-baseline gap-3 mb-8">
                <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">{activeCategory}</h2>
                <span className="text-sm text-[#9A9690]">
                  {inCategory.length} {inCategory.length === 1 ? "статья" : "статей"}
                </span>
              </div>
              {inCategory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inCategory.map((a, i) => (
                    <ArticleCard key={a.id} article={a} delay={i * 60} onClick={() => goArticle(a.id)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <Icon name="FileX" size={32} className="mx-auto mb-4 text-[#C8C4BC]" />
                  <p className="font-cormorant text-2xl text-[#4A4A48] mb-1">Пока пусто</p>
                  <p className="text-sm text-[#9A9690]">В этой категории ещё нет статей</p>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <>
          <div className="flex items-baseline gap-3 mb-8">
            <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Категории</h2>
            <span className="text-sm text-[#9A9690]">{categories.length} разделов</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => {
              const count = articles.filter((a) => a.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className="group text-left p-7 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in"
                  style={{ background: cat.color, animationDelay: `${i * 60}ms` }}
                >
                  <div className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center mb-4">
                    <Icon name={cat.icon} fallback="Folder" size={18} className="text-[#1A1A1A]" />
                  </div>
                  <p className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-1.5">{cat.name}</p>
                  <p className="text-sm text-[#6A6660]">
                    {count} {count === 1 ? "статья" : "статей"}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-[#6A6660] mt-2 opacity-80 line-clamp-2">{cat.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
