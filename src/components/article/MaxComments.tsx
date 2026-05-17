import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  useMaxComments,
  useMaxProfile,
  setMaxProfile,
  addComment,
  deleteComment,
  buildMaxProfileLink,
  type MaxComment,
} from "@/store/maxCommentsStore";

interface Props {
  articleId: number;
  articleTitle: string;
}

function formatWhen(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = new Date(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function MaxLogo({ size = 18 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-md bg-gradient-to-br from-[#FF6B00] via-[#FF3D8B] to-[#7B2CFF] text-white font-bold leading-none shrink-0"
    >
      <span style={{ fontSize: size * 0.55 }} className="font-golos">
        M
      </span>
    </span>
  );
}

function MaxConnectCard({ onConnect }: { onConnect: (nick: string, name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [nick, setNick] = useState("");
  const [name, setName] = useState("");

  const handle = () => {
    const cleanNick = nick.replace(/^@+/, "").trim();
    if (!cleanNick) return;
    onConnect(cleanNick, name.trim() || cleanNick);
    setNick("");
    setName("");
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="rounded-2xl border border-[#E8E4DC] bg-gradient-to-br from-[#FFF6EF] via-white to-[#F7F0FF] p-5 flex items-center gap-4">
        <MaxLogo size={32} />
        <div className="flex-1 min-w-0">
          <p className="font-cormorant text-xl font-semibold text-[#1A1A1A]">
            Комментируйте через MAX
          </p>
          <p className="text-sm text-[#6A6660]">
            Подключите никнейм MAX, чтобы оставлять комментарии и отвечать на них.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors flex items-center gap-2 shrink-0"
        >
          <Icon name="Link2" size={13} />
          Подключить
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 animate-slide-down">
      <div className="flex items-center gap-3 mb-4">
        <MaxLogo size={28} />
        <div className="flex-1">
          <p className="font-cormorant text-lg font-semibold text-[#1A1A1A]">Подключение MAX</p>
          <p className="text-xs text-[#9A9690]">Данные хранятся только в вашем браузере</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-[#9A9690] hover:text-[#1A1A1A] w-7 h-7 flex items-center justify-center"
        >
          <Icon name="X" size={14} />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 border border-[#E8E4DC] rounded-full px-4 py-2 focus-within:border-[#1A1A1A] transition-colors">
          <span className="text-[#9A9690] text-sm">@</span>
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder="ваш_никнейм_в_max"
            className="flex-1 bg-transparent outline-none text-sm text-[#1A1A1A] placeholder:text-[#B8B4AC]"
          />
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя для отображения (необязательно)"
          className="w-full bg-transparent border border-[#E8E4DC] rounded-full px-4 py-2 outline-none text-sm text-[#1A1A1A] placeholder:text-[#B8B4AC] focus:border-[#1A1A1A] transition-colors"
        />
      </div>
      <div className="flex items-center justify-between gap-3 mt-4">
        <p className="text-[11px] text-[#9A9690]">
          Нет аккаунта?{" "}
          <a
            href="https://max.ru"
            target="_blank"
            rel="noreferrer"
            className="text-[#1A1A1A] underline hover:no-underline"
          >
            Получить в MAX
          </a>
        </p>
        <button
          onClick={handle}
          disabled={!nick.trim()}
          className="bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors disabled:opacity-40"
        >
          Подключить
        </button>
      </div>
    </div>
  );
}

function Comment({
  c,
  meNick,
  onReply,
  onDelete,
}: {
  c: MaxComment;
  meNick: string | null;
  onReply: () => void;
  onDelete: () => void;
}) {
  const isMine = meNick === c.maxNickname;
  return (
    <div className="flex gap-3 group">
      <a
        href={buildMaxProfileLink(c.maxNickname)}
        target="_blank"
        rel="noreferrer"
        className="relative shrink-0"
        title={`Открыть @${c.maxNickname} в MAX`}
      >
        <div className="w-9 h-9 rounded-full bg-[#F0EDE8] flex items-center justify-center font-cormorant font-semibold text-[#4A4A48]">
          {(c.displayName || c.maxNickname)[0].toUpperCase()}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[1px] shadow-sm">
          <MaxLogo size={12} />
        </span>
      </a>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <a
            href={buildMaxProfileLink(c.maxNickname)}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[#1A1A1A] hover:underline"
          >
            {c.displayName || c.maxNickname}
          </a>
          <span className="text-[11px] text-[#9A9690]">@{c.maxNickname}</span>
          <span className="text-[11px] text-[#B8B4AC]">· {formatWhen(c.createdAt)}</span>
        </div>
        <p className="text-[14px] text-[#2A2A28] mt-0.5 leading-relaxed whitespace-pre-wrap break-words">
          {c.text}
        </p>
        <div className="flex items-center gap-3 mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onReply}
            className="text-[11px] text-[#6A6660] hover:text-[#1A1A1A] flex items-center gap-1"
          >
            <Icon name="CornerUpLeft" size={11} />
            Ответить
          </button>
          <a
            href={buildMaxProfileLink(c.maxNickname)}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-[#6A6660] hover:text-[#1A1A1A] flex items-center gap-1"
          >
            <Icon name="MessageSquare" size={11} />
            Написать в MAX
          </a>
          {isMine && (
            <button
              onClick={onDelete}
              className="text-[11px] text-[#9A9690] hover:text-red-600 flex items-center gap-1 ml-auto"
            >
              <Icon name="Trash2" size={11} />
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MaxComments({ articleId, articleTitle }: Props) {
  const comments = useMaxComments(articleId);
  const profile = useMaxProfile();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<MaxComment | null>(null);

  const handleConnect = (nickname: string, displayName: string) => {
    setMaxProfile({ nickname, displayName });
  };

  const handleDisconnect = () => setMaxProfile(null);

  const handleSend = () => {
    if (!profile) return;
    const finalText = replyTo
      ? `@${replyTo.maxNickname}, ${text.trim()}`
      : text.trim();
    if (!finalText) return;
    addComment({
      articleId,
      maxNickname: profile.nickname,
      displayName: profile.displayName,
      text: finalText,
      parentId: replyTo?.id ?? null,
    });
    setText("");
    setReplyTo(null);
  };

  const handleReply = (c: MaxComment) => {
    setReplyTo(c);
    setText("");
    setTimeout(() => {
      document.getElementById("max-comments-input")?.focus();
    }, 50);
  };

  const handleDelete = (c: MaxComment) => {
    if (!profile) return;
    if (!confirm("Удалить комментарий?")) return;
    deleteComment(c.id, profile.nickname);
  };

  // Discuss-in-MAX deep link (открыть статью в MAX-чате через share-ссылку)
  const shareLink = `https://max.ru/share?text=${encodeURIComponent(
    `${articleTitle}\n${typeof window !== "undefined" ? window.location.href : ""}`
  )}`;

  return (
    <section className="max-w-2xl mx-auto px-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <MaxLogo size={24} />
        <div className="flex-1">
          <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] leading-none">
            Комментарии
          </h2>
          <p className="text-[11px] text-[#9A9690] mt-1">
            через мессенджер MAX · {comments.length}{" "}
            {comments.length === 1 ? "комментарий" : "комментариев"}
          </p>
        </div>
        <a
          href={shareLink}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-sm text-[#6A6660] hover:text-[#1A1A1A] border border-[#E8E4DC] rounded-full px-3 py-1.5 hover:bg-[#F5F3EF] transition-colors"
          title="Обсудить статью в MAX"
        >
          <Icon name="Send" size={12} />
          Обсудить в MAX
        </a>
      </div>

      {/* Profile connect / status */}
      {!profile ? (
        <div className="mb-6">
          <MaxConnectCard onConnect={handleConnect} />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F7F4EE] border border-[#E8E4DC]">
          <MaxLogo size={20} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#1A1A1A] truncate">
              Вы вошли как{" "}
              <span className="font-medium">{profile.displayName}</span>{" "}
              <span className="text-[#9A9690]">@{profile.nickname}</span>
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-xs text-[#6A6660] hover:text-[#1A1A1A] flex items-center gap-1"
            title="Отключить MAX"
          >
            <Icon name="LogOut" size={11} />
            Отключить
          </button>
        </div>
      )}

      {/* Input */}
      {profile && (
        <div className="mb-8 border border-[#E8E4DC] rounded-2xl bg-white p-3 focus-within:border-[#1A1A1A] transition-colors">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-[#FAFAF8] rounded-lg border-l-2 border-[#FF3D8B]">
              <Icon name="CornerUpLeft" size={11} className="text-[#9A9690]" />
              <span className="text-[11px] text-[#7A7670]">
                В ответ <span className="font-medium text-[#1A1A1A]">@{replyTo.maxNickname}</span>:
              </span>
              <span className="text-[11px] text-[#9A9690] truncate flex-1">{replyTo.text}</span>
              <button
                onClick={() => setReplyTo(null)}
                className="text-[#9A9690] hover:text-[#1A1A1A] shrink-0"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
          <textarea
            id="max-comments-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Напишите комментарий..."
            rows={2}
            className="w-full resize-none bg-transparent outline-none text-[14px] text-[#1A1A1A] placeholder:text-[#B8B4AC] px-2 py-1"
          />
          <div className="flex items-center justify-between pt-2 border-t border-[#F0EDE8]">
            <p className="text-[11px] text-[#9A9690]">
              Отправляется как <span className="text-[#1A1A1A]">@{profile.nickname}</span>
            </p>
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="bg-[#1A1A1A] text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-[#333] transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <Icon name="Send" size={12} />
              Отправить
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#E8E4DC] rounded-2xl">
          <MaxLogo size={28} />
          <p className="font-cormorant text-lg text-[#4A4A48] mt-3">Комментариев пока нет</p>
          <p className="text-sm text-[#9A9690] mt-1">
            Будьте первым, кто оставит мнение через MAX
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((c) => (
            <Comment
              key={c.id}
              c={c}
              meNick={profile?.nickname ?? null}
              onReply={() => handleReply(c)}
              onDelete={() => handleDelete(c)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
