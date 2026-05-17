import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  updateUserRole,
  deleteUser,
  ROLE_LABELS,
  type Role,
  type User,
} from "@/store/authStore";

const ROLES: Role[] = ["user", "editor", "moderator", "admin"];

const ROLE_COLORS: Record<Role, string> = {
  user: "bg-[#F5F3EF] text-[#6A6660]",
  editor: "bg-[#E4E8DC] text-[#5A6648]",
  moderator: "bg-[#DCE0E8] text-[#48566A]",
  admin: "bg-[#1A1A1A] text-white",
};

interface Props {
  users: User[];
  filteredUsers: User[];
  currentUser: User | null;
  search: string;
  onSearchChange: (v: string) => void;
}

export default function AdminUsers({ users, filteredUsers, currentUser, search, onSearchChange }: Props) {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Пользователи</h2>
          <span className="text-sm text-[#9A9690]">{filteredUsers.length} из {users.length}</span>
        </div>
        <div className="relative">
          <Icon name="Search" size={14} className="text-[#9A9690] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск..."
            className="bg-white border border-[#E8E4DC] rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#B8B4AC] w-56"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E8E4DC] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E4DC] text-xs text-[#7A7670] uppercase tracking-widest">
              <th className="text-left font-medium px-5 py-3">Пользователь</th>
              <th className="text-left font-medium px-5 py-3 hidden sm:table-cell">E-mail</th>
              <th className="text-left font-medium px-5 py-3">Роль</th>
              <th className="text-right font-medium px-5 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b border-[#F0EDE8] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
                      <span className="font-cormorant font-semibold text-[#4A4A48]">
                        {u.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{u.name}</p>
                      <p className="text-xs text-[#9A9690] sm:hidden">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#6A6660] hidden sm:table-cell">{u.email}</td>
                <td className="px-5 py-4">
                  <select
                    value={u.role}
                    onChange={(e) => updateUserRole(u.id, e.target.value as Role)}
                    disabled={u.id === currentUser?.id}
                    className={`text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${ROLE_COLORS[u.role]}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="text-[#1A1A1A] bg-white normal-case">
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4 text-right">
                  {u.id === currentUser?.id ? (
                    <span className="text-xs text-[#B8B4AC]">Это вы</span>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/messages?u=${u.id}`)}
                        className="text-[#9A9690] hover:text-[#1A1A1A] transition-colors p-1.5"
                        title="Написать"
                      >
                        <Icon name="MessageCircle" size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить пользователя «${u.name}»?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="text-[#C8C4BC] hover:text-red-500 transition-colors p-1.5"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-16 text-[#9A9690]">
            <Icon name="UserX" size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Никого не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}
