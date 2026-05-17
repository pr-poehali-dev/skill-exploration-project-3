import { StatCard, ShortcutCard } from "./AdminShared";

interface Stats {
  users: number;
  articles: number;
  editors: number;
  moderators: number;
  admins: number;
  views: number;
}

interface Props {
  stats: Stats;
  onGoUsers: () => void;
  onGoArticles: () => void;
  onGoSeo: () => void;
  onGoCategories?: () => void;
  onGoRoles?: () => void;
}

export default function AdminOverview({ stats, onGoUsers, onGoArticles, onGoSeo, onGoCategories, onGoRoles }: Props) {
  return (
    <div className="animate-fade-in">
      <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A] mb-8">Обзор</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Пользователей" value={stats.users} icon="Users" />
        <StatCard label="Статей" value={stats.articles} icon="FileText" />
        <StatCard label="Просмотров" value={stats.views} icon="Eye" />
        <StatCard label="Редакторов" value={stats.editors} icon="PenLine" />
      </div>
      <div className="mb-12 text-xs text-[#9A9690]">
        Модераторов: {stats.moderators} · Администраторов: {stats.admins}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ShortcutCard
          title="Управление пользователями"
          description="Назначайте роли и удаляйте аккаунты"
          icon="Users"
          onClick={onGoUsers}
        />
        <ShortcutCard
          title="Управление статьями"
          description="Просмотр и удаление публикаций"
          icon="FileText"
          onClick={onGoArticles}
        />
        {onGoCategories && (
          <ShortcutCard
            title="Категории"
            description="Создание, редактирование и настройка"
            icon="Folder"
            onClick={onGoCategories}
          />
        )}
        {onGoRoles && (
          <ShortcutCard
            title="Роли"
            description="Названия, цвета и описания ролей"
            icon="ShieldCheck"
            onClick={onGoRoles}
          />
        )}
        <ShortcutCard
          title="SEO и метаданные"
          description="Title, description, OG-теги для сайта"
          icon="Search"
          onClick={onGoSeo}
        />
      </div>
    </div>
  );
}