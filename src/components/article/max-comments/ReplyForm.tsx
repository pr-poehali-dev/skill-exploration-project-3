import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function ReplyForm({
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
