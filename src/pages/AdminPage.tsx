import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth, useUsers, ROLE_LABELS } from "@/store/authStore";
import { useArticles } from "@/store/articlesStore";
import { useSiteSettings } from "@/store/siteSettingsStore";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminArticles from "@/components/admin/AdminArticles";
import AdminSEO from "@/components/admin/AdminSEO";

const TABS = [
  { key: "overview", label: "Обзор", icon: "LayoutDashboard" },
  { key: "users", label: "Пользователи", icon: "Users" },
  { key: "articles", label: "Статьи", icon: "FileText" },
  { key: "seo", label: "SEO и сайт", icon: "Search" },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const user = useAuth();
  const users = useUsers();
  const articles = useArticles();
  const [tab, setTab] = useState<"users" | "articles" | "overview" | "seo">("overview");
  const site = useSiteSettings();
  const [siteSaved, setSiteSaved] = useState(false);
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
          <AdminOverview
            stats={stats}
            onGoUsers={() => setTab("users")}
            onGoArticles={() => setTab("articles")}
            onGoSeo={() => setTab("seo")}
          />
        )}

        {tab === "users" && (
          <AdminUsers
            users={users}
            filteredUsers={filteredUsers}
            currentUser={user}
            search={search}
            onSearchChange={setSearch}
          />
        )}

        {tab === "articles" && <AdminArticles articles={articles} />}

        {tab === "seo" && (
          <AdminSEO site={site} siteSaved={siteSaved} setSiteSaved={setSiteSaved} />
        )}
      </main>
    </div>
  );
}
