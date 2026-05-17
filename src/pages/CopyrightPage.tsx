import InfoPage from "@/components/layout/InfoPage";

export default function CopyrightPage() {
  return (
    <InfoPage icon="Copyright" title="Копирайт и лицензии" subtitle="Кому принадлежат тексты и как их можно использовать">
      <section>
        <p>
          Все материалы, опубликованные на Медиуме, принадлежат их авторам. Платформа выступает
          посредником и не претендует на права на тексты, иллюстрации и фотографии.
        </p>
      </section>
      <section>
        <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-2">Цитирование</h2>
        <p>
          Цитирование разрешено в объёме, оправданном целью цитирования, с обязательной активной ссылкой
          на оригинал и указанием имени автора.
        </p>
      </section>
      <section>
        <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-2">Перепубликация</h2>
        <p>
          Полная или частичная перепубликация без письменного согласия автора запрещена. Свяжитесь с автором
          напрямую через личные сообщения, чтобы договориться об условиях.
        </p>
      </section>
      <section>
        <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-2">Нарушение прав</h2>
        <p>
          Если вы считаете, что ваши права нарушены публикацией на платформе — напишите нам в раздел
          «Помощь». Мы рассмотрим обращение в течение 7 рабочих дней.
        </p>
      </section>
      <p className="text-sm text-[#9A9690] pt-4 border-t border-[#E8E4DC]">
        © {new Date().getFullYear()} Медиум. Все права защищены.
      </p>
    </InfoPage>
  );
}
