import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth, useUsers, ROLE_LABELS } from "@/store/authStore";
import { forwardMessage, type Message } from "@/store/messagesStore";

interface Props {
  message: Message;
  onClose: () => void;
}

export default function ForwardMessageModal({ message, onClose }: Props) {
  const navigate = useNavigate();
  const me = useAuth();
  const users = useUsers();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const others = users.filter((u) => u.id !== me?.id);
  const filtered = search
    ? others.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : others;

  const toggle = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSend = () => {
    if (!me || selectedIds.size === 0) return;
    selectedIds.forEach((toId) => {
      forwardMessage(message.id, me.id, toId, comment);
    });
    setSent(true);
    setTimeout(() => {
      onClose();
      if (selectedIds.size === 1) {
        const [first] = Array.from(selectedIds);
        navigate(`/messages?u=${first}`);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md border border-[#E8E4DC] overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-5 py-4 border-b border-[#E8E4DC] flex items-center justify-between shrink-0">
          <p className="font-cormorant text-xl font-semibold text-[#1A1A1A]">Переслать сообщение</p>
          <button onClick={onClose} className="text-[#9A9690] hover:text-[#1A1A1A]">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Source message preview */}
        <div className="px-5 pt-4 shrink-0">
          <div className="border border-[#E8E4DC] bg-[#FAFAF8] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="CornerUpRight" size={11} className="text-[#9A9690]" />
              <span className="text-[10px] uppercase tracking-widest text-[#7A7670]">Сообщение</span>
            </div>
            {message.article && (
              <div className="mb-2 p-2 rounded-lg bg-white border border-[#E8E4DC]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon name="FileText" size={10} className="text-[#9A9690]" />
                  <span className="text-[9px] uppercase tracking-widest text-[#7A7670]">{message.article.category}</span>
                </div>
                <p className="font-cormorant text-sm font-semibold text-[#1A1A1A] line-clamp-1">
                  {message.article.title}
                </p>
              </div>
            )}
            {message.text && (
              <p className="text-xs text-[#4A4A48] leading-relaxed line-clamp-3 whitespace-pre-wrap">
                {message.text}
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pt-4 shrink-0">
          <div className="relative">
            <Icon name="Search" size={13} className="text-[#9A9690] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Найти пользователя..."
              className="w-full bg-[#FAFAF8] border border-[#E8E4DC] rounded-full pl-9 pr-3 py-2 text-sm outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#B8B4AC]"
            />
          </div>
          {selectedIds.size > 0 && (
            <p className="text-xs text-[#9A9690] mt-2 px-1">
              Выбрано: <span className="text-[#1A1A1A] font-medium">{selectedIds.size}</span>
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-[#9A9690] text-center py-8">Никого не найдено</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((u) => {
                const active = selectedIds.has(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggle(u.id)}
                    className={`w-full text-left flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      active ? "bg-[#F5F3EF]" : "hover:bg-[#FAFAF8]"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0 overflow-hidden">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-cormorant font-semibold text-[#4A4A48]">
                          {u.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1A1A1A] truncate">{u.name}</p>
                      <p className="text-xs text-[#9A9690] truncate">{ROLE_LABELS[u.role]}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        active ? "bg-[#1A1A1A] border-[#1A1A1A]" : "border-[#C8C4BC]"
                      }`}
                    >
                      {active && <Icon name="Check" size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="px-5 pb-3 shrink-0">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Добавьте комментарий (необязательно)..."
              className="w-full text-sm text-[#1A1A1A] bg-[#FAFAF8] border border-[#E8E4DC] rounded-full px-4 py-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#B8B4AC]"
            />
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#E8E4DC] flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="text-sm text-[#6A6660] hover:text-[#1A1A1A] px-4 py-2 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSend}
            disabled={selectedIds.size === 0 || sent}
            className="bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {sent ? (
              <>
                <Icon name="Check" size={14} />
                Отправлено
              </>
            ) : (
              <>
                <Icon name="Send" size={14} />
                Переслать {selectedIds.size > 1 ? `(${selectedIds.size})` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
