import Icon from "@/components/ui/icon";
import type { Category } from "@/store/categoriesStore";

interface Props {
  categories: Category[];
  category: string;
  setCategory: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  excerpt: string;
  setExcerpt: (v: string) => void;
  author: string;
  setAuthor: (v: string) => void;
  authorRole: string;
  setAuthorRole: (v: string) => void;
  sourceUrl: string;
  setSourceUrl: (v: string) => void;
  sourceTitle: string;
  setSourceTitle: (v: string) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function ArticleMetaFields({
  categories,
  category,
  setCategory,
  title,
  setTitle,
  excerpt,
  setExcerpt,
  author,
  setAuthor,
  authorRole,
  setAuthorRole,
  sourceUrl,
  setSourceUrl,
  sourceTitle,
  setSourceTitle,
  errors,
  setErrors,
}: Props) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-3">Категория</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
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

      <div>
        <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">Краткое описание</label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">Автор</label>
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
          <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">Должность / роль</label>
          <input
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            placeholder="Редактор, дизайнер..."
            className="w-full text-sm text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#C8C4BC] border-b border-[#E8E4DC] pb-2 focus:border-[#1A1A1A] transition-colors"
          />
        </div>
      </div>

      <SourceBlock
        sourceUrl={sourceUrl}
        setSourceUrl={setSourceUrl}
        sourceTitle={sourceTitle}
        setSourceTitle={setSourceTitle}
      />
    </>
  );
}

function SourceBlock({
  sourceUrl,
  setSourceUrl,
  sourceTitle,
  setSourceTitle,
}: {
  sourceUrl: string;
  setSourceUrl: (v: string) => void;
  sourceTitle: string;
  setSourceTitle: (v: string) => void;
}) {
  return (
    <div className="border border-[#E8E4DC] rounded-2xl bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="Link" size={15} className="text-[#1A1A1A]" />
        <p className="text-sm font-medium text-[#1A1A1A]">Источник</p>
        <span className="text-xs text-[#B8B4AC]">необязательно</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-4">
        <div>
          <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
            Название
          </label>
          <input
            value={sourceTitle}
            onChange={(e) => setSourceTitle(e.target.value)}
            placeholder="The New York Times"
            className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
          />
          <p className="text-[11px] text-[#B8B4AC] mt-1">
            Если пусто — покажется домен из ссылки
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
            Ссылка
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
          />
        </div>
      </div>
    </div>
  );
}
