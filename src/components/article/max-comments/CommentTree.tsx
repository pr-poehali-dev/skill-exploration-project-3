import Icon from "@/components/ui/icon";
import { buildMaxProfileLink, type MaxComment } from "@/store/maxCommentsStore";
import { type CommentNode, MaxLogo, formatWhen } from "./maxCommentsUtils";
import ReplyForm from "./ReplyForm";

export default function CommentTree({
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
