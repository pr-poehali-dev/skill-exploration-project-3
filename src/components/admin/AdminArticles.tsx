import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { deleteArticle } from "@/store/articlesStore";
import type { Article } from "@/data/articles";

interface Props {
  articles: Article[];
}

export default function AdminArticles({ articles }: Props) {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Статьи</h2>
          <span className="text-sm text-[#9A9690]">{articles.length} материалов</span>
        </div>
        <button
          onClick={() => navigate("/new")}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
        >
          <Icon name="Plus" size={14} />
          Написать
        </button>
      </div>

      <div className="bg-white border border-[#E8E4DC] rounded-2xl divide-y divide-[#F0EDE8] overflow-hidden">
        {articles.map((a) => (
          <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAF8] transition-colors group">
            <div className="flex-1 cursor-pointer min-w-0" onClick={() => navigate(`/article/${a.id}`)}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{a.category}</span>
                {a.featured && (
                  <span className="text-[10px] bg-[#1A1A1A] text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Главная
                  </span>
                )}
              </div>
              <p className="font-cormorant text-lg font-semibold text-[#1A1A1A] leading-snug line-clamp-1">
                {a.title}
              </p>
              <p className="text-xs text-[#9A9690] mt-0.5">
                {a.author} · {a.date} · {a.readTime}
              </p>
            </div>
            <button
              onClick={() => navigate(`/article/${a.id}/edit`)}
              className="text-[#9A9690] hover:text-[#1A1A1A] transition-colors p-2"
              title="Редактировать"
            >
              <Icon name="PenLine" size={15} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Удалить статью «${a.title}»?`)) {
                  deleteArticle(a.id);
                }
              }}
              className="text-[#C8C4BC] hover:text-red-500 transition-colors p-2"
              title="Удалить"
            >
              <Icon name="Trash2" size={15} />
            </button>
          </div>
        ))}
        {articles.length === 0 && (
          <div className="text-center py-16 text-[#9A9690]">
            <Icon name="FileX" size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Пока нет статей</p>
          </div>
        )}
      </div>
    </div>
  );
}
