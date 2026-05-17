import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import {
  useMaxComments,
  useMaxProfile,
  setMaxProfile,
  addComment,
  deleteComment,
  type MaxComment,
} from "@/store/maxCommentsStore";
import { MaxLogo, buildTree } from "./max-comments/maxCommentsUtils";
import MaxConnectCard from "./max-comments/MaxConnectCard";
import CommentTree from "./max-comments/CommentTree";

interface Props {
  articleId: number;
  articleTitle: string;
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
