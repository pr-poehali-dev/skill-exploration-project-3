import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  updateUserRole,
  deleteUser,
  createUser,
  type Role,
  type User,
} from "@/store/authStore";
import { SYSTEM_ROLES, useRoles, getRoleLabel, getRoleColor, getRoleTextColor } from "@/store/rolesStore";

interface Props {
  users: User[];
  filteredUsers: User[];
  currentUser: User | null;
  search: string;
  onSearchChange: (v: string) => void;
}

export default function AdminUsers({ users, filteredUsers, currentUser, search, onSearchChange }: Props) {
  const navigate = useNavigate();
  useRoles(); // re-render when role labels/colors change
  const [creating, setCreating] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Пользователи</h2>
          <span className="text-sm text-[#9A9690]">{filteredUsers.length} из {users.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon name="Search" size={14} className="text-[#9A9690] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Поиск..."
              className="bg-white border border-[#E8E4DC] rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#B8B4AC] w-56"
            />
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
          >
            <Icon name="UserPlus" size={14} />
            Создать
          </button>
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
            {filteredUsers.map((u) => {
              const color = getRoleColor(u.role);
              const textColor = getRoleTextColor(u.role);
              return (
                <tr key={u.id} className="border-b border-[#F0EDE8] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0 overflow-hidden">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-cormorant font-semibold text-[#4A4A48]">
                            {u.name[0].toUpperCase()}
                          </span>
                        )}
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
                      className="text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ background: color, color: textColor }}
                    >
                      {SYSTEM_ROLES.map((r) => (
                        <option key={r} value={r} className="text-[#1A1A1A] bg-white normal-case">
                          {getRoleLabel(r)}
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
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-16 text-[#9A9690]">
            <Icon name="UserX" size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Никого не найдено</p>
          </div>
        )}
      </div>

      {creating && <CreateUserModal onClose={() => setCreating(false)} />}
    </div>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    setError("");
    setSaving(true);
    setTimeout(() => {
      const result = createUser({ name, email, password, role });
      setSaving(false);
      if (result.ok) onClose();
      else setError(result.error);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md border border-[#E8E4DC] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E4DC] flex items-center justify-between">
          <p className="font-cormorant text-xl font-semibold text-[#1A1A1A]">Новый пользователь</p>
          <button onClick={onClose} className="text-[#9A9690] hover:text-[#1A1A1A]">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <Field label="Имя" value={name} onChange={setName} placeholder="Иван Петров" autoFocus />
          <Field label="E-mail" value={email} onChange={setEmail} placeholder="ivan@example.com" type="email" />
          <Field label="Пароль" value={password} onChange={setPassword} placeholder="Минимум 6 символов" type="password" />

          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2.5">
              Роль
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SYSTEM_ROLES.map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`text-xs font-medium uppercase tracking-widest px-3 py-2 rounded-lg border transition-all ${
                      active ? "border-[#1A1A1A]" : "border-[#E8E4DC] hover:border-[#C8C4BC]"
                    }`}
                    style={
                      active
                        ? { background: getRoleColor(r), color: getRoleTextColor(r) }
                        : undefined
                    }
                  >
                    {getRoleLabel(r)}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E8E4DC] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-[#6A6660] hover:text-[#1A1A1A] px-4 py-2 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="UserPlus" size={14} />}
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">{label}</label>
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
      />
    </div>
  );
}
