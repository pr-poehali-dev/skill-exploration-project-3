import { useState, useEffect } from "react";

// Возможные права
export type Permission =
  | "read_articles"
  | "bookmark_articles"
  | "send_messages"
  | "create_article"
  | "edit_own_article"
  | "edit_any_article"
  | "delete_any_article"
  | "manage_users"
  | "manage_categories"
  | "manage_seo"
  | "manage_theme"
  | "manage_roles";

export interface PermissionInfo {
  key: Permission;
  label: string;
  description: string;
  group: string;
}

export const PERMISSIONS: PermissionInfo[] = [
  { key: "read_articles",     label: "Чтение статей",       description: "Просмотр публичных материалов",       group: "Контент" },
  { key: "bookmark_articles", label: "Закладки",            description: "Сохранять статьи к себе",             group: "Контент" },
  { key: "send_messages",     label: "Сообщения",           description: "Переписка с другими пользователями",  group: "Контент" },
  { key: "create_article",    label: "Создавать статьи",    description: "Публикация новых материалов",         group: "Редакция" },
  { key: "edit_own_article",  label: "Редактировать свои",  description: "Изменять собственные публикации",     group: "Редакция" },
  { key: "edit_any_article",  label: "Редактировать любые", description: "Изменять статьи других авторов",      group: "Редакция" },
  { key: "delete_any_article",label: "Удалять любые",       description: "Удаление чужих публикаций",           group: "Редакция" },
  { key: "manage_users",      label: "Пользователи",        description: "Создание, удаление, смена ролей",     group: "Админ" },
  { key: "manage_categories", label: "Категории",           description: "CRUD категорий статей",               group: "Админ" },
  { key: "manage_seo",        label: "SEO",                 description: "Метаданные сайта и страниц",          group: "Админ" },
  { key: "manage_theme",      label: "Тема",                description: "Цвета, шрифты, скругление",           group: "Админ" },
  { key: "manage_roles",      label: "Роли",                description: "Управление ролями и правами",         group: "Админ" },
];

export interface CustomRole {
  id: string;
  name: string;
  color: string;
  textColor: string;
  description: string;
  icon: string;
  permissions: Permission[];
  isSystem: boolean;
}

const KEY = "blog_custom_roles";

// Стартовые системные роли. Они нередактируемы по правам, но имя/цвет можно менять.
const SEED_ROLES: CustomRole[] = [
  {
    id: "user",
    name: "Пользователь",
    color: "#F5F3EF",
    textColor: "#6A6660",
    description: "Может читать статьи, ставить закладки, переписываться",
    icon: "User",
    permissions: ["read_articles", "bookmark_articles", "send_messages"],
    isSystem: true,
  },
  {
    id: "editor",
    name: "Редактор",
    color: "#E4E8DC",
    textColor: "#5A6648",
    description: "Создаёт и редактирует свои статьи",
    icon: "PenLine",
    permissions: ["read_articles", "bookmark_articles", "send_messages", "create_article", "edit_own_article"],
    isSystem: true,
  },
  {
    id: "moderator",
    name: "Модератор",
    color: "#DCE0E8",
    textColor: "#48566A",
    description: "Редактирует и удаляет любые статьи",
    icon: "Shield",
    permissions: ["read_articles", "bookmark_articles", "send_messages", "create_article", "edit_own_article", "edit_any_article", "delete_any_article"],
    isSystem: true,
  },
  {
    id: "admin",
    name: "Администратор",
    color: "#1A1A1A",
    textColor: "#FFFFFF",
    description: "Полный доступ к админ-панели и настройкам",
    icon: "Crown",
    permissions: PERMISSIONS.map((p) => p.key),
    isSystem: true,
  },
];

function load(): CustomRole[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as CustomRole[];
  } catch (e) {
    console.warn(e);
  }
  localStorage.setItem(KEY, JSON.stringify(SEED_ROLES));
  return SEED_ROLES;
}

function save(items: CustomRole[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("custom-roles-updated"));
}

let _roles: CustomRole[] = load();

export function getAllRoles(): CustomRole[] {
  return _roles;
}

export function getRoleById(id: string): CustomRole | undefined {
  return _roles.find((r) => r.id === id);
}

export function addRole(input: Omit<CustomRole, "id" | "isSystem">): { ok: true; role: CustomRole } | { ok: false; error: string } {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Введите название роли" };
  const id = slugify(name);
  if (!id) return { ok: false, error: "Имя должно содержать латинские буквы или цифры" };
  if (_roles.some((r) => r.id === id)) return { ok: false, error: "Роль с таким именем уже существует" };
  const role: CustomRole = { ...input, name, id, isSystem: false };
  _roles = [..._roles, role];
  save(_roles);
  return { ok: true, role };
}

export function updateCustomRole(id: string, patch: Partial<Omit<CustomRole, "id" | "isSystem">>) {
  _roles = _roles.map((r) => (r.id === id ? { ...r, ...patch } : r));
  save(_roles);
}

export function deleteCustomRole(id: string): { ok: boolean; error?: string } {
  const role = _roles.find((r) => r.id === id);
  if (!role) return { ok: false, error: "Роль не найдена" };
  if (role.isSystem) return { ok: false, error: "Системную роль нельзя удалить" };
  _roles = _roles.filter((r) => r.id !== id);
  save(_roles);
  return { ok: true };
}

export function useCustomRoles() {
  const [items, setItems] = useState<CustomRole[]>(_roles);
  useEffect(() => {
    const handler = () => setItems([..._roles]);
    window.addEventListener("custom-roles-updated", handler);
    return () => window.removeEventListener("custom-roles-updated", handler);
  }, []);
  return items;
}

export function hasPermission(roleId: string | undefined | null, permission: Permission): boolean {
  if (!roleId) return false;
  const role = getRoleById(roleId);
  return !!role && role.permissions.includes(permission);
}

function slugify(text: string): string {
  const map: Record<string, string> = {
    а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",
    н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",
    ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
  };
  return text.toLowerCase().split("").map((ch) => map[ch] ?? ch).join("")
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export const ROLE_COLOR_PRESETS = [
  "#F5F3EF", "#E4E8DC", "#DCE0E8", "#EAE2ED",
  "#F0E4DC", "#DCE8E4", "#E8DCF0", "#F0E8DC",
  "#1A1A1A", "#3A5C3E", "#3E5C5C", "#5C3E5A",
];

export const ROLE_ICON_PRESETS = [
  "User", "PenLine", "Shield", "Crown",
  "Star", "Sparkles", "Award", "Gem",
  "Heart", "Coffee", "Code", "Briefcase",
  "Eye", "Headphones", "Camera", "Rocket",
];
