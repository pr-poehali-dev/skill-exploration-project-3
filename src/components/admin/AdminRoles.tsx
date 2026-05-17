import Icon from "@/components/ui/icon";
import { useUsers, ROLE_LABELS, type Role } from "@/store/authStore";
import {
  SYSTEM_ROLES,
  useRoles,
  updateRole,
  resetRole,
  resetAllRoles,
  getRoleLabel,
  getRoleColor,
  getRoleTextColor,
  getRoleDescription,
  ROLE_DEFAULT_COLOR,
} from "@/store/rolesStore";

const ROLE_ICONS: Record<Role, string> = {
  user: "User",
  editor: "PenLine",
  moderator: "Shield",
  admin: "Crown",
};

const COLOR_PRESETS = [
  "#F5F3EF", "#E4E8DC", "#DCE0E8", "#EAE2ED",
  "#F0E4DC", "#DCE8E4", "#E8DCF0", "#F0E8DC",
  "#1A1A1A", "#3A5C3E", "#3E5C5C", "#5C3E5A",
];

export default function AdminRoles() {
  useRoles(); // re-render on changes
  const users = useUsers();

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Роли пользователей</h2>
          <p className="text-sm text-[#9A9690] mt-1">
            Переименуйте роли, измените цвет бейджей и описания
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Сбросить все настройки ролей к значениям по умолчанию?")) resetAllRoles();
          }}
          className="text-xs text-[#9A9690] hover:text-red-500 transition-colors"
        >
          Сбросить всё
        </button>
      </div>

      <div className="space-y-4">
        {SYSTEM_ROLES.map((role) => {
          const count = users.filter((u) => u.role === role).length;
          const label = getRoleLabel(role);
          const color = getRoleColor(role);
          const textColor = getRoleTextColor(role);
          const description = getRoleDescription(role);
          const isDefault =
            label === ROLE_LABELS[role] && color === ROLE_DEFAULT_COLOR[role];

          return (
            <div
              key={role}
              className="bg-white border border-[#E8E4DC] rounded-2xl overflow-hidden"
            >
              {/* Top row */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-[#F0EDE8]">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: color, color: textColor }}
                >
                  <Icon name={ROLE_ICONS[role]} fallback="User" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-cormorant text-xl font-semibold text-[#1A1A1A]">{label}</p>
                    <span
                      className="text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: color, color: textColor }}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-[#9A9690]">·</span>
                    <span className="text-xs text-[#9A9690]">
                      {count} {count === 1 ? "пользователь" : "пользователей"}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7670] mt-0.5 font-mono">system: {role}</p>
                </div>
                {!isDefault && (
                  <button
                    onClick={() => resetRole(role)}
                    className="text-xs text-[#9A9690] hover:text-[#1A1A1A] transition-colors"
                    title="Сбросить к системному"
                  >
                    Сбросить
                  </button>
                )}
              </div>

              {/* Editor */}
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
                    Название
                  </label>
                  <input
                    value={label}
                    onChange={(e) => updateRole(role, { label: e.target.value })}
                    className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
                    Описание
                  </label>
                  <input
                    value={description}
                    onChange={(e) => updateRole(role, { description: e.target.value })}
                    placeholder="Что может делать эта роль"
                    className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
                    Цвет бейджа
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateRole(role, { color: c })}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          color.toLowerCase() === c.toLowerCase()
                            ? "ring-2 ring-offset-2 ring-[#1A1A1A] scale-110"
                            : "hover:scale-105 border border-[#E8E4DC]"
                        }`}
                        style={{ background: c }}
                      />
                    ))}
                    <label className="w-8 h-8 rounded-lg border-2 border-dashed border-[#C8C4BC] flex items-center justify-center cursor-pointer hover:border-[#1A1A1A] transition-colors">
                      <Icon name="Pipette" size={12} className="text-[#9A9690]" />
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateRole(role, { color: e.target.value })}
                        className="sr-only"
                      />
                    </label>
                    <span className="text-xs text-[#9A9690] ml-2 font-mono">{color.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-[#F5F3EF] border border-[#E8E4DC] rounded-2xl text-xs text-[#6A6660] flex gap-3">
        <Icon name="Info" size={14} className="text-[#9A9690] shrink-0 mt-0.5" />
        <p>
          Можно переименовать системные роли — например, превратить «Редактор» в «Автор» или
          «Журналист». Права доступа остаются прежними.
        </p>
      </div>
    </div>
  );
}
