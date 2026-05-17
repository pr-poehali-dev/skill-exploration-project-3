import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ArticleEditor, { type ArticleEditorHandle } from "@/components/ArticleEditor";
import { type Article, type EditorData, type ArticleSEO, type ArticleSource } from "@/data/articles";
import { addArticle, updateArticle } from "@/store/articlesStore";
import { editorToPlainText, estimateReadTimeFromEditor, markdownToEditor } from "@/lib/editorConvert";
import { useAuth, ROLE_LABELS } from "@/store/authStore";
import { useCategories } from "@/store/categoriesStore";
import { slugify } from "@/components/article-form/articleFormUtils";
import ArticleMetaFields from "@/components/article-form/ArticleMetaFields";
import ArticleSeoSection from "@/components/article-form/ArticleSeoSection";

interface Props {
  mode: "create" | "edit";
  article?: Article;
}

export default function ArticleForm({ mode, article }: Props) {
  const navigate = useNavigate();
  const editorRef = useRef<ArticleEditorHandle>(null);
  const currentUser = useAuth();
  const CATEGORIES = useCategories();

  const defaultAuthor = article?.author ?? currentUser?.name ?? "";
  const defaultRole = article?.authorRole ?? (currentUser ? ROLE_LABELS[currentUser.role] : "Автор");

  const [title, setTitle] = useState(article?.title ?? "");
  const [category, setCategory] = useState(article?.category ?? (CATEGORIES[0]?.name || ""));
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
          <ArticleMetaFields
            categories={CATEGORIES}
            category={category}
            setCategory={setCategory}
            title={title}
            setTitle={setTitle}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            author={author}
            setAuthor={setAuthor}
            authorRole={authorRole}
            setAuthorRole={setAuthorRole}
            sourceUrl={sourceUrl}
            setSourceUrl={setSourceUrl}
            sourceTitle={sourceTitle}
            setSourceTitle={setSourceTitle}
            errors={errors}
            setErrors={setErrors}
          />

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

          <ArticleSeoSection
            seoOpen={seoOpen}
            setSeoOpen={setSeoOpen}
            seo={seo}
            setSeo={setSeo}
            title={title}
            excerpt={excerpt}
          />

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
