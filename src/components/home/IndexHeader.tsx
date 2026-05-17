import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import NotificationBell from "@/components/NotificationBell";
import { type User, ROLE_LABELS, canCreateArticle, isAdmin, logoutUser } from "@/store/authStore";
import { updateTheme, type ThemeSettings } from "@/store/themeStore";
import { MenuItem } from "./IndexShared";

interface Props {
  navItems: string[];
  activeNav: string;
  setActiveNav: (v: string) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
  searchFocused: boolean;
  setSearchFocused: (v: boolean) => void;
  setActiveCategory: (v: string | null) => void;
  user: User | null;
  unread: number;
  theme: ThemeSettings;
}

export default function IndexHeader({
  navItems,
  activeNav,
  setActiveNav,
  searchValue,
  setSearchValue,
  searchFocused,
  setSearchFocused,
  setActiveCategory,
  user,
  unread,
  theme,
}: Props) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E4DC]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
        <button
          onClick={() => { setSearchValue(""); navigate("/?nav=home"); }}
          className="flex items-center gap-2 shrink-0 group"
        >
          <div className="w-8 h-8 bg-[#1A1A1A] rounded-sm flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-white font-cormorant font-semibold text-lg leading-none select-none">М</span>
          </div>
          <span className="font-cormorant font-semibold text-xl text-[#1A1A1A] hidden sm:block tracking-tight">
            Медиум
          </span>
        </button>

        <div className="flex-1 flex justify-center mx-2 relative">
          <div className="w-full max-w-[512px]">
          <div
            className={`flex items-center gap-2 bg-white border rounded-full px-4 py-2 transition-all duration-200 ${
              searchFocused
                ? "border-[#1A1A1A] shadow-[0_0_0_3px_rgba(26,26,26,0.06)]"
                : "border-[#E8E4DC] hover:border-[#C8C4BC]"
            }`}
          >
            <Icon name="Search" size={15} className="text-[#9A9690] shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Поиск статей, тем, авторов..."
              className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#B8B4AC] outline-none min-w-0"
            />
            {searchValue && (
              <button onClick={() => setSearchValue("")} className="text-[#9A9690] hover:text-[#1A1A1A] transition-colors">
                <Icon name="X" size={13} />
              </button>
            )}
          </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            canCreateArticle(user) && (
              <button
                onClick={() => navigate("/new")}
                className="bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors whitespace-nowrap hidden sm:flex items-center gap-1.5"
              >
                <Icon name="PenLine" size={13} />
                Написать
              </button>
            )
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors whitespace-nowrap hidden sm:block"
            >
              Войти
            </button>
          )}

          {user && <NotificationBell />}

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden ${
                profileOpen ? "border-[#1A1A1A] bg-[#1A1A1A]" : "border-[#E8E4DC] bg-white hover:border-[#C8C4BC]"
              }`}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : user ? (
                <span className={`font-cormorant font-semibold text-sm ${profileOpen ? "text-white" : "text-[#4A4A48]"}`}>
                  {user.name[0].toUpperCase()}
                </span>
              ) : (
                <Icon name="User" size={16} className={profileOpen ? "text-white" : "text-[#6A6660]"} />
              )}
            </button>
            {unread > 0 && !profileOpen && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium border-2 border-[#FAFAF8] pointer-events-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}

            {profileOpen && (
              <div className="absolute right-0 top-12 w-60 bg-white border border-[#E8E4DC] rounded-xl shadow-lg py-1 animate-slide-down z-50">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-[#F0EDE8] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-cormorant font-semibold text-[#4A4A48]">
                            {user.name[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{user.name}</p>
                        <p className="text-xs text-[#9A9690] truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-widest text-[#7A7670] bg-[#F5F3EF] px-2 py-0.5 rounded-full">
                          {ROLE_LABELS[user.role]}
                        </span>
                      </div>
                    </div>
                    <MenuItem icon="User" label="Мой профиль" onClick={() => { setProfileOpen(false); navigate("/profile"); }} />
                    <MenuItem icon="MessageCircle" label="Сообщения" badge={unread} onClick={() => { setProfileOpen(false); navigate("/messages"); }} />
                    <MenuItem icon="Bookmark" label="Закладки" onClick={() => { setProfileOpen(false); navigate("/bookmarks"); }} />
                    {canCreateArticle(user) && (
                      <MenuItem icon="PenLine" label="Написать статью" onClick={() => { setProfileOpen(false); navigate("/new"); }} />
                    )}
                    {isAdmin(user) && (
                      <MenuItem icon="Shield" label="Админ-панель" onClick={() => { setProfileOpen(false); navigate("/admin"); }} />
                    )}

                    <div className="border-t border-[#F0EDE8] my-1" />
                    <MenuItem icon="ScrollText" label="Правила" onClick={() => { setProfileOpen(false); navigate("/rules"); }} />
                    <MenuItem icon="Copyright" label="Копирайт" onClick={() => { setProfileOpen(false); navigate("/copyright"); }} />
                    <MenuItem icon="Info" label="О проекте" onClick={() => { setProfileOpen(false); navigate("/about"); }} />
                    <MenuItem icon="LifeBuoy" label="Помощь" onClick={() => { setProfileOpen(false); navigate("/help"); }} />

                    <div className="border-t border-[#F0EDE8] mt-1 px-4 py-2.5 flex items-center gap-3">
                      <Icon name={theme.mode === "dark" ? "Moon" : "Sun"} size={14} className="text-[#9A9690]" />
                      <span className="flex-1 text-sm text-[#1A1A1A]">
                        {theme.mode === "dark" ? "Тёмная тема" : "Светлая тема"}
                      </span>
                      <button
                        onClick={() => updateTheme({ mode: theme.mode === "dark" ? "light" : "dark" })}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          theme.mode === "dark" ? "bg-[#1A1A1A]" : "bg-[#E8E4DC]"
                        }`}
                        title="Переключить тему"
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                            theme.mode === "dark" ? "translate-x-[22px]" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="border-t border-[#F0EDE8]">
                      <button
                        onClick={() => { setProfileOpen(false); logoutUser(); navigate("/"); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-500 transition-colors hover:bg-[#F5F3EF] flex items-center gap-3"
                      >
                        <Icon name="LogOut" size={14} />
                        Выйти
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <MenuItem icon="LogIn" label="Войти" onClick={() => { setProfileOpen(false); navigate("/login"); }} />
                    <MenuItem icon="UserPlus" label="Зарегистрироваться" onClick={() => { setProfileOpen(false); navigate("/register"); }} />
                    <div className="border-t border-[#F0EDE8] my-1" />
                    <MenuItem icon="ScrollText" label="Правила" onClick={() => { setProfileOpen(false); navigate("/rules"); }} />
                    <MenuItem icon="Copyright" label="Копирайт" onClick={() => { setProfileOpen(false); navigate("/copyright"); }} />
                    <MenuItem icon="Info" label="О проекте" onClick={() => { setProfileOpen(false); navigate("/about"); }} />
                    <MenuItem icon="LifeBuoy" label="Помощь" onClick={() => { setProfileOpen(false); navigate("/help"); }} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex items-center gap-1">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => { setActiveNav(item); setSearchValue(""); setActiveCategory(null); }}
            className={`relative text-sm font-medium px-3 py-3 transition-colors ${
              activeNav === item ? "text-[#1A1A1A]" : "text-[#9A9690] hover:text-[#4A4A48]"
            }`}
          >
            {item}
            {activeNav === item && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#1A1A1A] rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </header>
  );
}