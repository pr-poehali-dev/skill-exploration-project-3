import { useState } from "react";
import Icon from "@/components/ui/icon";
import { MaxLogo } from "./maxCommentsUtils";

export default function MaxConnectCard({ onConnect }: { onConnect: (nick: string, name: string) => void }) {
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
