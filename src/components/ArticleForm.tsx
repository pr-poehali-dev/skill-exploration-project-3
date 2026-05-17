import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ArticleEditor, { type ArticleEditorHandle } from "@/components/ArticleEditor";
import { CATEGORIES, type Article, type EditorData, type ArticleSEO, type ArticleSource } from "@/data/articles";
import { addArticle, updateArticle } from "@/store/articlesStore";
import { editorToPlainText, estimateReadTimeFromEditor, markdownToEditor } from "@/lib/editorConvert";
import { useAuth, ROLE_LABELS } from "@/store/authStore";

function slugify(text: string): string {
  const map: Record<string, string> = {
    а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",
    н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",
    ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
  };
  return text.toLowerCase().split("").map((ch) => map[ch] ?? ch).join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

interface Props {
  mode: "create" | "edit";
  article?: Article;
}

export default function ArticleForm({ mode, article }: Props) {
  const navigate = useNavigate();
  const editorRef = useRef<ArticleEditorHandle>(null);
  const currentUser = useAuth();

  const defaultAuthor = article?.author ?? currentUser?.name ?? "";
  const defaultRole = article?.authorRole ?? (currentUser ? ROLE_LABELS[currentUser.role] : "Автор");

  const [title, setTitle] = useState(article?.title ?? "");
  const [category, setCategory] = useState(article?.category ?? CATEGORIES[0].name);
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [author, setAuthor] = useState(defaultAuthor);
  const [authorRole, setAuthorRole] = useState(defaultRole);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [seoOpen, setSeoOpen] = useState(false);
  const [seo, setSeo] = useState<ArticleSEO>(article?.seo ?? {});
  const [sourceUrl, setSourceUrl] = useState(article?.source?.url ?? "");
  const [sourceTitle, setSourceTitle] = useState(article?.source?.title ?? "");

  const initialData: EditorData =
    article?.editorData ?? (article?.content ? markdownToEditor(article.content) : { blocks: [] });

  const validate = (data: EditorData): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Введите заголовок";
    if (!excerpt.trim()) e.excerpt = "Введите краткое описание";
    if (!author.trim()) e.author = "Введите имя автора";
    if (!data.blocks?.length) e.content = "Добавьте хотя бы один блок в статью";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = await editorRef.current!.save();
      if (!validate(data)) {
        setSaving(false);
        return;
      }
      const plain = editorToPlainText(data, 100000);
      const readTime = estimateReadTimeFromEditor(data);

      const cleanSeo: ArticleSEO = {
        title: seo.title?.trim() || undefined,
        description: seo.description?.trim() || undefined,
        keywords: seo.keywords?.trim() || undefined,
        ogImage: seo.ogImage?.trim() || undefined,
        slug: seo.slug?.trim() || slugify(title),
        noindex: seo.noindex || false,
        canonical: seo.canonical?.trim() || undefined,
      };

      const cleanSource: ArticleSource | undefined = sourceUrl.trim()
        ? { url: sourceUrl.trim(), title: sourceTitle.trim() || undefined }
        : undefined;

      if (mode === "create") {
        const created = addArticle({
          title: title.trim(),
          category,
          excerpt: excerpt.trim(),
          author: author.trim(),
          authorRole: authorRole.trim() || "Автор",
          authorId: currentUser?.id,
          content: plain,
          readTime,
          editorData: data,
          seo: cleanSeo,
          source: cleanSource,
        });
        navigate(`/article/${created.id}`);
      } else if (article) {
        updateArticle(article.id, {
          title: title.trim(),
          category,
          excerpt: excerpt.trim(),
          author: author.trim(),
          authorRole: authorRole.trim() || "Автор",
          content: plain,
          readTime,
          editorData: data,
          seo: cleanSeo,
          source: cleanSource,
        });
        navigate(`/article/${article.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const headerLabel = mode === "create" ? "Новая статья" : "Редактирование";
  const submitLabel = mode === "create" ? "Опубликовать" : "Сохранить";

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
          <span className="font-cormorant font-semibold text-lg text-[#1A1A1A]">{headerLabel}</span>
          <div className="flex-1" />
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
            {submitLabel}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-3">Категория</label>
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

          <div>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">Текст статьи</label>
              <span className="text-xs text-[#B8B4AC]">
                Tab / «+» — добавить блок. Поддерживаются заголовки, цитаты, списки, выделение.
              </span>
            </div>
            <ArticleEditor ref={editorRef} initialData={initialData} />
            {errors.content && <p className="text-xs text-red-400 mt-2">{errors.content}</p>}
          </div>

          {/* Source */}
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

          {/* SEO section */}
          <div className="border border-[#E8E4DC] rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#FAFAF8] transition-colors"
            >
              <Icon name="Search" size={16} className="text-[#1A1A1A]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A1A1A]">SEO и метаданные</p>
                <p className="text-xs text-[#9A9690] mt-0.5">
                  Заголовок для поисковиков, описание, ключевые слова, превью для соцсетей
                </p>
              </div>
              <Icon name={seoOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-[#9A9690]" />
            </button>

            {seoOpen && (
              <div className="px-5 pb-5 pt-1 space-y-5 border-t border-[#E8E4DC] animate-fade-in">
                <SeoField
                  label="SEO-заголовок"
                  hint="60–70 символов. Что увидят в Google. Пустое — возьмётся из заголовка"
                  value={seo.title || ""}
                  max={70}
                  onChange={(v) => setSeo({ ...seo, title: v })}
                  placeholder={title || "Заголовок для поисковиков"}
                />
                <SeoField
                  label="Meta-описание"
                  hint="150–160 символов. Сниппет под заголовком в выдаче"
                  value={seo.description || ""}
                  max={160}
                  textarea
                  onChange={(v) => setSeo({ ...seo, description: v })}
                  placeholder={excerpt || "Краткое описание для поисковой выдачи"}
                />
                <SeoField
                  label="Ключевые слова"
                  hint="Через запятую"
                  value={seo.keywords || ""}
                  onChange={(v) => setSeo({ ...seo, keywords: v })}
                  placeholder="дизайн, минимализм, типографика"
                />
                <SeoField
                  label="Slug (URL)"
                  hint="Только латиница, цифры и дефисы. Пустое — сгенерируется"
                  value={seo.slug || ""}
                  onChange={(v) => setSeo({ ...seo, slug: v })}
                  placeholder={slugify(title) || "minimalism-design"}
                />
                <SeoField
                  label="OG-изображение (URL)"
                  hint="Превью при шеринге в соцсетях. 1200×630"
                  value={seo.ogImage || ""}
                  onChange={(v) => setSeo({ ...seo, ogImage: v })}
                  placeholder="https://example.com/cover.jpg"
                />
                <SeoField
                  label="Canonical URL"
                  hint="Необязательно. Указывает каноническую версию страницы"
                  value={seo.canonical || ""}
                  onChange={(v) => setSeo({ ...seo, canonical: v })}
                  placeholder="https://example.com/article/123"
                />
                <label className="flex items-center gap-3 text-sm text-[#4A4A48] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={seo.noindex || false}
                    onChange={(e) => setSeo({ ...seo, noindex: e.target.checked })}
                    className="w-4 h-4 accent-[#1A1A1A]"
                  />
                  Скрыть от поисковиков (noindex, nofollow)
                </label>

                {/* Preview */}
                <div className="mt-2 pt-4 border-t border-[#E8E4DC]">
                  <p className="text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-3">Как увидит Google</p>
                  <div className="border border-[#E8E4DC] rounded-xl p-4 bg-[#FAFAF8]">
                    <p className="text-xs text-[#3a7c2a] mb-1 truncate">
                      https://medium.example/article/{seo.slug || slugify(title) || "novaya-statya"}
                    </p>
                    <p className="text-[18px] text-[#1a0dab] leading-snug mb-1 line-clamp-1">
                      {seo.title || title || "Заголовок статьи"}
                    </p>
                    <p className="text-sm text-[#4d5156] line-clamp-2">
                      {seo.description || excerpt || "Описание появится здесь после заполнения краткого описания статьи."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#1A1A1A] text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Icon name="Loader" size={15} className="animate-spin" /> : null}
              {saving ? "Сохраняем..." : submitLabel}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function SeoField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  max,
  textarea,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  textarea?: boolean;
}) {
  const overLimit = max ? value.length > max : false;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{label}</label>
        {max && (
          <span className={`text-[10px] ${overLimit ? "text-red-400" : "text-[#B8B4AC]"}`}>
            {value.length} / {max}
          </span>
        )}
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC] resize-none leading-relaxed"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
        />
      )}
      {hint && <p className="text-[11px] text-[#B8B4AC] mt-1">{hint}</p>}
    </div>
  );
}