import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useArticles, deleteArticle } from "@/store/articlesStore";

const TABS = ["Мои статьи", "Настройки"];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Мои статьи");
  const [name, setName] = useState(() => localStorage.getItem("profile_name") || "");
  const [role, setRole] = useState(() => localStorage.getItem("profile_role") || "");
  const [saved, setSaved] = useState(false);
  const articles = useArticles();

  const saveProfile = () => {
    localStorage.setItem("profile_name", name);
    localStorage.setItem("profile_role", role);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          <span className="font-cormorant font-semibold text-lg text-[#1A1A1A]">Профиль</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
            <span className="font-cormorant font-semibold text-3xl text-[#4A4A48]">
              {name ? name[0].toUpperCase() : "А"}
            </span>
          </div>
          <div>
            <p className="font-cormorant text-2xl font-semibold text-[#1A1A1A]">
              {name || "Аноним"}
            </p>
            <p className="text-sm text-[#9A9690]">{role || "Читатель"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#E8E4DC] mb-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative text-sm font-medium px-3 py-3 transition-colors ${
                tab === t ? "text-[#1A1A1A]" : "text-[#9A9690] hover:text-[#4A4A48]"
              }`}
            >
              {t}
              {tab === t && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#1A1A1A] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {tab === "Мои статьи" ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#9A9690]">
                {articles.length} {articles.length === 1 ? "статья" : "статей"}
              </p>
              <button
                onClick={() => navigate("/new")}
                className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
              >
                <Icon name="Plus" size={14} />
                Написать
              </button>
            </div>
            {articles.length === 0 ? (
              <div className="text-center py-20 text-[#9A9690]">
                <Icon name="FileText" size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-cormorant text-xl text-[#4A4A48] mb-1">Пока нет статей</p>
                <p className="text-sm">Напишите первую — это займёт пару минут</p>
              </div>
            ) : (
              <div className="space-y-1">
                {articles.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white transition-colors group"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/article/${a.id}`)}
                    >
                      <span className="text-xs text-[#7A7670] uppercase tracking-widest">{a.category}</span>
                      <p className="font-cormorant text-lg font-semibold text-[#1A1A1A] leading-snug mt-0.5 line-clamp-1">
                        {a.title}
                      </p>
                      <p className="text-xs text-[#9A9690] mt-0.5">{a.date} · {a.readTime} чтения</p>
                    </div>
                    <button
                      onClick={() => deleteArticle(a.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#C8C4BC] hover:text-red-400 transition-all"
                    >
                      <Icon name="Trash2" size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
                Имя
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут?"
                className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
                Должность / роль
              </label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Редактор, журналист..."
                className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
              />
            </div>
            <button
              onClick={saveProfile}
              className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors"
            >
              {saved ? <Icon name="Check" size={14} /> : null}
              {saved ? "Сохранено" : "Сохранить"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
