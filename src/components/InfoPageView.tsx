import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useInfoPage, parseInfoContent, type InfoPageKey } from "@/store/infoPagesStore";

export default function InfoPageView({ pageKey }: { pageKey: InfoPageKey }) {
  const navigate = useNavigate();
  const page = useInfoPage(pageKey);
  const blocks = parseInfoContent(page.content);

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos">
      <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E4DC]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#6A6660] hover:text-[#1A1A1A] transition-colors"
          >
            <Icon name="ArrowLeft" size={15} />
            <span>Назад</span>
          </button>
          <div className="w-px h-4 bg-[#E8E4DC]" />
          <Icon name={page.icon} size={15} className="text-[#1A1A1A]" />
          <span className="font-cormorant font-semibold text-lg text-[#1A1A1A] truncate">{page.title}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-[#EDE9E2] flex items-center justify-center">
            <Icon name={page.icon} size={18} className="text-[#1A1A1A]" />
          </div>
          <h1 className="font-cormorant text-4xl font-semibold text-[#1A1A1A] tracking-tight">
            {page.title}
          </h1>
        </div>
        {page.subtitle && (
          <p className="text-[#7A7670] text-base mb-8 ml-[52px]">{page.subtitle}</p>
        )}

        <div className="text-[#2A2A28] text-[15px] leading-[1.75] space-y-5">
          {blocks.map((b, i) => {
            if (b.type === "h2")
              return (
                <h2 key={i} className="font-cormorant text-2xl font-semibold text-[#1A1A1A] pt-3">
                  {b.text}
                </h2>
              );
            if (b.type === "ul")
              return (
                <ul key={i} className="list-disc pl-5 space-y-1.5">
                  {b.items?.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              );
            return (
              <p key={i} className="whitespace-pre-wrap">
                {b.text}
              </p>
            );
          })}
        </div>

        {page.updatedAt > 0 && (
          <p className="text-xs text-[#9A9690] mt-12 pt-4 border-t border-[#E8E4DC]">
            Обновлено: {new Date(page.updatedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </main>
    </div>
  );
}
