import { useState, useEffect } from "react";
import { CATEGORIES as SEED } from "@/data/articles";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  order: number;
}

const KEY = "blog_categories";

const DEFAULT_ICONS = ["Palette", "Cpu", "Globe", "Atom", "Briefcase", "BookOpen"];

function seedToCategory(): Category[] {
  return SEED.map((c, i) => ({
    id: c.name,
    name: c.name,
    color: c.color,
    icon: DEFAULT_ICONS[i % DEFAULT_ICONS.length],
    order: i,
  }));
}

function load(): Category[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Category[];
  } catch (e) {
    console.warn(e);
  }
  const seeded = seedToCategory();
  localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}

function save(items: Category[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("categories-updated"));
}

let _items: Category[] = load();

export function getCategories(): Category[] {
  return [..._items].sort((a, b) => a.order - b.order);
}

export function addCategory(input: { name: string; color: string; icon: string; description?: string }): Category | null {
  const name = input.name.trim();
  if (!name) return null;
  if (_items.some((c) => c.name.toLowerCase() === name.toLowerCase())) return null;
  const cat: Category = {
    id: `${Date.now()}`,
    name,
    color: input.color,
    icon: input.icon,
    description: input.description?.trim() || undefined,
    order: _items.length,
  };
  _items = [..._items, cat];
  save(_items);
  return cat;
}

export function updateCategory(id: string, patch: Partial<Omit<Category, "id">>) {
  _items = _items.map((c) => (c.id === id ? { ...c, ...patch } : c));
  save(_items);
}

export function deleteCategory(id: string) {
  _items = _items.filter((c) => c.id !== id);
  save(_items);
}

export function reorderCategories(ids: string[]) {
  const map = new Map(_items.map((c) => [c.id, c]));
  _items = ids.map((id, i) => ({ ...(map.get(id) as Category), order: i }));
  save(_items);
}

export function useCategories() {
  const [items, setItems] = useState<Category[]>(() => getCategories());
  useEffect(() => {
    const handler = () => setItems(getCategories());
    window.addEventListener("categories-updated", handler);
    return () => window.removeEventListener("categories-updated", handler);
  }, []);
  return items;
}

export const CATEGORY_ICON_OPTIONS = [
  "Palette", "Cpu", "Globe", "Atom", "Briefcase", "BookOpen",
  "Music", "Camera", "Film", "Coffee", "Heart", "Lightbulb",
  "Rocket", "Star", "TreePine", "Mountain", "Compass", "Flame",
  "Sparkles", "Microscope", "Hammer", "PenTool", "Code", "Headphones",
];

export const CATEGORY_COLOR_OPTIONS = [
  "#EDE9E2", "#E2EDE8", "#EAE2ED", "#EDE8E2", "#E2E8ED", "#E8EDE2",
  "#F0E4DC", "#DCE8F0", "#E8DCF0", "#F0E8DC", "#DCF0E8", "#F0DCE4",
  "#E6E0D2", "#D2E6E0", "#E0D2E6", "#E6D2D8", "#D2D8E6", "#D8E6D2",
];
