import { type MaxComment } from "@/store/maxCommentsStore";

export interface CommentNode extends MaxComment {
  children: CommentNode[];
}

export function formatWhen(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = new Date(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function MaxLogo({ size = 18 }: { size?: number }) {
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

export function buildTree(items: MaxComment[]): CommentNode[] {
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
