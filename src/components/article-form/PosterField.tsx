import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  cover: string | undefined;
  setCover: (v: string | undefined) => void;
}

const MAX_BYTES = 4 * 1024 * 1024; // 4 МБ

export default function PosterField({ cover, setCover }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

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

  return (
    <div>
      <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-3">
        Постер статьи
      </label>

      {cover ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#E8E4DC] bg-[#F5F3EF] group">
          <img
            src={cover}
            alt="Постер"
            className="w-full aspect-[16/7] object-cover"
            onError={() => setError("Не удалось загрузить изображение по ссылке")}
          />
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
          onClick={() => fileRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors aspect-[16/7] flex flex-col items-center justify-center text-center px-6 ${
            dragOver
              ? "border-[#1A1A1A] bg-[#F5F3EF]"
              : "border-[#E0DDD8] bg-white hover:border-[#C8C4BC] hover:bg-[#FAFAF8]"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#F0EDE8] flex items-center justify-center mb-3">
            <Icon name="ImagePlus" size={22} className="text-[#6A6660]" />
          </div>
          <p className="font-cormorant text-xl text-[#1A1A1A] mb-1">Добавить постер</p>
          <p className="text-xs text-[#9A9690]">
            Перетащите файл или нажмите, чтобы выбрать · JPG, PNG, WEBP до 4 МБ
          </p>
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
        Постер показывается в карточке статьи и в шапке материала. Если не задан — используется графическая заглушка.
      </p>
    </div>
  );
}
