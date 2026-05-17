import { useState, useEffect } from "react";
import { ROLE_LABELS, type Role } from "./authStore";

export interface CustomRoleInfo {
  // Переопределение названия системной роли
  label: string;
  // Цвет бейджа (необязательно)
  color?: string;
  // Описание (необязательно)
  description?: string;
}

const KEY = "blog_role_overrides";

const DEFAULT_COLORS: Record<Role, string> = {
  user: "#F5F3EF",
  editor: "#E4E8DC",
  moderator: "#DCE0E8",
  admin: "#1A1A1A",
};

const DEFAULT_TEXT_COLORS: Record<Role, string> = {
  user: "#6A6660",
  editor: "#5A6648",
  moderator: "#48566A",
  admin: "#FFFFFF",
};

type Overrides = Partial<Record<Role, CustomRoleInfo>>;

function load(): Overrides {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Overrides;
  } catch (e) {
    console.warn(e);
  }
  return {};
}

function save(items: Overrides) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("roles-updated"));
}

let _overrides: Overrides = load();

export const SYSTEM_ROLES: Role[] = ["user", "editor", "moderator", "admin"];

export function getRoleLabel(role: Role): string {
  return _overrides[role]?.label || ROLE_LABELS[role];
}

export function getRoleColor(role: Role): string {
  return _overrides[role]?.color || DEFAULT_COLORS[role];
}

export function getRoleTextColor(role: Role): string {
  return DEFAULT_TEXT_COLORS[role];
}

export function getRoleDescription(role: Role): string {
  return _overrides[role]?.description || DEFAULT_DESCRIPTIONS[role];
}

export function updateRole(role: Role, patch: Partial<CustomRoleInfo>) {
  _overrides = {
    ..._overrides,
    [role]: { ...(_overrides[role] || { label: ROLE_LABELS[role] }), ...patch },
  };
  save(_overrides);
}

export function resetRole(role: Role) {
  const next = { ..._overrides };
  delete next[role];
  _overrides = next;
  save(_overrides);
}

export function resetAllRoles() {
  _overrides = {};
  save(_overrides);
}

export function useRoles() {
  const [data, setData] = useState<Overrides>(_overrides);
  useEffect(() => {
    const handler = () => setData({ ..._overrides });
    window.addEventListener("roles-updated", handler);
    return () => window.removeEventListener("roles-updated", handler);
  }, []);
  return data;
}

export const DEFAULT_DESCRIPTIONS: Record<Role, string> = {
  user: "Может читать статьи, ставить закладки, переписываться",
  editor: "Создаёт и редактирует свои статьи",
  moderator: "Редактирует и удаляет любые статьи",
  admin: "Полный доступ к админ-панели и настройкам",
};

export const ROLE_DEFAULT_LABEL = ROLE_LABELS;
export const ROLE_DEFAULT_COLOR = DEFAULT_COLORS;
