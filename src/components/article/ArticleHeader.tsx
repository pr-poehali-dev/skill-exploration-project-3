import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import type { Article } from "@/data/articles";
import { deleteArticle, useBookmarks } from "@/store/articlesStore";
import { useAuth } from "@/store/authStore";
import SendToChatModal from "./SendToChatModal";

interface Props {
  article: Article;
  progress: number;
  canEdit: boolean;
  canDelete: boolean;
  goBack: () => void;
}

export default function ArticleHeader({ article, progress, canEdit, canDelete, goBack }: Props) {
  const navigate = useNavigate();
  const { bookmarks, toggle } = useBookmarks();
  const isBookmarked = bookmarks.includes(article.id);
  const user = useAuth();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E4DC]">
      <div
        className="absolute bottom-0 left-0 h-[1.5px] transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #555 0%, #1A1A1A 80%, #1A1A1A 100%)",
          boxShadow: progress > 1 ? "2px 0 8px 1px rgba(26,26,26,0.18)" : "none",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
        >
          <Icon name="ArrowLeft" size={15} />
          <span>Назад</span>
        </button>
        <div className="w-px h-4 bg-[#E8E4DC]" />
        <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
          <div className="w-6 h-6 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
            <span className="text-white font-cormorant font-semibold text-sm leading-none select-none">М</span>
          </div>
          <span className="font-cormorant font-semibold text-lg text-[#1A1A1A] hidden sm:block tracking-tight">
            Медиум
          </span>
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          {canEdit && (
            <button
              onClick={() => navigate(`/article/${article.id}/edit`)}
              className="flex items-center gap-1.5 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
              title="Редактировать"
            >
              <Icon name="PenLine" size={15} />
              <span className="hidden sm:inline">Редактировать</span>
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                if (confirm("Удалить статью? Это действие нельзя отменить.")) {
                  deleteArticle(article.id);
                  navigate("/");
                }
              }}
              className="flex items-center gap-1.5 text-sm text-[#6A6660] hover:text-red-500 transition-colors"
              title="Удалить"
            >
              <Icon name="Trash2" size={15} />
            </button>
          )}
          <button
            onClick={() => toggle(article.id)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${isBookmarked ? "text-[#1A1A1A]" : "text-[#6A6660] hover:text-[#1A1A1A]"}`}
          >
            <Icon name={isBookmarked ? "BookmarkCheck" : "Bookmark"} size={15} />
            <span className="hidden sm:inline">{isBookmarked ? "Сохранено" : "Сохранить"}</span>
          </button>
          {user && (
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
              title="Отправить в чат"
            >
              <Icon name="Send" size={15} />
              <span className="hidden sm:inline">В чат</span>
            </button>
          )}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: article.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="flex items-center gap-1.5 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
          >
            <Icon name="Share2" size={15} />
            <span className="hidden sm:inline">Поделиться</span>
          </button>
        </div>
      </div>
      {shareOpen && <SendToChatModal article={article} onClose={() => setShareOpen(false)} />}
    </header>
  );
}