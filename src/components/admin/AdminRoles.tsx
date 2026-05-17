import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useUsers } from "@/store/authStore";
import {
  useCustomRoles,
  addRole,
  updateCustomRole,
  deleteCustomRole,
  PERMISSIONS,
  ROLE_COLOR_PRESETS,
  ROLE_ICON_PRESETS,
  type CustomRole,
  type Permission,
} from "@/store/customRolesStore";

interface EditState {
  id?: string;
  name: string;
  color: string;
  textColor: string;
  description: string;
  icon: string;
  permissions: Permission[];
}

const EMPTY: EditState = {
  name: "",
  color: ROLE_COLOR_PRESETS[0],
  textColor: "#1A1A1A",
  description: "",
  icon: ROLE_ICON_PRESETS[0],
  permissions: ["read_articles"],
};

export default function AdminRoles() {
  const roles = useCustomRoles();
  const users = useUsers();
  const [editor, setEditor] = useState<EditState | null>(null);
  const [error, setError] = useState("");

  const countByRole = (id: string) => users.filter((u) => u.role === id).length;

  const openCreate = () => {
    setError("");
    setEditor({ ...EMPTY });
  };

  const openEdit = (role: CustomRole) => {
    setError("");
    setEditor({
      id: role.id,
      name: role.name,
      color: role.color,
      textColor: role.textColor,
      description: role.description,
      icon: role.icon,
      permissions: [...role.permissions],
    });
  };

  const handleSave = () => {
    if (!editor) return;
    if (!editor.name.trim()) {
      setError("Введите название роли");
      return;
    }
    if (editor.id) {
      updateCustomRole(editor.id, {
        name: editor.name.trim(),
        color: editor.color,
        textColor: editor.textColor,
        description: editor.description.trim(),
        icon: editor.icon,
        permissions: editor.permissions,
      });
      setEditor(null);
    } else {
      const result = addRole({
        name: editor.name,
        color: editor.color,
        textColor: editor.textColor,
        description: editor.description,
        icon: editor.icon,
        permissions: editor.permissions,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditor(null);
    }
  };

  const handleDelete = (role: CustomRole) => {
    const count = countByRole(role.id);
    if (count > 0) {
      alert(`На этой роли ${count} пользователей. Сначала смените им роль и попробуйте снова.`);
      return;
    }
    if (confirm(`Удалить роль «${role.name}»?`)) {
      const result = deleteCustomRole(role.id);
      if (!result.ok) alert(result.error || "Не удалось удалить");
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
        <div>
          <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Роли и права</h2>
          <p className="text-sm text-[#9A9690] mt-1">
            Системные роли + любые пользовательские с собственным набором прав
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
        >
          <Icon name="Plus" size={14} />
          Создать роль
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const count = countByRole(role.id);
          return (
            <div
              key={role.id}
              className="rounded-2xl p-5 group transition-all hover:shadow-md"
              style={{ background: role.color, color: role.textColor }}
            >
              <div className="flex items-start gap-4 mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.4)" }}
                >
                  <Icon name={role.icon} fallback="User" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-cormorant text-xl font-semibold">{role.name}</p>
                    {role.isSystem && (
                      <span
                        className="text-[9px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(0,0,0,0.1)" }}
                      >
                        Системная
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">
                    {count} {count === 1 ? "пользователь" : "пользователей"} · {role.permissions.length} прав
                  </p>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(role)}
                    className="p-1.5 rounded-lg hover:bg-white/40 transition-colors"
                    title="Редактировать"
                  >
                    <Icon name="PenLine" size={14} />
                  </button>
                  {!role.isSystem && (
                    <button
                      onClick={() => handleDelete(role)}
                      className="p-1.5 rounded-lg hover:bg-white/40 transition-colors"
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                </div>
              </div>
              {role.description && (
                <p className="text-xs opacity-80 line-clamp-2 mb-3">{role.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.slice(0, 4).map((p) => {
                  const info = PERMISSIONS.find((x) => x.key === p);
                  return (
                    <span
                      key={p}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0,0,0,0.08)" }}
                    >
                      {info?.label || p}
                    </span>
                  );
                })}
                {role.permissions.length > 4 && (
                  <span className="text-[10px] opacity-70 px-2 py-0.5">
                    +{role.permissions.length - 4}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editor && (
        <RoleModal
          state={editor}
          setState={setEditor}
          error={error}
          isEdit={!!editor.id}
          isSystem={!!editor.id && roles.find((r) => r.id === editor.id)?.isSystem}
          onCancel={() => { setEditor(null); setError(""); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function RoleModal({
  state,
  setState,
  error,
  isEdit,
  isSystem,
  onCancel,
  onSave,
}: {
  state: EditState;
  setState: (s: EditState) => void;
  error: string;
  isEdit: boolean;
  isSystem?: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  const togglePermission = (p: Permission) => {
    const has = state.permissions.includes(p);
    setState({
      ...state,
      permissions: has ? state.permissions.filter((x) => x !== p) : [...state.permissions, p],
    });
  };

  const groups = Array.from(new Set(PERMISSIONS.map((p) => p.group)));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-[#E8E4DC] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#E8E4DC] flex items-center justify-between shrink-0">
          <p className="font-cormorant text-xl font-semibold text-[#1A1A1A]">
            {isEdit ? `Редактировать «${state.name}»` : "Новая роль"}
            {isSystem && (
              <span className="ml-2 text-[10px] font-medium uppercase tracking-widest text-[#7A7670] bg-[#F5F3EF] px-2 py-0.5 rounded-full">
                Системная
              </span>
            )}
          </p>
          <button onClick={onCancel} className="text-[#9A9690] hover:text-[#1A1A1A]">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Preview */}
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: state.color, color: state.textColor }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.4)" }}
            >
              <Icon name={state.icon} fallback="User" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-cormorant text-xl font-semibold">{state.name || "Название роли"}</p>
              {state.description && (
                <p className="text-xs opacity-80 line-clamp-1">{state.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
                Название
              </label>
              <input
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                placeholder="Например, Автор"
                className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
                Описание
              </label>
              <input
                value={state.description}
                onChange={(e) => setState({ ...state, description: e.target.value })}
                placeholder="Что эта роль делает"
                className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
              Цвет
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {ROLE_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setState({ ...state, color: c, textColor: isLight(c) ? "#1A1A1A" : "#FFFFFF" })}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    state.color.toLowerCase() === c.toLowerCase()
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
                  value={state.color}
                  onChange={(e) => setState({ ...state, color: e.target.value })}
                  className="sr-only"
                />
              </label>
              <span className="text-xs text-[#9A9690] ml-2 font-mono">{state.color.toUpperCase()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
              Иконка
            </label>
            <div className="grid grid-cols-8 gap-2">
              {ROLE_ICON_PRESETS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setState({ ...state, icon: ic })}
                  className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                    state.icon === ic
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-[#F5F3EF] text-[#4A4A48] hover:bg-[#E8E4DC]"
                  }`}
                  title={ic}
                >
                  <Icon name={ic} fallback="User" size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">
                Права доступа
              </label>
              <span className="text-[11px] text-[#9A9690]">
                Выбрано: {state.permissions.length} из {PERMISSIONS.length}
              </span>
            </div>
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group}>
                  <p className="text-[10px] font-medium text-[#9A9690] uppercase tracking-widest mb-2">
                    {group}
                  </p>
                  <div className="space-y-1">
                    {PERMISSIONS.filter((p) => p.group === group).map((p) => {
                      const checked = state.permissions.includes(p.key);
                      return (
                        <label
                          key={p.key}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            checked ? "bg-[#F5F3EF]" : "hover:bg-[#FAFAF8]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(p.key)}
                            className="w-4 h-4 accent-[#1A1A1A] mt-0.5"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-[#1A1A1A]">{p.label}</p>
                            <p className="text-xs text-[#9A9690]">{p.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E8E4DC] flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onCancel}
            className="text-sm text-[#6A6660] hover:text-[#1A1A1A] px-4 py-2 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onSave}
            className="bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors flex items-center gap-2"
          >
            <Icon name="Check" size={14} />
            {isEdit ? "Сохранить" : "Создать роль"}
          </button>
        </div>
      </div>
    </div>
  );
}

function isLight(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
