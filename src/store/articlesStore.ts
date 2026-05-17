import { useState, useEffect } from "react";
import { ARTICLES as SEED_ARTICLES, type Article } from "@/data/articles";

const STORAGE_KEY = "blog_articles";
const BOOKMARKS_KEY = "blog_bookmarks";

function loadArticles(): Article[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Article[];
  } catch (e) {
    console.warn(e);
  }
  return SEED_ARTICLES;
}

function saveArticles(articles: Article[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

export function loadBookmarks(): number[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) return JSON.parse(raw) as number[];
  } catch (e) {
    console.warn(e);
  }
  return [];
}

export function saveBookmarks(ids: number[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
}

// Singleton state shared across components via custom events
let _articles: Article[] = loadArticles();

export function getArticles(): Article[] {
  return _articles;
}

export function addArticle(article: Omit<Article, "id" | "date" | "featured">): Article {
  const now = new Date();
  const formatted = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const newArticle: Article = {
    ...article,
    id: Date.now(),
    date: formatted,
    featured: false,
  };
  _articles = [newArticle, ..._articles];
  saveArticles(_articles);
  window.dispatchEvent(new Event("articles-updated"));
  return newArticle;
}

export function getArticleById(id: number): Article | undefined {
  return _articles.find((a) => a.id === id);
}

export function updateArticle(id: number, patch: Partial<Article>) {
  _articles = _articles.map((a) => (a.id === id ? { ...a, ...patch } : a));
  saveArticles(_articles);
  window.dispatchEvent(new Event("articles-updated"));
}

export function deleteArticle(id: number) {
  _articles = _articles.filter((a) => a.id !== id);
  saveArticles(_articles);
  window.dispatchEvent(new Event("articles-updated"));
}

const VIEWED_KEY = "blog_viewed_articles";

function loadViewed(): Record<number, number> {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    if (raw) return JSON.parse(raw) as Record<number, number>;
  } catch (e) {
    console.warn(e);
  }
  return {};
}

export function incrementArticleViews(id: number) {
  const viewed = loadViewed();
  const last = viewed[id] || 0;
  const now = Date.now();
  // Throttle: один просмотр от одного браузера не чаще, чем раз в 30 минут
  if (now - last < 30 * 60 * 1000) return;

  viewed[id] = now;
  localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));

  _articles = _articles.map((a) =>
    a.id === id ? { ...a, views: (a.views || 0) + 1 } : a
  );
  saveArticles(_articles);
  window.dispatchEvent(new Event("articles-updated"));
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>(() => loadArticles());

  useEffect(() => {
    const handler = () => setArticles([...getArticles()]);
    window.addEventListener("articles-updated", handler);
    return () => window.removeEventListener("articles-updated", handler);
  }, []);

  return articles;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<number[]>(() => loadBookmarks());

  const toggle = (id: number) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      saveBookmarks(next);
      return next;
    });
  };

  return { bookmarks, toggle };
}