import Icon from "@/components/ui/icon";
import { type Article } from "@/data/articles";
import { ArticleCard, FeaturedPlaceholder, formatCardViews } from "./IndexShared";

interface Props {
  featured: Article | undefined;
  rest: Article[];
  goArticle: (id: number) => void;
  setActiveNav: (v: string) => void;
}

export default function IndexHome({ featured, rest, goArticle, setActiveNav }: Props) {
  return (
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
              <div className="flex items-center gap-4 text-xs text-[#9A9690] mb-6 flex-wrap">
                <span>{featured.date}</span>
                <span className="w-1 h-1 rounded-full bg-[#C8C4BC]" />
                <span>{featured.readTime} чтения</span>
                {(featured.views || 0) > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[#C8C4BC]" />
                    <span className="flex items-center gap-1">
                      <Icon name="Eye" size={11} />
                      {formatCardViews(featured.views || 0)}
                    </span>
                  </>
                )}
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
  );
}
