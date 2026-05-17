import InfoPage from "@/components/layout/InfoPage";

export default function AboutPage() {
  return (
    <InfoPage icon="Info" title="О проекте" subtitle="Журнал для тех, кто любит читать длинные тексты">
      <p>
        Медиум — независимый онлайн-журнал и сообщество авторов. Мы собираем тексты о культуре,
        технологиях, обществе и человеке — без шумной ленты и кликбейта.
      </p>
      <p>
        Здесь нет алгоритма, который решает, что вам читать. Только редакторы, авторы и читатели,
        у которых есть общее любопытство.
      </p>
      <section>
        <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-2">Команда</h2>
        <p>
          Над проектом работает небольшая команда редакторов, дизайнеров и разработчиков. Мы открыты
          к новым авторам и предложениям сотрудничества.
        </p>
      </section>
      <section>
        <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A] mb-2">Контакты</h2>
        <p>
          По всем вопросам — пишите на <a className="text-[#1A1A1A] underline" href="mailto:hi@medium.local">hi@medium.local</a>.
        </p>
      </section>
    </InfoPage>
  );
}
