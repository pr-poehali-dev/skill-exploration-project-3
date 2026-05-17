import { useState, useEffect } from "react";
import { addNotification } from "./notificationsStore";
import { listUsers } from "./authStore";

export interface MessageArticleRef {
  articleId: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
}

export interface ForwardedInfo {
  originalAuthorId: number;
  originalAuthorName: string;
  originalCreatedAt: number;
}

export interface Message {
  id: number;
  fromId: number;
  toId: number;
  text: string;
  createdAt: number;
  read: boolean;
  article?: MessageArticleRef;
  reactions?: Record<string, number[]>; // emoji -> userIds
  forwardedFrom?: ForwardedInfo;
}

export const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "😮", "😢"];

const KEY = "blog_messages";

function load(): Message[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Message[];
  } catch (e) {
    console.warn(e);
  }
  return [];
}

function save(messages: Message[]) {
  localStorage.setItem(KEY, JSON.stringify(messages));
  window.dispatchEvent(new Event("messages-updated"));
}

let _messages: Message[] = load();

export function getAllMessages(): Message[] {
  return _messages;
}

export function sendMessage(
  fromId: number,
  toId: number,
  text: string,
  article?: MessageArticleRef
): Message {
  const msg: Message = {
    id: Date.now() + Math.random(),
    fromId,
    toId,
    text: text.trim(),
    createdAt: Date.now(),
    read: false,
    article,
  };
  _messages = [..._messages, msg];
  save(_messages);

  // Notify recipient
  const sender = listUsers().find((u) => u.id === fromId);
  const previewText = article
    ? `📎 ${article.title}`
    : text.trim().slice(0, 80);
  addNotification({
    userId: toId,
    type: "message",
    title: sender ? `Сообщение от ${sender.name}` : "Новое сообщение",
    text: previewText,
    link: `/messages?u=${fromId}`,
  });

  return msg;
}

export function forwardMessage(
  sourceMessageId: number,
  fromId: number,
  toId: number,
  comment?: string
): Message | null {
  const source = _messages.find((m) => m.id === sourceMessageId);
  if (!source) return null;

  const originalAuthor = listUsers().find((u) => u.id === source.fromId);
  const forwarded: ForwardedInfo = source.forwardedFrom || {
    originalAuthorId: source.fromId,
    originalAuthorName: originalAuthor?.name || "Пользователь",
    originalCreatedAt: source.createdAt,
  };

  const msg: Message = {
    id: Date.now() + Math.random(),
    fromId,
    toId,
    text: (comment || "").trim(),
    createdAt: Date.now(),
    read: false,
    article: source.article,
    forwardedFrom: forwarded,
  };

  // Forwarded body text — храним отдельным сообщением сразу за переходным комментарием,
  // чтобы не смешивать комментарий и оригинал
  const forwardedBody: Message = {
    id: Date.now() + Math.random() + 1,
    fromId,
    toId,
    text: source.text,
    createdAt: Date.now() + 1,
    read: false,
    article: undefined, // карточка уже прикреплена выше
    forwardedFrom: forwarded,
  };

  _messages = [..._messages, msg, ...(source.text ? [forwardedBody] : [])];
  save(_messages);

  const sender = listUsers().find((u) => u.id === fromId);
  addNotification({
    userId: toId,
    type: "message",
    title: sender ? `Пересланное от ${sender.name}` : "Пересланное сообщение",
    text: source.text ? source.text.slice(0, 80) : source.article ? `📎 ${source.article.title}` : "",
    link: `/messages?u=${fromId}`,
  });

  return msg;
}

export function toggleReaction(messageId: number, userId: number, emoji: string) {
  _messages = _messages.map((m) => {
    if (m.id !== messageId) return m;
    const reactions = { ...(m.reactions || {}) };
    const list = reactions[emoji] ? [...reactions[emoji]] : [];
    const idx = list.indexOf(userId);
    if (idx >= 0) {
      list.splice(idx, 1);
      if (list.length === 0) delete reactions[emoji];
      else reactions[emoji] = list;
    } else {
      reactions[emoji] = [...list, userId];
    }
    return { ...m, reactions };
  });
  save(_messages);
}

export function markConversationRead(currentId: number, partnerId: number) {
  let changed = false;
  _messages = _messages.map((m) => {
    if (m.toId === currentId && m.fromId === partnerId && !m.read) {
      changed = true;
      return { ...m, read: true };
    }
    return m;
  });
  if (changed) save(_messages);
}

export function getConversation(userA: number, userB: number): Message[] {
  return _messages
    .filter(
      (m) =>
        (m.fromId === userA && m.toId === userB) ||
        (m.fromId === userB && m.toId === userA)
    )
    .sort((a, b) => a.createdAt - b.createdAt);
}

export interface ConversationSummary {
  partnerId: number;
  lastMessage: Message;
  unread: number;
}

export function getConversations(currentId: number): ConversationSummary[] {
  const partners = new Map<number, ConversationSummary>();
  for (const m of _messages) {
    if (m.fromId !== currentId && m.toId !== currentId) continue;
    const partnerId = m.fromId === currentId ? m.toId : m.fromId;
    const existing = partners.get(partnerId);
    if (!existing || m.createdAt > existing.lastMessage.createdAt) {
      partners.set(partnerId, {
        partnerId,
        lastMessage: m,
        unread: 0,
      });
    }
  }
  // Count unread
  for (const m of _messages) {
    if (m.toId === currentId && !m.read) {
      const summary = partners.get(m.fromId);
      if (summary) summary.unread += 1;
    }
  }
  return Array.from(partners.values()).sort(
    (a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt
  );
}

export function getUnreadCount(currentId: number): number {
  return _messages.filter((m) => m.toId === currentId && !m.read).length;
}

export function useConversations(currentId: number | undefined) {
  const [list, setList] = useState<ConversationSummary[]>(() =>
    currentId ? getConversations(currentId) : []
  );
  useEffect(() => {
    if (!currentId) return;
    const handler = () => setList(getConversations(currentId));
    window.addEventListener("messages-updated", handler);
    return () => window.removeEventListener("messages-updated", handler);
  }, [currentId]);
  return list;
}

export function useConversation(currentId: number | undefined, partnerId: number | undefined) {
  const [list, setList] = useState<Message[]>(() =>
    currentId && partnerId ? getConversation(currentId, partnerId) : []
  );
  useEffect(() => {
    if (!currentId || !partnerId) return;
    const handler = () => setList(getConversation(currentId, partnerId));
    window.addEventListener("messages-updated", handler);
    return () => window.removeEventListener("messages-updated", handler);
  }, [currentId, partnerId]);
  return list;
}

export function useUnreadCount(currentId: number | undefined) {
  const [count, setCount] = useState<number>(() => (currentId ? getUnreadCount(currentId) : 0));
  useEffect(() => {
    if (!currentId) return;
    const handler = () => setCount(getUnreadCount(currentId));
    window.addEventListener("messages-updated", handler);
    return () => window.removeEventListener("messages-updated", handler);
  }, [currentId]);
  return count;
}