// Тонкий адаптер над customRolesStore — сохраняет старое API для обратной совместимости
import { useState, useEffect } from "react";
import {
  getAllRoles,
  getRoleById,
  updateCustomRole,
  type CustomRole,
} from "./customRolesStore";
import type { Role } from "./authStore";

export type SystemRoleId = "user" | "editor" | "moderator" | "admin";
export const SYSTEM_ROLES: SystemRoleId[] = ["user", "editor", "moderator", "admin"];

export function getRoleLabel(role: Role): string {
  return getRoleById(role)?.name || role;
}

export function getRoleColor(role: Role): string {
  return getRoleById(role)?.color || "#F5F3EF";
}

export function getRoleTextColor(role: Role): string {
  return getRoleById(role)?.textColor || "#1A1A1A";
}

export function getRoleDescription(role: Role): string {
  return getRoleById(role)?.description || "";
}

export function getRoleIcon(role: Role): string {
  return getRoleById(role)?.icon || "User";
}

// Совместимость со старым AdminRoles
export interface CustomRoleInfo {
  label: string;
  color?: string;
  description?: string;
}

export function updateRole(role: Role, patch: Partial<CustomRoleInfo>) {
  updateCustomRole(role, {
    name: patch.label,
    color: patch.color,
    description: patch.description,
  });
}

export function resetRole(_role: Role) {
  // больше не используется — оставляем no-op для совместимости
}

export function resetAllRoles() {
  // больше не используется — оставляем no-op для совместимости
}

export function useRoles(): CustomRole[] {
  const [data, setData] = useState<CustomRole[]>(getAllRoles());
  useEffect(() => {
    const handler = () => setData([...getAllRoles()]);
    window.addEventListener("custom-roles-updated", handler);
    return () => window.removeEventListener("custom-roles-updated", handler);
  }, []);
  return data;
}

export const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  user: "Может читать статьи, ставить закладки, переписываться",
  editor: "Создаёт и редактирует свои статьи",
  moderator: "Редактирует и удаляет любые статьи",
  admin: "Полный доступ к админ-панели и настройкам",
};

export const ROLE_DEFAULT_LABEL: Record<string, string> = {
  user: "Пользователь",
  editor: "Редактор",
  moderator: "Модератор",
  admin: "Администратор",
};

export const ROLE_DEFAULT_COLOR: Record<string, string> = {
  user: "#F5F3EF",
  editor: "#E4E8DC",
  moderator: "#DCE0E8",
  admin: "#1A1A1A",
};
