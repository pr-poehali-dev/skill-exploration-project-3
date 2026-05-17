import { useMemo, useState } from "react";
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

interface CommentNode extends MaxComment {
  children: CommentNode[];
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

function buildTree(items: MaxComment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  items.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CommentNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  // newest first для корней, для веток — старые сверху (как в Telegram-ветках)
  roots.sort((a, b) => b.createdAt - a.createdAt);
  const sortChildren = (n: CommentNode) => {
    n.children.sort((a, b) => a.createdAt - b.createdAt);
    n.children.forEach(sortChildren);
  };
  roots.forEach(sortChildren);
  return roots;
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

function ReplyForm({
  meNick,
  onSubmit,
  onCancel,
}: {
  meNick: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };
  return (
    <div className="mt-2 border border-[#E8E4DC] rounded-xl bg-white p-2 animate-slide-down">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            send();
          }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Ваш ответ..."
        rows={2}
        className="w-full resize-none bg-transparent outline-none text-[13px] text-[#1A1A1A] placeholder:text-[#B8B4AC] px-2 py-1"
      />
      <div className="flex items-center justify-between pt-1.5 border-t border-[#F0EDE8]">
        <p className="text-[11px] text-[#9A9690]">
          От <span className="text-[#1A1A1A]">@{meNick}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="text-xs text-[#6A6660] hover:text-[#1A1A1A] px-3 py-1"
          >
            Отмена
          </button>
          <button
            onClick={send}
            disabled={!text.trim()}
            className="bg-[#1A1A1A] text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#333] transition-colors flex items-center gap-1 disabled:opacity-40"
          >
            <Icon name="Send" size={11} />
            Ответить
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentTree({
  node,
  depth,
  meNick,
  replyingId,
  collapsedIds,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onToggleCollapse,
  onDelete,
}: {
  node: CommentNode;
  depth: number;
  meNick: string | null;
  replyingId: string | null;
  collapsedIds: Set<string>;
  onStartReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => void;
  onToggleCollapse: (id: string) => void;
  onDelete: (c: MaxComment) => void;
}) {
  const isMine = meNick === node.maxNickname;
  const collapsed = collapsedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const maxDepth = 6;
  const indented = depth < maxDepth;

  return (
    <div className={depth > 0 ? "relative" : ""}>
      <div className="flex gap-3 group">
        <div className="flex flex-col items-center shrink-0">
          <a
            href={buildMaxProfileLink(node.maxNickname)}
            target="_blank"
            rel="noreferrer"
            className="relative"
            title={`Открыть @${node.maxNickname} в MAX`}
          >
            <div className="w-9 h-9 rounded-full bg-[#F0EDE8] flex items-center justify-center font-cormorant font-semibold text-[#4A4A48]">
              {(node.displayName || node.maxNickname)[0].toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[1px] shadow-sm">
              <MaxLogo size={12} />
            </span>
          </a>
          {hasChildren && (
            <button
              onClick={() => onToggleCollapse(node.id)}
              className="mt-1 flex-1 w-[2px] bg-[#E8E4DC] hover:bg-[#1A1A1A] rounded-full transition-colors min-h-[20px]"
              title={collapsed ? "Развернуть ветку" : "Свернуть ветку"}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 pb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <a
              href={buildMaxProfileLink(node.maxNickname)}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-[#1A1A1A] hover:underline"
            >
              {node.displayName || node.maxNickname}
            </a>
            <span className="text-[11px] text-[#9A9690]">@{node.maxNickname}</span>
            <span className="text-[11px] text-[#B8B4AC]">· {formatWhen(node.createdAt)}</span>
          </div>
          <p className="text-[14px] text-[#2A2A28] mt-0.5 leading-relaxed whitespace-pre-wrap break-words">
            {node.text}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            {meNick && (
              <button
                onClick={() => onStartReply(node.id)}
                className="text-[11px] text-[#6A6660] hover:text-[#1A1A1A] flex items-center gap-1"
              >
                <Icon name="CornerUpLeft" size={11} />
                Ответить
              </button>
            )}
            <a
              href={buildMaxProfileLink(node.maxNickname)}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-[#6A6660] hover:text-[#1A1A1A] flex items-center gap-1"
            >
              <Icon name="MessageSquare" size={11} />
              Написать в MAX
            </a>
            {hasChildren && (
              <button
                onClick={() => onToggleCollapse(node.id)}
                className="text-[11px] text-[#6A6660] hover:text-[#1A1A1A] flex items-center gap-1"
              >
                <Icon name={collapsed ? "ChevronDown" : "ChevronUp"} size={11} />
                {collapsed
                  ? `${node.children.length} ${node.children.length === 1 ? "ответ" : "ответов"}`
                  : "Скрыть"}
              </button>
            )}
            {isMine && (
              <button
                onClick={() => onDelete(node)}
                className="text-[11px] text-[#9A9690] hover:text-red-600 flex items-center gap-1 ml-auto opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="Trash2" size={11} />
                Удалить
              </button>
            )}
          </div>

          {replyingId === node.id && meNick && (
            <ReplyForm
              meNick={meNick}
              onSubmit={(t) => onSubmitReply(node.id, t)}
              onCancel={onCancelReply}
            />
          )}

          {hasChildren && !collapsed && (
            <div className={`mt-3 ${indented ? "pl-4 border-l-2 border-[#F0EDE8]" : ""} space-y-0`}>
              {node.children.map((child) => (
                <CommentTree
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  meNick={meNick}
                  replyingId={replyingId}
                  collapsedIds={collapsedIds}
                  onStartReply={onStartReply}
                  onCancelReply={onCancelReply}
                  onSubmitReply={onSubmitReply}
                  onToggleCollapse={onToggleCollapse}
                  onDelete={onDelete}
                />
              ))}
            </div>
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
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildTree(comments), [comments]);

  const handleConnect = (nickname: string, displayName: string) => {
    setMaxProfile({ nickname, displayName });
  };
  const handleDisconnect = () => setMaxProfile(null);

  const handleSendRoot = () => {
    if (!profile || !text.trim()) return;
    addComment({
      articleId,
      maxNickname: profile.nickname,
      displayName: profile.displayName,
      text: text.trim(),
      parentId: null,
    });
    setText("");
  };

  const handleSubmitReply = (parentId: string, replyText: string) => {
    if (!profile) return;
    addComment({
      articleId,
      maxNickname: profile.nickname,
      displayName: profile.displayName,
      text: replyText,
      parentId,
    });
    setReplyingId(null);
    // Раскроем ветку, чтобы был виден ответ
    setCollapsedIds((s) => {
      const next = new Set(s);
      next.delete(parentId);
      return next;
    });
  };

  const handleToggleCollapse = (id: string) => {
    setCollapsedIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = (c: MaxComment) => {
    if (!profile) return;
    if (!confirm("Удалить комментарий?")) return;
    deleteComment(c.id, profile.nickname);
  };

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

      {profile && (
        <div className="mb-8 border border-[#E8E4DC] rounded-2xl bg-white p-3 focus-within:border-[#1A1A1A] transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSendRoot();
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
              onClick={handleSendRoot}
              disabled={!text.trim()}
              className="bg-[#1A1A1A] text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-[#333] transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <Icon name="Send" size={12} />
              Отправить
            </button>
          </div>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#E8E4DC] rounded-2xl">
          <MaxLogo size={28} />
          <p className="font-cormorant text-lg text-[#4A4A48] mt-3">Комментариев пока нет</p>
          <p className="text-sm text-[#9A9690] mt-1">
            Будьте первым, кто оставит мнение через MAX
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tree.map((node) => (
            <CommentTree
              key={node.id}
              node={node}
              depth={0}
              meNick={profile?.nickname ?? null}
              replyingId={replyingId}
              collapsedIds={collapsedIds}
              onStartReply={(id) => setReplyingId(id)}
              onCancelReply={() => setReplyingId(null)}
              onSubmitReply={handleSubmitReply}
              onToggleCollapse={handleToggleCollapse}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
