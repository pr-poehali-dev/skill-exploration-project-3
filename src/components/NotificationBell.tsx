import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/store/authStore";
import {
  useNotifications,
  markAllRead,
  markRead,
  removeNotification,
  type Notification,
} from "@/store/notificationsStore";

const TYPE_ICONS: Record<string, string> = {
  message: "MessageCircle",
  article: "FileText",
  role: "Shield",
  system: "Bell",
};

function timeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return "только что";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} мин`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ч`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d} дн`;
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function NotificationBell() {
  const user = useAuth();
  const navigate = useNavigate();
  const items = useNotifications(user?.id);
  const unread = items.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleOpen = (n: Notification) => {
    markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
          open ? "border-[#1A1A1A] bg-[#1A1A1A]" : "border-[#E8E4DC] bg-white hover:border-[#C8C4BC]"
        }`}
        title="Уведомления"
      >
        <Icon name="Bell" size={16} className={open ? "text-white" : "text-[#6A6660]"} />
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium border-2 border-[#FAFAF8] pointer-events-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 max-w-[90vw] bg-white border border-[#E8E4DC] rounded-xl shadow-lg animate-slide-down z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0EDE8]">
            <p className="font-cormorant text-lg font-semibold text-[#1A1A1A]">Уведомления</p>
            {unread > 0 && (
              <button
                onClick={() => user && markAllRead(user.id)}
                className="text-xs text-[#9A9690] hover:text-[#1A1A1A] transition-colors"
              >
                Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-12 px-6 text-[#9A9690]">
                <Icon name="BellOff" size={28} className="mx-auto mb-3 opacity-40" />
                <p className="font-cormorant text-lg text-[#4A4A48] mb-1">Уведомлений нет</p>
                <p className="text-xs">Здесь появятся новые сообщения и события</p>
              </div>
            ) : (
              items.slice(0, 50).map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-[#F5F3EF] last:border-0 transition-colors cursor-pointer group ${
                    n.read ? "hover:bg-[#FAFAF8]" : "bg-[#FAFAF6] hover:bg-[#F5F3EF]"
                  }`}
                  onClick={() => handleOpen(n)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    n.read ? "bg-[#F0EDE8]" : "bg-[#1A1A1A]"
                  }`}>
                    <Icon
                      name={TYPE_ICONS[n.type] || "Bell"}
                      size={13}
                      className={n.read ? "text-[#6A6660]" : "text-white"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm truncate ${n.read ? "text-[#4A4A48]" : "text-[#1A1A1A] font-medium"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-[#9A9690] shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#7A7670] mt-0.5 line-clamp-2">{n.text}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[#C8C4BC] hover:text-red-400 transition-all shrink-0 self-start mt-1"
                  >
                    <Icon name="X" size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
