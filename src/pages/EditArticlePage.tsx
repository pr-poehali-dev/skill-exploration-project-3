import { useParams, useNavigate } from "react-router-dom";
import ArticleForm from "@/components/ArticleForm";
import { useArticles } from "@/store/articlesStore";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articles = useArticles();
  const article = articles.find((a) => a.id === Number(id));

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] font-golos flex items-center justify-center">
        <div className="text-center">
          <p className="font-cormorant text-3xl text-[#1A1A1A] mb-2">Статья не найдена</p>
          <button onClick={() => navigate("/")} className="text-sm text-[#9A9690] hover:text-[#1A1A1A] transition-colors">
            ← На главную
          </button>
        </div>
      </div>
    );
  }

  return <ArticleForm mode="edit" article={article} />;
}
