import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import {
  INFO_PAGE_KEYS,
  useAllInfoPages,
  updateInfoPage,
  resetInfoPage,
  type InfoPageKey,
} from "@/store/infoPagesStore";

export default function AdminPages() {
  const pages = useAllInfoPages();
  const [activeKey, setActiveKey] = useState<InfoPageKey>("rules");
  const active = pages[activeKey];

  const [title, setTitle] = useState(active.title);
  const [subtitle, setSubtitle] = useState(active.subtitle || "");
  const [content, setContent] = useState(active.content);
  const [icon, setIcon] = useState(active.icon);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  // При смене вкладки — подгружаем данные
  useEffect(() => {
    setTitle(active.title);
    setSubtitle(active.subtitle || "");
    setContent(active.content);
    setIcon(active.icon);
    setDirty(false);
    setSaved(false);
  }, [activeKey, active.title, active.subtitle, active.content, active.icon]);

  const handleSave = () => {
    updateInfoPage(activeKey, {
      title: title.trim() || active.title,
      subtitle: subtitle.trim() || undefined,
      icon: icon.trim() || active.icon,
      content,
    });
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!confirm("Сбросить к стандартному содержимому?")) return;
    resetInfoPage(activeKey);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Информационные страницы</h2>
          <p className="text-sm text-[#9A9690] mt-1">
            Правила, копирайт, о проекте и помощь — редактируются вживую
          </p>
        </div>
        <a
          href={`/${activeKey === "about" ? "about" : activeKey}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[#6A6660] hover:text-[#1A1A1A] flex items-center gap-1.5 border border-[#E8E4DC] rounded-full px-3 py-1.5 hover:bg-[#F5F3EF] transition-colors"
        >
          <Icon name="ExternalLink" size={12} />
          Открыть страницу
        </a>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {INFO_PAGE_KEYS.map((k) => {
          const p = pages[k];
          const isActive = activeKey === k;
          return (
            <button
              key={k}
              onClick={() => {
                if (dirty && !confirm("У вас есть несохранённые изменения. Переключиться?")) return;
                setActiveKey(k);
              }}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-colors ${
                isActive
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-white border border-[#E8E4DC] text-[#4A4A48] hover:border-[#C8C4BC]"
              }`}
            >
              <Icon name={p.icon} size={13} />
              {p.title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Editor */}
        <div className="space-y-5 bg-white border border-[#E8E4DC] rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
                Заголовок
              </label>
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
                className="w-full text-base text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
                Иконка (lucide)
              </label>
              <input
                value={icon}
                onChange={(e) => { setIcon(e.target.value); setDirty(true); }}
                placeholder="ScrollText"
                className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
              Подзаголовок
            </label>
            <input
              value={subtitle}
              onChange={(e) => { setSubtitle(e.target.value); setDirty(true); }}
              placeholder="Короткое описание (необязательно)"
              className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
              Содержимое
            </label>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setDirty(true); }}
              rows={20}
              className="w-full text-[14px] text-[#1A1A1A] bg-[#FAFAF8] border border-[#E8E4DC] rounded-xl p-4 outline-none focus:border-[#1A1A1A] transition-colors font-mono leading-relaxed resize-y"
            />
            <p className="text-[11px] text-[#9A9690] mt-2">
              <span className="text-[#1A1A1A] font-mono">## заголовок</span> — раздел,
              <span className="text-[#1A1A1A] font-mono ml-2">* пункт</span> — список,
              пустая строка — новый абзац.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F0EDE8]">
            <button
              onClick={handleReset}
              className="text-xs text-[#9A9690] hover:text-red-500 flex items-center gap-1.5 transition-colors"
            >
              <Icon name="RotateCcw" size={11} />
              Сбросить
            </button>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-xs text-green-600 flex items-center gap-1 animate-fade-in">
                  <Icon name="Check" size={12} />
                  Сохранено
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={!dirty}
                className="bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                <Icon name="Save" size={13} />
                Сохранить
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Eye" size={14} className="text-[#7A7670]" />
              <p className="text-sm font-medium text-[#1A1A1A]">Адрес страницы</p>
            </div>
            <code className="block text-xs text-[#6A6660] bg-[#FAFAF8] px-3 py-2 rounded-lg break-all">
              /{activeKey}
            </code>
          </div>

          {active.updatedAt > 0 && (
            <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Clock" size={14} className="text-[#7A7670]" />
                <p className="text-sm font-medium text-[#1A1A1A]">Последнее изменение</p>
              </div>
              <p className="text-xs text-[#6A6660]">
                {new Date(active.updatedAt).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          <div className="bg-[#F7F4EE] border border-[#E8E4DC] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Lightbulb" size={14} className="text-[#1A1A1A]" />
              <p className="text-sm font-medium text-[#1A1A1A]">Подсказка</p>
            </div>
            <p className="text-xs text-[#6A6660] leading-relaxed">
              Изменения сохраняются локально и доступны всем посетителям сайта.
              Используйте простую разметку без HTML.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
