import Icon from "@/components/ui/icon";
import type { ArticleSEO } from "@/data/articles";
import SeoField from "./SeoField";
import { slugify } from "./articleFormUtils";

interface Props {
  seoOpen: boolean;
  setSeoOpen: (v: boolean) => void;
  seo: ArticleSEO;
  setSeo: (s: ArticleSEO) => void;
  title: string;
  excerpt: string;
}

export default function ArticleSeoSection({ seoOpen, setSeoOpen, seo, setSeo, title, excerpt }: Props) {
  return (
    <div className="border border-[#E8E4DC] rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setSeoOpen(!seoOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#FAFAF8] transition-colors"
      >
        <Icon name="Search" size={16} className="text-[#1A1A1A]" />
        <div className="flex-1">
          <p className="text-sm font-medium text-[#1A1A1A]">SEO и метаданные</p>
          <p className="text-xs text-[#9A9690] mt-0.5">
            Заголовок для поисковиков, описание, ключевые слова, превью для соцсетей
          </p>
        </div>
        <Icon name={seoOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-[#9A9690]" />
      </button>

      {seoOpen && (
        <div className="px-5 pb-5 pt-1 space-y-5 border-t border-[#E8E4DC] animate-fade-in">
          <SeoField
            label="SEO-заголовок"
            hint="60–70 символов. Что увидят в Google. Пустое — возьмётся из заголовка"
            value={seo.title || ""}
            max={70}
            onChange={(v) => setSeo({ ...seo, title: v })}
            placeholder={title || "Заголовок для поисковиков"}
          />
          <SeoField
            label="Meta-описание"
            hint="150–160 символов. Сниппет под заголовком в выдаче"
            value={seo.description || ""}
            max={160}
            textarea
            onChange={(v) => setSeo({ ...seo, description: v })}
            placeholder={excerpt || "Краткое описание для поисковой выдачи"}
          />
          <SeoField
            label="Ключевые слова"
            hint="Через запятую"
            value={seo.keywords || ""}
            onChange={(v) => setSeo({ ...seo, keywords: v })}
            placeholder="дизайн, минимализм, типографика"
          />
          <SeoField
            label="Slug (URL)"
            hint="Только латиница, цифры и дефисы. Пустое — сгенерируется"
            value={seo.slug || ""}
            onChange={(v) => setSeo({ ...seo, slug: v })}
            placeholder={slugify(title) || "minimalism-design"}
          />
          <SeoField
            label="OG-изображение (URL)"
            hint="Превью при шеринге в соцсетях. 1200×630"
            value={seo.ogImage || ""}
            onChange={(v) => setSeo({ ...seo, ogImage: v })}
            placeholder="https://example.com/cover.jpg"
          />
          <SeoField
            label="Canonical URL"
            hint="Необязательно. Указывает каноническую версию страницы"
            value={seo.canonical || ""}
            onChange={(v) => setSeo({ ...seo, canonical: v })}
            placeholder="https://example.com/article/123"
          />
          <label className="flex items-center gap-3 text-sm text-[#4A4A48] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={seo.noindex || false}
              onChange={(e) => setSeo({ ...seo, noindex: e.target.checked })}
              className="w-4 h-4 accent-[#1A1A1A]"
            />
            Скрыть от поисковиков (noindex, nofollow)
          </label>

          {/* Preview */}
          <div className="mt-2 pt-4 border-t border-[#E8E4DC]">
            <p className="text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-3">Как увидит Google</p>
            <div className="border border-[#E8E4DC] rounded-xl p-4 bg-[#FAFAF8]">
              <p className="text-xs text-[#3a7c2a] mb-1 truncate">
                https://medium.example/article/{seo.slug || slugify(title) || "novaya-statya"}
              </p>
              <p className="text-[18px] text-[#1a0dab] leading-snug mb-1 line-clamp-1">
                {seo.title || title || "Заголовок статьи"}
              </p>
              <p className="text-sm text-[#4d5156] line-clamp-2">
                {seo.description || excerpt || "Описание появится здесь после заполнения краткого описания статьи."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
