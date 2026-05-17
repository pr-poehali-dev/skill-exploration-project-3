import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth, useUsers, ROLE_LABELS, canCreateArticle, isAdmin, logoutUser } from "@/store/authStore";
import { useUnreadCount, useConversations } from "@/store/messagesStore";
import { useCategories } from "@/store/categoriesStore";
import { useSidebarCollapsed } from "@/store/sidebarStore";

interface NavLinkProps {
  icon: string;
  label: string;
  to: string;
  active?: boolean;
  collapsed: boolean;
  badge?: number;
  onClick?: () => void;
  indent?: boolean;
}

function NavLink({ icon, label, to, active, collapsed, badge, onClick, indent }: NavLinkProps) {
  const navigate = useNavigate();
  const handle = () => {
    if (onClick) onClick();
    else navigate(to);
  };

  return (
    <button
      onClick={handle}
      title={collapsed ? label : undefined}
      className={`group w-full flex items-center gap-2 rounded-md text-sm transition-colors ${
        collapsed ? "justify-center px-2 py-2" : `${indent ? "pl-7 pr-2" : "px-2"} py-1.5`
      } ${
        active
          ? "bg-[#EDE9E2] text-[#1A1A1A] font-medium"
          : "text-[#4A4A48] hover:bg-[#F0EDE8]"
      }`}
    >
      <Icon name={icon} size={15} className={active ? "text-[#1A1A1A]" : "text-[#7A7670]"} />
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="bg-[#1A1A1A] text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="my-2 mx-2 border-t border-[#E8E4DC]" />;
  return (
    <p className="px-2 pt-4 pb-1 text-[10px] uppercase tracking-widest text-[#9A9690] font-medium">
      {children}
    </p>
  );
}

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [chatsOpen, setChatsOpen] = useState(true);
  const user = useAuth();
  const unread = useUnreadCount(user?.id);
  const categories = useCategories();
  const conversations = useConversations(user?.id);
  const users = useUsers();

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const path = location.pathname;
  const params = new URLSearchParams(location.search);
  const nav = params.get("nav") || "home";

  const isHome = path === "/" && nav === "home";
  const isCats = path === "/" && nav === "categories";
  const isArts = path === "/" && nav === "articles";
  const activeChatId = path.startsWith("/messages") ? Number(params.get("u")) || null : null;

  const topConversations = conversations.slice(0, 6);
  const getPartner = (id: number) => users.find((u) => u.id === id);
  const formatChatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  const goHomeWithNav = (n: string) => navigate(`/?nav=${n}`);
  const goCategory = (cat: string) =>
    navigate(`/?nav=articles&category=${encodeURIComponent(cat)}`);

  const sidebar = (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-[#F7F4EE] border-r border-[#E8E4DC] transition-[width] duration-200 ease-out ${
        collapsed ? "w-[60px]" : "w-[248px]"
      }`}
    >
      {/* Header / Logo / Collapse toggle */}
      <div
        className={`flex items-center gap-2 px-3 h-14 border-b border-[#E8E4DC] shrink-0 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group min-w-0"
          >
            <div className="w-7 h-7 bg-[#1A1A1A] rounded-sm flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <span className="text-white font-cormorant font-semibold text-base leading-none select-none">
                М
              </span>
            </div>
            <span className="font-cormorant font-semibold text-lg text-[#1A1A1A] tracking-tight truncate">
              Медиум
            </span>
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-md hover:bg-[#EDE9E2] flex items-center justify-center text-[#6A6660] shrink-0"
          title={collapsed ? "Развернуть" : "Свернуть"}
        >
          <Icon name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={15} />
        </button>
      </div>

      {/* Profile mini-card */}
      {user && !collapsed && (
        <button
          onClick={() => navigate("/profile")}
          className="mx-2 mt-2 mb-1 flex items-center gap-2 p-2 rounded-md hover:bg-[#EDE9E2] transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-cormorant font-semibold text-sm text-[#4A4A48]">
                {user.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{user.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#9A9690] truncate">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </button>
      )}

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {/* Main nav */}
        <div className="space-y-0.5 pt-2">
          <NavLink
            icon="Home"
            label="Главная"
            to="/?nav=home"
            active={isHome}
            collapsed={collapsed}
            onClick={() => goHomeWithNav("home")}
          />
          <NavLink
            icon="LayoutGrid"
            label="Категории"
            to="/?nav=categories"
            active={isCats}
            collapsed={collapsed}
            onClick={() => goHomeWithNav("categories")}
          />
          <NavLink
            icon="Newspaper"
            label="Статьи"
            to="/?nav=articles"
            active={isArts}
            collapsed={collapsed}
            onClick={() => goHomeWithNav("articles")}
          />
        </div>

        {/* Categories list (expandable like Notion pages) */}
        {!collapsed && (
          <div className="mt-3">
            <button
              onClick={() => setCategoriesOpen((v) => !v)}
              className="w-full flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-widest text-[#9A9690] hover:text-[#1A1A1A] font-medium"
            >
              <Icon
                name="ChevronRight"
                size={11}
                className={`transition-transform ${categoriesOpen ? "rotate-90" : ""}`}
              />
              Темы
            </button>
            {categoriesOpen && (
              <div className="space-y-0.5">
                {categories.map((c) => {
                  const activeCat =
                    path === "/" &&
                    params.get("category") === c.name;
                  return (
                    <NavLink
                      key={c.id}
                      icon={c.icon}
                      label={c.name}
                      to={`/?nav=articles&category=${encodeURIComponent(c.name)}`}
                      active={activeCat}
                      collapsed={false}
                      indent
                      onClick={() => goCategory(c.name)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Personal */}
        {user && (
          <>
            <SectionLabel collapsed={collapsed}>Личное</SectionLabel>
            <div className="space-y-0.5">
              <div className={collapsed ? "" : "flex items-center gap-0.5"}>
                <div className="flex-1">
                  <NavLink
                    icon="MessageCircle"
                    label="Сообщения"
                    to="/messages"
                    active={path.startsWith("/messages") && !activeChatId}
                    collapsed={collapsed}
                    badge={unread}
                  />
                </div>
                {!collapsed && topConversations.length > 0 && (
                  <button
                    onClick={() => setChatsOpen((v) => !v)}
                    className="w-6 h-6 rounded-md hover:bg-[#EDE9E2] flex items-center justify-center text-[#7A7670] shrink-0"
                    title={chatsOpen ? "Скрыть чаты" : "Показать чаты"}
                  >
                    <Icon
                      name="ChevronDown"
                      size={13}
                      className={`transition-transform ${chatsOpen ? "" : "-rotate-90"}`}
                    />
                  </button>
                )}
              </div>

              {/* Pinned chats list (Telegram-style) */}
              {!collapsed && chatsOpen && topConversations.length > 0 && (
                <div className="space-y-0.5 mb-1">
                  {topConversations.map((c) => {
                    const partner = getPartner(c.partnerId);
                    if (!partner) return null;
                    const active = activeChatId === c.partnerId;
                    const lastText = c.lastMessage.text
                      ? c.lastMessage.text
                      : c.lastMessage.article
                      ? `📎 ${c.lastMessage.article.title}`
                      : "...";
                    return (
                      <button
                        key={c.partnerId}
                        onClick={() => navigate(`/messages?u=${c.partnerId}`)}
                        title={partner.name}
                        className={`w-full flex items-center gap-2 pl-7 pr-2 py-1.5 rounded-md text-left transition-colors ${
                          active ? "bg-[#EDE9E2]" : "hover:bg-[#F0EDE8]"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0 overflow-hidden">
                          {partner.avatar ? (
                            <img
                              src={partner.avatar}
                              alt={partner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-cormorant font-semibold text-[11px] text-[#4A4A48]">
                              {partner.name[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p
                              className={`text-[13px] truncate ${
                                active ? "text-[#1A1A1A] font-medium" : "text-[#2A2A28]"
                              }`}
                            >
                              {partner.name}
                            </p>
                            <span className="text-[10px] text-[#9A9690] shrink-0">
                              {formatChatTime(c.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A7670] truncate leading-tight">
                            {lastText}
                          </p>
                        </div>
                        {c.unread > 0 && (
                          <span className="bg-[#1A1A1A] text-white text-[9px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center font-medium shrink-0">
                            {c.unread > 9 ? "9+" : c.unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <NavLink
                icon="Bookmark"
                label="Закладки"
                to="/bookmarks"
                active={path.startsWith("/bookmarks")}
                collapsed={collapsed}
              />
              <NavLink
                icon="User"
                label="Профиль"
                to="/profile"
                active={path.startsWith("/profile")}
                collapsed={collapsed}
              />
              {canCreateArticle(user) && (
                <NavLink
                  icon="PenLine"
                  label="Написать статью"
                  to="/new"
                  active={path === "/new"}
                  collapsed={collapsed}
                />
              )}
              {isAdmin(user) && (
                <NavLink
                  icon="Shield"
                  label="Админ-панель"
                  to="/admin"
                  active={path.startsWith("/admin")}
                  collapsed={collapsed}
                />
              )}
            </div>
          </>
        )}

        {/* Info */}
        <SectionLabel collapsed={collapsed}>Информация</SectionLabel>
        <div className="space-y-0.5">
          <NavLink
            icon="ScrollText"
            label="Правила"
            to="/rules"
            active={path === "/rules"}
            collapsed={collapsed}
          />
          <NavLink
            icon="Copyright"
            label="Копирайт"
            to="/copyright"
            active={path === "/copyright"}
            collapsed={collapsed}
          />
          <NavLink
            icon="Info"
            label="О проекте"
            to="/about"
            active={path === "/about"}
            collapsed={collapsed}
          />
          <NavLink
            icon="LifeBuoy"
            label="Помощь"
            to="/help"
            active={path === "/help"}
            collapsed={collapsed}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#E8E4DC] p-2 shrink-0">
        {user ? (
          <button
            onClick={() => {
              logoutUser();
              navigate("/");
            }}
            title={collapsed ? "Выйти" : undefined}
            className={`w-full flex items-center gap-2 rounded-md text-sm text-[#6A6660] hover:bg-[#EDE9E2] hover:text-[#1A1A1A] transition-colors ${
              collapsed ? "justify-center px-2 py-2" : "px-2 py-1.5"
            }`}
          >
            <Icon name="LogOut" size={15} />
            {!collapsed && <span>Выйти</span>}
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            title={collapsed ? "Войти" : undefined}
            className={`w-full flex items-center gap-2 rounded-md text-sm bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors ${
              collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
            }`}
          >
            <Icon name="LogIn" size={15} />
            {!collapsed && <span className="font-medium">Войти</span>}
          </button>
        )}
        {!collapsed && (
          <p className="text-[10px] text-[#B8B4AC] text-center mt-2 leading-relaxed">
            © {new Date().getFullYear()} Медиум
          </p>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile toggle button (floating, top-left) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 w-9 h-9 rounded-md bg-white border border-[#E8E4DC] shadow-sm flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5F3EF]"
        title="Меню"
      >
        <Icon name="Menu" size={16} />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative animate-slide-in-left">{sidebar}</div>
        </div>
      )}
    </>
  );
}