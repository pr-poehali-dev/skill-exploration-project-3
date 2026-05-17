import { useState } from "react";
import Icon from "@/components/ui/icon";
import InfoPage from "@/components/layout/InfoPage";

const FAQ = [
  {
    q: "Как опубликовать статью?",
    a: "Войдите в аккаунт, нажмите «Написать статью» в боковой панели и заполните форму. Перед публикацией материал проходит модерацию.",
  },
  {
    q: "Как стать автором?",
    a: "Зарегистрируйтесь, заполните профиль и напишите редакции через раздел «Помощь» — мы рассмотрим вашу заявку.",
  },
  {
    q: "Где найти свои закладки?",
    a: "Закладки доступны в боковой панели в разделе «Личное». Чтобы сохранить статью — нажмите иконку закладки на странице материала.",
  },
  {
    q: "Как написать другому пользователю?",
    a: "Откройте профиль автора или статью и нажмите «Написать». Все диалоги сохраняются в разделе «Сообщения».",
  },
  {
    q: "Как пожаловаться на нарушение?",
    a: "Напишите в форму ниже с указанием ссылки на материал и сути нарушения. Мы ответим в течение 72 часов.",
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <InfoPage icon="LifeBuoy" title="Помощь" subtitle="Ответы на частые вопросы и связь с командой">
      <div className="space-y-2 not-prose">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="border border-[#E8E4DC] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FAFAF8] transition-colors"
              >
                <span className="font-medium text-[#1A1A1A]">{item.q}</span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-[#9A9690] transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-[#4A4A48] text-[14px] leading-relaxed animate-slide-down">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-5 rounded-xl bg-[#F5F3EF] border border-[#E8E4DC]">
        <p className="font-cormorant text-xl font-semibold text-[#1A1A1A] mb-1">Не нашли ответа?</p>
        <p className="text-sm text-[#6A6660] mb-3">Напишите нам напрямую — обычно отвечаем за день.</p>
        <a
          href="mailto:help@medium.local"
          className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
        >
          <Icon name="Mail" size={14} />
          help@medium.local
        </a>
      </div>
    </InfoPage>
  );
}
