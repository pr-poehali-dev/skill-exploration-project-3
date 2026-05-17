import { useState, useEffect } from "react";

export type NotificationType = "message" | "article" | "system" | "role";

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  text: string;
  link?: string;
  read: boolean;
  createdAt: number;
}

const KEY = "blog_notifications";

function load(): Notification[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Notification[];
  } catch (e) {
    console.warn(e);
  }
  return [];
}

function save(items: Notification[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("notifications-updated"));
}

let _items: Notification[] = load();

export function getNotifications(userId: number): Notification[] {
  return _items.filter((n) => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export function addNotification(input: Omit<Notification, "id" | "createdAt" | "read">) {
  const exists = _items.find(
    (n) =>
      n.userId === input.userId &&
      n.type === input.type &&
      n.link === input.link &&
      Date.now() - n.createdAt < 30 * 1000
  );
  if (exists) return;

  const item: Notification = {
    ...input,
    id: Date.now() + Math.random(),
    createdAt: Date.now(),
    read: false,
  };
  _items = [item, ..._items].slice(0, 200);
  save(_items);
}

export function markAllRead(userId: number) {
  let changed = false;
  _items = _items.map((n) => {
    if (n.userId === userId && !n.read) {
      changed = true;
      return { ...n, read: true };
    }
    return n;
  });
  if (changed) save(_items);
}

export function markRead(id: number) {
  _items = _items.map((n) => (n.id === id ? { ...n, read: true } : n));
  save(_items);
}

export function removeNotification(id: number) {
  _items = _items.filter((n) => n.id !== id);
  save(_items);
}

export function useNotifications(userId: number | undefined) {
  const [list, setList] = useState<Notification[]>(() =>
    userId ? getNotifications(userId) : []
  );
  useEffect(() => {
    if (!userId) return;
    const handler = () => setList(getNotifications(userId));
    window.addEventListener("notifications-updated", handler);
    return () => window.removeEventListener("notifications-updated", handler);
  }, [userId]);
  return list;
}

export function useUnreadNotifications(userId: number | undefined) {
  const list = useNotifications(userId);
  return list.filter((n) => !n.read).length;
}
