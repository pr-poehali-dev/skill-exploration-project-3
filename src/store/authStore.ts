import { useState, useEffect } from "react";
import { addNotification } from "./notificationsStore";

export type Role = "user" | "moderator" | "editor" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: number;
  avatar?: string;
}

interface UserRecord extends User {
  passwordHash: string;
}

const USERS_KEY = "blog_users";
const SESSION_KEY = "blog_session";

// Lightweight hash — sufficient for client-side prototype
function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h) ^ input.charCodeAt(i);
  return String(h >>> 0);
}

function loadUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as UserRecord[];
  } catch (e) {
    console.warn(e);
  }
  // Seed default admin so panel is reachable
  const admin: UserRecord = {
    id: 1,
    email: "admin@blog.ru",
    name: "Администратор",
    role: "admin",
    createdAt: Date.now(),
    passwordHash: hash("admin123"),
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([admin]));
  return [admin];
}

function saveUsers(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as User;
  } catch (e) {
    console.warn(e);
  }
  return null;
}

function saveSession(user: User | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

let _users: UserRecord[] = loadUsers();
let _current: User | null = loadSession();

export function getCurrentUser(): User | null {
  return _current;
}

export function listUsers(): User[] {
  return _users.map(({ passwordHash, ...u }) => u);
}

export function registerUser(input: {
  email: string;
  password: string;
  name: string;
}): { ok: true; user: User } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) return { ok: false, error: "Введите корректный e-mail" };
  if (input.password.length < 6) return { ok: false, error: "Пароль должен быть не короче 6 символов" };
  if (!input.name.trim()) return { ok: false, error: "Введите имя" };
  if (_users.some((u) => u.email === email)) return { ok: false, error: "Этот e-mail уже зарегистрирован" };

  const newUser: UserRecord = {
    id: Date.now(),
    email,
    name: input.name.trim(),
    role: "user",
    createdAt: Date.now(),
    passwordHash: hash(input.password),
  };
  _users = [..._users, newUser];
  saveUsers(_users);

  const { passwordHash, ...publicUser } = newUser;
  _current = publicUser;
  saveSession(_current);
  return { ok: true, user: publicUser };
}

export function loginUser(
  email: string,
  password: string
): { ok: true; user: User } | { ok: false; error: string } {
  const e = email.trim().toLowerCase();
  const user = _users.find((u) => u.email === e);
  if (!user) return { ok: false, error: "Пользователь не найден" };
  if (user.passwordHash !== hash(password)) return { ok: false, error: "Неверный пароль" };
  const { passwordHash, ...publicUser } = user;
  _current = publicUser;
  saveSession(_current);
  return { ok: true, user: publicUser };
}

export function logoutUser() {
  _current = null;
  saveSession(null);
}

export function updateUserRole(userId: number, role: Role) {
  const target = _users.find((u) => u.id === userId);
  _users = _users.map((u) => (u.id === userId ? { ...u, role } : u));
  saveUsers(_users);
  if (_current?.id === userId) {
    _current = { ..._current, role };
    saveSession(_current);
  } else {
    window.dispatchEvent(new Event("auth-changed"));
  }
  if (target && target.role !== role) {
    addNotification({
      userId,
      type: "role",
      title: "Ваша роль изменена",
      text: `Теперь вы — ${ROLE_LABELS[role]}`,
      link: "/profile",
    });
  }
}

export function deleteUser(userId: number): { ok: boolean; error?: string } {
  if (_current?.id === userId) return { ok: false, error: "Нельзя удалить самого себя" };
  _users = _users.filter((u) => u.id !== userId);
  saveUsers(_users);
  window.dispatchEvent(new Event("auth-changed"));
  return { ok: true };
}

export function createUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
}): { ok: true; user: User } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) return { ok: false, error: "Введите корректный e-mail" };
  if (input.password.length < 6) return { ok: false, error: "Пароль должен быть не короче 6 символов" };
  if (!input.name.trim()) return { ok: false, error: "Введите имя" };
  if (_users.some((u) => u.email === email)) return { ok: false, error: "Этот e-mail уже зарегистрирован" };

  const newUser: UserRecord = {
    id: Date.now(),
    email,
    name: input.name.trim(),
    role: input.role,
    createdAt: Date.now(),
    passwordHash: hash(input.password),
  };
  _users = [..._users, newUser];
  saveUsers(_users);
  window.dispatchEvent(new Event("auth-changed"));
  const { passwordHash: _ph, ...publicUser } = newUser;
  return { ok: true, user: publicUser };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>(() => listUsers());
  useEffect(() => {
    const handler = () => setUsers(listUsers());
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, []);
  return users;
}

export function updateCurrentUser(patch: Partial<Pick<User, "name" | "avatar">>) {
  if (!_current) return;
  _users = _users.map((u) => (u.id === _current!.id ? { ...u, ...patch } : u));
  saveUsers(_users);
  _current = { ..._current, ...patch };
  saveSession(_current);
}

// React hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(_current);
  useEffect(() => {
    const handler = () => setUser(getCurrentUser());
    window.addEventListener("auth-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("auth-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return user;
}

// Permission helpers
export const canCreateArticle = (u: User | null) =>
  !!u && (u.role === "editor" || u.role === "moderator" || u.role === "admin");

export const canEditArticle = (u: User | null, authorId?: number) => {
  if (!u) return false;
  if (u.role === "admin" || u.role === "moderator") return true;
  if (u.role === "editor" && authorId === u.id) return true;
  return false;
};

export const canDeleteArticle = (u: User | null, authorId?: number) => {
  if (!u) return false;
  if (u.role === "admin" || u.role === "moderator") return true;
  if (u.role === "editor" && authorId === u.id) return true;
  return false;
};

export const isAdmin = (u: User | null) => u?.role === "admin";

export const ROLE_LABELS: Record<Role, string> = {
  user: "Пользователь",
  editor: "Редактор",
  moderator: "Модератор",
  admin: "Администратор",
};