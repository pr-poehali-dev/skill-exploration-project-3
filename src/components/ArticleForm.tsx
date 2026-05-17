import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ArticleEditor, { type ArticleEditorHandle } from "@/components/ArticleEditor";
import { CATEGORIES, type Article, type EditorData } from "@/data/articles";
import { addArticle, updateArticle } from "@/store/articlesStore";
import { editorToPlainText, estimateReadTimeFromEditor, markdownToEditor } from "@/lib/editorConvert";
import { useAuth, ROLE_LABELS } from "@/store/authStore";

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