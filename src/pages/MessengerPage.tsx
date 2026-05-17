import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth, useUsers, ROLE_LABELS } from "@/store/authStore";
import {
  useConversations,
  useConversation,
  sendMessage,
  markConversationRead,
} from "@/store/messagesStore";

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function MessengerPage() {
  const navigate = useNavigate();
  const me = useAuth();
  const users = useUsers();
  const conversations = useConversations(me?.id);
  const [params, setParams] = useSearchParams();
  const activeId = params.get("u") ? Number(params.get("u")) : null;
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation(me?.id, activeId ?? undefined);
  const partner = useMemo(() => users.find((u) => u.id === activeId) ?? null, [users, activeId]);

  // Mark read when opening
  useEffect(() => {
    if (me?.id && activeId) markConversationRead(me.id, activeId);
  }, [me?.id, activeId, conversation.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length]);

  const otherUsers = users.filter((u) => u.id !== me?.id);
  const filteredOther = search
    ? otherUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : otherUsers;

  const handleSend = () => {
    if (!me || !activeId || !text.trim()) return;
    sendMessage(me.id, activeId, text);
    setText("");
  };

  const openChat = (uid: number) => {
    setParams({ u: String(uid) });
    setShowNew(false);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos">
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E4DC]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
          >
            <Icon name="ArrowLeft" size={15} />
            <span>Назад</span>
          </button>
          <div className="w-px h-4 bg-[#E8E4DC]" />
          <Icon name="MessageCircle" size={15} className="text-[#1A1A1A]" />
          <span className="font-cormorant font-semibold text-lg text-[#1A1A1A]">Мессенджер</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white border border-[#E8E4DC] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-7rem)]">
          {/* SIDEBAR — Conversations */}
          <aside className={`border-r border-[#E8E4DC] flex flex-col ${activeId ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-[#E8E4DC] flex items-center gap-2">
              <h2 className="font-cormorant text-xl font-semibold text-[#1A1A1A]">Диалоги</h2>
              <span className="text-xs text-[#9A9690] ml-auto">{conversations.length}</span>
              <button
                onClick={() => setShowNew((v) => !v)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  showNew ? "bg-[#1A1A1A] text-white" : "bg-[#F5F3EF] text-[#4A4A48] hover:bg-[#E8E4DC]"
                }`}
                title="Новый диалог"
              >
                <Icon name={showNew ? "X" : "Plus"} size={14} />
              </button>
            </div>

            {showNew && (
              <div className="p-3 border-b border-[#E8E4DC] bg-[#FAFAF8] animate-slide-down">
                <div className="relative mb-2">
                  <Icon name="Search" size={13} className="text-[#9A9690] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Найти пользователя..."
                    className="w-full bg-white border border-[#E8E4DC] rounded-full pl-8 pr-3 py-2 text-sm outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#B8B4AC]"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {filteredOther.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => openChat(u.id)}
                      className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
                    >
                      <Avatar name={u.name} avatar={u.avatar} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A1A1A] truncate">{u.name}</p>
                        <p className="text-xs text-[#9A9690] truncate">{ROLE_LABELS[u.role]}</p>
                      </div>
                    </button>
                  ))}
                  {filteredOther.length === 0 && (
                    <p className="text-xs text-[#9A9690] text-center py-4">Никого не найдено</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && !showNew && (
                <div className="text-center py-16 px-6 text-[#9A9690]">
                  <Icon name="MessageSquare" size={28} className="mx-auto mb-3 opacity-40" />
                  <p className="font-cormorant text-lg text-[#4A4A48] mb-1">Пока пусто</p>
                  <p className="text-xs">Нажмите «+», чтобы начать диалог</p>
                </div>
              )}
              {conversations.map((c) => {
                const p = users.find((u) => u.id === c.partnerId);
                if (!p) return null;
                const isActive = activeId === p.id;
                return (
                  <button
                    key={c.partnerId}
                    onClick={() => openChat(p.id)}
                    className={`w-full text-left flex items-start gap-3 p-3 border-b border-[#F0EDE8] transition-colors ${
                      isActive ? "bg-[#F5F3EF]" : "hover:bg-[#FAFAF8]"
                    }`}
                  >
                    <Avatar name={p.name} avatar={p.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{p.name}</p>
                        <span className="text-[10px] text-[#9A9690] shrink-0">{formatTime(c.lastMessage.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#7A7670] truncate mt-0.5">
                        {c.lastMessage.fromId === me?.id && <span className="text-[#9A9690]">Вы: </span>}
                        {c.lastMessage.text}
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <span className="bg-[#1A1A1A] text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium">
                        {c.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* CHAT */}
          <section className={`flex flex-col ${activeId ? "flex" : "hidden md:flex"}`}>
            {partner ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-[#E8E4DC] flex items-center gap-3">
                  <button
                    onClick={() => setParams({})}
                    className="md:hidden text-[#6A6660] hover:text-[#1A1A1A]"
                  >
                    <Icon name="ArrowLeft" size={16} />
                  </button>
                  <Avatar name={partner.name} avatar={partner.avatar} />
                  <div className="flex-1 min-w-0">
                    <p className="font-cormorant text-lg font-semibold text-[#1A1A1A] truncate">{partner.name}</p>
                    <p className="text-xs text-[#9A9690]">{ROLE_LABELS[partner.role]}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#FAFAF8]">
                  {conversation.length === 0 && (
                    <div className="text-center py-16 text-[#9A9690]">
                      <Icon name="MessageCircle" size={28} className="mx-auto mb-3 opacity-40" />
                      <p className="font-cormorant text-lg text-[#4A4A48]">Начните разговор</p>
                      <p className="text-xs mt-1">Это начало вашей переписки с {partner.name}</p>
                    </div>
                  )}
                  {conversation.map((m, idx) => {
                    const mine = m.fromId === me?.id;
                    const prev = conversation[idx - 1];
                    const showAvatar = !mine && (!prev || prev.fromId !== m.fromId);
                    return (
                      <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                        {!mine && (
                          <div className={showAvatar ? "" : "opacity-0"}>
                            <Avatar name={partner.name} avatar={partner.avatar} size="sm" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                            mine
                              ? "bg-[#1A1A1A] text-white rounded-br-sm"
                              : "bg-white border border-[#E8E4DC] text-[#1A1A1A] rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.text}</p>
                          <p className={`text-[10px] mt-1 ${mine ? "text-white/60" : "text-[#9A9690]"}`}>
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[#E8E4DC]">
                  <div className="flex items-end gap-2 bg-[#FAFAF8] border border-[#E8E4DC] rounded-2xl p-2 focus-within:border-[#1A1A1A] transition-colors">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Напишите сообщение..."
                      rows={1}
                      className="flex-1 bg-transparent outline-none text-sm text-[#1A1A1A] placeholder:text-[#B8B4AC] resize-none px-2 py-1.5 max-h-32"
                      style={{ minHeight: "1.75rem" }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!text.trim()}
                      className="bg-[#1A1A1A] text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Icon name="Send" size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#B8B4AC] mt-1.5 px-2">Enter — отправить, Shift+Enter — новая строка</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center px-6">
                <div>
                  <Icon name="MessageCircle" size={40} className="mx-auto mb-4 text-[#C8C4BC]" />
                  <p className="font-cormorant text-2xl text-[#4A4A48] mb-2">Выберите диалог</p>
                  <p className="text-sm text-[#9A9690]">
                    {conversations.length === 0
                      ? "Нажмите «+» в левой колонке, чтобы начать переписку"
                      : "Или начните новый, нажав «+» слева"}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Avatar({ name, size = "md", avatar }: { name: string; size?: "sm" | "md"; avatar?: string }) {
  const cls = size === "sm" ? "w-7 h-7 text-sm" : "w-10 h-10 text-base";
  return (
    <div className={`${cls} rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0 overflow-hidden`}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-cormorant font-semibold text-[#4A4A48]">{name[0].toUpperCase()}</span>
      )}
    </div>
  );
}