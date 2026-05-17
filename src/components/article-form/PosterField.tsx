import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

interface Props {
  cover: string | undefined;
  setCover: (v: string | undefined) => void;
  /** Контекст для автогенерации постера через ИИ */
  title?: string;
  excerpt?: string;
  category?: string;
}

const MAX_BYTES = 4 * 1024 * 1024; // 4 МБ
const GENERATE_URL = (func2url as Record<string, string>)["generate-poster"];

export default function PosterField({ cover, setCover, title, excerpt, category }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Можно загружать только изображения");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Файл слишком большой. Максимум 4 МБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCover(String(reader.result));
    };
    reader.onerror = () => setError("Не удалось прочитать файл");
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    setCover(u);
    setUrlInput("");
  };

  const handleGenerate = async () => {
    const t = (title || "").trim();
    if (!t) {
      setError("Сначала введите заголовок статьи — он нужен для генерации");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch(GENERATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          excerpt: (excerpt || "").trim(),
          category: (category || "").trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Не удалось сгенерировать постер (код ${res.status})`);
        return;
      }
      if (!data.url) {
        setError("ИИ не вернул изображение, попробуйте ещё раз");
        return;
      }
      setCover(data.url);
    } catch (e) {
      setError(`Сбой соединения: ${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  const canGenerate = !!(title && title.trim());

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest">
          Постер статьи
        </label>
        <button
          onClick={handleGenerate}
          disabled={generating || !canGenerate}
          title={canGenerate ? "Сгенерировать постер через YandexART" : "Введите заголовок, чтобы сгенерировать"}
          className="text-xs font-medium text-[#1A1A1A] bg-gradient-to-r from-[#FFE9D6] via-[#FFD9F0] to-[#E0D6FF] hover:opacity-90 px-3 py-1.5 rounded-full flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {generating ? (
            <>
              <Icon name="Loader" size={12} className="animate-spin" />
              Генерируем...
            </>
          ) : (
            <>
              <Icon name="Sparkles" size={12} />
              {cover ? "Сгенерировать заново" : "Сгенерировать ИИ"}
            </>
          )}
        </button>
      </div>

      {cover ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#E8E4DC] bg-[#F5F3EF] group">
          <img
            src={cover}
            alt="Постер"
            className="w-full aspect-[16/7] object-cover"
            onError={() => setError("Не удалось загрузить изображение по ссылке")}
          />
          {generating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Icon name="Sparkles" size={28} className="text-[#1A1A1A] animate-pulse" />
              <p className="text-sm font-medium text-[#1A1A1A]">Рисуем новый постер...</p>
              <p className="text-xs text-[#6A6660]">YandexART, обычно 5-15 секунд</p>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="Image" size={12} />
              Заменить
            </button>
            <button
              onClick={() => setCover(undefined)}
              className="bg-white/90 backdrop-blur-sm text-red-600 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="Trash2" size={12} />
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          onClick={() => !generating && fileRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors aspect-[16/7] flex flex-col items-center justify-center text-center px-6 ${
            dragOver
              ? "border-[#1A1A1A] bg-[#F5F3EF]"
              : "border-[#E0DDD8] bg-white hover:border-[#C8C4BC] hover:bg-[#FAFAF8]"
          }`}
        >
          {generating ? (
            <>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFE9D6] via-[#FFD9F0] to-[#E0D6FF] flex items-center justify-center mb-3">
                <Icon name="Sparkles" size={22} className="text-[#1A1A1A] animate-pulse" />
              </div>
              <p className="font-cormorant text-xl text-[#1A1A1A] mb-1">ИИ рисует постер...</p>
              <p className="text-xs text-[#9A9690]">Обычно занимает 5-15 секунд</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[#F0EDE8] flex items-center justify-center mb-3">
                <Icon name="ImagePlus" size={22} className="text-[#6A6660]" />
              </div>
              <p className="font-cormorant text-xl text-[#1A1A1A] mb-1">Добавить постер</p>
              <p className="text-xs text-[#9A9690]">
                Перетащите файл, нажмите чтобы выбрать, или сгенерируйте через ИИ
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 border border-[#E8E4DC] rounded-full px-3 py-1.5 focus-within:border-[#1A1A1A] transition-colors">
          <Icon name="Link" size={12} className="text-[#9A9690]" />
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyUrl();
              }
            }}
            placeholder="Или вставьте ссылку на изображение"
            className="flex-1 bg-transparent outline-none text-xs text-[#1A1A1A] placeholder:text-[#B8B4AC]"
          />
        </div>
        <button
          onClick={handleApplyUrl}
          disabled={!urlInput.trim()}
          className="text-xs text-[#6A6660] hover:text-[#1A1A1A] px-3 py-1.5 disabled:opacity-40"
        >
          Применить
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      <p className="text-[11px] text-[#B8B4AC] mt-2">
        Можно загрузить файл, вставить ссылку или сгенерировать постер по заголовку через YandexART. JPG/PNG до 4 МБ.
      </p>
    </div>
  );
}
