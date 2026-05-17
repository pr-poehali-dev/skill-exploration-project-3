import Icon from "@/components/ui/icon";
import { type Article } from "@/data/articles";

export function formatCardViews(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1).replace(".0", "")}K`;
  if (n < 1000000) return `${Math.round(n / 1000)}K`;
  return `${(n / 1000000).toFixed(1).replace(".0", "")}M`;
}

export function ArticleCard({
  article,
  delay = 0,
  onClick,
}: {
  article: Article;
  delay?: number;
  onClick: () => void;
}) {
  return (
    <article
      className="group cursor-pointer animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="rounded-xl aspect-video mb-4 overflow-hidden transition-transform group-hover:scale-[1.02] bg-[#F0EDE8]">
        {article.cover ? (
          <img src={article.cover} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <CardPlaceholder seed={article.id} />
        )}
      </div>
      <span className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{article.category}</span>
      <h3 className="font-cormorant text-xl font-semibold text-[#1A1A1A] leading-snug mt-1.5 mb-2 group-hover:text-[#4A4A48] transition-colors line-clamp-2">
        {article.title}
      </h3>
      <p className="text-sm text-[#7A7670] leading-relaxed mb-3 line-clamp-2">{article.excerpt}</p>
      <div className="flex items-center gap-3 text-xs text-[#B8B4AC]">
        <span>{article.date}</span>
        <span className="w-1 h-1 rounded-full bg-[#D8D4CC]" />
        <span>{article.readTime} чтения</span>
        {(article.views || 0) > 0 && (
          <>
            <span className="w-1 h-1 rounded-full bg-[#D8D4CC]" />
            <span className="flex items-center gap-1" title="Просмотры">
              <Icon name="Eye" size={11} />
              {formatCardViews(article.views || 0)}
            </span>
          </>
        )}
      </div>
    </article>
  );
}

export function MenuItem({
  icon,
  label,
  onClick,
  badge,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-sm text-[#1A1A1A] transition-colors hover:bg-[#F5F3EF] flex items-center gap-3"
    >
      <Icon name={icon} size={14} className="text-[#9A9690]" />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className="bg-[#1A1A1A] text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

export function FeaturedPlaceholder() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" fill="none">
      <rect x="24" y="28" width="160" height="12" rx="6" fill="#D4CFC6" />
      <rect x="24" y="50" width="120" height="12" rx="6" fill="#DDD9D0" />
      <rect x="24" y="76" width="140" height="9" rx="4.5" fill="#E4E0D8" />
      <rect x="24" y="93" width="100" height="9" rx="4.5" fill="#E4E0D8" />
      <rect x="24" y="118" width="64" height="8" rx="4" fill="#CCC8C0" />
      <circle cx="178" cy="122" r="18" fill="#D4CFC6" opacity="0.6" />
    </svg>
  );
}

export function CardPlaceholder({ seed }: { seed: number }) {
  const palettes: [string, string, string][] = [
    ["#DDD9D0", "#EDE9E2", "#CFCAC1"],
    ["#C8D4CE", "#DCE8E4", "#BACEC6"],
    ["#D0C8D4", "#E4DCE8", "#C2BAC6"],
    ["#D4CEC8", "#E8E2DC", "#C6C0BA"],
    ["#C8CCD4", "#DCE0E8", "#BAC0C6"],
  ];
  const [c1, c2, c3] = palettes[seed % palettes.length];
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill={c2} />
      <circle cx="270" cy="40" r="55" fill={c1} opacity="0.5" />
      <rect x="28" y="56" width="150" height="9" rx="4.5" fill={c1} />
      <rect x="28" y="74" width="110" height="9" rx="4.5" fill={c1} opacity="0.7" />
      <rect x="28" y="92" width="130" height="9" rx="4.5" fill={c1} opacity="0.45" />
      <rect x="28" y="118" width="55" height="7" rx="3.5" fill={c3} opacity="0.6" />
    </svg>
  );
}