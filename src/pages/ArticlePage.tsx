import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useArticles, incrementArticleViews } from "@/store/articlesStore";
import { useAuth, canEditArticle, canDeleteArticle } from "@/store/authStore";
import { useSEO } from "@/lib/useSEO";
import ArticleHeader from "@/components/article/ArticleHeader";
import ArticleBody from "@/components/article/ArticleBody";

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articles = useArticles();
  const user = useAuth();
  const article = articles.find((a) => a.id === Number(id));
  const canEdit = canEditArticle(user, article?.authorId);
  const canDelete = canDeleteArticle(user, article?.authorId);

  useSEO({
    title: article?.seo?.title || article?.title,
    description: article?.seo?.description || article?.excerpt,
    keywords: article?.seo?.keywords,
    image: article?.seo?.ogImage,
    type: "article",
    noindex: article?.seo?.noindex,
    canonical: article?.seo?.canonical,
    author: article?.author,
    publishedAt: article?.date,
    section: article?.category,
  });

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Increment views once per article load (throttled inside store)
  useEffect(() => {
    if (article?.id) incrementArticleViews(article.id);
     
  }, [article?.id]);

  const related = articles.filter((a) => a.id !== article?.id).slice(0, 3);

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] font-golos flex items-center justify-center">
        <div className="text-center">
          <p className="font-cormorant text-3xl text-[#1A1A1A] mb-2">Статья не найдена</p>
          <button onClick={() => navigate("/")} className="text-sm text-[#9A9690] hover:text-[#1A1A1A] transition-colors">
            ← Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos">
      <ArticleHeader
        article={article}
        progress={progress}
        canEdit={canEdit}
        canDelete={canDelete}
        goBack={goBack}
      />
      <ArticleBody article={article} related={related} />
    </div>
  );
}
