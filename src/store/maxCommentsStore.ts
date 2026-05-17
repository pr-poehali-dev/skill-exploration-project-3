import { useEffect, useState } from "react";

export interface MaxComment {
  id: string;
  articleId: number;
  maxNickname: string; // никнейм в MAX (без @)
  displayName?: string; // отображаемое имя
  text: string;
  createdAt: number;
  parentId?: string | null;
}

export interface MaxProfile {
  nickname: string; // без @
  displayName: string;
}

const COMMENTS_KEY = "max_comments_v1";
const PROFILE_KEY = "max_profile_v1";
const EVENT = "max-comments-updated";
const PROFILE_EVENT = "max-profile-updated";

/** Базовый URL мессенджера MAX */
export const MAX_BASE_URL = "https://max.ru";

export function buildMaxProfileLink(nickname: string): string {
  const clean = nickname.replace(/^@+/, "").trim();
  return `${MAX_BASE_URL}/${encodeURIComponent(clean)}`;
}

function loadComments(): MaxComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (raw) return JSON.parse(raw) as MaxComment[];
  } catch (e) {
    console.warn(e);
  }
  return [];
}

function saveComments(items: MaxComment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

function loadProfile(): MaxProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as MaxProfile;
  } catch (e) {
    console.warn(e);
  }
  return null;
}

function saveProfile(p: MaxProfile | null) {
  if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  else localStorage.removeItem(PROFILE_KEY);
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

let _comments = loadComments();
let _profile = loadProfile();

export function getComments(articleId: number): MaxComment[] {
  return _comments
    .filter((c) => c.articleId === articleId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function addComment(input: {
  articleId: number;
  maxNickname: string;
  displayName?: string;
  text: string;
  parentId?: string | null;
}): MaxComment | null {
  const nick = input.maxNickname.replace(/^@+/, "").trim();
  const text = input.text.trim();
  if (!nick || !text) return null;
  const item: MaxComment = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    articleId: input.articleId,
    maxNickname: nick,
    displayName: input.displayName?.trim() || undefined,
    text,
    createdAt: Date.now(),
    parentId: input.parentId || null,
  };
  _comments = [..._comments, item];
  saveComments(_comments);
  return item;
}

export function deleteComment(id: string, byNickname: string) {
  _comments = _comments.filter((c) => !(c.id === id && c.maxNickname === byNickname));
  saveComments(_comments);
}

export function getMaxProfile(): MaxProfile | null {
  return _profile;
}

export function setMaxProfile(p: MaxProfile | null) {
  _profile = p;
  saveProfile(p);
}

export function useMaxComments(articleId: number | undefined) {
  const [list, setList] = useState<MaxComment[]>(() =>
    articleId === undefined ? [] : getComments(articleId)
  );
  useEffect(() => {
    if (articleId === undefined) return;
    const h = () => setList(getComments(articleId));
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [articleId]);
  return list;
}

export function useMaxProfile(): MaxProfile | null {
  const [p, setP] = useState<MaxProfile | null>(_profile);
  useEffect(() => {
    const h = () => setP(_profile);
    window.addEventListener(PROFILE_EVENT, h);
    return () => window.removeEventListener(PROFILE_EVENT, h);
  }, []);
  return p;
}
