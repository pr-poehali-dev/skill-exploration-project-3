import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import type { Article } from "@/data/articles";
import {
  CardPlaceholder,
  formatViews,
  getDomain,
  renderContent,
  renderEditorBlocks,
} from "./articleRenderers";

interface Props {
  article: Article;
  related: Article[];
}

export default function ArticleBody({ article, related }: Props) {
  const navigate = useNavigate();

  return (
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
          <div className="ml-auto flex items-center gap-3 sm:gap-4 text-xs text-[#9A9690] flex-wrap justify-end">
            <span>{article.date}</span>
            <span className="w-1 h-1 rounded-full bg-[#C8C4BC]" />
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={12} />
              {article.readTime} чтения
            </span>
            <span className="w-1 h-1 rounded-full bg-[#C8C4BC]" />
            <span className="flex items-center gap-1" title="Просмотры">
              <Icon name="Eye" size={12} />
              {formatViews(article.views || 0)}
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
      <div className="max-w-2xl mx-auto px-6 pb-10">
        {article.editorData?.blocks?.length
          ? renderEditorBlocks(article.editorData)
          : renderContent(article.content)}
      </div>

      {/* Source */}
      {article.source?.url && (
        <div className="max-w-2xl mx-auto px-6 pb-12">
          <a
            href={article.source.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#E8E4DC] hover:border-[#1A1A1A] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F5F3EF] flex items-center justify-center shrink-0 group-hover:bg-[#1A1A1A] transition-colors">
              <Icon
                name="ExternalLink"
                size={15}
                className="text-[#4A4A48] group-hover:text-white transition-colors"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-[#7A7670] uppercase tracking-widest mb-0.5">
                Источник
              </p>
              <p className="text-sm font-medium text-[#1A1A1A] truncate">
                {article.source.title || getDomain(article.source.url)}
              </p>
              <p className="text-xs text-[#9A9690] truncate">{article.source.url}</p>
            </div>
          </a>
        </div>
      )}

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
  );
}
