import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { addArticle } from "@/store/articlesStore";
import { CATEGORIES } from "@/data/articles";

const ESTIMATE: Record<number, string> = {
  0: "1 мин", 500: "2 мин", 1000: "3 мин", 1500: "4 мин",
  2000: "5 мин", 2500: "6 мин", 3000: "7 мин", 3500: "8 мин",
  4000: "10 мин", 5000: "12 мин",
};

function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} мин`;
}

export default function NewArticlePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Введите заголовок";
    if (!excerpt.trim()) e.excerpt = "Введите краткое описание";
    if (!author.trim()) e.author = "Введите имя автора";
    if (!content.trim()) e.content = "Введите текст статьи";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      const article = addArticle({
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        author: author.trim(),
        authorRole: authorRole.trim() || "Автор",
        content: content.trim(),
        readTime: estimateReadTime(content),
      });
      navigate(`/article/${article.id}`);
    }, 400);
  };

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
          <span className="font-cormorant font-semibold text-lg text-[#1A1A1A]">Новая статья</span>
          <div className="flex-1" />
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
            Опубликовать
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
        <div className="space-y-8">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-3">
              Категория
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                    category === cat.name
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-white border border-[#E8E4DC] text-[#6A6660] hover:border-[#C8C4BC]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <textarea
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
              placeholder="Заголовок статьи..."
              rows={2}
              className={`w-full font-cormorant text-4xl font-semibold text-[#1A1A1A] bg-transparent resize-none outline-none placeholder:text-[#D0CCC4] leading-tight border-b pb-4 transition-colors ${
                errors.title ? "border-red-300" : "border-[#E8E4DC] focus:border-[#1A1A1A]"
              }`}
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
              Краткое описание
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => { setExcerpt(e.target.value); setErrors((p) => ({ ...p, excerpt: "" })); }}
              placeholder="Одно-два предложения о чём статья..."
              rows={2}
              className={`w-full text-[15px] text-[#4A4A48] bg-transparent resize-none outline-none placeholder:text-[#C8C4BC] leading-relaxed border-b pb-3 transition-colors ${
                errors.excerpt ? "border-red-300" : "border-[#E8E4DC] focus:border-[#1A1A1A]"
              }`}
            />
            {errors.excerpt && <p className="text-xs text-red-400 mt-1">{errors.excerpt}</p>}
          </div>

          {/* Author */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
                Автор
              </label>
              <input
                value={author}
                onChange={(e) => { setAuthor(e.target.value); setErrors((p) => ({ ...p, author: "" })); }}
                placeholder="Имя Фамилия"
                className={`w-full text-sm text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#C8C4BC] border-b pb-2 transition-colors ${
                  errors.author ? "border-red-300" : "border-[#E8E4DC] focus:border-[#1A1A1A]"
                }`}
              />
              {errors.author && <p className="text-xs text-red-400 mt-1">{errors.author}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
                Должность / роль
              </label>
              <input
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Редактор, дизайнер..."
                className="w-full text-sm text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#C8C4BC] border-b border-[#E8E4DC] pb-2 focus:border-[#1A1A1A] transition-colors"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest">
                Текст статьи
              </label>
              {content && (
                <span className="text-xs text-[#9A9690]">≈ {estimateReadTime(content)} чтения</span>
              )}
            </div>
            <div className="text-xs text-[#B8B4AC] mb-3 space-x-3">
              <span>## Заголовок</span>
              <span>**жирный**</span>
              <span>{">"} цитата</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setErrors((p) => ({ ...p, content: "" })); }}
              placeholder="Начните писать текст статьи...&#10;&#10;## Используйте заголовки&#10;&#10;И **жирный текст** для акцентов."
              rows={18}
              className={`w-full text-[16px] text-[#2A2A2A] bg-white border rounded-2xl p-6 resize-none outline-none placeholder:text-[#C8C4BC] leading-[1.8] transition-colors ${
                errors.content ? "border-red-300" : "border-[#E8E4DC] focus:border-[#C8C4BC]"
              }`}
            />
            {errors.content && <p className="text-xs text-red-400 mt-1">{errors.content}</p>}
          </div>

          {/* Submit bottom */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#1A1A1A] text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Icon name="Loader" size={15} className="animate-spin" /> : null}
              {saving ? "Публикуем..." : "Опубликовать статью"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
