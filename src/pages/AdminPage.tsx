import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  useAuth,
  useUsers,
  updateUserRole,
  deleteUser,
  ROLE_LABELS,
  type Role,
} from "@/store/authStore";
import { useArticles, deleteArticle } from "@/store/articlesStore";

const TABS = [
  { key: "users", label: "Пользователи", icon: "Users" },
  { key: "articles", label: "Статьи", icon: "FileText" },
  { key: "overview", label: "Обзор", icon: "LayoutDashboard" },
];

const ROLES: Role[] = ["user", "editor", "moderator", "admin"];

const ROLE_COLORS: Record<Role, string> = {
  user: "bg-[#F5F3EF] text-[#6A6660]",
  editor: "bg-[#E4E8DC] text-[#5A6648]",
  moderator: "bg-[#DCE0E8] text-[#48566A]",
  admin: "bg-[#1A1A1A] text-white",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const user = useAuth();
  const users = useUsers();
  const articles = useArticles();
  const [tab, setTab] = useState<"users" | "articles" | "overview">("overview");
  const [search, setSearch] = useState("");

  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const stats = {
    users: users.length,
    articles: articles.length,
    editors: users.filter((u) => u.role === "editor").length,
    moderators: users.filter((u) => u.role === "moderator").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos">
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E4DC]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
          >
            <Icon name="ArrowLeft" size={15} />
            <span>На сайт</span>
          </button>
          <div className="w-px h-4 bg-[#E8E4DC]" />
          <Icon name="Shield" size={15} className="text-[#1A1A1A]" />
          <span className="font-cormorant font-semibold text-lg text-[#1A1A1A]">Админ-панель</span>
          <div className="flex-1" />
          <span className="text-xs text-[#9A9690] hidden sm:inline">
            {user?.name} · {ROLE_LABELS[user?.role || "user"]}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#E8E4DC] mb-10">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`relative text-sm font-medium px-4 py-3 transition-colors flex items-center gap-2 ${
                tab === t.key ? "text-[#1A1A1A]" : "text-[#9A9690] hover:text-[#4A4A48]"
              }`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#1A1A1A] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="animate-fade-in">
            <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A] mb-8">Обзор</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <StatCard label="Пользователей" value={stats.users} icon="Users" />
              <StatCard label="Статей" value={stats.articles} icon="FileText" />
              <StatCard label="Редакторов" value={stats.editors} icon="PenLine" />
              <StatCard label="Модераторов + админов" value={stats.moderators + stats.admins} icon="Shield" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ShortcutCard
                title="Управление пользователями"
                description="Назначайте роли и удаляйте аккаунты"
                icon="Users"
                onClick={() => setTab("users")}
              />
              <ShortcutCard
                title="Управление статьями"
                description="Просмотр и удаление публикаций"
                icon="FileText"
                onClick={() => setTab("articles")}
              />
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="animate-fade-in">
            <div className="flex items-baseline justify-between mb-6">
              <div className="flex items-baseline gap-3">
                <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Пользователи</h2>
                <span className="text-sm text-[#9A9690]">{filteredUsers.length} из {users.length}</span>
              </div>
              <div className="relative">
                <Icon name="Search" size={14} className="text-[#9A9690] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск..."
                  className="bg-white border border-[#E8E4DC] rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#B8B4AC] w-56"
                />
              </div>
            </div>

            <div className="bg-white border border-[#E8E4DC] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E4DC] text-xs text-[#7A7670] uppercase tracking-widest">
                    <th className="text-left font-medium px-5 py-3">Пользователь</th>
                    <th className="text-left font-medium px-5 py-3 hidden sm:table-cell">E-mail</th>
                    <th className="text-left font-medium px-5 py-3">Роль</th>
                    <th className="text-right font-medium px-5 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-[#F0EDE8] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
                            <span className="font-cormorant font-semibold text-[#4A4A48]">
                              {u.name[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[#1A1A1A]">{u.name}</p>
                            <p className="text-xs text-[#9A9690] sm:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#6A6660] hidden sm:table-cell">{u.email}</td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as Role)}
                          disabled={u.id === user?.id}
                          className={`text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${ROLE_COLORS[u.role]}`}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r} className="text-[#1A1A1A] bg-white normal-case">
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {u.id === user?.id ? (
                          <span className="text-xs text-[#B8B4AC]">Это вы</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/messages?u=${u.id}`)}
                              className="text-[#9A9690] hover:text-[#1A1A1A] transition-colors p-1.5"
                              title="Написать"
                            >
                              <Icon name="MessageCircle" size={15} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Удалить пользователя «${u.name}»?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="text-[#C8C4BC] hover:text-red-500 transition-colors p-1.5"
                              title="Удалить"
                            >
                              <Icon name="Trash2" size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-16 text-[#9A9690]">
                  <Icon name="UserX" size={28} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Никого не найдено</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "articles" && (
          <div className="animate-fade-in">
            <div className="flex items-baseline justify-between mb-6">
              <div className="flex items-baseline gap-3">
                <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Статьи</h2>
                <span className="text-sm text-[#9A9690]">{articles.length} материалов</span>
              </div>
              <button
                onClick={() => navigate("/new")}
                className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
              >
                <Icon name="Plus" size={14} />
                Написать
              </button>
            </div>

            <div className="bg-white border border-[#E8E4DC] rounded-2xl divide-y divide-[#F0EDE8] overflow-hidden">
              {articles.map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAF8] transition-colors group">
                  <div className="flex-1 cursor-pointer min-w-0" onClick={() => navigate(`/article/${a.id}`)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{a.category}</span>
                      {a.featured && (
                        <span className="text-[10px] bg-[#1A1A1A] text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Главная
                        </span>
                      )}
                    </div>
                    <p className="font-cormorant text-lg font-semibold text-[#1A1A1A] leading-snug line-clamp-1">
                      {a.title}
                    </p>
                    <p className="text-xs text-[#9A9690] mt-0.5">
                      {a.author} · {a.date} · {a.readTime}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/article/${a.id}/edit`)}
                    className="text-[#9A9690] hover:text-[#1A1A1A] transition-colors p-2"
                    title="Редактировать"
                  >
                    <Icon name="PenLine" size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Удалить статью «${a.title}»?`)) {
                        deleteArticle(a.id);
                      }
                    }}
                    className="text-[#C8C4BC] hover:text-red-500 transition-colors p-2"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={15} />
                  </button>
                </div>
              ))}
              {articles.length === 0 && (
                <div className="text-center py-16 text-[#9A9690]">
                  <Icon name="FileX" size={28} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Пока нет статей</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{label}</span>
        <Icon name={icon} size={16} className="text-[#C8C4BC]" />
      </div>
      <p className="font-cormorant text-4xl font-semibold text-[#1A1A1A]">{value}</p>
    </div>
  );
}

function ShortcutCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-[#E8E4DC] rounded-2xl p-6 hover:border-[#1A1A1A] hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#F5F3EF] flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors">
          <Icon name={icon} size={18} className="text-[#4A4A48] group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1">
          <p className="font-cormorant text-xl font-semibold text-[#1A1A1A] mb-1">{title}</p>
          <p className="text-sm text-[#7A7670]">{description}</p>
        </div>
        <Icon name="ArrowRight" size={16} className="text-[#C8C4BC] group-hover:text-[#1A1A1A] transition-colors mt-3" />
      </div>
    </button>
  );
}