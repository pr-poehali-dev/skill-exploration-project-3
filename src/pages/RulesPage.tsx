import InfoPage from "@/components/layout/InfoPage";

export default function RulesPage() {
  return (
    <InfoPage icon="ScrollText" title="Правила сообщества" subtitle="Кодекс уважительного общения и публикаций">
      <section>
        <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-2">1. Общие принципы</h2>
        <p>
          Медиум — пространство для вдумчивых текстов и спокойных дискуссий. Мы ценим уважение, любопытство
          и честность. Эти правила помогают сохранять атмосферу журнала, а не социальной сети.
        </p>
      </section>
      <section>
        <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-2">2. Что запрещено</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Оскорбления, травля и язык вражды.</li>
          <li>Плагиат и публикация чужих текстов без согласия автора.</li>
          <li>Реклама без указания и спам в комментариях.</li>
          <li>Дезинформация и контент, нарушающий закон.</li>
        </ul>
      </section>
      <section>
        <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-2">3. Публикации</h2>
        <p>
          Перед публикацией убедитесь, что текст вычитан, источники указаны, а изображения используются законно.
          Редакторы оставляют за собой право снять материал, нарушающий правила.
        </p>
      </section>
      <section>
        <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-2">4. Жалобы</h2>
        <p>
          Если вы заметили нарушение — сообщите модераторам через раздел «Помощь». Каждое обращение
          рассматривается в течение 72 часов.
        </p>
      </section>
    </InfoPage>
  );
}
